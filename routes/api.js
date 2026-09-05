const express = require('express');
const { body } = require('express-validator');

const { sendSuccess, ApiError } = require('../lib/response');
const { validate } = require('../middleware/validate');
const { requireApiKey } = require('../middleware/api-key');
const tokenomics = require('../YERTokenomicsCanonical');
const pi = require('../src/pi/piIntegration');

const YER_WALLET_PATTERN = /^YER_[A-Z0-9_]{3,60}$/;
const YER_AMOUNT_PATTERN = /^[1-9][0-9]{0,17}$/; // positive integer, no floats, no leading zeros

function createApiRouter(config) {
  const router = express.Router();
  const startedAt = Date.now();

  router.get('/health', (req, res) => {
    const data = {
      status: 'UP',
      app: config.app.name,
      version: config.app.version,
      environment: config.env,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    };
    // `status` is duplicated at the top level for gateway backwards compatibility.
    return sendSuccess(res, data, 200, { status: data.status });
  });

  router.get('/apps', (req, res) => {
    const data = {
      id: config.app.id,
      name: config.app.name,
      description: config.app.description,
      version: config.app.version,
      status: 'ONLINE',
      url: config.app.url,
      environment: config.env,
      pi: { sandbox: config.pi.sandbox, network: config.pi.network },
      endpoints: {
        root: '/',
        health: '/api/health',
        info: '/api/apps',
        status: '/api/status',
        tokenomics: '/api/tokenomics',
        transfer: '/api/transfer',
      },
    };
    return sendSuccess(res, data, 200, { status: data.status });
  });

  router.get('/status', (req, res) => {
    return sendSuccess(res, {
      status: 'OPERATIONAL',
      services: {
        api: 'OPERATIONAL',
        piIntegration: config.pi.sandbox ? 'SANDBOX' : 'MAINNET_PENDING',
        launchpad: tokenomics.getLaunchStatus(),
      },
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/tokenomics', (req, res) => {
    return sendSuccess(res, {
      symbol: tokenomics.symbol,
      maximumSupply: tokenomics.maximumSupply.toString(),
      precision: tokenomics.precision,
      allocations: {
        communityPublicUtility: tokenomics.allocations.communityPublicUtility.toString(),
        ecosystemLaunchLiquidity: tokenomics.allocations.ecosystemLaunchLiquidity.toString(),
        aecSovereignReserve: tokenomics.allocations.aecSovereignReserve.toString(),
      },
      allocationPercentages: tokenomics.allocationPercentages,
      launchStatus: tokenomics.getLaunchStatus(),
      communityReleaseUnlocked: tokenomics.canReleaseCommunityAllocation(),
    });
  });

  const transferValidation = validate([
    body('senderWallet')
      .isString()
      .trim()
      .matches(YER_WALLET_PATTERN)
      .withMessage('senderWallet must match YER_<ID> (uppercase letters, digits, underscore)'),
    body('receiverWallet')
      .isString()
      .trim()
      .matches(YER_WALLET_PATTERN)
      .withMessage('receiverWallet must match YER_<ID> (uppercase letters, digits, underscore)')
      .custom((value, { req }) => value !== req.body.senderWallet)
      .withMessage('receiverWallet must differ from senderWallet'),
    body('amountYer')
      .isString()
      .withMessage('amountYer must be a string to preserve BigInt precision')
      .matches(YER_AMOUNT_PATTERN)
      .withMessage('amountYer must be a positive integer string without decimals'),
    body('memo')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 140 })
      .withMessage('memo must be at most 140 characters'),
    body('piPaymentId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 8, max: 128 })
      .withMessage('piPaymentId must be between 8 and 128 characters'),
  ]);

  router.post('/transfer', requireApiKey(config.apiKey), transferValidation, (req, res, next) => {
    try {
      const { senderWallet, receiverWallet, amountYer, memo, piPaymentId } = req.body;
      const amount = BigInt(amountYer);

      if (amount > tokenomics.maximumSupply) {
        throw ApiError.badRequest('amountYer exceeds the YER maximum supply');
      }

      if (!pi.isReady()) {
        // Ledger settlement is intentionally not active until Pi integration is enabled.
        return sendSuccess(
          res,
          {
            accepted: false,
            state: 'VALIDATED_NOT_SETTLED',
            reason: 'Pi Network integration is running in sandbox mode; settlement is disabled',
            transfer: { senderWallet, receiverWallet, amountYer: amount.toString(), memo, piPaymentId },
          },
          202,
        );
      }

      // Reached only after Pi mainnet activation (see PI_INTEGRATION.md).
      throw ApiError.serviceUnavailable('Ledger settlement is not yet enabled');
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createApiRouter };
