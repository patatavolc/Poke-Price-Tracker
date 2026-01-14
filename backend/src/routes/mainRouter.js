import express from "express";
import syncRoutes from "./sync.routes.js";
import cardRoutes from "./card.routes.js";

const router = express.Router();

router.use("/sync", syncRoutes);
router.use("/card", cardRoutes);

export default router;
