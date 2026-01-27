import { query } from "../../config/db.js";
import { getExchangeRate } from "../currency.service.js";
import { getTCGPlayerPrice } from "./tcgplayer.provider.js";
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
      console.log(`Timeout obteniendo precio de ${cardId}, reintentando...`);
      await sleep(3000);
      return syncPriceByCardId(cardId, retries - 1);
    }

    if (!response.ok) {
      console.log(`⚠ Error API para ${cardId}: ${response.status}`);
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
      console.log(`No se encontró precio para ${cardId}`);
      return null;
    }

    const eurToUsdRate = await getExchangeRate();
    const priceEur = priceUsd / eurToUsdRate;

    await query(
      "INSERT INTO price_history (card_id, price_usd, price_eur, source) VALUES ($1, $2, $3, $4)",
      [cardId, priceUsd, priceEur.toFixed(2), "tcgplayer"],
    );

    console.log(`Precio actualizado: $${priceUsd} / €${priceEur.toFixed(2)}`);
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
    console.log(`CONSULTANDO PRECIOS PARA: ${cardName}`);
    console.log(`Card ID: ${cardId}`);
    console.log(`Set: ${setName || "N/A"}`);
    console.log(`Tasa de cambio EUR→USD: ${eurToUsdRate.toFixed(4)}`);
    console.log(`${"=".repeat(80)}`);

    console.log(`\nPASO 1: Consultar APIs de precios en paralelo...`);

    // Objeto para rastrear el estado de cada fuente
    const sourcesStatus = {
      tcgplayer: { attempted: true, success: false, price: null, error: null },
      cardmarket: { attempted: true, success: false, price: null, error: null },
    };

    // Consultar las fuentes en paralelo
    // TCGPlayer y Cardmarket por ID
    const [tcgplayerPrice, cardmarketPrice] = await Promise.all([
      getTCGPlayerPrice(cardId),
      getCardmarketPrice(cardId),
    ]);

    console.log(`\nPASO 2: Procesar resultados...`);
    const validPrices = [];

    // Procesar TCGPlayer
    if (tcgplayerPrice) {
      const priceData = {
        source: tcgplayerPrice.source,
        priceUsd: tcgplayerPrice.priceUsd,
        priceEur: tcgplayerPrice.priceUsd * usdToEurRate,
      };
      validPrices.push(priceData);
      sourcesStatus.tcgplayer.success = true;
      sourcesStatus.tcgplayer.price = priceData;
      console.log(
        `✅ TCGPlayer: $${priceData.priceUsd} / €${priceData.priceEur.toFixed(2)}`,
      );
    } else {
      sourcesStatus.tcgplayer.error = "Sin datos de precio disponibles";
      console.log(`❌ TCGPlayer: No disponible`);
    }

    // Procesar Cardmarket
    if (cardmarketPrice) {
      const priceData = {
        source: cardmarketPrice.source,
        priceEur: cardmarketPrice.priceEur,
        priceUsd: cardmarketPrice.priceEur * eurToUsdRate,
      };
      validPrices.push(priceData);
      sourcesStatus.cardmarket.success = true;
      sourcesStatus.cardmarket.price = priceData;
      console.log(
        `✅ Cardmarket: €${priceData.priceEur} / $${priceData.priceUsd.toFixed(2)}`,
      );
    } else {
      sourcesStatus.cardmarket.error = "Sin datos de precio disponibles";
      console.log(`❌ Cardmarket: No disponible`);
    }

    // Resumen de fuentes
    const successCount = Object.values(sourcesStatus).filter(
      (s) => s.success,
    ).length;
    const failedCount = Object.values(sourcesStatus).filter(
      (s) => !s.success,
    ).length;

    console.log(`\nRESUMEN DE FUENTES:`);
    console.log(`  ✅ Exitosas: ${successCount}/2`);
    console.log(`  ❌ Fallidas: ${failedCount}/2`);
    if (failedCount > 0) {
      const failed = Object.entries(sourcesStatus)
        .filter(([_, status]) => !status.success)
        .map(([name, _]) => name);
      console.log(`  Fuentes fallidas: ${failed.join(", ")}`);
    }

    if (validPrices.length === 0) {
      console.log(`\n⚠ SIN PRECIOS DISPONIBLES DE NINGUNA FUENTE`);
      console.log(`${"=".repeat(80)}\n`);
      return null;
    }

    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`RESULTADO FINAL:`);
    console.log(`  Precio promedio EUR: €${avgEur.toFixed(2)}`);
    console.log(`  Precio promedio USD: $${avgUsd.toFixed(2)}`);
    console.log(`  Fuentes exitosas: ${validPrices.length}/2`);
    console.log(`  Fuentes: ${validPrices.map((p) => p.source).join(", ")}`);
    console.log(`${"=".repeat(80)}\n`);

    return {
      averagePriceEur: parseFloat(avgEur.toFixed(2)),
      averagePriceUsd: parseFloat(avgUsd.toFixed(2)),
      sources: validPrices,
      sourceCount: validPrices.length,
      sourcesStatus, // Añadido: estado detallado de cada fuente
    };
  } catch (error) {
    console.error(`\n❌ ERROR CRÍTICO en getAggregatedPrice:`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    throw error;
  }
};
