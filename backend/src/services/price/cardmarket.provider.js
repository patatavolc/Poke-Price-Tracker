const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

/**
 * Obtiene el precio de Cardmarket para una carta usando pokemontcg.io
 *
 * pokemontcg.io devuelve precios de Cardmarket (EUR) en card.cardmarket.prices
 * en el mismo endpoint que TCGPlayer. Esto nos da mejor cobertura que TCGdex.
 *
 * Prioridad de campos EUR:
 * 1. averageSellPrice — precio promedio de ventas recientes
 * 2. trendPrice       — tendencia del mercado
 * 3. avg30            — promedio 30 días
 * 4. avg7             — promedio 7 días
 * 5. lowPrice         — precio mínimo (último fallback)
 */
export async function getCardmarketPrice(cardId) {
  try {
    console.log(`[Cardmarket] Consultando pokemontcg.io con ID: ${cardId}...`);

    if (!POKEMON_TCG_API_KEY) {
      console.error("[Cardmarket] ERROR: POKEMON_TCG_API_KEY no configurada");
      return null;
    }

    const url = `${POKEMON_TCG_API_URL}/cards/${cardId}`;
    const headers = { "X-Api-Key": POKEMON_TCG_API_KEY };
    const response = await fetch(url, { headers });

    console.log(`[Cardmarket] Status HTTP: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Cardmarket] Carta no encontrada (ID: ${cardId})`);
      } else {
        const errorText = await response.text();
        console.error(`[Cardmarket] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const result = await response.json();
    const card = result.data;

    if (!card) {
      console.log("[Cardmarket] Carta no encontrada en respuesta");
      return null;
    }

    const prices = card.cardmarket?.prices;

    if (!prices) {
      console.log(`[Cardmarket] Sin datos de precio (card.cardmarket.prices no existe)`);
      return null;
    }

    console.log(`[Cardmarket] Precios disponibles:`, {
      averageSellPrice: prices.averageSellPrice,
      trendPrice: prices.trendPrice,
      avg30: prices.avg30,
      avg7: prices.avg7,
      lowPrice: prices.lowPrice,
    });

    const priceEur =
      prices.averageSellPrice ||
      prices.trendPrice ||
      prices.avg30 ||
      prices.avg7 ||
      prices.lowPrice ||
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
