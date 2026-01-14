import express from "express";
import { syncSets } from "../controllers/sync.controller.js";

const router = express.Router();

router.get("/sets", syncSets);

export default router;
