/**
 * Servicio de sincronización de precios
 *
 * Este módulo maneja la sincronización masiva de precios desde múltiples fuentes.
 * Coordina el proceso de consulta, agregación y almacenamiento de precios en la base de datos.
 *
 * Funcionalidades principales:
 * - Sincronizar precio de una carta individual
 * - Sincronizar todas las cartas sin precio (batch processing)
 * - Sincronizar todas las cartas del sistema
 * - Seguimiento de progreso y estadísticas
 * - Manejo de errores y reintentos
 */

import { query } from "../../config/db.js";
import { getAggregatedPrice } from "./aggregator.js";
import { sleep } from "./utils.js";
import { isCardWithoutPrice, getWithoutPriceStats } from "./tracking.js";

/**
 * Sincroniza el precio agregado de una carta individual
 *
 * Obtiene los datos de la carta desde la base de datos, consulta los precios
 * de múltiples fuentes, calcula el promedio y guarda el historial de precios.
 *
 * @param {string} cardId - ID de la carta a sincronizar
 * @returns {Object|null} Objeto con los datos de precio agregado o null si no hay precios
 * @throws {Error} Si la carta no existe en la base de datos o hay un error crítico
 */
export const syncAggregatedPrice = async (cardId) => {
  try {
    // Obtener información básica de la carta desde la base de datos
    console.log(`\nObteniendo datos de carta ${cardId} desde DB...`);
    const { rows } = await query(
      "SELECT name, set_id FROM cards WHERE id = $1",
      [cardId],
    );

    if (rows.length === 0) {
      console.error(`❌ Carta ${cardId} no encontrada en la DB`);
      throw new Error("Carta no encontrada en la DB");
    }

    const { name, set_id } = rows[0];
    console.log(`Carta encontrada: ${name} (Set ID: ${set_id})`);

    // Obtener el nombre del set para mejor contexto en logs
    const { rows: setRows } = await query(
      "SELECT name FROM sets WHERE id = $1",
      [set_id],
    );
    const setName = setRows[0]?.name || "";
    console.log(`Set: ${setName || "Sin nombre de set"}`);

    const priceData = await getAggregatedPrice(cardId, name, setName);

    if (!priceData) {
      console.log(`⚠️ No se encontraron precios para ${name}`);
      return null;
    }

    // Guardar cada precio individual en el historial
    // Se guarda un registro por cada fuente exitosa (TCGPlayer y/o Cardmarket)
    console.log(
      `\nGuardando ${priceData.sources.length} precios en la base de datos...`,
    );
    for (const source of priceData.sources) {
      await query(
        "INSERT INTO price_history (card_id, price_usd, price_eur, source) VALUES ($1, $2, $3, $4)",
        [cardId, source.priceUsd, source.priceEur.toFixed(2), source.source],
      );
      console.log(
        `  ✅ Guardado precio de ${source.source}: €${source.priceEur.toFixed(2)} / $${source.priceUsd}`,
      );
    }

    // Mostrar qué fuentes fallaron (si hubo alguna)
    // Esto ayuda a diagnosticar problemas con APIs específicas
    if (priceData.sourcesStatus) {
      const failed = Object.entries(priceData.sourcesStatus)
        .filter(([_, status]) => !status.success)
        .map(([name, _]) => name);
      if (failed.length > 0) {
        console.log(`\n⚠ Fuentes sin precio: ${failed.join(", ")}`);
      }
    }

    console.log(
      `\n✅ COMPLETADO - ${name}: €${priceData.averagePriceEur} / $${priceData.averagePriceUsd} (${priceData.sources.length}/2 fuentes)`,
    );
    return priceData;
  } catch (error) {
    console.error("❌ Error sincronizando precio agregado:", error.message);
    throw error;
  }
};

/**
 * Sincroniza precios de cartas que no tienen precio en la base de datos
 *
 * Esta función es ideal para completar el catálogo de precios sin procesar
 * cartas que ya tienen precios actualizados. Útil para sincronizaciones incrementales.
 *
 * @param {number|null} dailyLimit - Límite opcional de cartas a procesar (null = sin límite)
 * @returns {Object} Estadísticas de la sincronización:
 *   - success: true si completó sin errores críticos
 *   - successCount: Número de cartas con precio sincronizado correctamente
 *   - skippedCount: Número de cartas sin precio disponible en ninguna fuente
 *   - failCount: Número de cartas que generaron error
 *   - total: Total de cartas procesadas
 *
 * Incluye delays entre peticiones para evitar sobrecarga de las APIs.
 */
