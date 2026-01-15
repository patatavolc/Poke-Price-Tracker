import { query } from "../config/db.js";
import { getExchangeRate } from "./currency.service.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;

export const updateCardPrice = async (cardId) => {
  try {
    // Obtener datos de la carta de la DB
    const { rows } = await query(
      "SELECT name, local_id, id FROM cards WHERE id = $1",
      [cardId]
    );
    if (rows.length === 0) {
      throw new Error("Carta no enctrada en la DB");
    }

    const card = rows[0];

    // Consultar precio en la otra api
    // Se busca por numero local y nombre
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${card.name}" number:${card.local_id}`,
      {
        headers: { "X-Api-Key": process.env.POKEMON_TCG_API_URL },
      }
    );

    const data = await response.json();
    const externalCard = data.data[0];

    if (!externalCard || !externalCard.tcgplayer) {
      console.log(`No se encontro precio para ${card.name}`);
      return null;
    }

    // Extraer el precio
    const price =
      externalCard.tcgplayer.prices.holofoil?.market ||
      externalCard.tcgplayer.prices.normal?.market ||
      0;

    // Guardar en price_history
    await query(
      "INSERT INTO price_history (card_id, price, source) VALUES ($1, $2, $3)",
      [card.id, price, "tcgplayer"]
    );

    console.log(`Precio actualizado para ${card.name}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error actualizando precio de ${card.id}:`, error.message);
  }
};

export const syncPriceByCardId = async (cardId) => {
  try {
    // Consultar la API externa
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: {
        "X-Api-Key": process.env.POKEMON_TCG_API_KEY_URL || "",
      },
    });

    if (!response.ok) throw new Error(`Error API Precios: ${response.status}`);

    const { data } = await response.json();

    // Extraer el precio de TCGPlayer (Market Price)
    // Intentamos obtener el precio 'holofoil', si no 'normal'
    const prices = data.tcgplayer?.prices;
    const marketPrice = prices?.holofoil?.market || prices?.normal?.market || 0;

    if (marketPrice === 0) {
      console.log(`No se encontró precio de mercado para ${cardId}`);
      return null;
    }

    // 3. Insertar en el historial
    const sql = `
      INSERT INTO price_history (card_id, price, source)
      VALUES ($1, $2, $3)
    `;

    await query(sql, [cardId, marketPrice, "tcgplayer"]);

    return marketPrice;
  } catch (error) {
    console.error(`Error en syncPriceByCardId (${cardId}):`, error.message);
    throw error;
  }
};

export const getAgregatedPrice = async (cardId) => {
  const usdToEurRate = 1 / (await getExchangeRate()); // Pasar de USD a EUR

  // Fuentes para consultar los precios
  const sources = [
    {
      name: "Cardmarket",
      url: `https://api.cardmarket.com/v1/products/${cardId}`,
      currency: "EUR",
    },
    {
      name: "TCGPlayer",
      url: `https://api.tcgplayer.com/v1/pricing/${cardId}`,
      currency: "USD",
    },
  ];

  // Consultas en paralelo
  const pricePromises = sources.map(async (source) => {
    try {
      const res = await fetch(source.url);
      if (!res.ok) return null;
      const data = await res.json();

      // Logica de extraccion de precio (Varia segun el JSON de la API)
      let rawPrice = data.marketPrice || data.price || 0;

      // Normalizar a euros
      const priceInEur =
        source.currency === "USD" ? rawPrice * usdToEurRate : rawPrice;

      return priceInEur > 0 ? priceInEur : null;
    } catch (error) {
      return null;
    }
  });

  const results = await Promise.all(pricePromises);
  const validPrices = results.filter((p) => p !== null);

  if (validPrices.length === 0) return null;

  // Calcular la media en euros
  const averageEur =
    validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

  return {
    priceEur: parseFloat(averageEur.toFixed(2)),
    priceUsd: parseFloat((averageEur * (1 / usdToEurRate)).toFixed(2)),
    sourceCount: validPrices.length,
    updatedAt: new Date(),
  };
};
