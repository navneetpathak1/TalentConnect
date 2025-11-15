import jwt from "jsonwebtoken";
import { env } from "../config";

export interface TokenPayload {
  sub: string; // user id
  role: string;
  iat?: number;
  exp?: number;
}

export function generateAccessToken(payload: { userId: string; role: string }): string {
  return jwt.sign(
    {
      sub: payload.userId,
      role: payload.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

export function generateRefreshToken(payload: { userId: string; role: string }): string {
  return jwt.sign(
    {
      sub: payload.userId,
      role: payload.role,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}

