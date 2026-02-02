/**
 * Tarea: Sincronizar sets desde Pokemon TCG API
 */

import { syncSetsFromAPI } from "../../services/pokemon.service.js";
import TaskLogger from "../utils/taskLogger.js";

export async function syncSetsTask() {
  const logger = new TaskLogger("SYNC_SETS");
  logger.start();

  try {
    const result = await syncSetsFromAPI();

    logger.info(`${result.count} sets sincronizados`);
    logger.metrics.success = result.count;
    logger.metrics.total = result.count;

    return logger.complete();
  } catch (error) {
    logger.error("Error sincronizando sets", error);
    logger.complete();
    throw error;
  }
}
