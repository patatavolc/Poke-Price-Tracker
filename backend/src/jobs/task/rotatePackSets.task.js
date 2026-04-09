/**
 * Tarea: Rotar sets disponibles en el pack opener
 * Selecciona 3 sets aleatorios (excluyendo los 5 más recientes) cada 3 días
 */

import { query } from "../../config/db.js";
import TaskLogger from "../utils/taskLogger.js";

export async function rotatePackSetsTask() {
  const logger = new TaskLogger("ROTATE_PACK_SETS");
  logger.start();

  try {
    // Obtener IDs de los 5 sets más recientes para excluirlos
    const recentRes = await query(
      "SELECT id FROM sets ORDER BY release_date DESC NULLS LAST LIMIT 5"
    );
    const recentIds = recentRes.rows.map((r) => r.id);

    // Seleccionar 3 sets aleatorios del resto
    const placeholders = recentIds.map((_, i) => `$${i + 1}`).join(", ");
    const rotatingRes = await query(
      `SELECT id FROM sets WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 3`,
      recentIds
    );

    if (rotatingRes.rows.length === 0) {
      logger.error("No hay sets disponibles para rotar", new Error("Sin sets"));
      return logger.complete();
    }

    // Reemplazar rotating_sets
    await query("DELETE FROM rotating_sets");
    for (const row of rotatingRes.rows) {
      await query(
        `INSERT INTO rotating_sets (set_id, expires_at)
         VALUES ($1, NOW() + INTERVAL '3 days')`,
        [row.id]
      );
    }

    logger.metrics.success = rotatingRes.rows.length;
    return logger.complete();
  } catch (error) {
    logger.error("Error rotando sets", error);
    logger.complete();
    throw error;
  }
}
