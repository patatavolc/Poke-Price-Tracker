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

  return {
    ...cardRes.rows[0],
    history: historyRes.rows,
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
