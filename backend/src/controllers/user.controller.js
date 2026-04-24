import { claimDailyCoins } from "../services/user.pack.service.js";
import { query } from "../config/db.js";

export const claimDailyController = async (req, res) => {
  const result = await claimDailyCoins(req.user.id);
  res.json(result);
};

export const getCollectionController = async (req, res) => {
  const result = await query(
    `SELECT
       c.id          AS card_id,
       c.name,
       c.image_small,
       c.rarity,
       s.id          AS set_id,
       s.name        AS set_name,
       s.release_date,
       uc.quantity,
       c.last_price_eur
     FROM user_cards uc
     JOIN cards c  ON uc.card_id = c.id
     JOIN sets  s  ON c.set_id   = s.id
     WHERE uc.user_id = $1
     ORDER BY s.release_date DESC NULLS LAST, c.name`,
    [req.user.id]
  );
  res.json(result.rows);
};
