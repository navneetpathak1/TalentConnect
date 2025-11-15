import { Router } from "express";
import * as submissionController from "../controllers/submission.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireUser } from "../middleware/role.middleware";

const router = Router();

router.post("/submit", authMiddleware, requireUser, submissionController.submit);

export default router;

