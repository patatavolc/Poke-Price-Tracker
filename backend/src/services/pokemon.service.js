import axios from "axios";
import { query } from "../config/db.js";

const TCGDEX_URL = process.env.TCGDEX_API_URL;

export const syncSetsFromAPI = async () => {
  console.log("Intentando conectar a:", TCGDEX_URL);
  try {
    // Pedir los sets a la API
    const response = await axios.get(`${TCGDEX_URL}/sets`);
    const sets = response.data;

    console.log(`Sincornizando ${sets.length} sets...`);

    // Guardar cada set en la DB
    for (const set of sets) {
      const cardCountValue = set.cardCount?.total || 0;

      const queryText = `
        INSERT INTO sets (id, name, logo_url, card_count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url, card_count = EXCLUDED.card_count`;

      // TCGdex devuelve el logo sin .png (a veces) por lo que lo normalizo
      const logo = set.logo ? `${set.logo}.png` : null;

      await query(queryText, [set.id, set.name, logo, cardCountValue]);
    }

    return { success: true, count: sets.length };
  } catch (error) {
    console.error("Error en syncSetsFromAPI:", error.message);
    throw error;
  }
};

export const syncCardsBySet = async (setId) => {
  try {
    console.log(`Obteniendo cartas del set: ${setId}`);

    // Pedir los detalles del set
    const response = await axios.get(`${TCGDEX_URL}/sets/${setId}`);
    const setDetails = response.data;

    const cards = setDetails.cards || []; // Array de cartas

    if (!cards || cards.length === 0) {
      console.log(`El set ${setId} no devolvio cartas en el array .cards`);
      return { success: true, count: 0 };
    }

    // Insertar cartas en la DB
    for (const card of cards) {
      const queryText = `
        INSERT INTO cards (id, name, image_url, local_id, set_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, 
            image_url = EXCLUDED.image_url, 
            local_id = EXCLUDED.local_id,
            updated_at = NOW();
      `;

      // Normalizar la url de la imagen
      const imageUrl = card.image ? `${card.image}/high.png` : null;

      await query(queryText, [
        card.id,
        card.name,
        imageUrl,
        card.localId,
        setId,
      ]);
    }

    console.log(`${cards.length} cartas sincronizadas para el set ${setId}`);
    return { success: true, count: cards.length };
  } catch (error) {
    console.error(
      `Error sincronizando cartas del set ${setId}:`,
      error.message
    );
    throw error;
  }
};

export const syncAllCards = async () => {
  try {
    // Obtener todos los IDs de sets que hay en la DB
    const { rows: sets } = await query("SELECT id FROM sets");
    console.log(
      `Iniciando sincronizacion masiva de cartas para ${sets.length} sets...`
    );

    let totalCardsSynced = 0;

    // Recorrer cada set y llamar a la logica de sincronizacion
    for (const set of sets) {
      try {
        const result = await syncCardsBySet(set.id);
        totalCardsSynced += result.count;
        console.log(`Progreso: ${totalCardsSynced} cartas en total`);
      } catch (error) {
        console.error(`Fallo en el set ${set.id}: ${error.message}`);
        // Seguir con el siguiente set aunque falle
        continue;
      }
    }

    return { success: true, total: totalCardsSynced };
  } catch (error) {
    console.error("Error en syncAllCards:", error.message);
    throw error;
  }
};
