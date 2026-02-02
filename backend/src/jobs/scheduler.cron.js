import cron from "node-cron";
import { query } from "../config/db.js";
import { syncSetsFromAPI, syncAllCards } from "../services/pokemon.service.js";
import { syncAggregatedPrice } from "../services/price/sync.js";

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
 * Llena los precios iniciales de todas las cartas sin precio
 * Esta funcion procesa las cartas en lotes, asi no se satura la API
 */
export const fillInitialPrices = async (batchSize = 100) => {
  console.log("\n Iniciando llenado de precios iniciales...\n");

  try {
    // Contar cartas sin pecio
    const { rows: countRows } = await query(` 
      SELECT COUNT(DISTINCT c.id) as total
      FROM cards c
      LEFT JOIN price_history ph ON c.id = ph.card_id
      WHERE ph.id IS NULL
      `);

    const totalCards = parseInt(countRows[0].total);

    if (totalCards === 0) {
      console.log("Todas las cartas ya tienen precios registrados");
      return { success: true, total: 0, processed: 0 };
    }

    console.log(`${totalCards} cartas sin precio encontradas`);
    console.log(`Procesando en lotes de ${batchSize} cartas... \n`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    while (processedCount < totalCards) {
      // Obtener siguiente lote de cartas sin precio
      const { rows: cards } = await query(
        ` 
          SELECT c.id, c.name
          FROM cards c
          LEFT JOIN price_history ph ON c.id = ph.card_id
          WHERE ph.id IS NULL
          LIMIT $1
          `,
        [batchSize],
      );

      if (cards.length === 0) break;

      console.log(
        `\n Lote ${Math.floor(processedCount / batchSize) + 1}: Procesando ${
          cards.length
        } cartas...`,
      );

      for (const card of cards) {
        try {
          await syncAggregatedPrice(card.id);
          successCount++;
          processedCount++;

          // Se muestra el proceso cada 10 cartas
          if (successCount % 10 === 0) {
            const percentage = ((processedCount / totalCards) * 100).toFixed(1);
            console.log(
              `Progreso: ${processedCount}/${totalCards} (${percentage}%)`,
            );
          }
        } catch (error) {
          errorCount++;
          processedCount++;
          console.error(`Error en ${card.name}:`, error.message);
        }

        // Espera para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log(
        `Lote completado: ${successCount} exitosos, ${errorCount} errores`,
      );
    }

    console.log("\n Llenado de precio completado");
    console.log(`Total procesados: ${processedCount}`);
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    return {
      success: true,
      total: totalCards,
      processed: processedCount,
      successful: successCount,
      errors: errorCount,
    };
  } catch (error) {
    console.error("Error en fillInitialPrices:", error.message);
    throw error;
  }
};

/**
 * Inicia todas las tareas programadas
 * @param {boolean} fillPricesFirst - Si es true, llena los precios antes de iniciar los cron jobs
 */
export const startAllSchedulers = async (fillPricesFirst = false) => {
  console.log("\n Iniciando sistema de tareas programadas...\n");

  //Llenar precios iniciales si se solicita
  if (fillPricesFirst) {
    try {
      await fillInitialPrices(50); // Lotes de 50 cartas
      console.log("Esperando 10 segundos...\n");
      await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (error) {
      console.error("Error llenando precios, Continuando con schedulers... \n");
    }
  }
  scheduleSetSync();
  scheduleCardSync();
  schedulePriceUpdates();

  console.log("\n Todos los schedulers iniciados correctamente\n");
};