export const syncMissingPrices = async (dailyLimit = null) => {
  try {
    console.log("\nBuscando cartas sin precio en la base de datos...");

    // Excluir cartas marcadas como sin precio
    let queryStr = `
      SELECT id, name 
      FROM cards 
      WHERE (last_price_usd IS NULL OR last_price_eur IS NULL)
        AND id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 2
        )
      ORDER BY id
    `;
    const queryParams = [];

    if (dailyLimit !== null) {
      queryStr += " LIMIT $1";
      queryParams.push(dailyLimit);
    }

    const { rows: cards } = await query(queryStr, queryParams);

    if (cards.length === 0) {
      console.log(
        "✅ Todas las cartas disponibles tienen precios sincronizados",
      );

      // Mostrar estadísticas de cartas sin precio
      const stats = await getWithoutPriceStats();
      if (stats && parseInt(stats.total_cards) > 0) {
        console.log(`\n📊 CARTAS SIN PRECIO DISPONIBLE:`);
        console.log(`   Total: ${stats.total_cards}`);
        console.log(`   Primer intento: ${stats.first_attempt}`);
        console.log(`   Pocos intentos (2-5): ${stats.few_attempts}`);
        console.log(`   Muchos intentos (>5): ${stats.many_attempts}`);
        console.log(`   Promedio intentos: ${stats.avg_attempts}`);
      }

      return { success: true, total: 0 };
    }

    console.log(`Encontradas ${cards.length} cartas sin precio`);
    if (dailyLimit) {
      console.log(`LÍMITE: Procesando máximo ${dailyLimit} cartas`);
    }

    // Mostrar cartas que se están skipeando
    const { rows: skippedCards } = await query(`
      SELECT COUNT(*) as count 
      FROM cards_without_price 
      WHERE attempt_count >= 2
    `);
    if (parseInt(skippedCards[0].count) > 0) {
      console.log(
        `⏭️  Skipeando ${skippedCards[0].count} cartas sin precio confirmado`,
      );
    }

    console.log("Iniciando sincronización de precios faltantes...");
    console.log(
      `Tiempo estimado: ~${Math.ceil((cards.length * 2.5) / 60)} minutos\n`,
    );

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      try {
        console.log(`\n${"=".repeat(80)}`);
        console.log(
          `Progreso: ${i + 1}/${cards.length} (${(((i + 1) / cards.length) * 100).toFixed(1)}%)`,
        );
        console.log(`Carta: ${card.name} (ID: ${card.id})`);
        console.log(
          `Tiempo transcurrido: ${Math.floor((Date.now() - startTime) / 1000)}s`,
        );

        const result = await syncAggregatedPrice(card.id);

        if (result) {
          successCount++;
          console.log(`\n✅ Éxito - Total exitosas: ${successCount}`);
        } else {
          skippedCount++;
          console.log(`\n⚠ Omitida - Total omitidas: ${skippedCount}`);
        }

        if (i < cards.length - 1) {
          console.log(`\nEsperando 2.5s antes de la siguiente carta...`);
          await sleep(2500);
        }
      } catch (error) {
        failCount++;
        console.error(`\n❌ ERROR - Carta ${card.id}: ${error.message}`);
        console.error(`❌ Total errores: ${failCount}`);
        console.log(`\nEsperando 3s antes de continuar...`);
        await sleep(3000);
        continue;
      }
    }

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    const successRate = ((successCount / cards.length) * 100).toFixed(1);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`\nSINCRONIZACIÓN DE PRECIOS FALTANTES COMPLETADA`);
    console.log(`\nESTADÍSTICAS:`);
    console.log(
      `   ✅ Precios sincronizados: ${successCount} (${successRate}%)`,
    );
    console.log(`   ⚠ Sin precio disponible: ${skippedCount}`);
    console.log(`   ❌ Errores: ${failCount}`);
    console.log(`   Total procesadas: ${cards.length}`);
    console.log(`\nTIEMPO:`);
    console.log(
      `   Duración total: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`,
    );
    console.log(
      `   Promedio por carta: ${(totalTime / cards.length).toFixed(1)}s`,
    );

    // Mostrar estadísticas actualizadas
    const finalStats = await getWithoutPriceStats();
    if (finalStats && parseInt(finalStats.total_cards) > 0) {
      console.log(`\n📊 CARTAS SIN PRECIO (ACTUALIZADO):`);
      console.log(`   Total registradas: ${finalStats.total_cards}`);
      console.log(`   Promedio intentos: ${finalStats.avg_attempts}`);
    }

    console.log(`\n${"=".repeat(80)}\n`);

    return {
      success: true,
      successCount,
      skippedCount,
      failCount,
      total: cards.length,
    };
  } catch (error) {
    console.error("Error en syncMissingPrices:", error.message);
    throw error;
  }
};

/**
 * Sincroniza precios de TODAS las cartas en la base de datos
 *
 * Esta función procesa todas las cartas sin excepción, incluyendo aquellas que
 * ya tienen precio. Útil para actualización completa del catálogo.
 *
 * ADVERTENCIA: Esta operación puede tardar varias horas dependiendo del número
 * de cartas en la base de datos.
 *
 * @returns {Object} Estadísticas de la sincronización:
 *   - success: true si completó sin errores críticos
 *   - successCount: Número de cartas actualizadas correctamente
 *   - skippedCount: Número de cartas sin precio disponible
 *   - failCount: Número de cartas que generaron error
 *   - total: Total de cartas procesadas
 */
export const syncAllPrices = async () => {
  try {
    const { rows: cards } = await query(
      "SELECT id, name FROM cards ORDER BY id",
    );
    console.log(
      `Iniciando sincronización de precios para ${cards.length} cartas...`,
    );

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      try {
        console.log(`\nProgreso: ${i + 1}/${cards.length} - ${card.name}`);

        const result = await syncAggregatedPrice(card.id);

        if (result) {
          successCount++;
        } else {
          skippedCount++;
        }

        if (i < cards.length - 1) {
          await sleep(2500);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Error en carta ${card.id}: ${error.message}`);
        await sleep(3000);
        continue;
      }
    }

    console.log(`\nSINCRONIZACIÓN DE PRECIOS COMPLETADA`);
    console.log(`✅ Precios sincronizados: ${successCount}`);
    console.log(`⚠ Sin precio disponible: ${skippedCount}`);
    console.log(`❌ Errores: ${failCount}`);

    return {
      success: true,
      successCount,
      skippedCount,
      failCount,
      total: cards.length,
    };
  } catch (error) {
    console.error("Error en syncAllPrices:", error.message);
    throw error;
  }
};
