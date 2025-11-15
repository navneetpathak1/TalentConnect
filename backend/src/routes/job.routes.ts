import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireCompany } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, requireCompany, jobController.createJob);
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJob);

export default router;

