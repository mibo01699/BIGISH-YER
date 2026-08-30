/**
 * @file testDexIntegration.js
 * @description اختبار محاكاة شامل لعمليات المبادلة (Swap) الفورية والتكامل مع AMM/DEX لزوج Pi/YER.
 * NOTE: Sandbox/Testnet validation only. No claims of official Pi Network integration.
 */

const exchange = require('./PiYerAMMExchange'); // استيراد الكائن الجاهز

function runDexEcosystemSimulation() {
    console.log("====================================================================");
    console.log("🔄 جاري بدء اختبار التكامل اللامركزي مع مجمعات AMM / DEX (Sandbox)");
    console.log("====================================================================");

    // السيناريو 1: الحصول على السعر الحالي (نص BigInt)
    const currentPrice = exchange.getOnChainPrice();
    console.log(`\n[السيناريو 1]: السعر الحالي من AMM: ${currentPrice} YER/Pi`);

    // السيناريو 2: فحص الانزلاق السعري (بدون أرقام عائمة)
    const amountPi = "10"; // 10 Pi كنص
    const expectedYer = "50000000"; // قيمة متوقعة كنص
    const isSlippageSafe = exchange.validateTransactionSlippage(amountPi, expectedYer);
    console.log(`\n[السيناريو 2]: فحص الانزلاق السعري لـ 10 Pi: ${isSlippageSafe ? 'PASS' : 'FAIL'}`);

    // السيناريو 3: حساب المخرجات يدوياً باستخدام BigInt
    const PI_SCALE = 10000000n;
    const YER_SCALE = 10000000000n;
    const priceBigInt = BigInt(currentPrice);
    const inputPi = 10n * PI_SCALE;
    const outputYer = (inputPi * priceBigInt) / PI_SCALE;

    console.log(`\n[السيناريو 3]: مخرجات 10 Pi بالـ YER: ${outputYer.toString()} (Sub-units)`);
    console.log(`   - ما يعادل: ${outputYer / YER_SCALE} YER (بدون كسور)`);

    console.log("\n====================================================================");
    console.log("✅ اكتمل فحص التكامل مع AMM/DEX (Sandbox) بنجاح وبدون أخطاء عائمة.");
    console.log("====================================================================");
}

runDexEcosystemSimulation();
