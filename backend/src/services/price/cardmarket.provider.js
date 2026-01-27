// URL base de la API de TCGdex para obtener datos de Cardmarket
const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

/**
 * Obtiene el precio de Cardmarket para una carta específica
 *
 * Utiliza la API de TCGdex que proporciona datos del mercado europeo (Cardmarket).
 * Los precios se devuelven en euros (EUR).
 *
 * @param {string} cardId - ID de la carta en formato Pokemon TCG API (ej: "base1-4")
 * @returns {Object|null} Objeto con {priceEur, source: "cardmarket"} o null si no hay precio disponible
 *
 * Prioridad de selección de precio:
 * 1. avg - Precio promedio general (más representativo)
 * 2. trend - Tendencia del mercado
 * 3. avg7 - Promedio de los últimos 7 días
 * 4. avg30 - Promedio de los últimos 30 días
 * 5. avg1 - Promedio del último día
 * 6. low - Precio más bajo disponible
 */
export async function getCardmarketPrice(cardId) {
  try {
    console.log(`[Cardmarket] Consultando TCGdex con ID: ${cardId}...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;

    const response = await fetch(url);

    console.log(`[Cardmarket] Status HTTP: ${response.status}`);

    // Manejar respuestas de error
    if (!response.ok) {
      const errorText = await response.text();

      // Error 404 es esperado para cartas antiguas o ediciones especiales que no están en TCGdex
      if (response.status === 404) {
        console.log(
          `[Cardmarket] Carta no encontrada en TCGdex (ID: ${cardId})`,
        );
      } else {
        console.log(
          `[Cardmarket] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        );
      }
      return null;
    }

    const card = await response.json();
    console.log(`[Cardmarket] Carta recibida: ${card.name || "sin nombre"}`);
    console.log(`[Cardmarket] Tiene datos de pricing:`, !!card.pricing);

    // Estructura de datos de TCGdex: los precios de Cardmarket están en card.pricing.cardmarket
    // (no confundir con card.cardmarket que no existe)
    const cardMarketPrices = card.pricing?.cardmarket;

    if (!cardMarketPrices) {
      console.log(
        `[Cardmarket] Sin datos de precio (campo pricing.cardmarket no existe)`,
      );
      return null;
    }

    console.log(`[Cardmarket] Precios disponibles:`, {
      avg: cardMarketPrices.avg,
      low: cardMarketPrices.low,
      trend: cardMarketPrices.trend,
      avg1: cardMarketPrices.avg1,
      avg7: cardMarketPrices.avg7,
      avg30: cardMarketPrices.avg30,
    });

    // Seleccionar el mejor precio disponible usando el orden de prioridad
    // avg es el más confiable al ser un promedio general del mercado
    // Fallback a otras métricas si avg no está disponible
    const priceEur =
      cardMarketPrices.avg ||
      cardMarketPrices.trend ||
      cardMarketPrices.avg7 ||
      cardMarketPrices.avg30 ||
      cardMarketPrices.avg1 ||
      cardMarketPrices.low ||
      null;

    if (!priceEur) {
      console.log(`[Cardmarket] Sin precio válido (todos los campos null)`);
      return null;
    }

    console.log(`✅ [Cardmarket] Precio encontrado: €${priceEur}`);
    return { priceEur, source: "cardmarket" };
  } catch (error) {
    console.error(`❌ [Cardmarket] Error:`, error.message);
    return null;
  }
}
