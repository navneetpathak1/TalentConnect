import { prisma } from "../utils/db";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import crypto from "crypto";
import { env } from "../config";

export interface OAuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export async function handleOAuthCallback(
  provider: "google" | "github",
  oauthUser: OAuthUser,
  providerId: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  try {
    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: oauthUser.email },
    });

    // Check if user exists by provider ID
    const providerField = provider === "google" ? "googleId" : "githubId";
    const existingByProvider = await prisma.user.findUnique({
      where: { [providerField]: providerId },
    });

    if (existingByProvider && existingByProvider.id !== user?.id) {
      // Provider ID exists but email is different - link accounts
      if (user) {
        // Update existing user with provider ID
        user = await prisma.user.update({
          where: { id: user.id },
          data: { [providerField]: providerId },
        });
      } else {
        // Use the user with provider ID
        user = existingByProvider;
      }
    }

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          avatarUrl: oauthUser.avatarUrl,
          [providerField]: providerId,
          role: "USER",
        },
      });
    } else {
      // Update existing user with provider info if missing
      const updateData: any = {};
      if (!user[providerField]) {
        updateData[providerField] = providerId;
      }
      if (!user.avatarUrl && oauthUser.avatarUrl) {
        updateData.avatarUrl = oauthUser.avatarUrl;
      }
      if (!user.firstName && oauthUser.firstName) {
        updateData.firstName = oauthUser.firstName;
      }
      if (!user.lastName && oauthUser.lastName) {
        updateData.lastName = oauthUser.lastName;
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // Store refresh token
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error({ error, provider }, "OAuth callback error");
    throw error;
  }
}

