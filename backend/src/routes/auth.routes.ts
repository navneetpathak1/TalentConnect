import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rate-limit.middleware";
import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  oauthCallbackHandler,
} from "../middleware/oauth.middleware";
import { env } from "../config";

const router = Router();

router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// OAuth routes
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get("/google", googleAuth);
  router.get("/google/callback", googleCallback, (req, res) => {
    oauthCallbackHandler(req, res, "google");
  });
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({
      success: false,
      data: null,
      error: {
        message: "Google OAuth not configured",
        code: "OAUTH_NOT_CONFIGURED",
      },
    });
  });
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  router.get("/github", githubAuth);
  router.get("/github/callback", githubCallback, (req, res) => {
    oauthCallbackHandler(req, res, "github");
  });
} else {
  router.get("/github", (req, res) => {
    res.status(503).json({
      success: false,
      data: null,
      error: {
        message: "GitHub OAuth not configured",
        code: "OAUTH_NOT_CONFIGURED",
      },
    });
  });
}

export default router;

