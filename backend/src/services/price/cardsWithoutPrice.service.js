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
