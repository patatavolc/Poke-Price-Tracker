const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

// 2️⃣ Cardmarket via TCGdex (EUR) - Precio del mercado europeo
export async function getCardmarketPrice(cardId) {
  try {
    console.log(`[Cardmarket] Consultando TCGdex con ID: ${cardId}...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;

    const response = await fetch(url);

    console.log(`[Cardmarket] Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();

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

    // Los precios están en card.pricing.cardmarket
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

    // Prioridad: avg (promedio general) > trend > avg7 > avg30 > avg1 > low
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
