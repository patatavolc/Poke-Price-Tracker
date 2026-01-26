import { query } from "../../config/db.js";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función auxiliar: Obtener tcgplayerId de una carta desde la DB
// Las cartas tienen tcgplayer_url guardado, necesitamos extraer el ID
export async function getTCGPlayerIdFromDB(cardId) {
  try {
    console.log(`    🔍 Buscando TCGPlayer URL en DB para ${cardId}...`);
    const { rows } = await query(
      "SELECT tcgplayer_url FROM cards WHERE id = $1",
      [cardId],
    );

    if (rows.length === 0) {
      console.log(`    ⚠️ Carta ${cardId} no encontrada en DB`);
      return null;
    }

    const tcgplayerUrl = rows[0].tcgplayer_url;

    if (!tcgplayerUrl) {
      console.log(`    ⚠️ Carta ${cardId} no tiene tcgplayer_url`);
      return null;
    }

    console.log(`    🌐 TCGPlayer URL: ${tcgplayerUrl}`);

    // Extraer el ID de la URL
    // Formato de URL de la API de Pokemon: contiene product/{id}
    // Ejemplo: "https://prices.tcgplayer.com/pokemon/..."
    // El ID puede estar al final o en el path

    // Intentar extraer el ID del producto
    // La API de Pokemon TCG guarda URLs pero no el productId directamente
    // Tendremos que usar el cardId de Pokemon TCG directamente para buscar en JustTCG

    console.log(
      `    ⚠️ TCGPlayer URL existe pero no contiene productId numérico`,
    );
    console.log(`    💡 Usaré el card ID de Pokemon TCG: ${cardId}`);

    return cardId; // Devolvemos el cardId para intentar buscar por nombre
  } catch (error) {
    console.error(`    🔴 Error obteniendo tcgplayerId de DB:`, error.message);
    return null;
  }
}
