import { query } from "../config/db.js";
import { getExchangeRate } from "./currency.service.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;
const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Obtiene precio de TCGPlayer (USD)
async function getTCGPlayerPrice(cardId) {
  try {
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: { "X-Api-Key": POKEMON_TCG_API_KEY },
    });

    if (!response.ok) {
      console.log(`    🔴 TCGPlayer: HTTP ${response.status} para ${cardId}`);
      return null;
    }

    const { data } = await response.json();
    const prices = data.tcgplayer?.prices;

    if (!prices) {
      console.log(`    ⚪ TCGPlayer: Sin datos de precio para ${cardId}`);
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

    return price ? { priceUsd: price, source: "tcgplayer" } : null;
  } catch (error) {
    console.error("Error TCGPlayer:", error.message);
    return null;
  }
}

// Obtiene el precio de TCGdex (precios de Cardmarket en EUR)
async function getTCGdexPrice(cardId) {
  try {
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(
        `    🔴 TCGdex: HTTP ${response.status} para ${cardId} (${url})`,
      );
      return null;
    }

    const card = await response.json();

    const cardMarketPrices = card.cardmarket;

    if (!cardMarketPrices) {
      console.log(`    ⚪ TCGdex: Sin datos de Cardmarket para ${cardId}`);
      return null;
    }

    const priceEur =
      cardMarketPrices.averageSellPrice ||
      cardMarketPrices.trendPrice ||
      cardMarketPrices.lowPrice ||
      null;

    if (!priceEur) {
      console.log(`    ⚪ TCGdex: Cardmarket sin precio válido para ${cardId}`);
    }

    return priceEur ? { priceEur, source: "cardmarket_tcgdex" } : null;
  } catch (error) {
    console.error("Error en TCGdex:", error.message);
    return null;
  }
}

// Precios de PriceCharting (USD)
async function getPriceChartingPrice(cardName, setName) {
  try {
    const searchQuery = encodeURIComponent(`${cardName} ${setName}`);
    const url = `https://www.pricecharting.com/api/products?q=${searchQuery}&type=pokemon-card&t=${Date.now()}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PokePriceTracker/1.0)",
      },
    });

    if (!response.ok) {
      console.log(
        `    🔴 PriceCharting: HTTP ${response.status} para "${cardName}"`,
      );
      return null;
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      console.log(
        `    ⚪ PriceCharting: Sin productos para "${cardName} ${setName}"`,
      );
      return null;
    }

    const product = data.products[0];
    const priceUsd = product["loose-price"] || product["cib-price"];

    if (!priceUsd) {
      console.log(
        `    ⚪ PriceCharting: Producto encontrado sin precio válido para "${cardName}"`,
      );
    }

    return priceUsd ? { priceUsd, source: "pricecharting" } : null;
  } catch (error) {
    console.error("Error PriceCharting:", error.message);
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

// Obtiene precios de múltiples fuentes y calcula la media
export const getAggregatedPrice = async (cardId, cardName, setName = "") => {
  try {
    const eurToUsdRate = await getExchangeRate();
    const usdToEurRate = 1 / eurToUsdRate;

    console.log(`Consultando precios para: ${cardName}...`);

    const [tcgPrice, tcgdexPrice, priceChartingPrice] = await Promise.all([
      getTCGPlayerPrice(cardId),
      getTCGdexPrice(cardId),
      getPriceChartingPrice(cardName, setName),
    ]);

    const validPrices = [];

    if (tcgPrice) {
      validPrices.push({
        source: tcgPrice.source,
        priceUsd: tcgPrice.priceUsd,
        priceEur: tcgPrice.priceUsd * usdToEurRate,
      });
      console.log(`  💵 TCGPlayer: $${tcgPrice.priceUsd}`);
    }

    if (tcgdexPrice) {
      validPrices.push({
        source: tcgdexPrice.source,
        priceEur: tcgdexPrice.priceEur,
        priceUsd: tcgdexPrice.priceEur * eurToUsdRate,
      });
      console.log(`  💶 Cardmarket (TCGdex): €${tcgdexPrice.priceEur}`);
    }

    if (priceChartingPrice) {
      validPrices.push({
        source: priceChartingPrice.source,
        priceUsd: priceChartingPrice.priceUsd,
        priceEur: priceChartingPrice.priceUsd * usdToEurRate,
      });
      console.log(`  💵 PriceCharting: $${priceChartingPrice.priceUsd}`);
    }

    if (validPrices.length === 0) {
      console.log("  ⚠️ Sin precios disponibles");
      return null;
    }

    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

    console.log(
      `  📊 Promedio: €${avgEur.toFixed(2)} / $${avgUsd.toFixed(2)} (${validPrices.length} fuentes)`,
    );

    return {
      averagePriceEur: parseFloat(avgEur.toFixed(2)),
      averagePriceUsd: parseFloat(avgUsd.toFixed(2)),
      sources: validPrices,
      sourceCount: validPrices.length,
    };
  } catch (error) {
    console.error(`Error agregando precios para ${cardId}:`, error.message);
    throw error;
  }
};

// Sincroniza precio agregado y guarda en el historial
export const syncAggregatedPrice = async (cardId) => {
  try {
    const { rows } = await query(
      "SELECT name, set_id FROM cards WHERE id = $1",
      [cardId],
    );

    if (rows.length === 0) {
      throw new Error("Carta no encontrada en la DB");
    }

    const { name, set_id } = rows[0];

    const { rows: setRows } = await query(
      "SELECT name FROM sets WHERE id = $1",
      [set_id],
    );
    const setName = setRows[0]?.name || "";

    const priceData = await getAggregatedPrice(cardId, name, setName);

    if (!priceData) {
      console.log(`⚠️ No se encontraron precios para ${name}`);
      return null;
    }

    for (const source of priceData.sources) {
      await query(
        "INSERT INTO price_history (card_id, price_usd, price_eur, source) VALUES ($1, $2, $3, $4)",
        [cardId, source.priceUsd, source.priceEur.toFixed(2), source.source],
      );
    }

    console.log(
      `✅ Precios actualizados para ${name}: €${priceData.averagePriceEur} / $${priceData.averagePriceUsd}`,
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

    console.log(
      `\n🎉 ===== SINCRONIZACIÓN DE PRECIOS FALTANTES COMPLETADA =====`,
    );
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
