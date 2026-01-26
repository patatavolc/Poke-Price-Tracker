const JUST_TCG_API_KEY = process.env.JUST_TCG_API_KEY;

// 1️⃣ JustTCG API (USD) - API principal con datos de TCGPlayer
// Busca por nombre de carta ya que no tenemos tcgplayerId numérico
export async function getJustTCGPrice(cardId, cardName) {
  try {
    console.log(
      `    🔄 [JustTCG] Consultando API con nombre: "${cardName}"...`,
    );

    // Verificar que la API key existe
    if (!JUST_TCG_API_KEY) {
      console.log(
        `    🔴 [JustTCG] ERROR: JUST_TCG_API_KEY no está definida en .env`,
      );
      return null;
    }

    console.log(
      `    🔑 [JustTCG] API Key cargada: ${JUST_TCG_API_KEY.substring(0, 10)}...`,
    );

    // Buscar por nombre de carta usando el parámetro q (query search)
    const searchQuery = encodeURIComponent(cardName);
    const url = `https://api.justtcg.com/v1/cards?q=${searchQuery}&game=pokemon`;

    console.log(`    🌐 [JustTCG] URL: ${url}`);

    const headers = {
      "X-API-Key": JUST_TCG_API_KEY, // Formato correcto según ejemplos de código de JustTCG
    };

    console.log(`    📤 [JustTCG] Headers enviados:`, headers);

    const response = await fetch(url, {
      headers: headers,
    });

    console.log(`    📡 [JustTCG] Status HTTP: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        console.log(`    🔴 [JustTCG] Error 401 - API Key inválida o revocada`);
        console.log(
          `    💡 [JustTCG] Verifica la API key en: https://justtcg.com/dashboard`,
        );
      } else if (response.status === 429) {
        console.log(
          `    🔴 [JustTCG] Error 429 - Límite de peticiones excedido`,
        );
        console.log(
          `    💡 [JustTCG] Plan Free: 100 req/día, 1000 req/mes, 10 req/min`,
        );
        console.log(
          `    💡 [JustTCG] Espera o mejora tu plan en: https://justtcg.com/dashboard/plans`,
        );
      }

      console.log(`    🔴 [JustTCG] Respuesta: ${errorText}`);
      return null;
    }

    const result = await response.json();
    console.log(
      `    📦 [JustTCG] Respuesta recibida, data.length: ${result.data?.length || 0}`,
    );

    if (!result.data || result.data.length === 0) {
      console.log(`    ⚪ [JustTCG] Carta no encontrada en respuesta`);
      return null;
    }

    const card = result.data[0];
    console.log(
      `    🃏 [JustTCG] Carta: ${card.name}, Variantes: ${card.variants?.length || 0}`,
    );

    if (!card.variants || card.variants.length === 0) {
      console.log(`    ⚪ [JustTCG] Sin variantes de precio`);
      return null;
    }

    // Buscar la variante Near Mint Normal (la más común)
    let variant = card.variants.find(
      (v) => v.condition === "Near Mint" && v.printing === "Normal",
    );

    console.log(
      `    🔍 [JustTCG] Buscando variante Near Mint Normal... ${variant ? "Encontrada" : "No encontrada"}`,
    );

    // Si no existe, tomar la primera variante con precio
    if (!variant) {
      variant = card.variants.find((v) => v.price && v.price > 0);
      console.log(
        `    🔍 [JustTCG] Usando primera variante con precio... ${variant ? "Encontrada" : "No encontrada"}`,
      );
    }

    if (!variant || !variant.price) {
      console.log(`    ⚪ [JustTCG] Sin precio válido en variantes`);
      console.log(
        `    📋 [JustTCG] Variantes disponibles:`,
        card.variants.map((v) => `${v.condition}-${v.printing}: $${v.price}`),
      );
      return null;
    }

    console.log(
      `    ✅ [JustTCG] PRECIO ENCONTRADO: $${variant.price} (${variant.condition}, ${variant.printing})`,
    );
    return { priceUsd: variant.price, source: "justtcg" };
  } catch (error) {
    console.error(`    🔴 [JustTCG] Error en catch:`, error.message);
    console.error(`    🔴 [JustTCG] Stack:`, error.stack);
    return null;
  }
}
