import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getAvailableSetsController,
  openPackController,
} from "../controllers/pack.controller.js";

const router = express.Router();

router.get(
  "/available-sets",
  authenticateToken,
  asyncHandler(getAvailableSetsController)
);

router.post("/open", authenticateToken, asyncHandler(openPackController));

export default router;
