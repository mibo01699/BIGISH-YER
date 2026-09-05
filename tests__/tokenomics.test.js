/**
 * اختبارات YER Tokenomics
 */

const YERTokenomics = require('../YERTokenomicsCanonical');

describe('YERTokenomics', () => {
  let tokenomics;

  beforeEach(() => {
    tokenomics = new YERTokenomics();
  });

  test('should return correct allocations', () => {
    const allocations = tokenomics.getAllocations();

    expect(allocations.community).toBe(30000000);
    expect(allocations.ecosystem).toBe(90000000);
    expect(allocations.reserve).toBe(180000000);
    
    const total = allocations.community + allocations.ecosystem + allocations.reserve;
    expect(total).toBe(300000000);
  });

  test('should validate percentages correctly', () => {
    expect(tokenomics.validatePercentages()).toBe(true);
  });

  test('should have correct maximum supply', () => {
    expect(tokenomics.MAX_SUPPLY).toBe(300000000);
  });
});