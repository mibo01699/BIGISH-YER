const YER_TOKENOMICS = require('../YERTokenomicsCanonical.js');

test('Tokenomics allocations sum to maximum supply', () => {
  const sum = YER_TOKENOMICS.allocations.communityPublicUtility +
               YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity +
               YER_TOKENOMICS.allocations.aecSovereignReserve;
  expect(sum).toBe(YER_TOKENOMICS.maximumSupply);
});