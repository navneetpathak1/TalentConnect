import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, notificationController.getNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

export default router;

