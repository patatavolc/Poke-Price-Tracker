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

/**
 * Actualiza precios de cartas normales (sin actualizacion recinte)
 */
export async function updateNormalPricesTask(batchSize = 100) {
  const logger = new TaskLogger("UPDATE_NORMAL_PRICES");
  logger.start();

  try {
    // Buscar cartas que NO han sido actualizadas en la utlimas 6 horas
    const { rows: normalCards } = await query(
      `
      SELECT c.id, c.name
      FROM cards c
      LEFT JOIN price_history ph ON c.id = ph.card_id 
        AND ph.created_at > NOW() - INTERVAL '6 hours'
      WHERE ph.id IS NULL
        AND c.id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 3
        )
      ORDER BY RANDOM()
      LIMIT $1
    `,
      [batchSize],
    );

    logger.info(`${normalCards.length} cartas normales para actualizar`);
    logger.metrics.total = normalCards.length;

    for (const card of normalCards) {
      try {
        await syncAggregatedPrice(card.id);
        logger.success(`${card.name}`);
      } catch (error) {
        logger.error(`Error en ${card.name}`, error);
      }
    }

    return logger.complete();
  } catch (error) {
    logger.error("Error actualizando precios normales", error);
    logger.complete();
    throw error;
  }
}
