import { Router } from "express";
import * as leaderboardController from "../controllers/leaderboard.controller";

const router = Router();

router.get("/:hackathonId", leaderboardController.getLeaderboard);

export default router;

