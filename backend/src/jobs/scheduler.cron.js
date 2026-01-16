import cron from "node-cron";
import { query } from "../config/db.js";
import { syncSetsFromAPI, syncAllCards } from "../services/pokemon.service.js";
import { syncAggregatedPrice } from "../services/priceAggregator.service.js";
import { updateCardPrice } from "../services/price.service.js";

// Sincroniza sets cada 24 horas (a las 3AM)
export const scheduleSetSync = () => {
  cron.schedule("0 3 * * *", async () => {
    console.log("Sincronizando sets programado...");
    try {
      await syncSetsFromAPI();
      console.log("Sets sincronizados correctamente");
    } catch (error) {
      console.error("Error sincronizando sets:", error.message);
    }
  });
  console.log("Tarea programada: Sincronizacion de sets (3 AM diaria)");
};

// Sincroniza todas las cartas cada 12 horas
export const scheduleCardSync = () => {
  cron.schedule("0 */12 * * *", async () => {
    console.log("Sincronizando cartas promado...");
    try {
      await syncAllCards();
      console.log("Cartas sincronizadas correctamente");
    } catch (error) {
      console.error("Error sincronizando cartas:", error.message);
    }

    console.log("Tarea programada: Sincronizacion de cartas (Cada 12 horas)");
  });
};

// Actualiza el precio de cartas segun la prioridad
// Cartas con muchas actualizaciones cada 1 horas
// Cartas normales cada 6 horas

export const schedulePriceUpdates = () => {
  // Cartas populares
  cron.schedule("0 * * * *", async () => {
    console.log("Actualizando precios de cartas populares...");
    try {
      // Buscar cartas que tienen mas de 10 actualizaciones en los ultimos  dias
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
          console.error(`Error en ${card.name}:`, errror.message);
        }
      }

      console.log("Precios de cartas populares actualizados");
    } catch (error) {
      console.error("Error actualizando precios populares:", error.message);
    }
  });

  console.log("Tareas programadas de precios iniciadas");
  console.log("Cartas opulares: cada hora");
  console.log("Cartas normales: cada 6 horas");
};

//  Inicia todas las tareas programas
export const startAllSchedulers = () => {
  console.log("Iniciando sistema de tareas programadas...\n");

  scheduleSetSync();
  scheduleCardSync();
  schedulePriceUpdates();

  console.log("\n Todos los schedules iniciados correctamente\n");
};
