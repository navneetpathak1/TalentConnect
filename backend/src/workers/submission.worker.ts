import { Worker } from "bullmq";
import { getRedisConnection } from "./index";
import { logger } from "../utils/logger";
import { prisma } from "../utils/db";
import { broadcastLeaderboardUpdate } from "../sockets";

// Helper to detect programming language from code
function detectLanguage(code: string): string | null {
  // Simple heuristics - can be enhanced
  if (code.includes("def ") || code.includes("import ") && code.includes("print(")) {
    return "python";
  }
  if (code.includes("function ") || code.includes("const ") || code.includes("let ")) {
    if (code.includes(": ") && code.includes("interface ")) {
      return "typescript";
    }
    return "javascript";
  }
  if (code.includes("public class") || code.includes("public static")) {
    return "java";
  }
  return null;
}

interface SubmissionJob {
  submissionId: string;
  roundId: string;
  hackathonId: string;
  code?: string;
  fileUrl?: string;
}

export function submissionWorker() {
  const worker = new Worker<SubmissionJob>(
    "submission",
    async (job) => {
      const { submissionId, roundId, hackathonId, code, fileUrl } = job.data;

      logger.info({ submissionId, roundId }, "Processing submission job");

      try {
        // Update status to RUNNING
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: "RUNNING" },
        });

        // Execute code (with Docker fallback to local execution)
        let executionResult;
        
        if (code) {
          try {
            // Try to detect language from code or use default
            const language = detectLanguage(code) || "javascript";
            
            // Use Docker execution if available, otherwise fallback to local
            if (process.env.USE_DOCKER_EXECUTION === "true") {
              const { executeCodeInDocker } = await import("../utils/code-executor");
              executionResult = await executeCodeInDocker({
                code,
                language,
                timeout: 30000, // 30 seconds
                maxMemory: 256 * 1024 * 1024, // 256MB
              });
            } else {
              const { executeCode } = await import("../utils/code-executor");
              executionResult = await executeCode({
                code,
                language,
                timeout: 30000,
                maxMemory: 256 * 1024 * 1024,
              });
            }
          } catch (execError) {
            logger.error({ error: execError, submissionId }, "Code execution error");
            executionResult = {
              success: false,
              score: 0,
              executionTime: 0,
              memoryUsed: 0,
              output: "",
              error: execError instanceof Error ? execError.message : "Execution error",
              feedback: "Code execution failed",
            };
          }
        } else {
          // File submission - for now, mark as passed (would need file processing)
          executionResult = {
            success: true,
            score: 100,
            executionTime: 1000,
            memoryUsed: 0,
            output: "File submission received",
            feedback: "File submission accepted",
          };
        }

        const score = executionResult.score;
        const executionTime = executionResult.executionTime;
        const memoryUsed = executionResult.memoryUsed;

        // Update submission
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: executionResult.success ? "PASSED" : "FAILED",
            score,
            executionTime,
            memoryUsed,
            feedback: executionResult.feedback || (executionResult.success ? "All tests passed!" : "Some tests failed"),
          },
        });

        // Update leaderboard
        const participant = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            participant: true,
          },
        });

        if (participant) {
          // Get or create leaderboard entry
          const existing = await prisma.leaderboardEntry.findUnique({
            where: {
              hackathonId_userId: {
                hackathonId,
                userId: participant.participant.userId,
              },
            },
          });

          if (existing) {
            await prisma.leaderboardEntry.update({
              where: { id: existing.id },
              data: {
                totalScore: existing.totalScore + score,
              },
            });
          } else {
            await prisma.leaderboardEntry.create({
              data: {
                hackathonId,
                userId: participant.participant.userId,
                totalScore: score,
              },
            });
          }

          // Get updated leaderboard
          const leaderboard = await prisma.leaderboardEntry.findMany({
            where: { hackathonId },
            orderBy: { totalScore: "desc" },
            include: {
              hackathon: {
                include: {
                  participants: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          email: true,
                          firstName: true,
                          lastName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          // Broadcast update
          broadcastLeaderboardUpdate(hackathonId, leaderboard);
        }

        return { success: true, score };
      } catch (error) {
        logger.error({ error, submissionId }, "Submission processing error");

        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: "ERROR",
            feedback: error instanceof Error ? error.message : "Unknown error",
          },
        });

        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 3, // Process 3 submissions at a time
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Submission job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err }, "Submission job failed");
  });

  return worker;
}

