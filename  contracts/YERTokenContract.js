// YERTokenomicsCanonical.js
// Canonical Source of Truth (Non-negotiable)

const YER_TOKENOMICS_CANONICAL = Object.freeze({
  symbol: "YER",
  maximumSupply: BigInt("300000000"),
  precision: 10, 
  allocations: {
    communityPublicUtility: BigInt("30000000"),
    ecosystemLaunchLiquidity: BigInt("90000000"),
    aecSovereignReserve: BigInt("180000000")
  },
  allocationPercentages: {
    communityPublicUtility: 10,
    ecosystemLaunchLiquidity: 30,
    aecSovereignReserve: 60
  }
});

// تحقق إلزامي من صحة الرياضيات (30M + 90M + 180M = 300M)
if (YER_TOKENOMICS_CANONICAL.allocations.communityPublicUtility + 
    YER_TOKENOMICS_CANONICAL.allocations.ecosystemLaunchLiquidity + 
    YER_TOKENOMICS_CANONICAL.allocations.aecSovereignReserve !== 
    YER_TOKENOMICS_CANONICAL.maximumSupply) {
    throw new Error("FATAL ERROR: YER Tokenomics distribution does not sum to Maximum Supply.");
}

module.exports = YER_TOKENOMICS_CANONICAL;