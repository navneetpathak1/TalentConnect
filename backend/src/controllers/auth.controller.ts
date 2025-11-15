import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/db";
import { hashPassword, verifyPassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { env } from "../config";
import crypto from "crypto";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["USER", "COMPANY"]).optional().default("USER"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        data: null,
        error: {
          message: "User with this email already exists",
          code: "USER_EXISTS",
        },
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // Store refresh token hash
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        deviceInfo: req.headers["user-agent"] || undefined,
      },
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
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

    logger.error({ error }, "Registration error");
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

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
      });
      return;
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // Store refresh token hash
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers["user-agent"] || undefined,
      },
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        accessToken,
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

    logger.error({ error }, "Login error");
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

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Refresh token not provided",
          code: "UNAUTHORIZED",
        },
      });
      return;
    }

    // Verify token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in DB
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        data: null,
        error: {
          message: "Invalid or expired refresh token",
          code: "UNAUTHORIZED",
        },
      });
      return;
    }

    // Rotate refresh token (delete old, create new)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const newRefreshToken = generateRefreshToken({
      userId: storedToken.userId,
      role: storedToken.user.role,
    });
    const newTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers["user-agent"] || undefined,
      },
    });

    const newAccessToken = generateAccessToken({
      userId: storedToken.userId,
      role: storedToken.user.role,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Refresh token error");
    res.status(401).json({
      success: false,
      data: null,
      error: {
        message: "Invalid refresh token",
        code: "UNAUTHORIZED",
      },
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await prisma.refreshToken.deleteMany({
        where: { tokenHash },
      });
    }

    res.clearCookie("refreshToken");
    res.json({
      success: true,
      data: { message: "Logged out successfully" },
      error: null,
    });
  } catch (error) {
    logger.error({ error }, "Logout error");
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

