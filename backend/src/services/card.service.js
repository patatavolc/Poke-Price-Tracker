import { query } from "../config/db.js";

export const getCardByIdWithHistory = async (id) => {
  const cardQuery = "SELECT * FROM cards WHERE id = $1";
  const historyQuery =
    "SELECT price_eur, price_usd, created_at FROM price_history WHERE card_id = $1 ORDER BY created_at ASC";

  const cardRes = await query(cardQuery, [id]);

  if (cardRes.rows.length === 0) {
    return null;
  }

  const historyRes = await query(historyQuery, [id]);

  // Calcular la media del historial de precios
  const priceAverage =
    historyRes.rows.length > 0
      ? {
          avg_price_eur: (
            historyRes.rows.reduce(
              (sum, entry) => sum + (parseFloat(entry.price_eur) || 0),
              0,
            ) / historyRes.rows.length
          ).toFixed(2),
          avg_price_usd: (
            historyRes.rows.reduce(
              (sum, entry) => sum + (parseFloat(entry.price_usd) || 0),
              0,
            ) / historyRes.rows.length
          ).toFixed(2),
          total_entries: historyRes.rows.length,
        }
      : {
          avg_price_eur: null,
          avg_price_usd: null,
          total_entries: 0,
        };

  return {
    ...cardRes.rows[0],
    history: historyRes.rows,
    priceAverage: priceAverage,
  };
};

export const getCardPriceService = async (id) => {
  const queryText =
    "SELECT id, name, last_price_eur, last_price_usd FROM cards WHERE id = $1";

  const res = await query(queryText, [id]);

  if (res.rows === 0) {
    return null;
  }

  return res.rows[0];
};

export const getCardsFromSetService = async (set_id) => {
  const queryText =
    "SELECT id, name, last_price_eur, last_price_usd FROM cards WHERE set_id = $1";

  const res = await query(queryText, [set_id]);

  return res.rows;
};

// Cartas con mayor subida de precio
export const getTrendingPriceIncreaseService = async (period = "24h") => {
  const timeCondition =
    period === "7d" ? "NOW() - INTERVAL '7 days'" : "NOW() - INTERVAL '1 day'";

  // WITH crea una tabla temporal
  const queryText = `
  WITH price_changes AS (
      SELECT 
        c.id,
        c.name,
        c.image_small,
        c.last_price_eur,
        c.last_price_usd,
        ph_old.price_eur as old_price_eur, -- precio antiguo
        ph_old.price_usd as old_price_usd,
        ((c.last_price_eur - ph_old.price_eur) / NULLIF(ph_old.price_eur, 0) * 100) as change_percentage_eur
      FROM cards c
      INNER JOIN LATERAL (
        SELECT price_eur, price_usd
        FROM price_history
        WHERE card_id = c.id 
          AND created_at <= ${timeCondition} -- condición de tiempo
        ORDER BY created_at DESC
        LIMIT 1
      ) ph_old ON true
      WHERE c.last_price_eur IS NOT NULL 
        AND ph_old.price_eur IS NOT NULL
        AND ph_old.price_eur > 0
    )
    SELECT * FROM price_changes
    WHERE change_percentage_eur > 0
    ORDER BY change_percentage_eur DESC
    LIMIT 20
  `;
  // LATERAL permite que las subconsulta use c.id

  const res = await query(queryText);
  return res.rows;
};

export const getTrendingPriceDecreaseService = async (period = "24h") => {
  const timeCondition =
    period === "7d" ? "NOW() - INTERVAL '7 days'" : "NOW() - INTERVAL '1 day'";

  const queryText = `
    WITH price_changes AS (
      SELECT 
        c.id,
        c.name,
        c.image_small,
        c.last_price_eur,
        c.last_price_usd,
        ph_old.price_eur as old_price_eur,
        ph_old.price_usd as old_price_usd,
        ((c.last_price_eur - ph_old.price_eur) / NULLIF(ph_old.price_eur, 0) * 100) as change_percentage_eur
      FROM cards c
      INNER JOIN LATERAL (
        SELECT price_eur, price_usd
        FROM price_history
        WHERE card_id = c.id 
          AND created_at <= ${timeCondition}
        ORDER BY created_at DESC
        LIMIT 1
      ) ph_old ON true
      WHERE c.last_price_eur IS NOT NULL 
        AND ph_old.price_eur IS NOT NULL
        AND ph_old.price_eur > 0
    )
    SELECT * FROM price_changes
    WHERE change_percentage_eur < 0
    ORDER BY change_percentage_eur ASC
    LIMIT 20
  `;

  const res = await query(queryText);
  return res.rows;
};

export const getMostExpensiveCardsService = async (
  limit = 20,
  currency = "eur",
) => {
  const priceColumn = currency === "usd" ? "last_price_usd" : "last_price_eur";

  const queryText = `
    SELECT
      c.id,
      c.name,
      c.image_small,
      c.rarity,
      c.last_price_eur,
      c.last_price_usd,
      s.name AS set_name
    FROM cards c
    JOIN sets s ON c.set_id = s.id
    WHERE c.${priceColumn} IS NOT NULL
    ORDER BY c.${priceColumn} DESC
    LIMIT $1
  `;

  const res = await query(queryText, [limit]);
  return res.rows;
};

