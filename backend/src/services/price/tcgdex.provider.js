const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

export async function getTCGdexPrice(cardId) {
  try {
    console.log(`[TCGdex] Consultando con ID: ${cardId}...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;
    const response = await fetch(url);

    console.log(`[TCGdex] Status HTTP: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[TCGdex] Carta no encontrada (ID: ${cardId})`);
      } else {
        const errorText = await response.text();
        console.log(`[TCGdex] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const card = await response.json();
    const cardMarketPrices = card.pricing?.cardmarket;

    if (!cardMarketPrices) {
      console.log(`[TCGdex] Sin datos de precio (pricing.cardmarket no existe)`);
      return null;
    }

    const priceEur =
      cardMarketPrices.avg ||
      cardMarketPrices.trend ||
      cardMarketPrices.avg7 ||
      cardMarketPrices.avg30 ||
      cardMarketPrices.avg1 ||
      cardMarketPrices.low ||
      null;

    if (!priceEur) {
      console.log(`[TCGdex] Sin precio válido (todos los campos null)`);
      return null;
    }

    console.log(`✅ [TCGdex] Precio encontrado: €${priceEur}`);
    return { priceEur, source: "tcgdex" };
  } catch (error) {
    console.error(`❌ [TCGdex] Error:`, error.message);
    return null;
  }
}
