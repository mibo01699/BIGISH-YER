/**
 * @file testDistributionGovernance.js
 * @description اختبار محاكاة التوزيع المجتمعي ومراقبة صمام أمان سقف الـ 30 مليون YER.
 */

const CommunityDistributionGovernor = require('./DynamicMiningGovernor');
const governor = new CommunityDistributionGovernor();

function runRestrictedPoolSimulation() {
    console.log("=========================================================");
    console.log("🚀 فحص صمام أمان سقف الـ 30 مليون YER للتوزيع المجتمعي");
    console.log("=========================================================");

    const YER_SCALE = 10000000000n;
    const LOCKED_LIQUIDITY = 90000000n * YER_SCALE; // سيولة 90 مليون YER
    const BURNED_TOKENS = 1000n * YER_SCALE;

    // حالة 1: التوزيع في البداية (تم توزيع 1 مليون YER فقط)
    console.log("\n[السيناريو 1]: تم توزيع 1 مليون YER فقط من أصل 30 مليون...");
    const distributed1 = 1000000n * YER_SCALE;
    const rate1 = governor.calculateInstantRate(distributed1, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التوزيع اللحظي النشط: ${rate1} وحدة/ساعة`);

    // حالة 2: المجمع قارب على النفاد (المتبقي كسر بسيط)
    console.log("\n[السيناريو 2]: المجمع شارف على الانتهاء...");
    const distributedAlmostFull = (30000000n * YER_SCALE) - 50000000n;
    const rate2 = governor.calculateInstantRate(distributedAlmostFull, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التوزيع المقيد: ${rate2} وحدة/ساعة`);

    // حالة 3: محاولة تخطي السقف بعد النفاد
    console.log("\n[السيناريو 3]: محاولة التوزيع بعد استهلاك الـ 30 مليون كاملة...");
    const distributedFull = 30000000n * YER_SCALE;
    const rate3 = governor.calculateInstantRate(distributedFull, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التوزيع المستلم: ${rate3} وحدة/ساعة (تم الإغلاق بنجاح).`);

    console.log("\n=========================================================");
    if (rate3 === "0") {
        console.log("\x1b[32m✔ نجاح الفحص: صمام الحوكمة يحمي سقف الـ 30 مليون بشكل صارم!\x1b[0m");
    } else {
        console.log("\x1b[31m❌ خطأ: حدث تجاوز للسقف المحدد برمجياً.\x1b[0m");
    }
    console.log("=========================================================");
}

runRestrictedPoolSimulation();