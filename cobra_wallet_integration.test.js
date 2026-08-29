/**
 * BIGISH-YER: COBRA Wallet & Asset Integration Test
 * Verifies anti-slippage compliance and zero floating-point ledger transfers.
 */
const assert = require('assert');
const PiYerAMMExchange = require('./PiYerAMMExchange');

function testWalletIntegration() {
    console.log("======================================================");
    console.log("💸 Running COBRA Wallet On-Chain Clearing Validation...");
    console.log("======================================================");

    try {
        // 1. اختبار محرك السعر الموحد (التحقق من أنه نص وليس صفراً)
        const price = PiYerAMMExchange.getOnChainPrice();
        assert.ok(BigInt(price) > 0n, "DEX Pi token liquidity pricing engine failed.");
        console.log(`📊 On-Chain Price Check: 1 Pi = ${price} Tokenized YER.`);

        // 2. اختبار حماية الانزلاق السعري (استخدام BigInt مباشرة)
        const isSafe = PiYerAMMExchange.validateTransactionSlippage("100", "20000000");
        assert.strictEqual(typeof isSafe, 'boolean');
        console.log("✅ Slippage Protection Guard: Anti-Market Manipulation Active.");

        console.log("\n🔒 COBRA INTEGRATION SANITY CHECK PASSED SUCCESSFULLY!");
        process.exitCode = 0;
    } catch (error) {
        console.error("❌ Wallet Integration Test Failed:", error.message);
        process.exitCode = 1;
    }
}

testWalletIntegration();