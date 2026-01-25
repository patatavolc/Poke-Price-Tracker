import { query } from "../config/db.js";
import { getExchangeRate } from "./currency.service.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;
const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1️⃣ TCGPlayer Market Price (USD) - Precio de mercado principal
async function getTCGPlayerPrice(cardId) {
  try {
    console.log(`    🔄 Consultando TCGPlayer Market...`);
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: { "X-Api-Key": POKEMON_TCG_API_KEY },
    });

    if (!response.ok) {
      console.log(`    🔴 TCGPlayer Market: HTTP ${response.status}`);
      return null;
    }

    const { data } = await response.json();
    const prices = data.tcgplayer?.prices;

    if (!prices) {
      console.log(`    ⚪ TCGPlayer Market: Sin datos de precio`);
      return null;
    }

    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofoil?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    const price = priceVariants.find((p) => p && p > 0);

    if (!price) {
      console.log(`    ⚪ TCGPlayer Market: Sin precio válido`);
      return null;
    }

    console.log(`    ✅ TCGPlayer Market: $${price}`);
    return { priceUsd: price, source: "tcgplayer_market" };
  } catch (error) {
    console.error(`    🔴 Error TCGPlayer Market:`, error.message);
    return null;
  }
}

// 2️⃣ Cardmarket via TCGdex (EUR) - Precio del mercado europeo
async function getTCGdexPrice(cardId) {
  try {
    console.log(`    🔄 Consultando Cardmarket (TCGdex)...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`    🔴 Cardmarket (TCGdex): HTTP ${response.status}`);
      return null;
    }

    const card = await response.json();
    const cardMarketPrices = card.cardmarket;

    if (!cardMarketPrices) {
      console.log(`    ⚪ Cardmarket (TCGdex): Sin datos`);
      return null;
    }

    const priceEur =
      cardMarketPrices.averageSellPrice ||
      cardMarketPrices.trendPrice ||
      cardMarketPrices.lowPrice ||
      null;

    if (!priceEur) {
      console.log(`    ⚪ Cardmarket (TCGdex): Sin precio válido`);
      return null;
    }

    console.log(`    ✅ Cardmarket (TCGdex): €${priceEur}`);
    return { priceEur, source: "cardmarket" };
  } catch (error) {
    console.error(`    🔴 Error Cardmarket (TCGdex):`, error.message);
    return null;
  }
}

// 3️⃣ TCGPlayer Low/Mid/High Average (USD) - Promedio de rangos de precio
async function getTCGPlayerLowMidHigh(cardId) {
  try {
    console.log(`    🔄 Consultando TCGPlayer Avg (L/M/H)...`);
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: { "X-Api-Key": POKEMON_TCG_API_KEY },
    });

    if (!response.ok) {
      console.log(`    🔴 TCGPlayer Avg: HTTP ${response.status}`);
      return null;
    }

    const { data } = await response.json();
    const prices = data.tcgplayer?.prices;

    if (!prices) {
      console.log(`    ⚪ TCGPlayer Avg: Sin datos de precio`);
      return null;
    }

    // Buscar la primera variante con datos completos de low, mid, high
    const variants = [
      prices.holofoil,
      prices.reverseHolofoil,
      prices.normal,
      prices.unlimitedHolofoil,
      prices["1stEditionHolofoil"],
    ];

    const validPrices = [];
    for (const variant of variants) {
      if (variant?.low && variant?.mid && variant?.high) {
        validPrices.push(variant.low, variant.mid, variant.high);
      }
    }

    if (validPrices.length === 0) {
      console.log(`    ⚪ TCGPlayer Avg: Sin datos L/M/H`);
      return null;
    }

    const avgPrice =
      validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

    console.log(`    ✅ TCGPlayer Avg (L/M/H): $${avgPrice.toFixed(2)}`);
    return {
      priceUsd: parseFloat(avgPrice.toFixed(2)),
      source: "tcgplayer_avg",
    };
  } catch (error) {
    console.error(`    🔴 Error TCGPlayer Avg:`, error.message);
    return null;
  }
}

// 4️⃣ Pokellector Scraping (USD) - Scraping de precios públicos
async function getPokeCollectorPrice(cardId) {
  try {
    console.log(`    🔄 Consultando Pokellector...`);
    // Pokellector usa formato: set-number (ej: base1-4)
    const url = `https://www.pokellector.com/card/${cardId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.log(`    🔴 Pokellector: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Buscar el precio en el HTML (patrón común: "Market Price: $XX.XX")
    const priceMatch = html.match(/Market Price[:\s]*\$([0-9,]+\.?[0-9]*)/i);

    if (!priceMatch) {
      console.log(`    ⚪ Pokellector: No se encontró precio en HTML`);
      return null;
    }

    const priceUsd = parseFloat(priceMatch[1].replace(/,/g, ""));

    if (!priceUsd || priceUsd <= 0) {
      console.log(`    ⚪ Pokellector: Precio inválido`);
      return null;
    }

    console.log(`    ✅ Pokellector: $${priceUsd}`);
    return { priceUsd, source: "pokellector" };
  } catch (error) {
    console.error(`    🔴 Error Pokellector:`, error.message);
    return null;
  }
}

// ===== FUNCIONES EXPORTADAS =====

// Función simple para obtener precio solo de TCGPlayer
export const syncPriceByCardId = async (cardId, retries = 3) => {
  try {
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: { "X-Api-Key": POKEMON_TCG_API_KEY },
    });

    if (response.status === 504 && retries > 0) {
      console.log(`⏳ Timeout obteniendo precio de ${cardId}, reintentando...`);
      await sleep(3000);
      return syncPriceByCardId(cardId, retries - 1);
    }

    if (!response.ok) {
      console.log(`⚠️ Error API para ${cardId}: ${response.status}`);
      return null;
    }

    const { data } = await response.json();
    const prices = data.tcgplayer?.prices;

    if (!prices) return null;

    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofoil?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    const priceUsd = priceVariants.find((p) => p && p > 0);

    if (!priceUsd) {
      console.log(`💵 No se encontró precio para ${cardId}`);
      return null;
    }

    const eurToUsdRate = await getExchangeRate();
    const priceEur = priceUsd / eurToUsdRate;

    await query(
      "INSERT INTO price_history (card_id, price_usd, price_eur, source) VALUES ($1, $2, $3, $4)",
      [cardId, priceUsd, priceEur.toFixed(2), "tcgplayer"],
    );

    console.log(
      `💰 Precio actualizado: $${priceUsd} / €${priceEur.toFixed(2)}`,
    );
    return { priceUsd, priceEur };
  } catch (error) {
    console.error(`Error en syncPriceByCardId (${cardId}):`, error.message);
    return null;
  }
};

