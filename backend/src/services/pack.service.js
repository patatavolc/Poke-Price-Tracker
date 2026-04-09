import { query, getClient } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Devuelve los sets disponibles para abrir sobres:
 * - 5 sets más recientes (fijos)
 * - hasta 3 sets rotativos activos
 */
export const getAvailableSets = async () => {
  const [recentRes, rotatingRes] = await Promise.all([
    query(`
    SELECT id, name, series, logo_url, symbol_url, release_date,
           false AS is_rotating
    FROM sets
    ORDER BY release_date DESC NULLS LAST
    LIMIT 5
  `),
    query(`
    SELECT s.id, s.name, s.series, s.logo_url, s.symbol_url, s.release_date,
           true AS is_rotating
    FROM rotating_sets rs
    JOIN sets s ON rs.set_id = s.id
    WHERE rs.expires_at > NOW()
    LIMIT 3
  `),
  ]);

  return [...recentRes.rows, ...rotatingRes.rows];
};

const pickCard = async (setId, rarities) => {
  for (const rarity of rarities) {
    const res = await query(
      `SELECT id, name, image_small, image_large, rarity
       FROM cards
       WHERE set_id = $1 AND rarity = $2
       ORDER BY RANDOM()
       LIMIT 1`,
      [setId, rarity]
    );
    if (res.rows.length > 0) return res.rows[0];
  }
  const res = await query(
    `SELECT id, name, image_small, image_large, rarity
     FROM cards
     WHERE set_id = $1
     ORDER BY RANDOM()
     LIMIT 1`,
    [setId]
  );
  return res.rows[0] || null;
};

const RARITY_SLOTS = [
  { count: 6, rarities: ["Common"] },
  { count: 2, rarities: ["Uncommon"] },
  { count: 1, rarities: ["Rare", "Rare Holo"] },
  { count: 1, rarities: ["Rare Secret", "Ultra Rare", "Rare Holo", "Rare"] },
];

export const openPack = async (userId, setId) => {
  const setCheck = await query("SELECT id FROM sets WHERE id = $1", [setId]);
  if (setCheck.rows.length === 0) throw new AppError("Set no encontrado", 404);

  const client = await getClient();
  try {
    await client.query("BEGIN");

    const coinRes = await client.query(
      `UPDATE users SET coins = coins - 100
       WHERE id = $1 AND coins >= 100
       RETURNING coins`,
      [userId]
    );
    if (coinRes.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new AppError("Monedas insuficientes", 400);
    }

    const cards = [];
    for (const slot of RARITY_SLOTS) {
      for (let i = 0; i < slot.count; i++) {
        const card = await pickCard(setId, slot.rarities);
        if (card) cards.push(card);
      }
    }

    if (cards.length === 0) {
      await client.query("ROLLBACK");
      throw new AppError("No se encontraron cartas en el set", 500);
    }

    for (const card of cards) {
      await client.query("CALL add_card_to_user($1, $2)", [userId, card.id]);
    }

    await client.query("COMMIT");
    return { cards, remaining_coins: coinRes.rows[0].coins };
  } catch (err) {
    if (err.isOperational) throw err; // AppError already thrown after ROLLBACK
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};
