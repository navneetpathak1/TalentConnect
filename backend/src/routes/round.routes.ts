import { Router } from "express";
import * as roundController from "../controllers/round.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireCompany } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, requireCompany, roundController.createRound);

export default router;

