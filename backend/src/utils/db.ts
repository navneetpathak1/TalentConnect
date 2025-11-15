import { PrismaClient } from "../generated/prisma/index.js";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? [{ level: "query", emit: "event" }]
      : [{ level: "error", emit: "event" }],
});

if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: { query: string; params: string; duration: number }) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, "Prisma query");
  });
}

prisma.$on("error" as never, (e: { message: string; target?: string }) => {
  logger.error({ error: e }, "Prisma error");
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

