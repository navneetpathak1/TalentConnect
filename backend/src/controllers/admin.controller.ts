import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "Admin access required",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    const [userCount, jobCount, applicationCount, hackathonCount] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.hackathon.count(),
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        jobs: jobCount,
        applications: applicationCount,
        hackathons: hackathonCount,
      },
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get admin stats error");
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

