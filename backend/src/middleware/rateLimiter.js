/**
 * Middleware de Rate Limiting para proteger la API
 */
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/**
 * Rate limiter general para toda la API
 * 100 request port 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: {
    error: "Demasiadas peticiones desde esta IP, intenta mas tarde",
    retryAfter: "15 minuto",
  },
  standardHeaders: true, // Retorna info en headers 'RateLimit-*
  legacyHeaders: false, // Deshabilita headers
  handler: (req, res) => {
    res.status(429).json({
      error: "Limite de peticiones excedido",
      message:
        "Has realizado demasiadas peticiones. Por favor, espera 15 minutos",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter estricto para endpoints de sincronización
 * 10 requests por hora
 */
export const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 requests
  message: {
    error: "Límite de sincronizaciones excedido",
    message: "Solo puedes realizar 10 sincronizaciones por hora",
  },
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter para búsquedas
 * 50 requests por 5 minutos
 */
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50,
  message: {
    error: "Demasiadas búsquedas",
    message: "Has realizado demasiadas búsquedas. Espera 5 minutos",
  },
});

/**
 * Rate limiter para endpoints administrativos
 * 20 requests por hora
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: {
    error: "Límite de operaciones administrativas excedido",
    message: "Solo 20 operaciones administrativas por hora",
  },
});

/**
 * Speed limiter - ralentiza requests progresivamente
 * Después de 50 requests, empieza a agregar delays
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // Después de 50 requests, empezar a ralentizar
  delayMs: 500, // Agregar 500ms de delay por cada request sobre el límite
  maxDelayMs: 5000, // Máximo delay de 5 segundos
});

/**
 * Rate limiter muy permisivo para consultas públicas
 * 200 requests por 15 minutos
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: "Límite temporal excedido",
    message: "Demasiadas consultas, intenta en 15 minutos",
  },
});
