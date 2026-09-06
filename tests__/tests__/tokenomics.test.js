// tests__/unit/tokenomics.test.js
const tokenomics = require('../../YERTokenomicsCanonical');

describe('YER Tokenomics', () => {
  test('Supply is 300,000,000', () => {
    expect(tokenomics.YER_SUPPLY).toBe(300000000);
  });

  test('Precision is 10', () => {
    expect(tokenomics.PRECISION).toBe(10);
  });

  test('Allocations sum to 100%', () => {
    const allocations = tokenomics.ALLOCATIONS;
    const total = Object.values(allocations).reduce((sum, a) => sum + a.percentage, 0);
    expect(total).toBe(100);
  });
});