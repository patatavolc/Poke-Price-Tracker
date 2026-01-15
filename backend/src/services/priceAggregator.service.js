import { query } from "../config/db.js";
import { getExchangeRate } from "./currency.service.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const CARDMARKET_API_URL = process.env.CARDMARKET_API_URL;

// Obtiene precios de multiples fuentes y calcula la media
export const getAggregatedPrice = async (cardId, cardName, localId) => {
  try {
    const usdToEurRate = 1 / (await getExchangeRate());

    // Consultar precios de diferentes fuentes en paralelo
    const [tcgPrice, cardmarketPrice] = await Promise.all([
      getTCGPlayerPrice(cardName, localId),
      getCardmarketPrice(cardId),
    ]);

    const validPrices = [];

    if (tcgPrice) {
      validPrices.push({
        source: "tcgplayer",
        priceUsd: tcgPrice,
        priceEur: tcgPrice * usdToEurRate,
      });
    }

    if (cardmarketPrice) {
      validPrices.push({
        source: "cardmarket",
        priceEur: cardmarketPrice,
        priceUsd: cardmarketPrice / usdToEurRate,
      });
    }

    if (validPrices.length === 0) {
      return null;
    }

    // Calcular la media
    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

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
