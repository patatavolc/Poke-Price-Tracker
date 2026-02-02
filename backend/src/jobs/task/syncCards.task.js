/**
 * Tarea: Sincronizar todas las cartas
 */

import { syncAllCards } from "../../services/pokemon.service.js";
import TaskLogger from "../utils/taskLogger.js";

export async function syncCardsTask() {
  const logger = new TaskLogger("SYNC_CARDS");
  logger.start();

  try {
    const result = await syncAllCards();

    logger.metrics.success = result.successCount;
    logger.metrics.failed = result.failCount;
    logger.metrics.skipped = result.skippedCount;
    logger.metrics.total = result.total;

    return logger.complete();
  } catch (error) {
    logger.error("Error sincronizando cartas", error);
    logger.complete();
    throw error;
  }
}
