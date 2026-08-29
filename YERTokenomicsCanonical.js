
```javascript
/**
 * YERTokenomicsCanonical.js
 * ---------------------------------------------------------
 * The canonical source of truth for YER Tokenomics.
 * All wallets, contracts, and tests MUST import values from here.
 * This enforces the NON-NEGOTIABLE economics of the project.
 *
 * Distribution:
 * - Maximum Supply: 300,000,000 YER (300M)
 * - Community & Public Utility: 30,000,000 YER (10% / 30M)
 * - Ecosystem Launch & Liquidity: 90,000,000 YER (30% / 90M)
 * - A.E.C Sovereign Fund Reserve: 180,000,000 YER (60% / 180M)
 */

// Using BigInt for precision and to avoid floating-point errors
const YER_TOKENOMICS_CANONICAL = Object.freeze({
  symbol: "YER",
  
  // Maximum Supply: 300 Million YER
  maximumSupply: BigInt("300000000"),
  
  // Precision: 10 decimals (as per protocol)
  precision: 10,

  // Absolute allocations (in whole tokens)
  allocations: {
    communityPublicUtility: BigInt("30000000"),   // 30M
    ecosystemLaunchLiquidity: BigInt("90000000"), // 90M
    aecSovereignReserve: BigInt("180000000")      // 180M
  },

  // Percentage allocations (integers to avoid floating-point errors)
  allocationPercentages: {
    communityPublicUtility: 10,
    ecosystemLaunchLiquidity: 30,
    aecSovereignReserve: 60
  }
});

// Enforce the integrity of the tokenomics at runtime (Fail-fast if wrong)
(function validateTokenomics() {
  // Check sum of absolute values
  const sumAllocations = 
    YER_TOKENOMICS_CANONICAL.allocations.communityPublicUtility +
    YER_TOKENOMICS_CANONICAL.allocations.ecosystemLaunchLiquidity +
    YER_TOKENOMICS_CANONICAL.allocations.aecSovereignReserve;

  if (sumAllocations !== YER_TOKENOMICS_CANONICAL.maximumSupply) {
    throw new Error("FATAL ERROR: YER Tokenomics allocations do not sum to Maximum Supply (300M).");
  }

  // Check sum of percentages
  const sumPercentages =
    YER_TOKENOMICS_CANONICAL.allocationPercentages.communityPublicUtility +
    YER_TOKENOMICS_CANONICAL.allocationPercentages.ecosystemLaunchLiquidity +
    YER_TOKENOMICS_CANONICAL.allocationPercentages.aecSovereignReserve;

  if (sumPercentages !== 100) {
    throw new Error("FATAL ERROR: YER Tokenomics percentages do not sum to 100%.");
  }
})();

module.exports = YER_TOKENOMICS_CANONICAL;
```