import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { z } from "zod";

const applySchema = z.object({
  jobId: z.string(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
});

export async function apply(req: AuthRequest, res: Response): Promise<void> {
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

    console.log("Apply request body:", req.body);
    const body = applySchema.parse(req.body);

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
    });

    if (!job || job.status !== "OPEN") {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Job not found or not open",
          code: "JOB_NOT_FOUND",
        },
      });
      return;
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: body.jobId,
          userId: req.user.sub,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        data: null,
        error: {
          message: "You have already applied to this job",
          code: "ALREADY_APPLIED",
        },
      });
      return;
    }

    const application = await prisma.application.create({
      data: {
        jobId: body.jobId,
        userId: req.user.sub,
        resumeUrl: body.resumeUrl,
        coverLetter: body.coverLetter,
      },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: application,
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
          details: error.errors,
        },
      });
      return;
    }

    logger.error({ error }, "Apply to job error");
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

export async function getMyApplications(req: AuthRequest, res: Response): Promise<void> {
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

    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.sub,
      },
      include: {
        job: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: applications,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get my applications error");
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


const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
});

export async function getJobApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;

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

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { organization: true },
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

    // Check if user has access to this job
    let hasAccess = false;
    if (job.organizationId) {
      // Check org membership
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: job.organizationId,
            userId: req.user.sub,
          },
        },
      });
      if (membership) hasAccess = true;
    } else {
      // Check if user is the poster
      if (job.postedById === req.user.sub) hasAccess = true;
    }

    if (!hasAccess && req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "You do not have permission to view applications for this job",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: applications,
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Get job applications error");
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

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = updateStatusSchema.parse(req.body);

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

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "Application not found",
          code: "NOT_FOUND",
        },
      });
      return;
    }

    // Verify job ownership
    const job = application.job;
    let hasAccess = false;
    
    if (job.organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: job.organizationId,
            userId: req.user.sub,
          },
        },
      });
      if (membership) hasAccess = true;
    } else {
      if (job.postedById === req.user.sub) hasAccess = true;
    }

    if (!hasAccess && req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "You do not have permission to update this application",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: body.status },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedApplication,
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

    logger.error({ error }, "Update application status error");
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
