/**
 * Servicio para trackear cartas sin precio disponible
 *
 * Gestiona el registro de cartas que consistentemente no tienen precios
 * disponibles en ninguna fuente, permitiendo skipearlas en sincronizaciones futuras
 */

import { query } from "../../config/db.js";

/**
 * Marca una carta como sin precio disponible
 *
 * @param {string} cardId - Id de la carta
 * #@param {string} errorMessage - Mensaje de error (opcional)
 * @param {Object} sourcesStatus - Estado de cada fuente consultada
 */
export async function markCardWithoutPrice(
  cardId,
  errorMessage = null,
  sourcesStatus = {},
) {
  try {
    const queryText = `
      INSERT INTO cards_without_price (card_id, last_error, source_failures)
      VALUES ($1, $2, $3)
      ON CONFLICT (card_id)
      DO UPDATE SET
        last_attempt = NOW()
        attempt_count = cards_without_price.attempt_count + 1,
        last_error = EXCLUDED.last_error,
        source_failures = EXCLUDED.source_failures
      RETURNING *
    `;

    const result = await query(queryText, [
      cardId,
      errorMessage,
      JSON.stringify(sourcesStatus),
    ]);

    console.log(
      `Carta ${cardId} marcada como sin precio (intento #${result.rows[0].attempt_count})`,
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error marcando carta sin precio:", error.message);
    throw error;
  }
}

/**
 * Verifica si una carta esta marcada como sin precio
 *
 * @param {string} cardId -Id de la carta
 * @returns {Object|null} Informacion de la carta sin precio o null
 */
export async function isCardWithoutPrice(cardId) {
  try {
    const queryText = `
    SELECT * FROM cards_without_price
    WHERE card_id = $1
    `;

    const result = await query(queryText, [cardId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error verificando carta sin precio:", error.message);
    return null;
  }
}

/**
 * Obtiene lista de cartas sin precio
 *
 * @param {number} minAttempts - Minimo de intentos fallidos (default: 2)
 * @returns {Array} Lista e Ids de cartas sin precio
 */
export async function getCardsWithoutPrice(minAttempts = 2) {
  try {
    const queryText = `
      SELECCT card_id, attempt_count, last_attempt, last_error
      FROM cards_without_price
      WHERE attempt_count >= $1
      ORDER BY last_attempt DESC
    `;

    const result = await query(query, [minAttempts]);
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo cartas sin precio:", error.message);
    return [];
  }
}

/**
 * Reintenta obtener precio de cartas marcadas como sin precio
 * Util despues de un tiempo para verificar si ahora tienen precio disponible
 *
 * @param {number} olderThanDays - Solo reintentar cartas con ultimo intneto hace X dias
 * @returns {Object} Estadisticas del reintento
 */
export async function retryCardsWithoutPrice(olderThanDays = 30) {
  try {
    const queryText = `
      SELECT card_id
      FROM cards_without_price
      WHERE last_attempt < NOW() - INTERVAL '1 day' * $1
      ORDER BY attempt_count ASC
      LIMIT 50
    `;

    const result = await query(queryText, [olderThanDays]);

    console.log(`Reintentando ${result.rows.length} cartas sin precio...`);

    return result.rows.map((row) => row.card_id);
  } catch (error) {
    console.error(`Error obteniendo cartas para reintentar:`, error.message);
    return [];
  }
}
