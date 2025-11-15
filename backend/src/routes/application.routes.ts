import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireUser } from "../middleware/role.middleware";

const router = Router();

router.post("/apply", authMiddleware, requireUser, applicationController.apply);
router.get("/me", authMiddleware, requireUser, applicationController.getMyApplications);

export default router;

