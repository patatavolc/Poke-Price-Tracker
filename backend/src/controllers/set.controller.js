/**
 * Controladores para gestión de sets
 */

import {
  getAllSets,
  getSetDetails,
  getSetStats,
  getSetsBySeries,
  getAllSeries,
} from "../services/set.service.js";

/**
 * GET /api/sets
 * Obtiene todos los sets
 */
export const getSets = async (req, res) => {
  try {
    const { orderBy } = req.query;
    const sets = await getAllSets(orderBy);
    res.json({
      success: true,
      count: sets.length,
      data: sets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/sets/:setId
 * Obtiene detalles de un set específico
 */
export const getSet = async (req, res) => {
  try {
    const { setId } = req.params;
    const set = await getSetDetails(setId);

    if (!set) {
      return res.status(404).json({ error: "Set no encontrado" });
    }

    res.json({
      success: true,
      data: set,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/sets/:setId/stats
 * Obtiene estadísticas de un set
 */
export const getSetStatistics = async (req, res) => {
  try {
    const { setId } = req.params;
    const stats = await getSetStats(setId);

    if (!stats) {
      return res.status(404).json({ error: "Set no encontrado" });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/sets/series/:seriesName
 * Obtiene sets de una serie específica
 */
export const getSetsBySeriesName = async (req, res) => {
  try {
    const { seriesName } = req.params;
    const sets = await getSetsBySeries(seriesName);

    res.json({
      success: true,
      count: sets.length,
      data: sets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/sets/series
 * Obtiene lista de todas las series
 */
export const getSeries = async (req, res) => {
  try {
    const series = await getAllSeries();

    res.json({
      success: true,
      count: series.length,
      data: series,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
