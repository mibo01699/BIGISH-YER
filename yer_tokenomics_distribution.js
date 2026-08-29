/**
 * BIGISH-YER
 * YER Token Distribution & Allocation Engine
 * NOTE: This engine pulls all tokenomics from the Canonical Source (YERTokenomicsCanonical.js).
 * No hard-coded numbers here to prevent drift and conflicts.
 */

const YER_TOKENOMICS = require('./YERTokenomicsCanonical');

class YerTokenomicsDistribution {

  constructor() {
    // YER fixed-point precision: 10 decimal places
    this.yerScale = 10000000000n;

    // ============================================================
    // READ FROM CANONICAL SOURCE (300M Supply / 30M / 90M / 180M)
    // ============================================================

    this.MAX_GLOBAL_SUPPLY = YER_TOKENOMICS.maximumSupply * this.yerScale;

    this.allocations = {
      PUBLIC_UTILITY_DISTRIBUTION: YER_TOKENOMICS.allocations.communityPublicUtility * this.yerScale,
      ECOSYSTEM_LAUNCH_AND_LIQUIDITY: YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity * this.yerScale,
      AEC_SOVEREIGN_FUND_RESERVE: YER_TOKENOMICS.allocations.aecSovereignReserve * this.yerScale
    };

    this.allocationPercentages = {
      PUBLIC_UTILITY_DISTRIBUTION: YER_TOKENOMICS.allocationPercentages.communityPublicUtility,
      ECOSYSTEM_LAUNCH_AND_LIQUIDITY: YER_TOKENOMICS.allocationPercentages.ecosystemLaunchLiquidity,
      AEC_SOVEREIGN_FUND_RESERVE: YER_TOKENOMICS.allocationPercentages.aecSovereignReserve
    };

    // ============================================================
    // INTEGRITY CHECK (Ensure Canonical Sums to 300M)
    // ============================================================

    const allocationTotal =
      Object.values(this.allocations)
        .reduce((sum, value) => sum + value, 0n);

    if (allocationTotal !== this.MAX_GLOBAL_SUPPLY) {
      throw new Error(
        "YER TOKENOMICS INTEGRITY FAILURE: " +
        "Allocation total does not equal maximum supply."
      );
    }

    this.totalDistributedSupply = 0n;
  }

  /**
   * Validate and register a YER allocation.
   * Amount must be supplied as a decimal string,
   * avoiding JavaScript floating-point arithmetic.
   */
  validateAndRegisterAllocation(allocationType, amountInBaseUnits) {
    if (!this.allocations[allocationType]) {
      return { success: false, reason: "UNAUTHORIZED_ALLOCATION_TIER" };
    }

    const bigAmount = BigInt(amountInBaseUnits);

    if (bigAmount <= 0n) {
      return { success: false, reason: "INVALID_ALLOCATION_AMOUNT" };
    }

    if (bigAmount > this.allocations[allocationType]) {
      return { success: false, reason: "EXCEEDED_ALLOCATION_TIER_CAP" };
    }

    if (this.totalDistributedSupply + bigAmount > this.MAX_GLOBAL_SUPPLY) {
      return { success: false, reason: "GLOBAL_MAX_SUPPLY_BREACH_INTERCEPTED" };
    }

    this.totalDistributedSupply += bigAmount;

    return {
      success: true,
      status: "ALLOCATION_VERIFIED",
      allocationType,
      currentSupplyRaw: this.totalDistributedSupply.toString(),
      globalCapRaw: this.MAX_GLOBAL_SUPPLY.toString()
    };
  }
}

module.exports = new YerTokenomicsDistribution();