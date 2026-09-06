/**
 * اختبارات YER Tokenomics
 * للتحقق من صحة التوزيعات والنسب المئوية
 */

const YERTokenomics = require('../YERTokenomicsCanonical');

describe('YERTokenomics', () => {
  let tokenomics;

  beforeEach(() => {
    tokenomics = new YERTokenomics();
  });

  test('should return correct allocations', () => {
    const allocations = tokenomics.getAllocations();

    expect(allocations.community).toBe(30000000);   // 10%
    expect(allocations.ecosystem).toBe(90000000);   // 30%
    expect(allocations.reserve).toBe(180000000);    // 60%

    const total = allocations.community + allocations.ecosystem + allocations.reserve;
    expect(total).toBe(300000000); // 100%
  });

  test('should validate percentages correctly', () => {
    expect(tokenomics.validatePercentages()).toBe(true);
  });

  test('should have correct maximum supply', () => {
    expect(tokenomics.MAX_SUPPLY).toBe(300000000);
  });
});