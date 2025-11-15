import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { env } from "../config";
import { handleOAuthCallback } from "../services/oauth.service";
import { logger } from "../utils/logger";

// Configure Google OAuth
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.OAUTH_REDIRECT_URI
          ? `${env.OAUTH_REDIRECT_URI}/api/v1/auth/google/callback`
          : `http://localhost:8000/api/v1/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "",
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatarUrl: profile.photos?.[0]?.value,
          };

          if (!user.email) {
            return done(new Error("Email not provided by Google"), null);
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// Configure GitHub OAuth
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.OAUTH_REDIRECT_URI
          ? `${env.OAUTH_REDIRECT_URI}/api/v1/auth/github/callback`
          : `http://localhost:8000/api/v1/auth/github/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            id: profile.id.toString(),
            email: profile.emails?.[0]?.value || profile.username + "@github.local",
            firstName: profile.displayName?.split(" ")[0],
            lastName: profile.displayName?.split(" ").slice(1).join(" "),
            avatarUrl: profile.photos?.[0]?.value,
          };

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// Serialize user for session (not used but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

export const googleCallback = passport.authenticate("google", {
  session: false,
  failureRedirect: `${env.FRONTEND_URL}/auth/login?error=oauth_failed`,
});

export const githubAuth = passport.authenticate("github", {
  scope: ["user:email"],
  session: false,
});

export const githubCallback = passport.authenticate("github", {
  session: false,
  failureRedirect: `${env.FRONTEND_URL}/auth/login?error=oauth_failed`,
});

export async function oauthCallbackHandler(
  req: Request,
  res: Response,
  provider: "google" | "github"
): Promise<void> {
  try {
    if (!req.user) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=oauth_failed`);
      return;
    }

    const oauthUser = req.user as any;
    const providerId = oauthUser.id;

    const result = await handleOAuthCallback(provider, oauthUser, providerId);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token
    const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("token", result.accessToken);
    redirectUrl.searchParams.set("user", JSON.stringify(result.user));

    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error({ error, provider }, "OAuth callback handler error");
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=oauth_error`);
  }
}

