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

// Obtiene precio de TCGPlayer
async function getTCGPlayerPrice(cardName, localId) {
  try {
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${cardName}" number:${localId}`,
      {
        headers: { "X-Api-Key": process.env.POKEMON_TCG_API_KEY || "" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const card = data.data[0];

    if (!card?.tcgplayer?.prices) return null;

    const prices = card.tcgplayer.prices;
    return prices.holofoil?.market || prices.normal?.market || null;
  } catch (error) {
    console.error("Error obteniendo precio de TCGPlayer: ", error.message);
    return null
  }
}

// Obtiene precio de Cardmarket
async function getCardmarketPrice(cardId) {
  try {
    // NOTA: Cardmarket requiere OAuth, esto es un placeholder
    const response = await fetch(`${CARDMARKET_API_URL}/products/${cardId}`);
    
    if (!response.ok) return null;

    const data = await response.json();
    return data.priceGuide?.AVG || data.priceGuide?.TREND || null;
  } catch (error) {
    console.error("Error obteniendo precio Cardmarket:", error.message);
    return null;
  }
}


// Sincroniza precio agregado y lo guarda en el historial
export const syncAggregatedPrice = async (cardId) => {
  try {
    const { rows } = await query(
      "SELECT name, local_id FROM cards WHERE id = $1",
      [cardId]
    );

    if (rows.length === 0) {
      throw new Error("Carta no encontrada en la DB");
    }

    const { name, local_id } = rows[0];

    const priceData = await getAggregatedPrice(cardId, name, local_id);

    if (!priceData) {
      console.log(`No se encontraron precios para ${name}`);
      return null;
    }

    // Guardar cada fuente en el historial
    for (const source of priceData.sources) {
      await query(
        "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
        [cardId, source.priceUsd, source.source]
      );
    }

    // Guardar también el precio medio
    await query(
      "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
      [cardId, priceData.averagePriceUsd, "aggregated"]
    );

    console.log(`Precios actualizados para ${name}: €${priceData.averagePriceEur}`);
    return priceData;
  } catch (error) {
    console.error(`Error sincronizando precio agregado:`, error.message);
    throw error;
  }
};
