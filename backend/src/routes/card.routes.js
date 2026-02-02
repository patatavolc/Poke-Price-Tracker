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
  searchCards,
  filterCardsController,
} from "../controllers/card.controller.js";
import {
  validateCardId,
  validateSetId,
  validatePagination,
  validatePriceParams,
  validateSearchQuery,
  validatePeriod,
  sanitizeInput,
} from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

// Búsqueda y filtrado (deben ir primero para no conflictuar con /:id)
router.get(
  "/search",
  validateSearchQuery,
  validatePagination,
  asyncHandler(searchCards),
);

router.get(
  "/filter",
  validatePriceParams,
  validatePagination,
  asyncHandler(filterCardsController),
);

// Comparación de cartas
router.get("/compare", asyncHandler(compareCardPrices));

// Tendencias
router.get(
  "/trending/price-increase",
  validatePeriod,
  asyncHandler(getTrendingPriceIncrease),
);

router.get(
  "/trending/price-decrease",
  validatePeriod,
  asyncHandler(getTrendingPriceDecrease),
);

// Listas especiales
router.get("/expensive", validatePriceParams, asyncHandler(getExpensiveCards));

router.get("/cheap", validatePriceParams, asyncHandler(getCheapCards));

// Cartas por set
router.get("/set/:set_id", validateSetId, asyncHandler(getCardsFromSet));

// Detalles de carta individual
router.get("/:id", validateCardId, asyncHandler(getCardDetails));

router.get("/price/:id", validateCardId, asyncHandler(getCardPrice));

router.get("/:id/price-range", validateCardId, asyncHandler(getPriceRange));

router.get("/:id/price-alert", validateCardId, asyncHandler(checkPriceAlert));

export default router;
