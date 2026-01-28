import { query } from "../config/db.js";

export const getCardByIdWithHistory = async (id) => {
  const cardQuery = "SELECT * FROM cards WHERE id = $1";
  const historyQuery =
    "SELECT price_eur, price_usd, created_at FROM price_history WHERE card_id = $1 ORDER BY created_at ASC";

  const cardRes = await query(cardQuery, [id]);

  if (cardRes.rows.length === 0) {
    return null;
  }

  const historyRes = await query(historyQuery, [id]);

  return {
    ...cardRes.rows[0],
    history: historyRes.rows,
  };
};

export const getCardPriceService = async (id) => {
  const queryText =
    "SELECT id, name, last_price_eur, last_price_usd FROM cards WHERE id = $1";

  const res = await query(queryText, [id]);

  if (res.rows === 0) {
    return null;
  }

  return res.rows[0];
};

export const getCardsFromSetService = async (set_id) => {
  const queryText =
    "SELECT id, name, last_price_eur, last_price_use FROM cards WHERE set_id = $1";

  const res = await query(queryText, [set_id]);

  return res.rows;
};
