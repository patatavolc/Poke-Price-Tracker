const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

/**
 * Obtiene el precio de mercado de TCGPlayer para una carta
 * Usa la Pokemon TCG API que incluye precios de TCGPlayer
 * @param {string} cardId - ID de la carta en formato Pokemon TCG API
 * @returns {Object|null} - {priceUsd, source} o null si no hay precio
 */
export async function getTCGPlayerPrice(cardId) {
  try {
    console.log(`[TCGPlayer] Consultando precio para carta: ${cardId}`);

    if (!POKEMON_TCG_API_KEY) {
      console.error("[TCGPlayer] ERROR: POKEMON_TCG_API_KEY no configurada");
      return null;
    }

    const url = `${POKEMON_TCG_API_URL}/cards/${cardId}`;
    const headers = { "X-Api-Key": POKEMON_TCG_API_KEY };
    const response = await fetch(url, { headers });

    console.log(`[TCGPlayer] Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        console.log(`[TCGPlayer] Carta no encontrada (ID: ${cardId})`);
      } else {
        console.error(
          `[TCGPlayer] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        );
      }
      return null;
    }

    const result = await response.json();
    const card = result.data;

    if (!card) {
      console.log("[TCGPlayer] Carta no encontrada en respuesta");
      return null;
    }

    console.log(`[TCGPlayer] Carta recibida: ${card.name}`);

    if (!card.tcgplayer?.prices) {
      console.log("[TCGPlayer] Sin datos de precio disponibles");
      return null;
    }

    const prices = card.tcgplayer.prices;

    // Priorizar variantes: holofoil > reverseHolofoil > normal > unlimitedHolofoil > 1stEditionHolofoil
    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofoil?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    const priceUsd = priceVariants.find((p) => p && p > 0);

    if (!priceUsd) {
      console.log("[TCGPlayer] Sin precio válido en ninguna variante");
      return null;
    }

    // Determinar qué variante se usó
    let variantUsed = "unknown";
    if (prices.holofoil?.market === priceUsd) variantUsed = "holofoil";
    else if (prices.reverseHolofoil?.market === priceUsd)
      variantUsed = "reverseHolofoil";
    else if (prices.normal?.market === priceUsd) variantUsed = "normal";
    else if (prices.unlimitedHolofoil?.market === priceUsd)
      variantUsed = "unlimitedHolofoil";
    else if (prices["1stEditionHolofoil"]?.market === priceUsd)
      variantUsed = "1stEditionHolofoil";

    console.log(
      `✓ [TCGPlayer] Precio encontrado: $${priceUsd} (${variantUsed})`,
    );
    return { priceUsd, source: "tcgplayer" };
  } catch (error) {
    console.error(`✗ [TCGPlayer] Error:`, error.message);
    return null;
  }
}
