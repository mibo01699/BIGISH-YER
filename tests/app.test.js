const { YER_MAX_SUPPLY, parseToFixedPoint } = require('../app');
const YER_TOKENOMICS = require('../YERTokenomicsCanonical');

test('يجب أن يكون المعروض الأقصى 300 مليون', () => {
  expect(YER_MAX_SUPPLY).toBe(300000000n);
});

test('يجب أن يعمل التحويل من نص إلى BigInt', () => {
  expect(parseToFixedPoint('100.5', 10n ** 10n)).toBe(1005000000000n);
});

test('يجب أن تتطابق توزيعات اليونيسيف مع السقف', () => {
  const total = YER_TOKENOMICS.allocations.communityPublicUtility + 
                YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity + 
                YER_TOKENOMICS.allocations.aecSovereignReserve;
  expect(total).toBe(YER_TOKENOMICS.maximumSupply);
});