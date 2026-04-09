import { query } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Reclama la recompensa diaria de monedas.
 *
 * Reglas de streak:
 * - < 24h desde último claim → error 409 (ya reclamado hoy)
 * - Entre 24h y >= 48h → streak = 1 (reset)
 * - Entre 24h y < 48h → streak + 1
 *
 * Monedas ganadas: min(streak * 100, 1000)
 *
 * Usa un UPDATE atómico con WHERE para evitar race conditions (doble claim simultáneo).
 */
export const claimDailyCoins = async (userId) => {
  const updated = await query(
    `UPDATE users
     SET coins = coins + LEAST(
                   CASE
                     WHEN last_daily_claim IS NULL OR last_daily_claim < NOW() - INTERVAL '48 hours'
                       THEN 100
                     ELSE (COALESCE(daily_streak, 0) + 1) * 100
                   END,
                   1000
                 ),
         daily_streak = CASE
                          WHEN last_daily_claim IS NULL OR last_daily_claim < NOW() - INTERVAL '48 hours'
                            THEN 1
                          ELSE COALESCE(daily_streak, 0) + 1
                        END,
         last_daily_claim = NOW()
     WHERE id = $1
       AND (last_daily_claim IS NULL OR last_daily_claim < NOW() - INTERVAL '24 hours')
     RETURNING coins, daily_streak`,
    [userId]
  );

  if (updated.rows.length === 0) {
    const userRes = await query("SELECT id FROM users WHERE id = $1", [userId]);
    if (!userRes.rows[0]) throw new AppError("Usuario no encontrado", 404);
    throw new AppError("Ya reclamaste hoy", 409);
  }

  const { coins, daily_streak: newStreak } = updated.rows[0];
  const coinsEarned = Math.min(newStreak * 100, 1000);

  return {
    coins_earned: coinsEarned,
    new_streak: newStreak,
    total_coins: coins,
  };
};
