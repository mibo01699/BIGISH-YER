const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const baseConfig = require('./config');
const { createLogger } = require('./logger');
const { ApiError, sendSuccess, sendError } = require('./response');
const { createApiRouter } = require('../routes/api');

/**
 * Builds the Express application.
 * `overrides` lets tests inject a tighter rate limit, a fake API key, etc.
 */
function createApp(overrides = {}) {
  const config = {
    ...baseConfig,
    ...overrides,
    rateLimit: { ...baseConfig.rateLimit, ...(overrides.rateLimit || {}) },
    pi: { ...baseConfig.pi, ...(overrides.pi || {}) },
  };
  const logger = overrides.logger || createLogger();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Vercel / reverse proxies set X-Forwarded-For

  // --- Security headers ----------------------------------------------------
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  // --- Request logging -----------------------------------------------------
  if (!config.isTest) {
    morgan.token('origin', (req) => req.get('origin') || '-');
    app.use(
      morgan(config.isProduction ? 'combined' : 'dev', {
        stream: { write: (line) => process.stdout.write(line) },
      }),
    );
  }

  // --- CORS whitelist ------------------------------------------------------
  const allowedOrigins = new Set(config.allowedOrigins);
  app.use(
    cors({
      origin(origin, callback) {
        // Requests without an Origin header (server-to-server, curl, health probes) are allowed.
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(ApiError.forbidden(`Origin ${origin} is not allowed by CORS`));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-api-key'],
      maxAge: 600,
    }),
  );

  // --- Rate limiting -------------------------------------------------------
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { ip: req.ip, path: req.originalUrl });
      sendError(res, 429, 'Too many requests, please try again later');
    },
  });
  app.use('/api/', limiter);

  // --- Body parsing --------------------------------------------------------
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  // --- Routes --------------------------------------------------------------
  app.get('/', (req, res) => {
    sendSuccess(res, {
      message: 'BIGISH-YER API is running',
      app: config.app.name,
      version: config.app.version,
      documentation: '/api-docs.md',
      endpoints: ['/api/health', '/api/apps', '/api/status', '/api/tokenomics', '/api/transfer'],
    });
  });

  app.use('/api', createApiRouter(config));

  // Extension point for additional routers (used by tests and future modules).
  if (typeof overrides.mount === 'function') {
    overrides.mount(app);
  }

  // --- 404 -----------------------------------------------------------------
  app.use((req, res) => {
    sendError(res, 404, `Route ${req.method} ${req.path} not found`);
  });

  // --- Central error handler ----------------------------------------------
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error instanceof ApiError) {
      if (error.status >= 500) {
        logger.error('Request failed', { status: error.status, path: req.originalUrl, error });
      } else {
        logger.warn('Request rejected', { status: error.status, path: req.originalUrl, code: error.code });
      }
      return sendError(res, error.status, error.message, { code: error.code, details: error.details });
    }

    // body-parser errors carry `type` and `status`
    if (error.type === 'entity.parse.failed') {
      return sendError(res, 400, 'Malformed JSON body');
    }
    if (error.type === 'entity.too.large') {
      return sendError(res, 413, 'Request body too large');
    }

    logger.error('Unhandled error', { path: req.originalUrl, error });
    return sendError(res, 500, 'Internal server error');
  });

  app.locals.config = config;
  app.locals.logger = logger;
  return app;
}

module.exports = { createApp };
