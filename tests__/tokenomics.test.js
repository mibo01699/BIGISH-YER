const YERTokenomics = require('../YERTokenomicsCanonical');

describe('YERTokenomics', () => {
  test('should return correct allocations', () => {
    const tokenomics = new YERTokenomics();
    const allocations = tokenomics.getAllocations();

    expect(allocations.community).toBe(30000000);
    expect(allocations.ecosystem).toBe(90000000);
    expect(allocations.reserve).toBe(180000000);
    expect(allocations.community + allocations.ecosystem + allocations.reserve).toBe(300000000);
  });

  test('should validate percentages correctly', () => {
    const tokenomics = new YERTokenomics();
    expect(tokenomics.validatePercentages()).toBe(true);
  });
});