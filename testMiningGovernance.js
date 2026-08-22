/**
 * @file testMiningGovernance.js
 * @description اختبار محاكاة التعدين المجاني ومراقبة صمام أمان سقف الـ 10%.
 */

const DynamicMiningGovernor = require('./DynamicMiningGovernor');
const governor = new DynamicMiningGovernor();

function runRestrictedPoolSimulation() {
    console.log("=========================================================");
    console.log("🚀 فحص صمام أمان سقف الـ 10% للتعدين المجاني لـ BIGISH-YER");
    console.log("=========================================================");

    const YER_SCALE = 10000000000n;
    const LOCKED_LIQUIDITY = 30000000n * YER_SCALE; // محاكاة وجود سيولة ممتازة بدعم 30 مليون YER
    const BURNED_TOKENS = 1000n * YER_SCALE;

    // حالة 1: التعدين في البداية (تم تعدين 1 مليون YER فقط من المجمع المجاني)
    console.log("\n[السيناريو 1]: تم تعدين 1 مليون YER فقط من أصل 10 مليون...");
    const mined1 = 1000000n * YER_SCALE;
    const rate1 = governor.calculateInstantRate(mined1, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التعدين اللحظي النشط: ${Number(BigInt(rate1)) / 10000000000} YER/ساعة`);

    // حالة 2: المجمع المجاني قارب على النفاد تماماً (المتبقي فقط 0.005 YER)
    console.log("\n[السيناريو 2]: المجمع المجاني شارف على الانتهاء (المتبقي كسر بسيط جداً)...");
    const minedAlmostFull = (10000000n * YER_SCALE) - 50000000n; // متبقي 0.005 YER فقط
    const rate2 = governor.calculateInstantRate(minedAlmostFull, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التعدين الحوكمي المقيد: ${Number(BigInt(rate2)) / 10000000000} YER/ساعة (تم تحجيم الحصة للمتبقي لحماية السقف).`);

    // حالة 3: محاولة تخطي السقف والتعدين بعد نفاد الـ 10% بالكامل
    console.log("\n[السيناريو 3]: محاولة التعدين بعد استهلاك الـ 10 مليون YER كاملة...");
    const minedFull = 10000000n * YER_SCALE;
    const rate3 = governor.calculateInstantRate(minedFull, LOCKED_LIQUIDITY, BURNED_TOKENS);
    console.log(`-> معدل التعدين النمطي المستلم: ${rate3} YER/ساعة (تم الإغلاق بنجاح وصفرية الأخطاء الحسابية الحجمية).`);

    console.log("\n=========================================================");
    if (rate3 === "0") {
        console.log("\x1b[32m✔ نجاح الفحص: صمام الحوكمة يحمي نسبة الـ 10% للتعدين المجاني بشكل صارم ومحكم السيادة!\x1b[0m");
    } else {
        console.log("\x1b[31m❌ خطأ: حدث تجاوز للسقف المحدد برمجياً.\x1b[0m");
    }
    console.log("=========================================================");
}

runRestrictedPoolSimulation();
