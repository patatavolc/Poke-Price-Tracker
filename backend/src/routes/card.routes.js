import express from "express";
import {
  getCardDetails,
  getCardPrice,
  getCardsFromSet,
  getTrendingPriceIncrease,
  getExpensiveCards,
} from "../controllers/card.controller.js";

const router = express.Router();

router.get("/:id", getCardDetails);
router.get("/price/:id", getCardPrice);
router.get("/set/:set_id", getCardsFromSet);
router.get("/trending/price-increase", getTrendingPriceIncrease);
router.get("/trending/price-decrease", getTrendingPriceIncrease);
router.get("/cards/expensive", getExpensiveCards);

/**
 * TODO:
 * Cartas con mayor subida de precio (Ultimas 24h, 7d)
 * GET /cards/trending/price-increase
 *
 * Cartas con mayor bajada de precio
 * GET /cards/trending/price-decrease
 *
 * Cartas mas caras del mercado
 * GET /cards/expensive
 *
 * Cartas mas baratas
 * GET /cards/cheap
 *
 * Rangos de precios (min/max) en un periodo
 * GET /cards/:id/price-range?days=30
 *
 * Verificar si el precio esta por debajo del umbral
 * GET /cards/:id/price-alert_threshold=50
 *
 * Comparar precios de multiples cartas
 * GET /cards/compare?ids=id1,id2,id3
 */
export default router;
