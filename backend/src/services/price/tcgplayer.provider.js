const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

// TCGPlayer API (USD) - Precios de TCGPlayer vía Pokemon TCG API
// La Pokemon TCG API incluye datos de precios de TCGPlayer y tiene mejor cobertura
export async function getTCGPlayerPrice(cardId) {
  try {
    console.log(
      `    🔄 [TCGPlayer] Consultando precios con ID: "${cardId}"...`,
    );

    if (!POKEMON_TCG_API_KEY) {
      console.log(
        `    🔴 [TCGPlayer] ERROR: POKEMON_TCG_API_KEY no está definida en .env`,
      );
      return null;
    }

    const url = `${POKEMON_TCG_API_URL}/cards/${cardId}`;
    console.log(`    🌐 [TCGPlayer] URL: ${url}`);

    const headers = {
      "X-Api-Key": POKEMON_TCG_API_KEY,
    };

    const response = await fetch(url, { headers });

    console.log(`    📡 [TCGPlayer] Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 404) {
        console.log(
          `    ⚪ [TCGPlayer] Carta no encontrada en Pokemon TCG API (ID: ${cardId})`,
        );
      } else {
        console.log(
          `    🔴 [TCGPlayer] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        );
      }
      return null;
    }

    const result = await response.json();
    const card = result.data;

    if (!card) {
      console.log(`    ⚪ [TCGPlayer] Carta no encontrada en respuesta`);
      return null;
    }

    console.log(`    📦 [TCGPlayer] Carta recibida: ${card.name}`);
    console.log(
      `    🔍 [TCGPlayer] Tiene datos de tcgplayer:`,
      !!card.tcgplayer,
    );

    if (!card.tcgplayer?.prices) {
      console.log(
        `    ⚪ [TCGPlayer] Sin datos de precio (campo tcgplayer.prices no existe)`,
      );
      return null;
    }

    const prices = card.tcgplayer.prices;
    console.log(`    📋 [TCGPlayer] Tipos de precio disponibles:`, {
      holofoil: !!prices.holofoil,
      reverseHolofoil: !!prices.reverseHolofoil,
      normal: !!prices.normal,
      unlimitedHolofoil: !!prices.unlimitedHolofoil,
      "1stEditionHolofoil": !!prices["1stEditionHolofoil"],
    });

    // Prioridad de variantes: holofoil > reverseHolofoil > normal > otros
    const priceVariants = [
      prices.holofoil?.market,
      prices.reverseHolofoil?.market,
      prices.normal?.market,
      prices.unlimitedHolofoil?.market,
      prices["1stEditionHolofoil"]?.market,
    ];

    const priceUsd = priceVariants.find((p) => p && p > 0);

    if (!priceUsd) {
      console.log(`    ⚪ [TCGPlayer] Sin precio válido en ninguna variante`);
      console.log(`    📋 [TCGPlayer] Variantes inspeccionadas:`, {
        holofoil: prices.holofoil?.market,
        reverseHolofoil: prices.reverseHolofoil?.market,
        normal: prices.normal?.market,
      });
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
      `    ✅ [TCGPlayer] PRECIO ENCONTRADO: $${priceUsd} (variante: ${variantUsed})`,
    );
    return { priceUsd, source: "tcgplayer" };
  } catch (error) {
    console.error(`    🔴 [TCGPlayer] Error en catch:`, error.message);
    console.error(`    🔴 [TCGPlayer] Stack:`, error.stack);
    return null;
  }
}
