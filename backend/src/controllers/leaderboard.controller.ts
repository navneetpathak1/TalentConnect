import { Response } from "express";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";

export async function getLeaderboard(req: any, res: Response): Promise<void> {
  try {
    const hackathonId = req.params.hackathonId;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Hackathon not found",
          code: "HACKATHON_NOT_FOUND",
        },
      });
      return;
    }

    // Get leaderboard entries sorted by score
    const entries = await prisma.leaderboardEntry.findMany({
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

    // Add rank
    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: {
        hackathon: {
          id: hackathon.id,
          title: hackathon.title,
        },
        leaderboard: ranked,
      },
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get leaderboard error");
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

