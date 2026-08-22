/**
 * @file testVestingGovernance.js
 * @description فحص مصحح بالكامل للتأكد من حوكمة الـ 90 مليون YER واجتياز خط أتمتة GitHub Actions بنجاح.
 */

const SovereignVestingWallet = require('./SovereignVestingWallet');
const wallet = new SovereignVestingWallet();

function runVestingSimulation() {
    console.log("====================================================================");
    console.log("🛠 جاري تشغيل فحص قيود الحوكمة للـ 90 مليون عملة المخصصة للإدراج");
    console.log("====================================================================");

    const YER_SCALE = 10000000000n;
    let auditPassed = true;

    // الفحص 1: محاولة إطلاق اكتتاب لمستخدم غير موثق الهوية (KYC)
    console.log("\n[الفحص 1]: محاولة سحب عملات الاكتتاب لمستخدم لم يجتز الـ KYC المعتمد...");
    try {
        wallet.releaseLaunchpadTokens(5000000n * YER_SCALE, false);
        console.log("❌ فشل الفحص: سمح العقد بالصرف دون KYC!");
        auditPassed = false;
    } catch (error) {
        console.log(`✔ نجاح الحظر برمجياً ومنع التجاوز: ${error.message}`);
    }

    // الفحص 2: محاولة سحب كمية تتجاوز الـ 30 مليون المخصصة للـ Launchpad
    console.log("\n[الفحص 2]: محاولة سحب 35 مليون YER (أكبر من مخصص الاكتتاب البالغ 30 مليون)...");
    try {
        wallet.releaseLaunchpadTokens(35000000n * YER_SCALE, true);
        console.log("❌ فشل الفحص: سمح العقد بتجاوز مخصصات منصة الإطلاق!");
        auditPassed = false;
    } catch (error) {
        console.log(`✔ نجاح الحظر برمجياً ومنع التجاوز: ${error.message}`);
    }

    // الفحص 3: تأكيد الحقن السليم للسيولة والالتزام بالحدود الحجمية الصارمة
    console.log("\n[الفحص 3]: حقن 40 مليون YER كاملة لدعم عمق السوق ومجمع المقاصة...");
    try {
        const injected = wallet.injectLiquidityPool(40000000n * YER_SCALE);
        console.log(`✔ نجاح المقاصة الحجمية: تم حقن ${BigInt(injected) / YER_SCALE} مليون YER بنجاح.`);
    } catch (error) {
        console.log(`❌ فشل الحقن: ${error.message}`);
        auditPassed = false;
    }

    console.log("\n====================================================================");
    if (auditPassed) {
        console.log("🎯 انتهت فحوصات العقود الذكية لـ 90%؛ البنية التحتية جاهزة تماماً للإدراج السيادي.");
        process.exit(0); // إخبار خادم GitHub Actions بالخروج الآمن كعلامة نجاح
    } else {
        console.log("❌ فشل التدقيق: توجد قيود منكسرة في بنية الأمان المالية.");
        process.exit(1); // إخبار الخادم بالفشل في حال وجود خطأ حقيقي
    }
    console.log("====================================================================");
}

runVestingSimulation();
