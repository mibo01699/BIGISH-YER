/**
 * Centralised runtime configuration.
 * Every value is read from the environment exactly once; nothing is hardcoded.
 */

require('dotenv').config();

const pkg = require('../package.json');

const DEFAULT_ALLOWED_ORIGINS = [
  'https://arabian-eagle-aec-gateway.vercel.app',
  'http://localhost:3000',
];

function parseOrigins(raw) {
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseBoolean(raw, fallback) {
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

function parseInteger(raw, fallback) {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const config = Object.freeze({
  app: Object.freeze({
    id: 'bigish-yer',
    name: 'BIGISH-YER',
    version: pkg.version,
    url: process.env.PUBLIC_APP_URL || 'https://bigish-yer.vercel.app',
    description:
      'طبقة التسوية المالية الأساسية ومنظومة الريال الرقمي اليمني',
  }),
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInteger(process.env.PORT, 3000),
  allowedOrigins: Object.freeze(parseOrigins(process.env.ALLOWED_ORIGINS)),
  rateLimit: Object.freeze({
    windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parseInteger(process.env.RATE_LIMIT_MAX, 100),
  }),
  apiKey: process.env.API_KEY || '',
  pi: Object.freeze({
    sandbox: parseBoolean(process.env.PI_SANDBOX, true),
    apiUrl: process.env.PI_API_URL || 'https://api.minepi.com',
    network: process.env.PI_BLOCKCHAIN_NETWORK || 'testnet',
  }),
});

module.exports = config;
