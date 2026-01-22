import { query } from "../config/db.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

export const syncSetsFromAPI = async () => {
  console.log("Intentando conectar a:", POKEMON_TCG_API_URL);
  try {
    // Pedir los sets a la API
    const response = await fetch(`${POKEMON_TCG_API_URL}/sets`, {
      headers: {
        "X-Api-Key": POKEMON_TCG_API_KEY,
      },
    });

    console.log("Status de respuesta:", response.status);
    console.log("Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de la API:", errorText);
      throw new Error(`API devolvió status ${response.status}`);
    }

    const result = await response.json();
    const sets = result.data;

    console.log(`Sincornizando ${sets.length} sets...`);

    // Guardar cada set en la DB
    for (const set of sets) {
      // Convertir fecha de YYYY/MM/DD a formato DATE (YYYY-MM-DD)
      const releaseDate = set.releaseDate
        ? set.releaseDate.replace(/\//g, "-")
        : null;

      const queryText = ` 
      INSERT INTO sets (id, name, series, total, release_date, symbol_url, logo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, 
            series = EXCLUDED.series, 
            total = EXCLUDED.total,
            release_date = EXCLUDED.release_date,
            symbol_url = EXCLUDED.symbol_url,
            logo_url = EXCLUDED.logo_url`;

      await query(queryText, [
        set.id,
        set.name,
        set.series,
        set.total,
        releaseDate,
        set.images?.symbol || null,
        set.images?.logo || null,
      ]);
    }

    console.log(`✅ ${sets.length} sets sincronizados correctamente`);

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
    const response = await fetch(`${TCGDEX_URL}/sets/${setId}`);
    const setDetails = await response.json();

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
      error.message,
    );
    throw error;
  }
};

export const syncAllCards = async () => {
  try {
    // Obtener todos los IDs de sets que hay en la DB
    const { rows: sets } = await query("SELECT id FROM sets");
    console.log(
      `Iniciando sincronizacion masiva de cartas para ${sets.length} sets...`,
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
