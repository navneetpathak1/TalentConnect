import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { generatePresignedUploadUrl as generateS3Url } from "../utils/s3";
import { generatePresignedUploadUrl as generateSupabaseUrl } from "../utils/supabase-storage";
import { env } from "../config";
import { logger } from "../utils/logger";
import { z } from "zod";

const presignQuerySchema = z.object({
  type: z.enum(["resume", "logo", "submission", "avatar"]),
  filename: z.string(),
  contentType: z.string().optional(),
});

export async function getPresignedUrl(req: AuthRequest, res: Response): Promise<void> {
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

    const query = presignQuerySchema.parse(req.query);

    // Check if storage is configured (Supabase takes priority, fallback to S3)
    const useSupabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY;
    const useS3 = env.S3_BUCKET && !useSupabase;

    if (!useSupabase && !useS3) {
      res.status(503).json({
        success: false,
        data: null,
        error: {
          message:
            "File upload service is not configured. Please configure either Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) or S3 (S3_BUCKET) in environment variables.",
          code: "SERVICE_UNAVAILABLE",
        },
      });
      return;
    }

    // Use Supabase if configured, otherwise fallback to S3
    const result = useSupabase
      ? await generateSupabaseUrl({
          type: query.type,
          filename: query.filename,
          contentType: query.contentType,
        })
      : await generateS3Url({
          type: query.type,
          filename: query.filename,
          contentType: query.contentType,
        });

    res.json({
      success: true,
      data: result,
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

    // Handle storage configuration errors
    if (
      error instanceof Error &&
      (error.message.includes("S3_BUCKET") || error.message.includes("Supabase"))
    ) {
      res.status(503).json({
        success: false,
        data: null,
        error: {
          message: error.message,
          code: "SERVICE_UNAVAILABLE",
        },
      });
      return;
    }

    logger.error({ error }, "Generate presigned URL error");
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

