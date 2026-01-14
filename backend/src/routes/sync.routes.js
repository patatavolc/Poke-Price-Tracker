import express from "express";
import {
  syncSets,
  syncCards,
  syncAll,
} from "../controllers/sync.controller.js";

const router = express.Router();

router.get("/sets", syncSets);
router.get("/cards/:setId", syncCards);
router.get("/all-cards", syncAll);

export default router;
