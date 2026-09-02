// YERTokenomicsCanonical.js - المصدر الوحيد والحقيقي لتوزيعات YER
// تم التحديث: تأجيل ترحيل حصة الجمهور (10%) حتى نجاح الإطلاق على Pi Launchpad

const YER_TOKENOMICS_CANONICAL = Object.freeze({
  symbol: "YER",
  maximumSupply: BigInt("300000000"),
  precision: 10,
  allocations: {
    communityPublicUtility: BigInt("30000000"),   // 10% - مؤجل حتى الإطلاق
    ecosystemLaunchLiquidity: BigInt("90000000"),  // 30% - يتم تعدينها أولاً للإطلاق
    aecSovereignReserve: BigInt("180000000")       // 60% - احتياطي سيادي
  },
  allocationPercentages: {
    communityPublicUtility: 10,
    ecosystemLaunchLiquidity: 30,
    aecSovereignReserve: 60
  },
  // حالة الإطلاق (تُقرأ من متغير بيئة)
  launchStatus: process.env.YER_LAUNCHPAD_STATUS || 'PENDING'
});

(function validateTokenomics() {
  const sumAllocations =
    YER_TOKENOMICS_CANONICAL.allocations.communityPublicUtility +
    YER_TOKENOMICS_CANONICAL.allocations.ecosystemLaunchLiquidity +
    YER_TOKENOMICS_CANONICAL.allocations.aecSovereignReserve;

  if (sumAllocations !== YER_TOKENOMICS_CANONICAL.maximumSupply) {
    throw new Error("FATAL ERROR: YER Tokenomics allocations do not sum to Maximum Supply (300M).");
  }

  const sumPercentages =
    YER_TOKENOMICS_CANONICAL.allocationPercentages.communityPublicUtility +
    YER_TOKENOMICS_CANONICAL.allocationPercentages.ecosystemLaunchLiquidity +
    YER_TOKENOMICS_CANONICAL.allocationPercentages.aecSovereignReserve;

  if (sumPercentages !== 100) {
    throw new Error("FATAL ERROR: YER Tokenomics percentages do not sum to 100%.");
  }
})();

/**
 * التحقق من حالة الإطلاق على منصة Pi Launchpad
 * @returns {boolean} true إذا تم الإطلاق بنجاح
 */
function isLaunchpadDeployed() {
  const status = process.env.YER_LAUNCHPAD_STATUS || 'PENDING';
  return status === 'DEPLOYED_SUCCESS';
}

/**
 * التحقق من صلاحية ترحيل حصة الجمهور (10%)
 * لا يُسمح بالترحيل إلا بعد نجاح الإطلاق
 * @returns {boolean} true إذا كان الترحيل مسموحاً
 */
function canReleaseCommunityAllocation() {
  return isLaunchpadDeployed();
}

/**
 * التحقق من صلاحية التعامل مع حصة الإطلاق (30%)
 * هذه الحصة متاحة دائماً للتعدين والإدراج
 * @returns {boolean} true دائماً
 */
function canMineEcosystemAllocation() {
  return true; // متاحة دائماً
}

module.exports = {
  ...YER_TOKENOMICS_CANONICAL,
  isLaunchpadDeployed,
  canReleaseCommunityAllocation,
  canMineEcosystemAllocation,
  getLaunchStatus: () => process.env.YER_LAUNCHPAD_STATUS || 'PENDING'
};