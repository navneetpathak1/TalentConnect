import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const createHackathonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  imageUrl: z.string().url().optional(),
  prizePool: z.string().optional(),
  rules: z.string().optional(),
  organizationId: z.string().optional(),
});

const getHackathonsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  status: z.enum(["DRAFT", "OPEN", "IN_PROGRESS", "JUDGING", "COMPLETED", "CANCELLED"]).optional(),
});

export async function createHackathon(req: AuthRequest, res: Response): Promise<void> {
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

    const body = createHackathonSchema.parse(req.body);

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

    // Verify organization membership if provided
    if (body.organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: body.organizationId,
            userId: req.user.sub,
          },
        },
      });

      if (!membership) {
        res.status(403).json({
          success: false,
          data: null,
          error: {
            message: "You are not a member of this organization",
            code: "FORBIDDEN",
          },
        });
        return;
      }
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        imageUrl: body.imageUrl,
        prizePool: body.prizePool,
        rules: body.rules,
        organizationId: body.organizationId,
        status: "DRAFT",
      },
    });

    res.status(201).json({
      success: true,
      data: hackathon,
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

    logger.error({ error }, "Create hackathon error");
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

export async function getHackathons(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query = getHackathonsQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    const [hackathons, total] = await Promise.all([
      prisma.hackathon.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          organization: true,
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.hackathon.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        hackathons,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
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

    logger.error({ error }, "Get hackathons error");
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

export async function joinHackathon(req: AuthRequest, res: Response): Promise<void> {
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

    const hackathonId = req.params.id;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon || hackathon.status !== "OPEN") {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Hackathon not found or not open for registration",
          code: "HACKATHON_NOT_FOUND",
        },
      });
      return;
    }

    // Check if already joined
    const existing = await prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId: req.user.sub,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        data: null,
        error: {
          message: "You have already joined this hackathon",
          code: "ALREADY_JOINED",
        },
      });
      return;
    }

    const participant = await prisma.hackathonParticipant.create({
      data: {
        hackathonId,
        userId: req.user.sub,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        hackathon: true,
      },
    });

    res.status(201).json({
      success: true,
      data: participant,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Join hackathon error");
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

