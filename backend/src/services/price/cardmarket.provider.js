const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

// 2️⃣ Cardmarket via TCGdex (EUR) - Precio del mercado europeo
export async function getCardmarketPrice(cardId) {
  try {
    console.log(`    🔄 [Cardmarket] Consultando TCGdex con ID: ${cardId}...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;

    console.log(`    🌐 [Cardmarket] URL: ${url}`);

    const response = await fetch(url);

    console.log(`    📡 [Cardmarket] Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        `    🔴 [Cardmarket] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`,
      );
      return null;
    }

    const card = await response.json();
    console.log(
      `    📦 [Cardmarket] Carta recibida: ${card.name || "sin nombre"}`,
    );
    console.log(
      `    🔍 [Cardmarket] Tiene datos de cardmarket:`,
      !!card.cardmarket,
    );

    const cardMarketPrices = card.cardmarket;

    if (!cardMarketPrices) {
      console.log(
        `    ⚪ [Cardmarket] Sin datos de precio (campo cardmarket no existe)`,
      );
      return null;
    }

    console.log(`    📋 [Cardmarket] Precios disponibles:`, {
      averageSellPrice: cardMarketPrices.averageSellPrice,
      trendPrice: cardMarketPrices.trendPrice,
      avg1: cardMarketPrices.avg1,
      avg7: cardMarketPrices.avg7,
      avg30: cardMarketPrices.avg30,
    });

    const priceEur =
      cardMarketPrices.averageSellPrice ||
      cardMarketPrices.trendPrice ||
      cardMarketPrices.avg1 ||
      cardMarketPrices.avg7 ||
      cardMarketPrices.avg30 ||
      null;

    if (!priceEur) {
      console.log(
        `    ⚪ [Cardmarket] Sin precio válido (todos los campos null)`,
      );
      return null;
    }

    console.log(`    ✅ [Cardmarket] PRECIO ENCONTRADO: €${priceEur}`);
    return { priceEur, source: "cardmarket" };
  } catch (error) {
    console.error(`    🔴 [Cardmarket] Error en catch:`, error.message);
    console.error(`    🔴 [Cardmarket] Stack:`, error.stack);
    return null;
  }
}
