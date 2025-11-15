import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get user error");
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

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
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

    const body = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.sub },
      data: body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
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

    logger.error({ error }, "Update user error");
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

