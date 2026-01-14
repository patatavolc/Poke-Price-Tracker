import express from "express";
import syncRoutes from "./sync.routes.js";
import cardRoutes from "./card.routes.js";
import priceRoutes from "./price.routes.js"

const router = express.Router();

router.use("/sync", syncRoutes);
router.use("/card", cardRoutes);
router.use("/prices", priceRoutes)

export default router;