// Obtiene precios de las 4 fuentes y calcula el promedio
export const getAggregatedPrice = async (cardId, cardName, setName = "") => {
  try {
    const eurToUsdRate = await getExchangeRate();
    const usdToEurRate = 1 / eurToUsdRate;

    console.log(`\n💰 Consultando precios para: ${cardName} (${cardId})...`);

    // Consultar las 4 fuentes en paralelo
    const [tcgMarket, cardmarket, tcgAvg, pokellector] = await Promise.all([
      getTCGPlayerPrice(cardId),
      getTCGdexPrice(cardId),
      getTCGPlayerLowMidHigh(cardId),
      getPokeCollectorPrice(cardId),
    ]);

    const validPrices = [];

    // Procesar TCGPlayer Market
    if (tcgMarket) {
      validPrices.push({
        source: tcgMarket.source,
        priceUsd: tcgMarket.priceUsd,
        priceEur: tcgMarket.priceUsd * usdToEurRate,
      });
    }

    // Procesar Cardmarket
    if (cardmarket) {
      validPrices.push({
        source: cardmarket.source,
        priceEur: cardmarket.priceEur,
        priceUsd: cardmarket.priceEur * eurToUsdRate,
      });
    }

    // Procesar TCGPlayer Average
    if (tcgAvg) {
      validPrices.push({
        source: tcgAvg.source,
        priceUsd: tcgAvg.priceUsd,
        priceEur: tcgAvg.priceUsd * usdToEurRate,
      });
    }

    // Procesar Pokellector
    if (pokellector) {
      validPrices.push({
        source: pokellector.source,
        priceUsd: pokellector.priceUsd,
        priceEur: pokellector.priceUsd * usdToEurRate,
      });
    }

    if (validPrices.length === 0) {
      console.log("  ⚠️ Sin precios disponibles de ninguna fuente");
      return null;
    }

    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

    console.log(
      `  📊 PROMEDIO FINAL: €${avgEur.toFixed(2)} / $${avgUsd.toFixed(2)} (${validPrices.length}/4 fuentes exitosas)`,
    );

    return {
      averagePriceEur: parseFloat(avgEur.toFixed(2)),
      averagePriceUsd: parseFloat(avgUsd.toFixed(2)),
      sources: validPrices,
      sourceCount: validPrices.length,
    };
  } catch (error) {
    console.error(`❌ Error agregando precios para ${cardId}:`, error.message);
    throw error;
  }
};

