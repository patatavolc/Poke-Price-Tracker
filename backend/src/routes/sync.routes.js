import express from "express";
import { syncSets, syncCards } from "../controllers/sync.controller.js";

const router = express.Router();

router.get("/sets", syncSets);
router.get("/cards/:setId", syncCards);

export default router;
