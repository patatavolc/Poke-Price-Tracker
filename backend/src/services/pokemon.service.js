import axios from "axios";
import { query } from "../config/db.js";

const TCGDEX_URL = process.env.TCGDEX_API_URL;

export const syncSetsFromAPI = async () => {
  console.log("Intentando conectar a:", process.env.TCGDEX_API_URL);
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
