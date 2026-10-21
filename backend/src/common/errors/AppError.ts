export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'No autorizado', code = 'UNAUTHORIZED') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Acceso denegado', code = 'FORBIDDEN') {
    return new AppError(403, code, message);
  }

  static notFound(message = 'Recurso no encontrado', code = 'NOT_FOUND') {
    return new AppError(404, code, message);
  }

  static conflict(message: string, code = 'CONFLICT', details?: unknown) {
    return new AppError(409, code, message, details);
  }

  static tooMany(message = 'Demasiadas peticiones') {
    return new AppError(429, 'RATE_LIMITED', message);
  }

  static internal(message = 'Error interno del servidor', details?: unknown) {
    return new AppError(500, 'INTERNAL_ERROR', message, details);
  }
}
