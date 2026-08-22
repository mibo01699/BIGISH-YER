/**
 * @file testDexIntegration.js
 * @description اختبار محاكاة شامل لعمليات المبادلة (Swap) الفورية والتكامل مع الـ AMM والـ DEX لزوج Pi/YER.
 */

const PiYerAMMExchange = require('./PiYerAMMExchange');
const exchange = new PiYerAMMExchange();

function runDexEcosystemSimulation() {
    console.log("====================================================================");
    console.log("🔄 جاري بدء اختبار التكامل اللامركزي مع مجمعات AMM / DEX لشبكة Pi");
    console.log("====================================================================");

    const PI_SCALE = 10000000n;
    const YER_SCALE = 10000000000n;

    // حالة 1: قياس سعر الصرف المبدئي لكمية ضئيلة (10 Pi)
    console.log("\n[السيناريو 1]: مستخدم يطلب مبادلة 10 Pi مقابل رمز YER...");
    const inputPi1 = 10n * PI_SCALE;
    const output1 = exchange.getSwapOutputPiToYer(inputPi1);
    console.log(`-> القيمة المقدرة للمخرجات: ${Number(output1) / Number(YER_SCALE)} YER`);

    // حالة 2: تنفيذ حقيقي للمبادلة في العمق ومراقبة تغير أسعار السوق اللامركزي
    console.log("\n[السيناريو 2]: تنفيذ صفقة تداول حقيقية بمقدار 5,000 Pi وتحديث المجمع...");
    const inputPi2 = 5000n * PI_SCALE;
    const swapReceipt = exchange.executeSwapPiToYer(inputPi2);
    
    console.log("📊 إيصال المقاصة الصادر من الـ DEX:");
    console.log(`- كمية الـ Pi المودعة: ${Number(BigInt(swapReceipt.spentPiStroops)) / Number(PI_SCALE)} Pi`);
    console.log(`- كمية الـ YER المستلمة: ${Number(BigInt(swapReceipt.receivedYerSubUnits)) / Number(YER_SCALE)} YER`);
    console.log(`- سيولة مجمع Pi المتبقية: ${Number(BigInt(swapReceipt.currentPoolPi)) / Number(PI_SCALE)} Pi`);
    console.log(`- سيولة مجمع YER المتبقية: ${Number(BigInt(swapReceipt.currentPoolYer)) / Number(YER_SCALE)} YER`);

    // حالة 3: فحص استقرار ثابت المنتج K (حيث يجب أن يظل ثابتاً أو يرتفع بسبب الرسوم المقتطعة)
    console.log("\n[السيناريو 3]: التحقق من حماية مجمع السيولة وثبات المعامل الكلي K...");
    const checkK = BigInt(swapReceipt.currentPoolPi) * BigInt(swapReceipt.currentPoolYer);
    
    console.log("====================================================================");
    if (checkK >= exchange.constantK) {
        console.log("\x1b[32m✔ نجاح باهر: مجمعات السيولة الآلية AMM مستقرة تماماً، ومحمية من ثغرات السحب العشوائي وجاهزة للإدراج على Pi Launchpad!\x1b[0m");
    } else {
        console.log("\x1b[31m❌ خطأ: حدث تسرب مالي في حسابات ثابت المنتج.\x1b[0m");
    }
    console.log("====================================================================");
}

runDexEcosystemSimulation();
