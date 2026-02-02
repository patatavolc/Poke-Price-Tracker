/**
 * Sistema de tareas programadas
 *
 * Coordinador principal que testiona todas las tareas cron del sistema
 */
import cron, { schedule } from "node-cron";
import { SCHEDULES, INITIAL_FILL_CONFIG } from "./config/schedules.config.js";
import { syncSetsTask } from "./task/syncSets.task.js";
import { syncCardsTask } from "./task/syncCards.task.js";
import {
  updateHotPricesTask,
  updateNormalPricesTask,
} from "./task/updatePrices.task.js";
import { retryWithoutPriceTask } from "./task/retryWithoutPrice.task.js";
import { fillinitialPrices } from "./scheduler.cron.js";

class SchedulerManager {
  constructor() {
    this.task = [];
    this.isRunning = false;
  }

  /**
   * Registra una tarea programada
   */
  register(name, chedule, taskFunction, enabled = true) {
    if (!enabled) {
      console.log(`[${name}] Deshabilitado`);
      return;
    }

    if (!cron.validate(schedule)) {
      console.error(`[${name}] Schedule invalido: ${schedule}`);
      return;
    }

    const task = cron.schedule(
      schedule,
      async () => {
        try {
          await taskFunction();
        } catch (error) {
          console.error(`[${name}] Error critico:`, error.message);
        }
      },
      {
        scheduled: false, // No iniciar automaticamente
      },
    );

    this.task.push({ name, schedule, task, enabled });
    console.log(`[${name}] Registrado: ${schedule}`);
  }

  start() {
    if (this.isRunning) {
      console.warn(" Scheduler ya está en ejecución");
      return;
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(" INICIANDO SISTEMA DE TAREAS PROGRAMADAS");
    console.log(`${"=".repeat(80)}\n`);

    this.tasks.forEach(({ name, task }) => {
      task.start();
      console.log(`  [${name}] Iniciado`);
    });

    this.isRunning = true;

    console.log(`\n${"=".repeat(80)}`);
    console.log(` ${this.tasks.length} tareas programadas activas`);
    console.log(`${"=".repeat(80)}\n`);
  }

  /**
   * Detiene todas las tareas programadas
   */
  stop() {
    console.log("\nDeteniendo tareas programadas...");

    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`  [${name}] Detenido`);
    });

    this.isRunning = false;
    console.log(" Todas las tareas detenidas\n");
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
