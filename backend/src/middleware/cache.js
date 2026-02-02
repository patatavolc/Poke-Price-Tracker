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
