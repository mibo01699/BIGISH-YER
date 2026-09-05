/**
 * Structured JSON logger.
 * One line per event so Vercel Function Logs can be filtered and parsed.
 */

const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });

const SENSITIVE_KEYS = new Set([
  'apiKey',
  'api_key',
  'x-api-key',
  'authorization',
  'password',
  'secret',
  'token',
  'accessToken',
  'privateKey',
]);

function redact(value, depth = 0) {
  if (value === null || typeof value !== 'object' || depth > 4) return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  const output = {};
  for (const [key, entry] of Object.entries(value)) {
    output[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : redact(entry, depth + 1);
  }
  return output;
}

function serializeError(error) {
  if (!(error instanceof Error)) return error;
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  };
}

function createLogger(options = {}) {
  const minLevel = LEVELS[options.level || process.env.LOG_LEVEL || 'info'] || LEVELS.info;
  const silent = options.silent ?? process.env.NODE_ENV === 'test';
  const write = options.write || ((line) => process.stdout.write(`${line}\n`));

  function emit(level, message, meta) {
    if (silent || LEVELS[level] < minLevel) return;
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service: 'bigish-yer',
      message,
      ...(meta ? redact(meta) : {}),
    };
    if (payload.error) payload.error = serializeError(payload.error);
    write(JSON.stringify(payload));
  }

  return {
    debug: (message, meta) => emit('debug', message, meta),
    info: (message, meta) => emit('info', message, meta),
    warn: (message, meta) => emit('warn', message, meta),
    error: (message, meta) => emit('error', message, meta),
  };
}

module.exports = { createLogger, redact };
