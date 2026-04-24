import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  claimDailyController,
  getCollectionController,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post(
  "/daily-claim",
  authenticateToken,
  asyncHandler(claimDailyController)
);

router.get(
  "/collection",
  authenticateToken,
  asyncHandler(getCollectionController)
);

export default router;
