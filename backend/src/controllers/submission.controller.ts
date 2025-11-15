import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";
import { submissionQueue } from "../workers";

const submitSchema = z.object({
  roundId: z.string(),
  code: z.string().optional(),
  fileUrl: z.string().url().optional(),
}).refine((data) => data.code || data.fileUrl, {
  message: "Either code or fileUrl must be provided",
});

export async function submit(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
      return;
    }

    const body = submitSchema.parse(req.body);

    // Verify round exists
    const round = await prisma.round.findUnique({
      where: { id: body.roundId },
      include: {
        hackathon: {
          include: {
            participants: {
              where: { userId: req.user.sub },
            },
          },
        },
      },
    });

    if (!round) {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Round not found",
          code: "ROUND_NOT_FOUND",
        },
      });
      return;
    }

    // Check if user is a participant
    if (round.hackathon.participants.length === 0) {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "You are not a participant in this hackathon",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    const participant = round.hackathon.participants[0];

    // Check if round is active
    const now = new Date();
    if (now < round.startDate || now > round.endDate) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Round is not currently active",
          code: "ROUND_NOT_ACTIVE",
        },
      });
      return;
    }

    const submission = await prisma.submission.create({
      data: {
        roundId: body.roundId,
        participantId: participant.id,
        code: body.code,
        fileUrl: body.fileUrl,
        status: "PENDING",
      },
    });

    // Queue job for code execution/evaluation
    await submissionQueue.add("evaluate", {
      submissionId: submission.id,
      roundId: body.roundId,
      hackathonId: round.hackathon.id,
      code: body.code,
      fileUrl: body.fileUrl,
    });

    res.status(201).json({
      success: true,
      data: submission,
      error: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Validation error",
          code: "VALIDATION_ERROR",
        },
      });
      return;
    }

    logger.error({ error }, "Submit error");
    res.status(500).json({
      success: false,
      data: null,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    });
  }
}

