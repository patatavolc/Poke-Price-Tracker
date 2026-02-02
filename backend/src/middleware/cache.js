/**
 * Sistema de cache en memoria para optimizar respuestas frecuentes
 */
import NodeCache from "node-cache";

// Crear instancias de cache con diferentes TTL
const shortCache = new NodeCache({ stdTTL: 300 }); // 5 minutos
const mediumCache = new NodeCache({ stdTTL: 1800 }); // 30 minutos
const longCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

/**
 * Middleware de chache generico
 *
 * @param {number} duration - Duración del cache en segundos
 * @param {function} keyGenerator - Funcion para generar la clave del cache
 *
 */
export const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return (req, res, next) => {
    // Generar clave del cache
    const key = keyGenerator
      ? keyGenerator(req)
      : `${req.method}:${req.originalUrl || req.url}`;

    // Verificar si existe en cache
    const cachedResponse = getCacheByDuration(duration).get(key);
    if (cachedResponse) {
      console.log(`Cache HIT: ${key}`);
      return res.json({
        ...cachedResponse,
        _cached: true,
        _cachedAt: new Date(cachedResponse._timestamp).toISOString(),
      });
    }

    console.log(`Cache MISS: ${key}`);

    // Guardar la funcion original
    const originalJson = res.json.bind(res);

    // Sobreescribir res.json para guardar en cache
    res.json = function (data) {
      // Agregar timestamp
      const dataWithMeta = {
        ...data,
        _timestamp: Date.now(),
      };

      // Guardar en cache
      getCacheByDuration(duration).set(key, dataWithMeta);
      console.log(`Cache SAVED: ${key}`);

      return originalJson(dataWithMeta);
    };
    next();
  };
};

/**
 * Obtiene la instancia de cache segun duracion
 */
function getCacheByDuration(duration) {
  if (duration <= 300) return shortCache;
  if (duration <= 1800) return mediumCache;
  return longCache;
}

// Cache corto (5 minutos) - para datos que cambian frecuentemente
export const shortCacheMiddleware = cacheMiddleware(300);

// Cache medio (30 minutos) - para datos semi-estaticos
export const mediumCacheMiddleware = cacheMiddleware(1800);

// Cache largo (1 hora) - para datos estaticos
export const longCacheMiddleware = cacheMiddleware(3600);

// Limpia todo el cache
export const clearAllCaches = () => {
  shortCache.flushAll();
  mediumCache.flushAll();
  longCache.flushAll();
  console.log("Cache limpiado completamente");
};

// Limpia cache por patron
export const clearCacheByPattern = (pattern) => {
  const regex = new RegExp(pattern);
  let clearedCount = 0;

  [shortCache, mediumCache, longCache].forEach((cache) => {
    const keys = cache.keys();
    keys.forEach((key) => {
      if (regex.test(key)) {
        cache.del(key);
        clearedCount++;
      }
    });
  });

  console.log(
    `${clearedCount} entradas de cache eliminadas (patron: ${pattern})`,
  );
  return clearedCount;
};

// Obtiene estadisticas del cache
export const getCacheStats = () => {
  return {
    short: {
      keys: shortCache.keys().length,
      hits: shortCache.getStats().hits,
      misses: shortCache.getStats().misses,
      hitRate:
        (
          (shortCache.getStats().hits /
            (shortCache.getStats().hits + shortCache.getStats().misses || 1)) *
          100
        ).toFixed(2) + "%",
    },
    medium: {
      keys: mediumCache.keys().length,
      hits: mediumCache.getStats().hits,
      misses: mediumCache.getStats().misses,
      hitRate:
        (
          (mediumCache.getStats().hits /
            (mediumCache.getStats().hits + mediumCache.getStats().misses ||
              1)) *
          100
        ).toFixed(2) + "%",
    },
    long: {
      keys: longCache.keys().length,
      hits: longCache.getStats().hits,
      misses: longCache.getStats().misses,
      hitRate:
        (
          (longCache.getStats().hits /
            (longCache.getStats().hits + longCache.getStats().misses || 1)) *
          100
        ).toFixed(2) + "%",
    },
  };
};
