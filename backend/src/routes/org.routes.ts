import { Router } from "express";
import * as orgController from "../controllers/org.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireCompany } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, requireCompany, orgController.createOrg);
router.get("/me", authMiddleware, orgController.getMyOrgs);

export default router;

