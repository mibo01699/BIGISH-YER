const request = require('supertest');
const { createApp } = require('../lib/create-app');

const GATEWAY = 'https://arabian-eagle-aec-gateway.vercel.app';
const TEST_API_KEY = 'test-api-key-0123456789abcdef';

const validTransfer = {
  senderWallet: 'YER_AJYAL_SRC_01',
  receiverWallet: 'YER_GAV_POS_02',
  amountYer: '1500',
  memo: 'Monthly civil salary stabilization subsidy',
};

function buildApp(overrides = {}) {
  return createApp({ apiKey: TEST_API_KEY, isTest: true, ...overrides });
}

describe('BIGISH-YER API', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  describe('GET /', () => {
    it('returns the welcome envelope', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toMatch(/BIGISH-YER API is running/);
      expect(res.body.data.endpoints).toEqual(
        expect.arrayContaining(['/api/health', '/api/apps', '/api/status']),
      );
    });
  });

  describe('GET /api/health', () => {
    it('returns 200 with status UP', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('UP');
      expect(res.body.status).toBe('UP'); // gateway compatibility alias
      expect(res.body.data.app).toBe('BIGISH-YER');
      expect(typeof res.body.data.uptimeSeconds).toBe('number');
      expect(new Date(res.body.data.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /api/apps', () => {
    it('returns the app descriptor with ONLINE status and public url', async () => {
      const res = await request(app).get('/api/apps');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: 'bigish-yer',
        name: 'BIGISH-YER',
        status: 'ONLINE',
        url: 'https://bigish-yer.vercel.app',
      });
      expect(res.body.data.endpoints.health).toBe('/api/health');
      expect(res.body.data.pi.sandbox).toBe(true);
    });
  });

  describe('GET /api/status', () => {
    it('returns OPERATIONAL with service breakdown', async () => {
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('OPERATIONAL');
      expect(res.body.data.services.api).toBe('OPERATIONAL');
      expect(res.body.data.services.piIntegration).toBe('SANDBOX');
    });
  });

  describe('GET /api/tokenomics', () => {
    it('serialises BigInt values as strings and sums to max supply', async () => {
      const res = await request(app).get('/api/tokenomics');
      expect(res.status).toBe(200);
      const { maximumSupply, allocations } = res.body.data;
      expect(maximumSupply).toBe('300000000');
      const total =
        BigInt(allocations.communityPublicUtility) +
        BigInt(allocations.ecosystemLaunchLiquidity) +
        BigInt(allocations.aecSovereignReserve);
      expect(total.toString()).toBe(maximumSupply);
    });
  });

  describe('POST /api/transfer', () => {
    it('rejects requests without an API key (401)', async () => {
      const res = await request(app).post('/api/transfer').send(validTransfer);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'UNAUTHORIZED', message: expect.any(String) },
      });
    });

    it('rejects requests with a wrong API key (403)', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', 'wrong-key')
        .send(validTransfer);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('responds 503 when no API key is configured on the server', async () => {
      const unconfigured = buildApp({ apiKey: '' });
      const res = await request(unconfigured)
        .post('/api/transfer')
        .set('x-api-key', 'anything')
        .send(validTransfer);
      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('accepts a valid payload and reports VALIDATED_NOT_SETTLED in sandbox (202)', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .send(validTransfer);
      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.state).toBe('VALIDATED_NOT_SETTLED');
      expect(res.body.data.transfer.amountYer).toBe('1500');
    });

    it('returns 400 with field details for missing parameters', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      const fields = res.body.error.details.map((d) => d.field);
      expect(fields).toEqual(
        expect.arrayContaining(['senderWallet', 'receiverWallet', 'amountYer']),
      );
    });

    it.each([
      ['float amount', { amountYer: '15.5' }],
      ['numeric amount (not string)', { amountYer: 1500 }],
      ['negative amount', { amountYer: '-10' }],
      ['zero amount', { amountYer: '0' }],
      ['leading zero amount', { amountYer: '0150' }],
      ['lowercase wallet id', { senderWallet: 'yer_bad' }],
      ['wallet with injection chars', { receiverWallet: "YER_X'; DROP TABLE--" }],
      ['identical wallets', { receiverWallet: validTransfer.senderWallet }],
      ['memo too long', { memo: 'x'.repeat(141) }],
      ['piPaymentId too short', { piPaymentId: 'abc' }],
    ])('rejects invalid data: %s', async (_label, patch) => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .send({ ...validTransfer, ...patch });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects amounts above the maximum supply', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .send({ ...validTransfer, amountYer: '300000001' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/maximum supply/);
    });

    it('returns 400 for malformed JSON bodies', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .set('Content-Type', 'application/json')
        .send('{"broken":');
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Malformed JSON/);
    });

    it('returns 413 for oversized bodies', async () => {
      const res = await request(app)
        .post('/api/transfer')
        .set('x-api-key', TEST_API_KEY)
        .send({ ...validTransfer, memo: 'x'.repeat(20 * 1024) });
      expect(res.status).toBe(413);
    });
  });

  describe('Error handling', () => {
    it('returns a standard 404 envelope for unknown routes', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'NOT_FOUND', message: expect.stringContaining('/api/does-not-exist') },
      });
    });

    it('returns 404 for unsupported methods on known paths', async () => {
      const res = await request(app).delete('/api/health');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns a sanitised 500 envelope for unexpected errors', async () => {
      const errors = [];
      const failing = buildApp({
        logger: { info() {}, warn() {}, debug() {}, error: (msg, meta) => errors.push({ msg, meta }) },
        mount(app) {
          app.get('/api/boom', () => {
            throw new Error('database exploded: password=hunter2');
          });
        },
      });

      const res = await request(failing).get('/api/boom');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      expect(JSON.stringify(res.body)).not.toMatch(/hunter2/);
      expect(errors).toHaveLength(1);
      expect(errors[0].msg).toBe('Unhandled error');
    });
  });

  describe('Security', () => {
    it('sets Helmet security headers and hides x-powered-by', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
      expect(res.headers['strict-transport-security']).toBeDefined();
    });

    it('allows the gateway origin via CORS', async () => {
      const res = await request(app).get('/api/health').set('Origin', GATEWAY);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(GATEWAY);
    });

    it('allows localhost:3000 for development', async () => {
      const res = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('blocks unknown origins with 403', async () => {
      const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('answers CORS preflight for allowed origins', async () => {
      const res = await request(app)
        .options('/api/transfer')
        .set('Origin', GATEWAY)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'x-api-key,content-type');
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-headers']).toMatch(/x-api-key/i);
    });

    it('enforces the rate limit with a 429 envelope', async () => {
      const limited = buildApp({ rateLimit: { windowMs: 60_000, max: 3 } });
      for (let i = 0; i < 3; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await request(limited).get('/api/health');
        expect(ok.status).toBe(200);
      }
      const blocked = await request(limited).get('/api/health');
      expect(blocked.status).toBe(429);
      expect(blocked.body).toEqual({
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: expect.any(String) },
      });
      expect(blocked.headers['ratelimit']).toBeDefined();
    });

    it('does not rate limit the root route', async () => {
      const limited = buildApp({ rateLimit: { windowMs: 60_000, max: 1 } });
      await request(limited).get('/');
      const res = await request(limited).get('/');
      expect(res.status).toBe(200);
    });
  });
});
