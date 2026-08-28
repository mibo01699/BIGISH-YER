/**
 * BIGISH-YER
 * Official YER Token Distribution
 *
 * Maximum Supply:
 * 300,000,000 YER
 *
 * Distribution:
 * 10% Community / Public Utility
 * 30% Ecosystem Launch & Liquidity
 * 60% A.E.C Sovereign Fund
 *
 * Total:
 * 100% = 300,000,000 YER
 *
 * NOTE:
 * This is the BIGISH-YER ecosystem's proposed tokenomics.
 * It is NOT an official Pi Network token allocation.
 */

class YerTokenomicsDistribution {

  constructor() {

    // YER fixed-point precision: 10 decimal places
    this.yerScale = 10000000000n;

    // ============================================================
    // OFFICIAL BIGISH-YER MAXIMUM SUPPLY
    // ============================================================

    this.MAX_GLOBAL_SUPPLY =
      300000000n * this.yerScale;

    // ============================================================
    // OFFICIAL DISTRIBUTION MATRIX
    // ============================================================

    this.allocations = {

      // 10%
      PUBLIC_UTILITY_DISTRIBUTION:
        30000000n * this.yerScale,

      // 30%
      ECOSYSTEM_LAUNCH_AND_LIQUIDITY:
        90000000n * this.yerScale,

      // 60%
      AEC_SOVEREIGN_FUND_RESERVE:
        180000000n * this.yerScale

    };

    // ============================================================
    // DISTRIBUTION PERCENTAGES
    // ============================================================

    this.allocationPercentages = {

      PUBLIC_UTILITY_DISTRIBUTION: 10n,

      ECOSYSTEM_LAUNCH_AND_LIQUIDITY: 30n,

      AEC_SOVEREIGN_FUND_RESERVE: 60n

    };

    // ============================================================
    // INTEGRITY CHECK
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
   *
   * Amount must be supplied as a decimal string,
   * avoiding JavaScript floating-point arithmetic.
   */
  validateAndRegisterAllocation(
    allocationType,
    amountInBaseUnits
  ) {

    if (!this.allocations[allocationType]) {

      return {
        success: false,
        reason: "UNAUTHORIZED_ALLOCATION_TIER"
      };

    }

    const bigAmount =
      BigInt(amountInBaseUnits);

    if (bigAmount <= 0n) {

      return {
        success: false,
        reason: "INVALID_ALLOCATION_AMOUNT"
      };

    }

    if (
      bigAmount >
      this.allocations[allocationType]
    ) {

      return {
        success: false,
        reason:
          "EXCEEDED_ALLOCATION_TIER_CAP"
      };

    }

    if (
      this.totalDistributedSupply + bigAmount >
      this.MAX_GLOBAL_SUPPLY
    ) {

      return {
        success: false,
        reason:
          "GLOBAL_MAX_SUPPLY_BREACH_INTERCEPTED"
      };

    }

    this.totalDistributedSupply += bigAmount;

    return {

      success: true,

      status:
        "ALLOCATION_VERIFIED",

      allocationType,

      currentSupplyRaw:
        this.totalDistributedSupply.toString(),

      globalCapRaw:
        this.MAX_GLOBAL_SUPPLY.toString()

    };
  }

}

module.exports =
  new YerTokenomicsDistribution();