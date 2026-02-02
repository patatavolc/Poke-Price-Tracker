import express from "express";
import {
  getCardDetails,
  getCardPrice,
  getCardsFromSet,
  getTrendingPriceIncrease,
  getExpensiveCards,
  getCheapCards,
  getTrendingPriceDecrease,
  getPriceRange,
  checkPriceAlert,
  compareCardPrices,
} from "../controllers/card.controller.js";

const router = express.Router();

router.get("/:id", getCardDetails);
router.get("/price/:id", getCardPrice);
router.get("/set/:set_id", getCardsFromSet);
router.get("/trending/price-increase", getTrendingPriceIncrease);
router.get("/trending/price-decrease", getTrendingPriceDecrease);
router.get("/expensive", getExpensiveCards);
router.get("/cheap", getCheapCards);
router.get("/:id/price-range", getPriceRange);
router.get("/:id/price-alert", checkPriceAlert);
router.get("/compare", compareCardPrices);

export default router;
