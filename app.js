/**
 * BIGISH-YER — الطبقة المالية الأساسية لمنظومة النسر العربي
 * بوابة الريال الرقمي اليمني
 *
 * Entry point. The Express app itself is assembled in lib/create-app.js so
 * that tests and the Vercel serverless handler (api/index.js) share one build.
 */

const { createApp } = require('./lib/create-app');

const app = createApp();

module.exports = app;

if (require.main === module) {
  const { config, logger } = app.locals;

  const server = app.listen(config.port, () => {
    logger.info('BIGISH-YER started', {
      port: config.port,
      environment: config.env,
      allowedOrigins: config.allowedOrigins,
      piSandbox: config.pi.sandbox,
      apiKeyConfigured: Boolean(config.apiKey),
    });
  });

  const shutdown = (signal) => {
    logger.info('Shutting down', { signal });
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
