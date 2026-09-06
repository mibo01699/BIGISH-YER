const request = require('supertest');
const app = require('../app');

describe('Idempotency - AntiDoubleDipping', () => {
  const uniqueKey = `test-key-${Date.now()}`;

  test('Should accept first transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Idempotency-Key', uniqueKey)
      .send({
        source: 'test_source',
        destination: 'test_destination',
        amount: 100,
        currency: 'YER'
      });
    expect(res.status).toBe(201);
    expect(res.body.transaction.status).toBe('completed');
  });

  test('Should reject duplicate transaction with same key', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Idempotency-Key', uniqueKey)
      .send({
        source: 'test_source',
        destination: 'test_destination',
        amount: 100,
        currency: 'YER'
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('DUPLICATE_TRANSACTION');
  });

  test('Should retrieve transaction by key', async () => {
    const res = await request(app)
      .get(`/api/transactions/${uniqueKey}`);
    expect(res.status).toBe(200);
    expect(res.body.idempotencyKey).toBe(uniqueKey);
  });

  test('Should reject missing Idempotency-Key header', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        source: 'test_source',
        destination: 'test_destination',
        amount: 50,
        currency: 'YER'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Idempotency-Key');
  });
});