import express from "express";
import { syncSets } from "../controllers/sync.controllerr";

const router = express.Router();

router.get("/sync-set", syncSets);

export default router;