export const getCheapestCardsService = async (limit = 20, currency = "eur") => {
  const priceColumn = currency === "usd" ? "last_price_usd" : "last_price_eur";

  const queryText = `
    SELECT
      c.id,
      c.name,
      c.image_small,
      c.rarity,
      c.last_price_eur,
      c.last_price_usd,
      s.name AS set_name
    FROM cards c
    JOIN sets s ON c.set_id = s.id
    WHERE c.${priceColumn} IS NOT NULL
    ORDER BY c.${priceColumn} ASC
    LIMIT $1
  `;

  const res = await query(queryText, [limit]);
  return res.rows;
};

// Rangos de precio en un periodo
export const getPriceRangeService = async (cardId, days = 30) => {
  const queryText = `
    SELECT
      MIN(price_eur) as min_price_eur,
      MAX(price_eur) as max_price_eur,
      AVG(price_eur) as avg_price_eur,
      MIN(price_usd) as min_price_usd,
      MAX(price_usd) as max_price_usd,
      AVG(price_usd) as avg_price_usd,
      COUNT(*) as data_points
    FROM price_history
    WHERE card_id = $1
      AND created_at >= NOW() - INTERVAL '1 day' * $2
  `;

  const res = await query(queryText, [cardId, days]);

  if (res.rows.length === 0 || res.rows[0].data_points === "0") {
    return null;
  }

  return res.rows[0];
};

// Verificar alerta de precio
export const checkPriceAlertService = async (
  cardId,
  threshold,
  currency = "eur",
) => {
  const priceColumn = currency === "usd" ? "last_price_usd" : "last_price_eur";

  const queryText = `
  SELECT
    id,
    name,
    ${priceColumn} as current_price,
    image_small
  FROM cards
  WHERE id = $1
  `;

  const res = await query(queryText, [cardId]);

  if (res.rows.length === 0) {
    return null;
  }

  const card = res.rows[0];
  const isBelowThreshold =
    parseFloat(card.current_price) <= parseFloat(threshold);

  return {
    ...card,
    threshold: parseFloat(threshold),
    is_bellow_threshold: isBelowThreshold,
    difference: parseFloat(threshold) - parseFloat(card.current_price),
  };
};

export const compareCardPricesService = async (cardsIds) => {
  const queryText = `
  SELECT
    c.id,
    c.name,
    c.image_small,
    c.rarity,
    c.last_price_eur,
    c.last_price_usd,
    s.name as set_name
  FROM cards c
  LEFT JOIN sets s ON c.set_id = s.id
  WHERE c.id = ANY($1::varchar[])
  ORDER BY c.last_price_eur DESC
  `;

  const res = await query(queryText, [cardsIds]);
  return res.rows;
};

/**
 * Búsqueda de cartas por nombre con coincidencia parcial
 *
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Array} Cartas encontradas
 */
export const searchCardsByName = async (searchTerm, limit = 20) => {
  const queryText = `
    SELECT
      c.id,
      c.name,
      c.image_small,
      c.rarity,
      c.supertype,
      c.last_price_eur,
      c.last_price_usd,
      s.name AS set_name,
      s.series AS set_series
    FROM cards c
    LEFT JOIN sets s ON c.set_id = s.id
    WHERE c.name ILIKE $1
    ORDER BY c.name ASC
    LIMIT $2
  `;

  const res = await query(queryText, [`%${searchTerm}%`, limit]);
  return res.rows;
};

/**
 * Filtrado avanzado de cartas con múltiples criterios
 *
 * @param {Object} filters - Objeto con filtros opcionales
 * @returns {Array} Cartas filtradas
 */
export const filterCards = async (filters) => {
  const {
    name,
    setId,
    rarity,
    supertype,
    types,
    artist,
    minPrice,
    maxPrice,
    currency = "eur",
    limit = 50,
  } = filters;

  const priceColumn = currency === "usd" ? "last_price_usd" : "last_price_eur";
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Construir condiciones dinámicamente
  if (name) {
    conditions.push(`c.name ILIKE $${paramIndex}`);
    params.push(`%${name}%`);
    paramIndex++;
  }

  if (setId) {
    conditions.push(`c.set_id = $${paramIndex}`);
    params.push(setId);
    paramIndex++;
  }

  if (rarity) {
    conditions.push(`c.rarity = $${paramIndex}`);
    params.push(rarity);
    paramIndex++;
  }

  if (supertype) {
    conditions.push(`c.supertype = $${paramIndex}`);
    params.push(supertype);
    paramIndex++;
  }

  if (types && types.length > 0) {
    conditions.push(`c.types && $${paramIndex}::text[]`);
    params.push(types);
    paramIndex++;
  }

  if (artist) {
    conditions.push(`c.artist ILIKE $${paramIndex}`);
    params.push(`%${artist}%`);
    paramIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`c.${priceColumn} >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`c.${priceColumn} <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const queryText = `
    SELECT
      c.id,
      c.name,
      c.image_small,
      c.rarity,
      c.supertype,
      c.types,
      c.artist,
      c.last_price_eur,
      c.last_price_usd,
      s.name AS set_name,
      s.series AS set_series
    FROM cards c
    LEFT JOIN sets s ON c.set_id = s.id
    ${whereClause}
    ORDER BY c.name ASC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  const res = await query(queryText, params);
  return res.rows;
};
