import { query } from "../config/db.js";
import { getExchangeRate } from "./currency.service.js";
import {
  markCardWithoutPrice,
  removeCardWithoutPrice,
} from "./price/cardsWithoutPrice.service.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const CARDMARKET_API_URL = process.env.CARDMARKET_API_URL;

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

    const sourcesStatus = {
      tcgplayer: { attempted: true, success: false, price: null, error: null },
      cardmarket: { attempted: true, success: false, price: null, error: null },
    };

    const [tcgplayerPrice, cardmarketPrice] = await Promise.all([
      getTCGPlayerPrice(cardId),
      getCardmarketPrice(cardId),
    ]);

    console.log(`\nPASO 2: Procesar resultados...`);
    const validPrices = [];

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

    const successCount = Object.values(sourcesStatus).filter(
      (s) => s.success,
    ).length;
    const failedCount = Object.values(sourcesStatus).filter(
      (s) => !s.success,
    ).length;

    console.log(`\nRESUMEN DE FUENTES:`);
    console.log(`  ✅ Exitosas: ${successCount}/2`);
    console.log(`  ❌ Fallidas: ${failedCount}/2`);

    if (validPrices.length === 0) {
      console.log(`\n⚠ SIN PRECIOS DISPONIBLES DE NINGUNA FUENTE`);

      // Marcar carta como sin precio
      await markCardWithoutPrice(
        cardId,
        "Sin precios disponibles en ninguna fuente",
        sourcesStatus,
      );

      console.log(`${"=".repeat(80)}\n`);
      return null;
    }

    // Si se obtiene precio, remover de lista sin precio
    await removeCardWithoutPrice(cardId);

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
      sourcesStatus,
    };
  } catch (error) {
    console.error(`\n❌ ERROR CRÍTICO en getAggregatedPrice:`);
    console.error(`   Mensaje: ${error.message}`);

    // Marcar como error crítico
    await markCardWithoutPrice(cardId, error.message);

    throw error;
  }
};

// Obtiene precio de TCGPlayer
async function getTCGPlayerPrice(cardId) {
  try {
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${cardId}"`,
      {
        headers: { "X-Api-Key": process.env.POKEMON_TCG_API_KEY || "" },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const card = data.data[0];

    if (!card?.tcgplayer?.prices) return null;

    const prices = card.tcgplayer.prices;
    return prices.holofoil?.market || prices.normal?.market || null;
  } catch (error) {
    console.error("Error obteniendo precio de TCGPlayer:", error.message);
    return null;
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
      [cardId],
    );

    if (rows.length === 0) {
      throw new Error("Carta no encontrada en la DB");
    }

    const { name, local_id } = rows[0];

    const priceData = await getAggregatedPrice(cardId, name, local_id);

    // FIX: Si no hay precio, guardar y RETORNAR
    if (!priceData) {
      console.log(`⚠️  No se encontraron precios para ${name}`);

      await query(
        "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
        [cardId, 0, "not_found"],
      );

      return null; // ✅ AÑADIDO: Retornar aquí para no continuar
    }

    // Guardar cada fuente en el historial
    for (const source of priceData.sources) {
      await query(
        "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
        [cardId, source.priceUsd, source.source],
      );
    }

    // Guardar también el precio medio
    await query(
      "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
      [cardId, priceData.averagePriceUsd, "aggregated"],
    );

    console.log(
      `✅ Precios actualizados para ${name}: €${priceData.averagePriceEur}`,
    );
    return priceData;
  } catch (error) {
    console.error(`❌ Error sincronizando precio agregado:`, error.message);

    // Guardar registro de error para evitar bucle infinito
    try {
      await query(
        "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
        [cardId, 0, "error"],
      );
    } catch (dbError) {
      console.error("Error guardando registro de error:", dbError.message);
    }

    throw error;
  }
};
