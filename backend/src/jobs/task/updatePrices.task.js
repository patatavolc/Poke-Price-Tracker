/**
 * Tarea: Actualizar precios de cartas con diferentes estrategias
 */

import { query } from "../../config/db.js";
import { syncAggregatedPrice } from "../../services/price/sync.js";
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

/**
 * Actualiza TODAS las cartas en lotes (para 19.000+ cartas)
 * Se ejecuta en segundo plano y toma varias horas
 */
export async function updateAllPricesTask(batchSize = 100, delayMs = 2000) {
  const logger = new TaskLogger("UPDATE_ALL_PRICES");
  logger.start();

  try {
    // Obtener el total de cartas
    const { rows: totalResult } = await query(
      `SELECT COUNT(*) as total FROM cards`,
    );
    const totalCards = parseInt(totalResult[0].total);

    logger.info(`Total de cartas: ${totalCards}`);
    logger.metrics.total = totalCards;

    let offset = 0;
    let processedCards = 0;

    // Procesar en lotes
    while (processedCards < totalCards) {
      const { rows: cards } = await query(
        `
        SELECT id, name
        FROM cards
        ORDER BY id
        LIMIT $1 OFFSET $2
        `,
        [batchSize, offset],
      );

      if (cards.length === 0) break;

      logger.info(
        `Lote ${Math.floor(offset / batchSize) + 1}: ${cards.length} cartas`,
      );

      for (const card of cards) {
        try {
          await syncAggregatedPrice(card.id);
          logger.success(`${card.name} (${++processedCards}/${totalCards})`);

          // Delay de 2 segundos para no saturar las APIs externas
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } catch (error) {
          logger.error(`Error en ${card.name}`, error);
          processedCards++;
        }
      }

      offset += batchSize;

      // Log de progreso cada 500 cartas
      if (processedCards % 500 === 0) {
        const progress = ((processedCards / totalCards) * 100).toFixed(2);
        logger.info(`Progreso: ${processedCards}/${totalCards} (${progress}%)`);
      }
    }

    return logger.complete();
  } catch (error) {
    logger.error("Error actualizando todas las cartas", error);
    logger.complete();
    throw error;
  }
}
