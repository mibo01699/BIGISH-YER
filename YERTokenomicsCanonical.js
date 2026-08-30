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

module.exports = YER_TOKENOMICS_CANONICAL;