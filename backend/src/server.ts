import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config";
import { logger } from "./utils/logger";
import { prisma } from "./utils/db";
import { setupSocketIO } from "./sockets";
import "./workers"; // Initialize workers

const app = createApp();
const server = createServer(app);

// Setup Socket.io
setupSocketIO(server);

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("Database connected");

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
  });
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

