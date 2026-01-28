import { query } from "../config/db.js";
import {
  getCardByIdWithHistory,
  getCardPriceService,
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
