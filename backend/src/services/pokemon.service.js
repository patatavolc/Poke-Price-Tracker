import { query } from "../config/db.js";

const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    console.log(`Sincronizando ${sets.length} sets...`);

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

export const syncCardsBySet = async (setId, retries = 3) => {
  try {
    console.log(`Obteniendo cartas del set: ${setId}`);

    // Pedir las cartas del set
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=set.id:${setId}`,
      {
        headers: {
          "X-Api-Key": POKEMON_TCG_API_KEY,
        },
      },
    );

    // Si es 504 y quedan reintentos, esperar y reintentar
    if (response.status === 504 && retries > 0) {
      console.log(
        `⏳ Timeout en ${setId}, reintentando en 3 segundos... (${retries} intentos restantes)`,
      );
      await sleep(3000);
      return syncCardsBySet(setId, retries - 1);
    }

    // Si es 404, el set no existe en la API, skip
    if (response.status === 404) {
      console.log(`⚠️ Set ${setId} no encontrado en la API (404), saltando...`);
      return { success: true, count: 0, skipped: true };
    }

    if (!response.ok) {
      throw new Error(`La API devolvio status ${response.status}`);
    }

    const result = await response.json();
    const cards = result.data || [];

    if (cards.length === 0) {
      console.log(`⚠️ El set ${setId} no tiene cartas disponibles`);
      return { success: true, count: 0 };
    }

    console.log(`Sincronizando ${cards.length} cartas del set ${setId}...`);

    // Insertar cartas en la DB
    for (const card of cards) {
      const queryText = `
        INSERT INTO cards (
          id, set_id, name, supertype, subtypes, types, 
          artist, rarity, image_small, image_large, 
          tcgplayer_url, cardmarket_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, 
            supertype = EXCLUDED.supertype,
            subtypes = EXCLUDED.subtypes,
            types = EXCLUDED.types,
            artist = EXCLUDED.artist,
            rarity = EXCLUDED.rarity,
            image_small = EXCLUDED.image_small,
            image_large = EXCLUDED.image_large,
            tcgplayer_url = EXCLUDED.tcgplayer_url,
            cardmarket_url = EXCLUDED.cardmarket_url,
            updated_at = NOW();
      `;

      await query(queryText, [
        card.id,
        card.set.id, // ← CORREGIDO: Añadido set_id
        card.name,
        card.supertype || null,
        card.subtypes || [],
        card.types || [],
        card.artist || null,
        card.rarity || null,
        card.images?.small || null,
        card.images?.large || null,
        card.tcgplayer?.url || null,
        card.cardmarket?.url || null,
      ]);
    }

    console.log(`✅ ${cards.length} cartas sincronizadas para el set ${setId}`);
    return { success: true, count: cards.length };
  } catch (error) {
    console.error(
      `❌ Error sincronizando cartas del set ${setId}:`,
      error.message,
    );
    throw error;
  }
};

export const syncAllCards = async () => {
  try {
    // Obtener todos los IDs de sets que hay en la DB
    const { rows: sets } = await query("SELECT id FROM sets ORDER BY id");
    console.log(
      `Iniciando sincronizacion masiva de cartas para ${sets.length} sets...`,
    );

    let totalCardsSynced = 0;
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    // Recorrer cada set y llamar a la logica de sincronizacion
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      try {
        console.log(`\nProgreso: ${i + 1}/${sets.length} sets procesados`);

        const result = await syncCardsBySet(set.id);

        if (result.skipped) {
          skippedCount++;
        } else {
          totalCardsSynced += result.count;
          successCount++;
        }

        console.log(`Total acumulado: ${totalCardsSynced} cartas`);

        // Esperar 1 segundo entre cada set para no saturar la API
        if (i < sets.length - 1) {
          await sleep(1000);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Fallo en el set ${set.id}: ${error.message}`);
        // Esperar 2 segundos extra si hubo error
        await sleep(2000);
        continue;
      }
    }

    console.log(`\n===== SINCRONIZACIÓN COMPLETADA =====`);
    console.log(`✅ Sets exitosos: ${successCount}`);
    console.log(`⚠️ Sets no encontrados (404): ${skippedCount}`);
    console.log(`❌ Sets fallidos: ${failCount}`);
    console.log(`📦 Total de cartas sincronizadas: ${totalCardsSynced}`);

    return {
      success: true,
      total: totalCardsSynced,
      successCount,
      failCount,
      skippedCount,
    };
  } catch (error) {
    console.error("Error en syncAllCards:", error.message);
    throw error;
  }
};
