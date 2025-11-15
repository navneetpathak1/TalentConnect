import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export async function createOrg(req: AuthRequest, res: Response): Promise<void> {
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

    const body = createOrgSchema.parse(req.body);

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        data: null,
        error: {
          message: "Organization with this name already exists",
          code: "ORG_EXISTS",
        },
      });
      return;
    }

    const org = await prisma.organization.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        website: body.website,
        logoUrl: body.logoUrl,
        members: {
          create: {
            userId: req.user.sub,
            role: "OWNER",
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: org,
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

    logger.error({ error }, "Create organization error");
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

export async function getMyOrgs(req: AuthRequest, res: Response): Promise<void> {
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

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user.sub },
      include: {
        organization: true,
      },
    });

    res.json({
      success: true,
      data: memberships.map((m) => ({
        ...m.organization,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get organizations error");
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

