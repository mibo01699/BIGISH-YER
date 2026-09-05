/**
 * Standard API envelope.
 *
 *   success: { "success": true,  "data": { ... } }
 *   failure: { "success": false, "error": { "code", "message", "details"? } }
 */

const ERROR_CODES = Object.freeze({
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
});

class ApiError extends Error {
  constructor(status, message, { code, details, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || ERROR_CODES[status] || 'ERROR';
    this.details = details;
    if (cause) this.cause = cause;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, { details });
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new ApiError(429, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, message);
  }
}

function sendSuccess(res, data, status = 200, extra = {}) {
  return res.status(status).json({ success: true, data, ...extra });
}

function sendError(res, status, message, { code, details } = {}) {
  const error = { code: code || ERROR_CODES[status] || 'ERROR', message };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}

module.exports = { ApiError, ERROR_CODES, sendSuccess, sendError };
