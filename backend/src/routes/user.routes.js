import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { claimDailyController } from "../controllers/user.controller.js";

const router = express.Router();

router.post(
  "/daily-claim",
  authenticateToken,
  asyncHandler(claimDailyController)
);

export default router;
