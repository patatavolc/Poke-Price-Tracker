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

    if (!response.ok) return null;

    const { data } = await response.json();
    const prices = data.tcgplayer?.prices;

    if (!prices) return null;

    // Intentar obtener el precio de cualquier variante disponible
    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofiol?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    const price = priceVariants.find((p) => p && p > 0);

    return price ? { priceUsd: price, source: "tcgplayer" } : null;
  } catch (error) {
    console.error("Error TCGPlayer: ", error.message);
    return null;
  }
}

// Obtiene el precio de TCGdex (precios de Cardmarket en EUR)
async function getTCGdexPrice(cardId) {
  try {
    const response = await fetch(`${TCGDEX_API_URL}/cards/${cardId}`);

    if (!response.ok) return null;

    const card = await response.json();

    // TCGDex tiene precios de Cardmarket en la propiedad 'cardmarket'
    const cardMarketPrices = card.cardmarket;

    if (!cardMarketPrices) return null;

    // Intentar obtener precio promedio, tendencia o bajo
    const priceEur =
      cardMarketPrices.averageSellPrice ||
      cardMarketPrices.trendPrice ||
      cardMarketPrices.lowPrice ||
      null;

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
    const response = await fetch(
      `https://www.pricecharting.com/api/products?q=${searchQuery}&type=pokemon-card&t=${Date.now()}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatrible; PokePriceTracker/1.0)",
        },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.products || data.products.length === 0) return null;

    const product = data.products[0];
    const priceUsd = product["loose-price"] || product["cib-price"];

    return priceUsd ? { priceUsd, source: "pricecharting" } : null;
  } catch (error) {
    console.error("Error PriceCharting:", error.message);
    return null;
  }
}

// Obtiene precios de multiples fuentes y calcula la media
export const getAggregatedPrice = async (cardId, cardName, setName = "") => {
  try {
    const eurToUsdRate = await getExchangeRate();
    const usdToEurRate = 1 / eurToUsdRate;

    console.log(`Consultando precios para: ${cardName}...`);

    // Consultar precios de diferentes fuentes en paralelo
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
      console.log(` 💵 TCGPlayer: $${tcgPrice.priceUsd}`);
    }

    if (tcgdexPrice) {
      validPrices.push({
        source: tcgdexPrice.source,
        priceEur: tcgdexPrice.priceEur,
        priceUsd: tcgdexPrice.priceEur * eurToUsdRate,
      });
      console.log(`💵 Cardmarket (TCGdex): €${tcgdexPrice.priceEur}`);
    }

    if (priceChartingPrice) {
      validPrices.push({
        source: priceChartingPrice.source,
        priceUsd: priceChartingPrice.priceUsd,
        priceEur: priceChartingPrice.priceUsd * usdToEurRate,
      });
      console.log(`💵 PriceCharting: $${priceChartingPrice.priceUsd}`);
    }

    if (validPrices.length === 0) {
      console.log("Sin precios disponibles");
      return null;
    }

    // Calcular la media
    const avgEur =
      validPrices.reduce((sum, p) => sum + p.priceEur, 0) / validPrices.length;

    const avgUsd =
      validPrices.reduce((sum, p) => sum + p.priceUsd, 0) / validPrices.length;

    console.log(
      `Promedio: €${avgEur.toFixed(2)} / $${avgUsd.toFixed(2)} (${validPrices.length}) fuentes`,
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
    const { rows } = await query("SELECT name, set_id FROM cards WHERE id = $1", [cardId]);

    if(rows.length === 0) {
      throw new Error('Carta no encontrada en la DB');
    }

    const { name, set_id } = rows[0];

    // Obtener nombre del set
    const { rows: setRows } = await query(
      "SELECT name FROM sets WHERE id = $1",[set_id]
    )
    const setName = setRows[0]?.name || "";

    const priceData = await getAggregatedPrice(cardId, name, setName);

    if(!priceData) {
      console.log(`No se encontraron precios para ${name}`);
      return null
    }

    // Guardar cada fuente en el historial
    for (const source of priceData.sources) {
      await query(
        "INSERT INTO price_history (card_id, price_usd, price_eur, source) VALUES ($1, $2, $3, $4)", [cardId, source.priceUsd, source.priceEur.toFixed(2), source.source],
      )
    }

    console.log(`✅ Precios actualizados para ${name}: €${priceData.averagePriceEur} / $${priceData.averagePriceUsd}`);
    return priceData;
  } catch (error) {
    console.error('Error sincronizando precio agregado:', error.message);
    throw error;
  }
}

