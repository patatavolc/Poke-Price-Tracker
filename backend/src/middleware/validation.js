/**
 * Middleware de validación de entrada
 */

/**
 * Valida que el ID de carta tenga formato válido
 */
export const validateCardId = (req, res, next) => {
  const { id, cardId } = req.params;
  const targetId = id || cardId;

  if (!targetId) {
    return res.status(400).json({
      error: "ID de carta requerido",
    });
  }

  // Formato típico: "base1-4", "xy1-1", etc.
  if (!/^[a-z0-9]+-[0-9]+$/i.test(targetId)) {
    return res.status(400).json({
      error:
        "Formato de ID de carta inválido. Formato esperado: 'setId-number'",
      example: "base1-4",
    });
  }

  next();
};

/**
 * Valida que el set ID tenga formato válido
 */
export const validateSetId = (req, res, next) => {
  const { setId, set_id } = req.params;
  const targetId = setId || set_id;

  if (!targetId) {
    return res.status(400).json({
      error: "ID de set requerido",
    });
  }

  // Formato típico: "base1", "xy1", "swsh1", etc.
  if (!/^[a-z0-9]+$/i.test(targetId)) {
    return res.status(400).json({
      error: "Formato de ID de set inválido. Solo letras y números",
      example: "base1",
    });
  }

  next();
};

/**
 * Valida parámetros de paginación
 */
export const validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "El parámetro 'limit' debe ser un número entre 1 y 100",
      });
    }
    req.query.limit = limitNum;
  }

  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: "El parámetro 'offset' debe ser un número mayor o igual a 0",
      });
    }
    req.query.offset = offsetNum;
  }

  next();
};

/**
 * Valida parámetros de precio
 */
export const validatePriceParams = (req, res, next) => {
  const { minPrice, maxPrice, currency } = req.query;

  if (minPrice !== undefined) {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0) {
      return res.status(400).json({
        error: "El parámetro 'minPrice' debe ser un número positivo",
      });
    }
    req.query.minPrice = min;
  }

  if (maxPrice !== undefined) {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0) {
      return res.status(400).json({
        error: "El parámetro 'maxPrice' debe ser un número positivo",
      });
    }
    req.query.maxPrice = max;
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    req.query.minPrice > req.query.maxPrice
  ) {
    return res.status(400).json({
      error: "'minPrice' no puede ser mayor que 'maxPrice'",
    });
  }

  if (
    currency !== undefined &&
    !["eur", "usd"].includes(currency.toLowerCase())
  ) {
    return res.status(400).json({
      error: "Moneda inválida. Use 'eur' o 'usd'",
    });
  }

  next();
};

/**
 * Valida parámetros de búsqueda
 */
export const validateSearchQuery = (req, res, next) => {
  const { q, name, search } = req.query;
  const searchTerm = q || name || search;

  if (!searchTerm || searchTerm.trim().length === 0) {
    return res.status(400).json({
      error:
        "Término de búsqueda requerido. Use el parámetro 'q', 'name' o 'search'",
    });
  }

  if (searchTerm.length < 2) {
    return res.status(400).json({
      error: "El término de búsqueda debe tener al menos 2 caracteres",
    });
  }

  if (searchTerm.length > 100) {
    return res.status(400).json({
      error: "El término de búsqueda no puede exceder 100 caracteres",
    });
  }

  req.query.searchTerm = searchTerm.trim();
  next();
};

/**
 * Valida período de tiempo
 */
export const validatePeriod = (req, res, next) => {
  const { period } = req.query;

  if (period && !["24h", "7d", "30d", "1y"].includes(period)) {
    return res.status(400).json({
      error: "Período inválido. Use '24h', '7d', '30d' o '1y'",
    });
  }

  next();
};

/**
 * Sanitiza entrada de texto para prevenir inyección
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitizar params
  for (const key in req.params) {
    if (typeof req.params[key] === "string") {
      req.params[key] = req.params[key].trim();
    }
  }

  // Sanitizar query
  for (const key in req.query) {
    if (typeof req.query[key] === "string") {
      req.query[key] = req.query[key].trim();
    }
  }

  next();
};


