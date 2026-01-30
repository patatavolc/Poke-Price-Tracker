import { query } from "../config/db.js";
import {
  getCardByIdWithHistory,
  getCardPriceService,
  getTrendingPriceIncreaseService,
  getCardsFromSetService,
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
