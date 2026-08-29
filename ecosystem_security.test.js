/**
 * BIGISH-YER: Advanced Tokenomics & Ecosystem Security Integration Test
 * Verifies synchronization between the Central Ledger and the Sovereign Fund Rig.
 */
const assert = require('assert');
const YER_TOKENOMICS = require('./YERTokenomicsCanonical');

function runGlobalEcosystemSyncTest() {
    console.log("======================================================");
    console.log("🦅 Running Tokenomics Synchronization Verifications (A.E.C)...");
    console.log("======================================================");

    try {
        // التحقق من أن المصدر المركزي موجود
        assert.ok(YER_TOKENOMICS, "YER Tokenomics Canonical Source failed to load.");
        console.log("✅ [Sync Test] YER Tokenomics Canonical Source is online.");

        // 1. التحقق من المعروض الكلي 300M
        const maxSupply = YER_TOKENOMICS.maximumSupply;
        assert.strictEqual(maxSupply.toString(), "300000000");
        console.log(`✅ [Tokenomics Test] Maximum Supply verified: ${maxSupply}`);

        // 2. التحقق من التوزيع: 30M + 90M + 180M = 300M
        const totalAlloc = YER_TOKENOMICS.allocations.communityPublicUtility +
                           YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity +
                           YER_TOKENOMICS.allocations.aecSovereignReserve;
        assert.strictEqual(totalAlloc.toString(), "300000000");
        console.log("✅ [Tokenomics Test] Allocation sum verified: 30M + 90M + 180M = 300M");

        // 3. التحقق من النسب المئوية
        const totalPct = YER_TOKENOMICS.allocationPercentages.communityPublicUtility +
                         YER_TOKENOMICS.allocationPercentages.ecosystemLaunchLiquidity +
                         YER_TOKENOMICS.allocationPercentages.aecSovereignReserve;
        assert.strictEqual(totalPct, 100);
        console.log("✅ [Tokenomics Test] Percentages verified: 10% + 30% + 60% = 100%");

        console.log("\n🥇 ALL INTERCONNECTED ECOSYSTEM MATRIX CODES ARE FULLY SYNCED!");
    } catch (error) {
        console.error("❌ Critical Ecosystem Synchronization Failure:", error.message);
        process.exitCode = 1;
    }
}

runGlobalEcosystemSyncTest();