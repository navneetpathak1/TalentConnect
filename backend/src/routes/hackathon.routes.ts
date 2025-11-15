import { Router } from "express";
import * as hackathonController from "../controllers/hackathon.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireCompany } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, requireCompany, hackathonController.createHackathon);
router.get("/", hackathonController.getHackathons);
router.post("/:id/join", authMiddleware, hackathonController.joinHackathon);

export default router;

