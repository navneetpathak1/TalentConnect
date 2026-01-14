import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  remote: z.boolean().optional().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().optional().default("USD"),
  organizationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const getJobsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  search: z.string().optional(),
  location: z.string().optional(),
  remote: z.coerce.boolean().optional(),
  organizationId: z.string().optional(),
});

export async function createJob(req: AuthRequest, res: Response): Promise<void> {
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

    const body = createJobSchema.parse(req.body);

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

    const job = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        remote: body.remote,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        currency: body.currency,
        organizationId: body.organizationId,
        postedById: req.user.sub,
        tags: body.tags
          ? {
              create: body.tags.map((tag) => ({ name: tag })),
            }
          : undefined,
      },
      include: {
        organization: true,
        tags: true,
      },
    });

    res.status(201).json({
      success: true,
      data: job,
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

    logger.error({ error }, "Create job error");
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

export async function getJobs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query = getJobsQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    const where: any = {
      status: "OPEN",
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: "insensitive" };
    }

    if (query.remote !== undefined) {
      where.remote = query.remote;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          organization: true,
          tags: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
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

    logger.error({ error }, "Get jobs error");
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

export async function getJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Job ID is required",
          code: "VALIDATION_ERROR",
        },
      });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        organization: true,
        tags: true,
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Job not found",
          code: "NOT_FOUND",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: job,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get job error");
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

export async function getMyJobs(req: AuthRequest, res: Response): Promise<void> {
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

    const jobs = await prisma.job.findMany({
      where: {
        postedById: req.user.sub,
      },
      include: {
        organization: true,
        tags: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: jobs,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get my jobs error");
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