// Sincroniza precio agregado y guarda en el historial
export const syncAggregatedPrice = async (cardId) => {
  try {
    console.log(`\n🔍 Obteniendo datos de carta ${cardId} desde DB...`);
    const { rows } = await query(
      "SELECT name, set_id FROM cards WHERE id = $1",
      [cardId],
    );

    if (rows.length === 0) {
      console.error(`❌ Carta ${cardId} no encontrada en la DB`);
      throw new Error("Carta no encontrada en la DB");
    }

    const { name, set_id } = rows[0];
    console.log(`📝 Carta encontrada: ${name} (Set ID: ${set_id})`);

    const { rows: setRows } = await query(
      "SELECT name FROM sets WHERE id = $1",
      [set_id],
    );
    const setName = setRows[0]?.name || "";
    console.log(`📦 Set: ${setName || "Sin nombre de set"}`);

    const priceData = await getAggregatedPrice(cardId, name, setName);

    if (!priceData) {
      console.log(`⚠️ No se encontraron precios para ${name}`);
      return null;
    }

    console.log(
      `\n💾 Guardando ${priceData.sources.length} precios en la base de datos...`,
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

    console.log(
      `\n✅ COMPLETADO - ${name}: €${priceData.averagePriceEur} / $${priceData.averagePriceUsd} (${priceData.sources.length} fuentes)`,
    );
    return priceData;
  } catch (error) {
    console.error("❌ Error sincronizando precio agregado:", error.message);
    throw error;
  }
};

// Sincronizar precios solo de cartas sin precio
export const syncMissingPrices = async () => {
  try {
    const { rows: cards } = await query(
      "SELECT id, name FROM cards WHERE last_price_usd IS NULL OR last_price_eur IS NULL ORDER BY id",
    );

    if (cards.length === 0) {
      console.log("✅ Todas las cartas tienen precios sincronizados");
      return { success: true, total: 0 };
    }

    console.log(`🔍 Encontradas ${cards.length} cartas sin precio`);
    console.log("🚀 Iniciando sincronización de precios faltantes...");
    console.log(
      `⏱️  Tiempo estimado: ~${Math.ceil((cards.length * 2.5) / 60)} minutos\n`,
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
          `📊 Progreso: ${i + 1}/${cards.length} (${(((i + 1) / cards.length) * 100).toFixed(1)}%)`,
        );
        console.log(`📇 Carta: ${card.name} (ID: ${card.id})`);
        console.log(
          `⏱️  Tiempo transcurrido: ${Math.floor((Date.now() - startTime) / 1000)}s`,
        );

        const result = await syncAggregatedPrice(card.id);

        if (result) {
          successCount++;
          console.log(`\n✅ Éxito - Total exitosas: ${successCount}`);
        } else {
          skippedCount++;
          console.log(`\n⚠️  Omitida - Total omitidas: ${skippedCount}`);
        }

        if (i < cards.length - 1) {
          console.log(`\n⏳ Esperando 2.5s antes de la siguiente carta...`);
          await sleep(2500);
        }
      } catch (error) {
        failCount++;
        console.error(`\n❌ ERROR - Carta ${card.id}: ${error.message}`);
        console.error(`❌ Total errores: ${failCount}`);
        console.log(`\n⏳ Esperando 3s antes de continuar...`);
        await sleep(3000);
        continue;
      }
    }

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    const successRate = ((successCount / cards.length) * 100).toFixed(1);

    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `\n🎉 ===== SINCRONIZACIÓN DE PRECIOS FALTANTES COMPLETADA =====`,
    );
    console.log(`\n📊 ESTADÍSTICAS:`);
    console.log(
      `   ✅ Precios sincronizados: ${successCount} (${successRate}%)`,
    );
    console.log(`   ⚠️  Sin precio disponible: ${skippedCount}`);
    console.log(`   ❌ Errores: ${failCount}`);
    console.log(`   📝 Total procesadas: ${cards.length}`);
    console.log(`\n⏱️  TIEMPO:`);
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
      `🚀 Iniciando sincronización de precios para ${cards.length} cartas...`,
    );

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      try {
        console.log(`\n📊 Progreso: ${i + 1}/${cards.length} - ${card.name}`);

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

    console.log(`\n🎉 ===== SINCRONIZACIÓN DE PRECIOS COMPLETADA =====`);
    console.log(`✅ Precios sincronizados: ${successCount}`);
    console.log(`⚠️ Sin precio disponible: ${skippedCount}`);
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
