import { query } from "../../config/db.js";
import { getExchangeRate } from "../currency.service.js";
import { getJustTCGPrice } from "./justtcg.provider.js";
import { getCardmarketPrice } from "./cardmarket.provider.js";
import { sleep } from "./utils.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

// Función simple para obtener precio solo de TCGPlayer (legacy)
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

// Obtiene precios de las 2 fuentes principales y calcula el promedio
export const getAggregatedPrice = async (cardId, cardName, setName = "") => {
  try {
    const eurToUsdRate = await getExchangeRate();
    const usdToEurRate = 1 / eurToUsdRate;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`💰 CONSULTANDO PRECIOS PARA: ${cardName}`);
    console.log(`🆔 Card ID: ${cardId}`);
    console.log(`📦 Set: ${setName || "N/A"}`);
    console.log(`💱 Tasa de cambio EUR→USD: ${eurToUsdRate.toFixed(4)}`);
    console.log(`${"=".repeat(80)}`);

    console.log(`\n🔍 PASO 1: Consultar APIs de precios en paralelo...`);

    // Consultar las fuentes en paralelo
    // JustTCG busca por nombre, Cardmarket por ID
    const [justTcgPrice, cardmarketPrice] = await Promise.all([
      getJustTCGPrice(cardId, cardName),
      getCardmarketPrice(cardId),
    ]);

    console.log(`\n📊 PASO 2: Procesar resultados...`);
    const validPrices = [];

    // Procesar JustTCG
    if (justTcgPrice) {
      const priceData = {
        source: justTcgPrice.source,
        priceUsd: justTcgPrice.priceUsd,
        priceEur: justTcgPrice.priceUsd * usdToEurRate,
      };
      validPrices.push(priceData);
      console.log(
        `✅ JustTCG procesado: $${priceData.priceUsd} / €${priceData.priceEur.toFixed(2)}`,
      );
    } else {
      console.log(`❌ JustTCG: No disponible`);
    }

    // Procesar Cardmarket
    if (cardmarketPrice) {
      const priceData = {
        source: cardmarketPrice.source,
        priceEur: cardmarketPrice.priceEur,
        priceUsd: cardmarketPrice.priceEur * eurToUsdRate,
      };
      validPrices.push(priceData);
      console.log(
        `✅ Cardmarket procesado: €${priceData.priceEur} / $${priceData.priceUsd.toFixed(2)}`,
      );
    } else {
      console.log(`❌ Cardmarket: No disponible`);
    }

    if (validPrices.length === 0) {
      console.log(`\n⚠️ ❌ SIN PRECIOS DISPONIBLES DE NINGUNA FUENTE`);
      console.log(`${"=".repeat(80)}\n`);
      return null;
    }

    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📊 RESULTADO FINAL:`);
    console.log(`  💶 Precio promedio EUR: €${avgEur.toFixed(2)}`);
    console.log(`  💵 Precio promedio USD: $${avgUsd.toFixed(2)}`);
    console.log(`  📈 Fuentes exitosas: ${validPrices.length}/2`);
    console.log(`  📋 Fuentes: ${validPrices.map((p) => p.source).join(", ")}`);
    console.log(`${"=".repeat(80)}\n`);

    return {
      averagePriceEur: parseFloat(avgEur.toFixed(2)),
      averagePriceUsd: parseFloat(avgUsd.toFixed(2)),
      sources: validPrices,
      sourceCount: validPrices.length,
    };
  } catch (error) {
    console.error(`\n❌ ERROR CRÍTICO en getAggregatedPrice:`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    throw error;
  }
};
