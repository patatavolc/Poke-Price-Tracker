/**
 * Sistema de tareas programadas
 *
 * Coordinador principal que gestiona todas las tareas cron del sistema
 */
import cron from "node-cron";
import { SCHEDULES, INITIAL_FILL_CONFIG } from "./config/schedules.config.js";
import { syncSetsTask } from "./task/syncSets.task.js";
import { syncCardsTask } from "./task/syncCards.task.js";
import {
  updateHotPricesTask,
  updateNormalPricesTask,
} from "./task/updatePrices.task.js";
import { retryWithoutPriceTask } from "./task/retryWithoutPrice.task.js";
import { fillInitialPrices } from "./utils/fillInitialPrices.js";

class SchedulerManager {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }

  /**
   * Registra una tarea programada
   */
  register(name, schedule, taskFunction, enabled = true) {
    if (!enabled) {
      console.log(`⏸️  [${name}] Deshabilitado`);
      return;
    }

    if (!cron.validate(schedule)) {
      console.error(`❌ [${name}] Schedule inválido: ${schedule}`);
      return;
    }

    const task = cron.schedule(
      schedule,
      async () => {
        try {
          await taskFunction();
        } catch (error) {
          console.error(`❌ [${name}] Error crítico:`, error.message);
        }
      },
      {
        scheduled: false, // No iniciar automáticamente
      },
    );

    this.tasks.push({ name, schedule, task, enabled }); // FIX: era 'this.task'
    console.log(`✅ [${name}] Registrado: ${schedule}`);
  }

  /**
   * Inicia todas las tareas programadas
   */
  start() {
    if (this.isRunning) {
      console.warn("⚠️  Scheduler ya está en ejecución");
      return;
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log("🚀 INICIANDO SISTEMA DE TAREAS PROGRAMADAS");
    console.log(`${"=".repeat(80)}\n`);

    this.tasks.forEach(({ name, task }) => {
      task.start();
      console.log(`▶️  [${name}] Iniciado`);
    });

    this.isRunning = true;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`✅ ${this.tasks.length} tareas programadas activas`);
    console.log(`${"=".repeat(80)}\n`);
  }

  /**
   * Detiene todas las tareas programadas
   */
  stop() {
    console.log("\n🛑 Deteniendo tareas programadas...");

    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`⏹️  [${name}] Detenido`);
    });

    this.isRunning = false;
    console.log("✅ Todas las tareas detenidas\n");
  }

  /**
   * Obtiene estado de todas las tareas
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.length,
      tasks: this.tasks.map(({ name, schedule, enabled }) => ({
        name,
        schedule,
        enabled,
      })),
    };
  }
}

// Instancia global del scheduler
const scheduler = new SchedulerManager();

/**
 * Configura e inicia todas las tareas programadas
 */
export async function startAllSchedulers(fillPricesFirst = false) {
  console.log("\n📅 CONFIGURANDO TAREAS PROGRAMADAS...\n");

  // Llenado inicial de precios (opcional)
  if (fillPricesFirst || INITIAL_FILL_CONFIG.enabled) {
    try {
      console.log("🔄 Ejecutando llenado inicial de precios...");
      await fillInitialPrices(INITIAL_FILL_CONFIG.batchSize);
      console.log("✅ Llenado inicial completado\n");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("❌ Error en llenado inicial:", error.message);
      console.log("⏭️  Continuando con schedulers...\n");
    }
  }

  // Registrar tareas
  scheduler.register(
    "SYNC_SETS",
    SCHEDULES.SYNC_SETS.cron,
    syncSetsTask,
    SCHEDULES.SYNC_SETS.enabled,
  );

  scheduler.register(
    "SYNC_CARDS",
    SCHEDULES.SYNC_CARDS.cron,
    syncCardsTask,
    SCHEDULES.SYNC_CARDS.enabled,
  );

  scheduler.register(
    "UPDATE_HOT_PRICES",
    SCHEDULES.UPDATE_HOT_PRICES.cron,
    () => updateHotPricesTask(SCHEDULES.UPDATE_HOT_PRICES.batchSize),
    SCHEDULES.UPDATE_HOT_PRICES.enabled,
  );

  scheduler.register(
    "UPDATE_NORMAL_PRICES",
    SCHEDULES.UPDATE_NORMAL_PRICES.cron,
    () => updateNormalPricesTask(SCHEDULES.UPDATE_NORMAL_PRICES.batchSize),
    SCHEDULES.UPDATE_NORMAL_PRICES.enabled,
  );

  scheduler.register(
    "RETRY_WITHOUT_PRICE",
    SCHEDULES.RETRY_WITHOUT_PRICE.cron,
    () => retryWithoutPriceTask(SCHEDULES.RETRY_WITHOUT_PRICE.olderThanDays),
    SCHEDULES.RETRY_WITHOUT_PRICE.enabled,
  );

  // Iniciar scheduler
  scheduler.start();

  return scheduler;
}

/**
 * Detiene el scheduler
 */
export function stopAllSchedulers() {
  scheduler.stop();
}

/**
 * Obtiene estado del scheduler
 */
export function getSchedulerStatus() {
  return scheduler.getStatus();
}

export default scheduler;
