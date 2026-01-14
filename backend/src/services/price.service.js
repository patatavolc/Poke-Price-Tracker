import { query } from "../config/db.js";

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
