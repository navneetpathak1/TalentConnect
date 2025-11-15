import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware factory
 * Creates a middleware that validates request body/query/params against a Zod schema
 */
export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate based on method - body for POST/PUT/PATCH, query for GET
      const dataToValidate =
        ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : req.query;

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: result.error.format(),
          },
        });
        return;
      }

      // Replace the original data with validated data
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        req.body = result.data;
      } else {
        req.query = result.data as any;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        error: {
          message: "Validation middleware error",
          code: "INTERNAL_ERROR",
        },
      });
    }
  };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized;
}

