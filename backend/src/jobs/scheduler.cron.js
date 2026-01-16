import cron from "node-cron";
import { query } from "../config/db.js";
import { syncSetsFromAPI, syncAllCards } from "../services/pokemon.service.js";
import { syncAggregatedPrice } from "../services/priceAggregator.service.js";

/**
 * Sincroniza sets cada 24 horas (a las 3 AM)
 */
export const scheduleSetSync = () => {
  cron.schedule("0 3 * * *", async () => {
    console.log("Sincronizando sets programado...");
    try {
      await syncSetsFromAPI();
      console.log("ets sincronizados correctamente");
    } catch (error) {
      console.error("Error sincronizando sets:", error.message);
    }
  });
  console.log("Tarea programada: Sincronizacion de sets (3 AM diaria)");
};

/**
 * Sincroniza todas las cartas cada 12 horas
 */
export const scheduleCardSync = () => {
  cron.schedule("0 */12 * * *", async () => {
    console.log("Sincronizando cartas programado...");
    try {
      await syncAllCards();
      console.log("Cartas sincronizadas correctamente");
    } catch (error) {
      console.error("Error sincronizando cartas:", error.message);
    }
  });
  console.log("Tarea programada: Sincronizacion de cartas (cada 12 horas)");
};

/**
 * Actualiza precios de cartas según prioridad
 * - Cartas con muchas actualizaciones (populares): cada 1 hora
 * - Cartas normales: cada 6 horas
 */
export const schedulePriceUpdates = () => {
  // Actualizar cartas "populares" cada hora
  cron.schedule("0 * * * *", async () => {
    console.log("Actualizando precios de cartas populares...");
    try {
      // Buscar cartas que tienen más de 10 actualizaciones en los últimos 7 días
      const { rows: hotCards } = await query(`
        SELECT DISTINCT c.id, c.name
        FROM cards c
        JOIN price_history ph ON c.id = ph.card_id
        WHERE ph.created_at > NOW() - INTERVAL '7 days'
        GROUP BY c.id, c.name
        HAVING COUNT(*) > 10
        ORDER BY COUNT(*) DESC
        LIMIT 50
      `);

      console.log(`${hotCards.length} cartas populares encontradas`);

      for (const card of hotCards) {
        try {
          await syncAggregatedPrice(card.id);
          console.log(`${card.name}`);
        } catch (error) {
          console.error(`Error en ${card.name}:`, error.message);
        }
      }

      console.log("Precios de cartas populares actualizados");
    } catch (error) {
      console.error("Error actualizando precios populares:", error.message);
    }
  });

  // Actualizar cartas normales cada 6 horas
  cron.schedule("0 */6 * * *", async () => {
    console.log("Actualizando precios de cartas normales...");
    try {
      // Buscar cartas que NO han sido actualizadas en las últimas 6 horas
      const { rows: normalCards } = await query(`
        SELECT c.id, c.name
        FROM cards c
        LEFT JOIN price_history ph ON c.id = ph.card_id 
          AND ph.created_at > NOW() - INTERVAL '6 hours'
        WHERE ph.id IS NULL
        ORDER BY RANDOM()
        LIMIT 100
      `);

      console.log(`${normalCards.length} cartas normales para actualizar`);

      for (const card of normalCards) {
        try {
          await syncAggregatedPrice(card.id);
          console.log(` ${card.name}`);
        } catch (error) {
          console.error(`  Error en ${card.name}:`, error.message);
        }
      }

      console.log("Precios de cartas normales actualizados");
    } catch (error) {
      console.error("Error actualizando precios normales:", error.message);
    }
  });

  console.log(" Tareas programadas de precios iniciadas");
  console.log("   - Cartas populares: cada hora");
  console.log("   - Cartas normales: cada 6 horas");
};

/**
 * Inicia todas las tareas programadas
 */
export const startAllSchedulers = () => {
  console.log("\n Iniciando sistema de tareas programadas...\n");

  scheduleSetSync();
  scheduleCardSync();
  schedulePriceUpdates();

  console.log("\n Todos los schedulers iniciados correctamente\n");
};
