import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { env } from "../config";
import { logger } from "../utils/logger";
import { emailWorker } from "./email.worker";
import { submissionWorker } from "./submission.worker";

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!connection) {
    const redisUrl = env.REDIS_URL || "redis://localhost:6379";
    
    try {
      const url = new URL(redisUrl);
      connection = new Redis({
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null,
      });

      connection.on("error", (error) => {
        logger.error({ error }, "Redis connection error");
      });

      connection.on("connect", () => {
        logger.info("Redis connected for BullMQ");
      });
    } catch (error) {
      // Fallback to default connection if URL parsing fails
      connection = new Redis({
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null,
      });
    }
  }

  return connection;
}

// Queues - Created lazily to handle Redis unavailability
let emailQueueInstance: Queue | null = null;
let submissionQueueInstance: Queue | null = null;

export function getEmailQueue(): Queue {
  if (!emailQueueInstance) {
    try {
      emailQueueInstance = new Queue("email", {
        connection: getRedisConnection(),
      });
    } catch (error) {
      logger.warn({ error }, "Failed to create email queue - Redis may not be available");
      throw error;
    }
  }
  return emailQueueInstance;
}

export function getSubmissionQueue(): Queue {
  if (!submissionQueueInstance) {
    try {
      submissionQueueInstance = new Queue("submission", {
        connection: getRedisConnection(),
      });
    } catch (error) {
      logger.warn({ error }, "Failed to create submission queue - Redis may not be available");
      throw error;
    }
  }
  return submissionQueueInstance;
}

// Export for backward compatibility
export const emailQueue = {
  add: async (...args: Parameters<Queue["add"]>) => {
    try {
      return await getEmailQueue().add(...args);
    } catch (error) {
      logger.error({ error }, "Failed to add email job - Redis may not be available");
      throw error;
    }
  },
};

export const submissionQueue = {
  add: async (...args: Parameters<Queue["add"]>) => {
    try {
      return await getSubmissionQueue().add(...args);
    } catch (error) {
      logger.error({ error }, "Failed to add submission job - Redis may not be available");
      throw error;
    }
  },
};

// Workers - Initialize only if Redis is available
if (process.env.NODE_ENV !== "test") {
  // Initialize workers asynchronously to not block server startup
  setTimeout(async () => {
    try {
      const testConnection = getRedisConnection();
      await testConnection.ping();
      
      emailWorker();
      submissionWorker();
      logger.info("BullMQ workers initialized");
    } catch (error) {
      logger.warn(
        { error },
        "Redis not available - workers will not start. This is OK for development without Redis."
      );
    }
  }, 1000); // Wait 1 second for Redis to be ready
}

