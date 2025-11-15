import { Worker } from "bullmq";
import { getRedisConnection, getEmailQueue } from "./index";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/email";

interface EmailJob {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export function emailWorker() {
  const worker = new Worker<EmailJob>(
    "email",
    async (job) => {
      const { to, subject, html, text, from } = job.data;

      logger.info({ to, subject }, "Processing email job");

      try {
        const success = await sendEmail({
          to,
          subject,
          html,
          text,
          from,
        });

        if (!success) {
          throw new Error("Email sending failed");
        }

        return { success: true };
      } catch (error) {
        logger.error({ error, to, subject }, "Email job error");
        throw error; // Re-throw to mark job as failed
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: "exponential",
        delay: 2000, // Start with 2 seconds
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Email job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err }, "Email job failed");
  });

  return worker;
}

