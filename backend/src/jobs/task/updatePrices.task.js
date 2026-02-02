/**
 * Tarea: Actualizar precios de cartas con diferentes estrategias
 */

import { query } from "../../config/db.js";
import { syncAggregatedPrice } from "../../services/price.js";
import TaskLogger from "../utils/taskLogger.js";

/**
 * Actualiza precios de cartas populares (con muchas actualizaciones recientes)
 */

export async function updateHotPricesTask(batchSize = 50) {
  const logger = new TaskLogger("UPDATE_HOT_PRICES");
  logger.start();

  try {
    // Buscar cartas con mas de 10 actualizaciones en los ultimos 7 dias
    const { rows: hotCards } = await query(
      `
      SELECT DISTINCT c.id, c.name
      FROM cards c
      JOIN price_history ph ON c.id = ph.card_id
      WHERE ph.created_at > NOW() - INTERVAL '7 days'
      GROUP BY c.id, c.name
      HAVING COUNT(*) > 10
      ORDER BY COUNT(*) DESC
      LIMIT $1
      `,
      [batchSize],
    );

    logger.info(`${hotCards.length} cartas populares encontradas`);
    logger.metrics.total = hotCards.length;

    for (const card of hotCards) {
      try {
        await syncAggregatedPrice(card.id);
        logger.success(`${card.name}`);
      } catch (error) {
        logger.error(`Error en ${card.name}`, error);
      }
    }

    return logger.complete();
  } catch (error) {
    logger.error("Error actualizando precios populares", error);
    throw error;
  }
}
