import { query } from "../config/db.js";
import {
  getCardByIdWithHistory,
  getCardPriceService,
  getTrendingPriceIncreaseService,
  getTrendingPriceDecreaseService,
  getCardsFromSetService,
  getMostExpensiveCardsService,
  getCheapestCardsService,
  getPriceRangeService,
  checkPriceAlertService,
  compareCardPricesService,
} from "../services/card.service.js";

export const getCardDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const cardData = await getCardByIdWithHistory(id);

    if (!cardData) {
      return res.status(404).json({ error: "Carta no encontrada" });
    }

    res.json(cardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCardPrice = async (req, res) => {
  const { id } = req.params;
  try {
    const cardData = await getCardPriceService(id);

    if (!cardData) {
      return res.status(404).json({ error: "Carta no encontrada" });
    }

    res.json(cardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCardsFromSet = async (req, res) => {
  const { set_id } = req.params;
  try {
    const cards = await getCardsFromSetService(set_id);

    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrendingPriceIncrease = async (req, res) => {
  const { period = "24h" } = req.query;

  if (!["24h", "7d"].includes(period)) {
    return res
      .status(400)
      .json({ error: "Período inválido. Use '24h' o '7d'." });
  }

  try {
    const cards = await getTrendingPriceIncreaseService(period);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrendingPriceDecrease = async (req, res) => {
  const { period = "24h" } = req.query;

  if (!["24h", "7d"].includes(period)) {
    return res
      .status(400)
      .json({ error: "Período inválido. Use '24h' o '7d'." });
  }

  try {
    const cards = await getTrendingPriceDecreaseService(period);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpensiveCards = async (req, res) => {
  const { limit = 20, currency = "eur" } = req.query;

  if (!["eur", "usd"].includes(currency)) {
    return res
      .status(400)
      .json({ error: "Moneda inválida. Use 'eur' o 'usd'." });
  }

  try {
    const cards = await getMostExpensiveCardsService(limit, currency);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCheapCards = async (req, res) => {
  const { limit = 20, currency = "eur" } = req.query;

  if (!["eur", "usd"].includes(currency)) {
    return res
      .status(400)
      .json({ error: "Moneda inválida. Use 'eur' o 'usd'." });
  }

  try {
    const cards = await getCheapestCardsService(limit, currency);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPriceRange = async (req, res) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  try {
    const priceRange = await getPriceRangeService(id, parseInt(days));

    if (!priceRange) {
      return res.status(404).json({
        error:
          "No hay datos de precios para esta carta en el periodo especificado",
      });
    }

    res.json(priceRange);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkPriceAlert = async (req, res) => {
  const { id } = req.params;
  const { threshold, currency = "eur" } = req.query;

  if (!threshold) {
    return res
      .status(400)
      .json({ error: "El parametro 'threshold' es obligatorio" });
  }

  if (!["eur", "usd"].includes(currency)) {
    return res.status(400).json({ error: "La moneda debe ser 'eur' o 'usd'" });
  }

  try {
    const alert = await checkPriceAlertService(id, threshold, currency);

    if (!alert) {
      return res.status(404).json({ eur: "Carta no encontrada" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const compareCardPrices = async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: "El parametro 'ids' es requerido" });
  }

  const cardIds = ids.split(",").map((id) => id.trim());

  if (cardIds.length < 2) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos 2 cartas para comparar" });
  }

  if (cardIds.length > 10) {
    return res.status(400).json({ error: "Maximo 10 cartas para comparar" });
  }

  try {
    const cards = await compareCardPricesService(cardIds);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
