const request = require('supertest');
const app = require('../app');

describe('Ledger Operations', () => {
  test('Should return balance for test_source', async () => {
    const res = await request(app).get('/api/balance/test_source');
    expect(res.status).toBe(200);
    expect(res.body.balance).toBeGreaterThanOrEqual(0);
    expect(res.body.currency).toBe('YER');
  });

  test('Should process a valid transfer', async () => {
    const key = `transfer-${Date.now()}`;
    const res = await request(app)
      .post('/api/transactions')
      .set('Idempotency-Key', key)
      .send({
        source: 'test_source',
        destination: 'test_destination',
        amount: 50,
        currency: 'YER'
      });
    expect(res.status).toBe(201);
  });

  test('Should reject insufficient balance', async () => {
    const key = `insufficient-${Date.now()}`;
    const res = await request(app)
      .post('/api/transactions')
      .set('Idempotency-Key', key)
      .send({
        source: 'test_destination', // هذا الحساب رصيده صفر
        destination: 'test_source',
        amount: 999999,
        currency: 'YER'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INSUFFICIENT_BALANCE');
  });
});