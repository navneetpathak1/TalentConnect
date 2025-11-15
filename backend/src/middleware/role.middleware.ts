import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

type UserRole = "USER" | "COMPANY" | "ADMIN";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Authentication required",
          code: "UNAUTHORIZED",
        },
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          message: "Insufficient permissions",
          code: "FORBIDDEN",
        },
      });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole("ADMIN");
export const requireCompany = requireRole("COMPANY", "ADMIN");
export const requireUser = requireRole("USER", "COMPANY", "ADMIN");

