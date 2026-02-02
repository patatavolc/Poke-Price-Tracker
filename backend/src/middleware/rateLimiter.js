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
