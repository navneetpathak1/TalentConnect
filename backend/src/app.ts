import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import passport from "passport";
import crypto from "crypto";
import { logger } from "./utils/logger";
import { env } from "./config";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { apiRateLimiter } from "./middleware/rate-limit.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import orgRoutes from "./routes/org.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import hackathonRoutes from "./routes/hackathon.routes";
import roundRoutes from "./routes/round.routes";
import submissionRoutes from "./routes/submission.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import notificationRoutes from "./routes/notification.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from "./routes/admin.routes";

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Passport initialization (for OAuth)
  app.use(passport.initialize());

  // Logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
    })
  );

  // Request ID is handled by pino-http middleware

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", apiRateLimiter, userRoutes);
  app.use("/api/v1/org", apiRateLimiter, orgRoutes);
  app.use("/api/v1/jobs", apiRateLimiter, jobRoutes);
  app.use("/api/v1/applications", apiRateLimiter, applicationRoutes);
  app.use("/api/v1/hackathons", apiRateLimiter, hackathonRoutes);
  app.use("/api/v1/rounds", apiRateLimiter, roundRoutes);
  app.use("/api/v1/submissions", apiRateLimiter, submissionRoutes);
  app.use("/api/v1/leaderboard", apiRateLimiter, leaderboardRoutes);
  app.use("/api/v1/notifications", apiRateLimiter, notificationRoutes);
  app.use("/api/v1/upload", apiRateLimiter, uploadRoutes);
  app.use("/api/v1/admin", apiRateLimiter, adminRoutes);

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
}

