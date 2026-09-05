const { redact, createLogger } = require('../lib/logger');
const { ApiError, sendError, sendSuccess } = require('../lib/response');
const pi = require('../src/pi/piIntegration');

function fakeRes() {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

describe('lib/response', () => {
  it('builds success envelopes', () => {
    const res = sendSuccess(fakeRes(), { ok: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, data: { ok: 1 } });
  });

  it('builds error envelopes with standard codes', () => {
    const res = sendError(fakeRes(), 429, 'slow down');
    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'slow down' },
    });
  });

  it('ApiError factories map to the right status codes', () => {
    expect(ApiError.badRequest('x').status).toBe(400);
    expect(ApiError.unauthorized().status).toBe(401);
    expect(ApiError.forbidden().status).toBe(403);
    expect(ApiError.notFound().status).toBe(404);
    expect(ApiError.tooManyRequests().status).toBe(429);
    expect(ApiError.serviceUnavailable().status).toBe(503);
    expect(ApiError.badRequest('x', [{ field: 'a' }]).details).toEqual([{ field: 'a' }]);
  });
});

describe('lib/logger', () => {
  it('redacts sensitive keys recursively', () => {
    const out = redact({
      user: 'a',
      password: 'p',
      nested: { token: 't', 'x-api-key': 'k', list: [{ secret: 's' }] },
    });
    expect(out).toEqual({
      user: 'a',
      password: '[REDACTED]',
      nested: { token: '[REDACTED]', 'x-api-key': '[REDACTED]', list: [{ secret: '[REDACTED]' }] },
    });
  });

  it('emits one JSON line per event with level and service', () => {
    const lines = [];
    const logger = createLogger({ silent: false, level: 'info', write: (l) => lines.push(l) });
    logger.debug('hidden');
    logger.info('hello', { apiKey: 'abc', path: '/x' });
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]);
    expect(parsed).toMatchObject({ level: 'info', service: 'bigish-yer', message: 'hello', path: '/x' });
    expect(parsed.apiKey).toBe('[REDACTED]');
  });
});

describe('src/pi/piIntegration (sandbox)', () => {
  it('reports sandbox mode and not ready', () => {
    const mode = pi.getMode();
    expect(mode.sandbox).toBe(true);
    expect(mode.ready).toBe(false);
    expect(pi.isReady()).toBe(false);
  });

  it('refuses all mainnet operations while sandboxed', async () => {
    await expect(pi.verifyAccessToken('tok')).rejects.toThrow(/disabled/);
    await expect(pi.approvePayment('pay_1')).rejects.toThrow(/disabled/);
    await expect(pi.completePayment('pay_1', 'tx_1')).rejects.toThrow(/disabled/);
  });
});
