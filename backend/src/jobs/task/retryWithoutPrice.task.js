/**
 * Tarea: Reintentar obtener precios de cartas sin precio disponible
 */

import {
  retryCardsWithoutPrice,
  getWithoutPriceStats,
} from "../../services/price/cardsWithoutPrice.service.js";
import { syncAggregatedPrice } from "../../services/price/sync.js";
import TaskLogger from "../utils/taskLogger.js";

export async function retryWithoutPriceTask(olderThanDays = 30) {
  const logger = new TaskLogger("RETRY_WITHOUT_PRICE");
  logger.start();

  try {
    // Obtener estadísticas antes
    const statsBefore = await getWithoutPriceStats();
    logger.info(`Cartas sin precio: ${statsBefore?.total_cards || 0}`);

    // Obtener cartas para reintentar
    const cardIds = await retryCardsWithoutPrice(olderThanDays);
    logger.info(`${cardIds.length} cartas seleccionadas para reintento`);
    logger.metrics.total = cardIds.length;

    if (cardIds.length === 0) {
      logger.info("No hay cartas para reintentar");
      return logger.complete();
    }

    // Reintentar cada carta
    for (let i = 0; i < cardIds.length; i++) {
      const cardId = cardIds[i];

      try {
        logger.progress(i + 1, cardIds.length, `- Carta: ${cardId}`);

        const result = await syncAggregatedPrice(cardId);

        if (result) {
          logger.success(`${cardId} - Precio obtenido`);
        } else {
          logger.skip(`${cardId} - Aún sin precio`);
        }

        // Esperar 2 segundos entre cada carta
        if (i < cardIds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        logger.error(`${cardId}`, error);
      }
    }

    // Obtener estadísticas después
    const statsAfter = await getWithoutPriceStats();
    logger.info(`Cartas sin precio (después): ${statsAfter?.total_cards || 0}`);

    return logger.complete();
  } catch (error) {
    logger.error("Error en tarea de reintento", error);
    logger.complete();
    throw error;
  }
}
