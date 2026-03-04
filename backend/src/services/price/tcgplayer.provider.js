// URL base de la Pokemon TCG API (pokemontcg.io/v2) que incluye precios de TCGPlayer
const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
// API key requerida para acceso ilimitado (sin límite de peticiones)
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

/**
 * Obtiene el precio de mercado de TCGPlayer para una carta específica
 *
 * Usa la Pokemon TCG API oficial (pokemontcg.io) que incluye datos de precios de TCGPlayer.
 * Los precios se devuelven en dólares estadounidenses (USD).
 * Esta API requiere autenticación mediante API key pero no tiene límite de peticiones.
 *
 * @param {string} cardId - ID de la carta en formato Pokemon TCG API (ej: "base1-4")
 * @returns {Object|null} Objeto con {priceUsd, source: "tcgplayer"} o null si no hay precio disponible
 *
 * Prioridad de variantes de carta:
 * 1. holofoil - Carta holográfica (más común)
 * 2. reverseHolofoil - Holográfica reversa
 * 3. normal - Versión normal/common
 * 4. unlimitedHolofoil - Holográfica edición ilimitada
 * 5. 1stEditionHolofoil - Holográfica primera edición
 */
export async function getTCGPlayerPrice(cardId) {
  try {
    console.log(`[TCGPlayer] Consultando precio para carta: ${cardId}`);

    if (!POKEMON_TCG_API_KEY) {
      console.error("[TCGPlayer] ERROR: POKEMON_TCG_API_KEY no configurada");
      return null;
    }

    const url = `${POKEMON_TCG_API_URL}/cards/${cardId}`;
    // Autenticación mediante API key en el header X-Api-Key
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
    // La API devuelve los datos de la carta en result.data
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

    // Crear array de precios ordenado por prioridad
    // Usamos .find() luego para obtener el primer precio válido (> 0)
    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofoil?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    // Obtener el primer precio válido (no null y mayor que 0)
    const priceUsd = priceVariants.find((p) => p && p > 0);

    if (!priceUsd) {
      console.log("[TCGPlayer] Sin precio válido en ninguna variante");
      return null;
    }

    // Determinar qué variante se usó para logging y debugging
    // Esto ayuda a entender qué tipo de carta se está valorando
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
      `✅ [TCGPlayer] Precio encontrado: $${priceUsd} (${variantUsed})`,
    );
    return { priceUsd, source: "tcgplayer" };
  } catch (error) {
    console.error(`❌ [TCGPlayer] Error:`, error.message);
    return null;
  }
}
