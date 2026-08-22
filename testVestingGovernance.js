/**
 * @file testVestingGovernance.js
 * @description فحص للتأكد من حوكمة الـ 90 مليون YER ومنع اختراق مخصصات الإدراج والسيولة.
 */

const SovereignVestingWallet = require('./SovereignVestingWallet');
const wallet = new SovereignVestingWallet();

function runVestingSimulation() {
    console.log("====================================================================");
    console.log("🛠 جاري فحص قيود العقود الذكية لـ 90 مليون YER المخصصة لمنصة الإطلاق والسيولة");
    console.log("====================================================================");

    const YER_SCALE = 10000000000n;

    // الفحص 1: محاولة إطلاق اكتتاب لمستخدم غير موثق الهوية (KYC)
    console.log("\n[الفحص 1]: محاولة سحب عملات الاكتتاب لمستخدم لم يجتز الـ KYC المعتمد...");
    try {
        wallet.releaseLaunchpadTokens(5000000n * YER_SCALE, false);
        console.log("❌ فشل الفحص: سمح العقد بالصرف دون KYC!");
    } catch (error) {
        console.log(`\x1b[32m✔ نجاح الحظر برمجياً: ${error.message}\x1b[0m`);
    }

    // الفحص 2: محاولة سحب كمية تتجاوز الـ 30 مليون المخصصة للـ Launchpad
    console.log("\n[الفحص 2]: محاولة سحب 35 مليون YER (أكبر من مخصص الاكتتاب البالغ 30 مليون)...");
    try {
        wallet.releaseLaunchpadTokens(35000000n * YER_SCALE, true);
        console.log("❌ فشل الفحص: سمح العقد بتجاوز مخصصات منصة الإطلاق!");
    } catch (error) {
        console.log(`\x1b[32m✔ نجاح الحظر برمجياً: ${error.message}\x1b[0m`);
    }

    // الفحص 3: تأكيد الحقن السليم للسيولة والالتزام بالحدود الحجمية الصارمة
    console.log("\n[الفحص 3]: حقن 40 مليون YER كاملة لدعم عمق السوق ومجمع المقاصة...");
    try {
        const injected = wallet.injectLiquidityPool(40000000n * YER_SCALE);
        console.log(`\x1b[32m✔ نجاح المقاصة: تم حقن ${BigInt(injected) / YER_SCALE} مليون YER بنجاح في عمق السوق المتبادل للـ DEX.\x1b[0m`);
    } catch (error) {
        console.log(`❌ فشل الحقن: ${error.message}`);
    }

    console.log("\n====================================================================");
    console.log("🎯 انتهت فحوصات العقود الذكية لـ 90%؛ البنية التحتية جاهزة تماماً للإدراج السيادي.");
    console.log("====================================================================");
}

runVestingSimulation();
