import { query } from "../config/db.js";

export const getCardByIdWithHistory = async (id) => {
  const cardQuery = "SELECT * FROM cards WHERE id = $1";
  const historyQuery =
    "SELECT price, created_at FROM price_history WHERE card_id = $1 ORDER BY created_at ASC";

  const cardRes = await query(cardQuery, [id]);

  if (cardQuery.rows.length === 0) {
    return null;
  }

  const historyRes = await query(historyQuery, [id]);

  return {
    ...cardRes.rows[0],
    history: historyRes.rows,
  };
};
