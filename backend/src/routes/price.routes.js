import express from "express";
import {
  updatePrice,
  updateAggregatedPrice,
} from "../controllers/price.controller.js";
import { getWithoutPriceStats } from "../services/price/cardsWithoutPrice.service.js";

const router = express.Router();

router.post("/update/:cardId", updatePrice);
router.post("/update-aggregated/:cardId", updateAggregatedPrice);

router.get("/without-price-stats", async (req, res) => {
  try {
    const stats = await getWithoutPriceStats();
    res.json(stats || { message: "No hay cartas sin precio registradas" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
