import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/presign", authMiddleware, uploadController.getPresignedUrl);

export default router;

