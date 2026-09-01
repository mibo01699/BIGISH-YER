const YER_TOKENOMICS = require('../YERTokenomicsCanonical.js');

test('Tokenomics allocations sum to maximum supply', () => {
  const total = YER_TOKENOMICS.allocations.communityPublicUtility +
                YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity +
                YER_TOKENOMICS.allocations.aecSovereignReserve;

  expect(total).toBe(YER_TOKENOMICS.maximumSupply);
});

test('Percentages are correct', () => {
  const communityRatio = Number(YER_TOKENOMICS.allocations.communityPublicUtility) / Number(YER_TOKENOMICS.maximumSupply);
  expect(communityRatio).toBeCloseTo(0.1, 2);

  const ecosystemRatio = Number(YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity) / Number(YER_TOKENOMICS.maximumSupply);
  expect(ecosystemRatio).toBeCloseTo(0.3, 2);

  const reserveRatio = Number(YER_TOKENOMICS.allocations.aecSovereignReserve) / Number(YER_TOKENOMICS.maximumSupply);
  expect(reserveRatio).toBeCloseTo(0.6, 2);
});
