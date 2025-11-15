import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] = crypto.randomUUID();
  }
  res.setHeader("x-request-id", req.headers["x-request-id"]);
  next();
}

