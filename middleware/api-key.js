const crypto = require('crypto');
const { ApiError } = require('../lib/response');

/**
 * Protects sensitive endpoints with a shared secret sent as `x-api-key`.
 *
 * - If no API_KEY is configured the endpoint is disabled (503) rather than
 *   silently open, so a missing env var can never expose a sensitive route.
 * - Comparison is constant-time to prevent timing attacks.
 */
function requireApiKey(expectedKey) {
  return function apiKeyGuard(req, res, next) {
    if (!expectedKey) {
      return next(
        ApiError.serviceUnavailable('This endpoint is disabled: API_KEY is not configured'),
      );
    }

    const provided = req.get('x-api-key');
    if (!provided) {
      return next(ApiError.unauthorized('Missing x-api-key header'));
    }

    const expectedBuffer = Buffer.from(expectedKey);
    const providedBuffer = Buffer.from(provided);
    const matches =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!matches) {
      return next(ApiError.forbidden('Invalid API key'));
    }

    return next();
  };
}

module.exports = { requireApiKey };
