import { query } from "../../config/db.js";
import { getAggregatedPrice } from "./aggregator.js";
import { sleep } from "./utils.js";

// Sincroniza precio agregado y guarda en el historial
export const syncAggregatedPrice = async (cardId) => {
  try {
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

    // Mostrar estado de fuentes
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

// Sincronizar precios solo de cartas sin precio
export const syncMissingPrices = async (dailyLimit = null) => {
  try {
    console.log("\nBuscando cartas sin precio en la base de datos...");

    let queryStr =
      "SELECT id, name FROM cards WHERE last_price_usd IS NULL OR last_price_eur IS NULL ORDER BY id";
    const queryParams = [];

    if (dailyLimit !== null) {
      queryStr += " LIMIT $1";
      queryParams.push(dailyLimit);
    }

    const { rows: cards } = await query(queryStr, queryParams);

    if (cards.length === 0) {
      console.log("✅ Todas las cartas tienen precios sincronizados");
      return { success: true, total: 0 };
    }

    console.log(`Encontradas ${cards.length} cartas sin precio`);
    if (dailyLimit) {
      console.log(`LÍMITE: Procesando máximo ${dailyLimit} cartas`);
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

// Sincronizar precios de todas las cartas
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
