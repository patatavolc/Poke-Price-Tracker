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

/**
 * Middleware global de manejo de errores
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log del error
  console.error("❌ ERROR:", {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Errores de base de datos PostgreSQL
  if (err.code) {
    switch (err.code) {
      case "23505": // Duplicate key violation
        return res.status(409).json({
          success: false,
          error: "Recurso duplicado",
          message: "El recurso ya existe en la base de datos",
          details:
            process.env.NODE_ENV === "development" ? err.detail : undefined,
        });

      case "23503": // Foreign key violation
        return res.status(400).json({
          success: false,
          error: "Relación inválida",
          message: "El recurso relacionado no existe",
          details:
            process.env.NODE_ENV === "development" ? err.detail : undefined,
        });

      case "22P02": // Invalid text representation
        return res.status(400).json({
          success: false,
          error: "Formato inválido",
          message: "El formato de los datos es incorrecto",
        });

      case "23502": // Not null violation
        return res.status(400).json({
          success: false,
          error: "Campo requerido",
          message: "Falta un campo obligatorio",
          details:
            process.env.NODE_ENV === "development" ? err.column : undefined,
        });
    }
  }

  // Error operacional conocido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  // Error desconocido - no filtrar detalles en producción
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: "Ha ocurrido un error inesperado",
    });
  }

  // En desarrollo, mostrar más detalles
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err,
  });
};

/**
 * Wrapper para async handlers - evita try/catch en cada controlador
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};