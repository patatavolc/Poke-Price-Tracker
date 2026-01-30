/**
 * Utilidades para el sistema de precios
 *
 * Funciones auxiliares usadas por los proveedores de precios y servicios de sincronización.
 */

import { query } from "../../config/db.js";

/**
 * Pausa la ejecución por un número específico de milisegundos
 *
 * Útil para implementar delays entre peticiones a APIs y evitar rate limiting.
 *
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del delay
 *
 * @example
 * await sleep(2500); // Espera 2.5 segundos
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtiene el ID de TCGPlayer de una carta desde la base de datos
 *
 * NOTA: Esta función es legacy y puede no ser necesaria con la API actual.
 * Las cartas tienen tcgplayer_url guardado pero no siempre contiene un productId numérico.
 *
 * @param {string} cardId - ID de la carta en la base de datos
 * @returns {string|null} ID de TCGPlayer o el mismo cardId como fallback, null si falla
 * @deprecated Considerar usar directamente el cardId de Pokemon TCG API
 */
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

    // La URL de TCGPlayer no contiene un productId numérico extraíble
    // La API de Pokemon TCG guarda URLs descriptivas pero no IDs de producto
    // Solución: usar directamente el cardId de Pokemon TCG API que es universal

    console.log(
      `    ⚠️ TCGPlayer URL existe pero no contiene productId numérico`,
    );
    console.log(`    💡 Usaré el card ID de Pokemon TCG: ${cardId}`);

    // Devolver el cardId original como fallback - las APIs modernas aceptan este formato
    return cardId;
  } catch (error) {
    console.error(`    🔴 Error obteniendo tcgplayerId de DB:`, error.message);
    return null;
  }
}
