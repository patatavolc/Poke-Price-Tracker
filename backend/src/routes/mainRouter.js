import express from "express";
import syncRoutes from "./sync.routes.js";
import cardRoutes from "./card.routes.js";
import priceRoutes from "./price.routes.js";
import setRoutes from "./set.routes.js";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/sync", syncRoutes);
router.use("/cards", cardRoutes);
router.use("/prices", priceRoutes);
router.use("/sets", setRoutes);
router.use("/auth", authRoutes);

export default router;
