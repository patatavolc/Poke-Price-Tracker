/**
 * Llenar precios iniciales de cartas sin precio
 *
 * Procesa cartas en lotes para evitar saturar las APIs externas
 */

import { query } from "../../config/db.js";
import { syncAggregatedPrice } from "../../services/price/sync.js";

/**
 * Llena los precios iniciales de todas las cartas sin precio
 * Esta función procesa las cartas en lotes para no saturar la API
 *
 * @param {number} batchSize - Tamaño del lote (default: 100)
 * @returns {Object} Estadísticas del proceso
 */
export async function fillInitialPrices(batchSize = 100) {
  console.log("\nIniciando llenado de precios iniciales...\n");

  try {
    // Contar cartas sin precio
    const { rows: countRows } = await query(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM cards c
      LEFT JOIN price_history ph ON c.id = ph.card_id
      WHERE ph.id IS NULL
    `);

    const totalCards = parseInt(countRows[0].total);

    if (totalCards === 0) {
      console.log("✅ Todas las cartas ya tienen precios registrados");
      return { success: true, total: 0, processed: 0 };
    }

    console.log(`${totalCards} cartas sin precio encontradas`);
    console.log(`Procesando en lotes de ${batchSize} cartas...\n`);

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
        `\nLote ${Math.floor(processedCount / batchSize) + 1}: Procesando ${cards.length} cartas...`,
      );

      for (const card of cards) {
        try {
          await syncAggregatedPrice(card.id);
          successCount++;
          processedCount++;

          // Mostrar progreso cada 10 cartas
          if (successCount % 10 === 0) {
            const percentage = ((processedCount / totalCards) * 100).toFixed(1);
            console.log(
              `Progreso: ${processedCount}/${totalCards} (${percentage}%)`,
            );
          }
        } catch (error) {
          errorCount++;
          processedCount++;
          console.error(`❌ Error en ${card.name}:`, error.message);
        }

        // Esperar para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(
        `✅ Lote completado: ${successCount} exitosos, ${errorCount} errores`,
      );
    }

    console.log("\nLlenado de precios completado");
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
    console.error("❌ Error en fillInitialPrices:", error.message);
    throw error;
  }
}
