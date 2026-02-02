/**
 * Middleware de manejo global de errores
 */

/**
 * Clase de error personalizada para la aplicacion
 *
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
/**
 * Middleware para capturar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
  );
  next(error);
};
