import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const createRoundSchema = z.object({
  hackathonId: z.string(),
  number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export async function createRound(req: AuthRequest, res: Response): Promise<void> {
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

    const body = createRoundSchema.parse(req.body);

    if (body.endDate <= body.startDate) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "End date must be after start date",
          code: "VALIDATION_ERROR",
        },
      });
      return;
    }

    // Verify hackathon exists and user has permission
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: body.hackathonId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: req.user.sub },
            },
          },
        },
      },
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

    // Check if user is admin or organization member
    if (req.user.role !== "ADMIN" && (!hackathon.organization || hackathon.organization.members.length === 0)) {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "You don't have permission to create rounds for this hackathon",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    const round = await prisma.round.create({
      data: {
        hackathonId: body.hackathonId,
        number: body.number,
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
      },
    });

    res.status(201).json({
      success: true,
      data: round,
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

    logger.error({ error }, "Create round error");
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

