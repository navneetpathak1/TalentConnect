import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorMiddleware(
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logger.warn(
      {
        error: err,
        path: req.path,
        method: req.method,
        requestId: req.headers["x-request-id"],
      },
      "Validation error"
    );

    res.status(400).json({
      success: false,
      data: null,
      error: {
        message: "Validation error",
        code: "VALIDATION_ERROR",
        details: err.format(),
      },
    });
    return;
  }

  // Handle custom API errors
  const apiError = err as ApiError;
  const statusCode = apiError.statusCode || 500;
  const message = apiError.message || "Internal server error";

  // Log error with appropriate level
  if (statusCode >= 500) {
    logger.error(
      {
        err,
        statusCode,
        path: req.path,
        method: req.method,
        requestId: req.headers["x-request-id"],
      },
      "Request error"
    );
  } else {
    logger.warn(
      {
        err,
        statusCode,
        path: req.path,
        method: req.method,
        requestId: req.headers["x-request-id"],
      },
      "Client error"
    );
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      code: apiError.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
}

