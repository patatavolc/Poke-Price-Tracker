/**
 * Rutas para gestión de sets
 */

import express from "express";
import {
  getSets,
  getSet,
  getSetStatistics,
  getSetsBySeriesName,
  getSeries,
} from "../controllers/set.controller.js";

const router = express.Router();

// Obtener todas las series (debe ir antes de /:setId)
router.get("/series", getSeries);

// Obtener sets por serie
router.get("/series/:seriesName", getSetsBySeriesName);

// Obtener todos los sets
router.get("/", getSets);

// Obtener detalles de un set
router.get("/:setId", getSet);

// Obtener estadísticas de un set
router.get("/:setId/stats", getSetStatistics);

export default router;
