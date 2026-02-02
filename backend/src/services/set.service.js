/**
 * Servicios para gestión de sets
 */

import { query } from "../config/db.js";

/**
 * Obtiene todos los sets con información básica
 *
 * @param {string} orderBy - Campo por el que ordenar (release_date, name)
 * @returns {Array} Lista de sets
 */
export const getAllSets = async (orderBy = "release_date") => {
  const validOrderBy = ["release_date", "name", "series"];
  const order = validOrderBy.includes(orderBy) ? orderBy : "release_date";

  const queryText = `
    SELECT
      s.id,
      s.name,
      s.series,
      s.total,
      s.release_date,
      s.symbol_url,
      s.logo_url,
      COUNT(c.id) AS synced_cards
    FROM sets s
    LEFT JOIN cards c ON s.id = c.set_id
    GROUP BY s.id, s.name, s.series, s.total, s.release_date, s.symbol_url, s.logo_url
    ORDER BY s.${order} DESC
  `;

  const res = await query(queryText);
  return res.rows;
};

/**
 * Obtiene detalles de un set específico con sus cartas
 *
 * @param {string} setId - ID del set
 * @returns {Object|null} Datos del set con cartas
 */
export const getSetDetails = async (setId) => {
  // Obtener datos del set
  const setQuery = `
    SELECT
      id,
      name,
      series,
      total,
      release_date,
      symbol_url,
      logo_url
    FROM sets
    WHERE id = $1
  `;

  const setRes = await query(setQuery, [setId]);

  if (setRes.rows.length === 0) {
    return null;
  }

  // Obtener cartas del set
  const cardsQuery = `
    SELECT
      id,
      name,
      supertype,
      rarity,
      image_small,
      last_price_eur,
      last_price_usd
    FROM cards
    WHERE set_id = $1
    ORDER BY name ASC
  `;

  const cardsRes = await query(cardsQuery, [setId]);

  return {
    ...setRes.rows[0],
    cards: cardsRes.rows,
    cards_count: cardsRes.rows.length,
  };
};

/**
 * Obtiene estadísticas de un set
 *
 * @param {string} setId - ID del set
 * @returns {Object|null} Estadísticas del set
 */
export const getSetStats = async (setId) => {
  const queryText = `
    SELECT
      s.id,
      s.name,
      s.total AS total_cards,
      COUNT(c.id) AS synced_cards,
      COUNT(CASE WHEN c.last_price_eur IS NOT NULL THEN 1 END) AS cards_with_price,
      COALESCE(AVG(c.last_price_eur), 0)::NUMERIC(10,2) AS avg_price_eur,
      COALESCE(MAX(c.last_price_eur), 0)::NUMERIC(10,2) AS max_price_eur,
      COALESCE(MIN(c.last_price_eur), 0)::NUMERIC(10,2) AS min_price_eur,
      COALESCE(SUM(c.last_price_eur), 0)::NUMERIC(10,2) AS total_value_eur
    FROM sets s
    LEFT JOIN cards c ON s.id = c.set_id
    WHERE s.id = $1
    GROUP BY s.id, s.name, s.total
  `;

  const res = await query(queryText, [setId]);

  if (res.rows.length === 0) {
    return null;
  }

  return res.rows[0];
};

/**
 * Obtiene sets por serie
 *
 * @param {string} seriesName - Nombre de la serie
 * @returns {Array} Sets de la serie
 */
export const getSetsBySeries = async (seriesName) => {
  const queryText = `
    SELECT
      s.id,
      s.name,
      s.series,
      s.total,
      s.release_date,
      s.symbol_url,
      COUNT(c.id) AS synced_cards
    FROM sets s
    LEFT JOIN cards c ON s.id = c.set_id
    WHERE s.series ILIKE $1
    GROUP BY s.id, s.name, s.series, s.total, s.release_date, s.symbol_url
    ORDER BY s.release_date DESC
  `;

  const res = await query(queryText, [`%${seriesName}%`]);
  return res.rows;
};

/**
 * Obtiene lista de series únicas
 *
 * @returns {Array} Lista de series
 */
export const getAllSeries = async () => {
  const queryText = `
    SELECT
      series,
      COUNT(*) AS sets_count,
      MIN(release_date) AS first_release,
      MAX(release_date) AS last_release
    FROM sets
    GROUP BY series
    ORDER BY MAX(release_date) DESC
  `;

  const res = await query(queryText);
  return res.rows;
};
