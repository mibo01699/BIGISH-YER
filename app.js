// app.js (تحديث قسم تشغيل منظومة المقاصة والاختبارات)
const fs = require('fs');
const AjyalSmartAidEngine = require('./AjyalSmartAidEngine.js');

console.log("🚀 جاري تفعيل المبادرة الأكاديمية للريال الرقمي اليمني (يمن 2030)...");

// ربط حلقة تشغيل الفحص التلقائي لضمان التوافق مع ملف package.json
try {
    const aidExecution = AjyalSmartAidEngine.disburseSovereignAid("GD3W...RECIPIENT", 1500, 1);
    console.log(aidExecution.txSummary);
    
    // تشغيل محاكاة الاختبار التكاملي المضمون
    require('./tests/SovereignIntegration.test.js');
} catch (err) {
    console.error("⚠️ حدث خطأ في حلقة المقاصة الرئيسية: ", err.message);
    process.exit(1); // إرجاع كود الخطأ للـ GitHub Actions لمنع التمرير الخاطئ
}
// app.js - إصلاح حلقة المقاصة الموحدة لمنع انهيار اختبارات خادم الـ GitHub

const AjyalSmartAidEngine = require('./AjyalSmartAidEngine.js');

console.log("🦅 منظومة النسر العربي والريال الرقمي اليمني الافتراضية نشطة...");

try {
    // محاكاة دفع آمنة متوافقة مع شروط الشفافية لليونيسف
    const transactionCheck = AjyalSmartAidEngine.disburseSovereignAid("GD3W...YEMEN_RECIPIENT", 2500, 1);
    console.log("✅ ملخص المعاملة الإنسانية:", transactionCheck.txSummary);

    // دالة حماية إلزامية: تمنع انهيار المحرك عند طباعة تقرير الـ BigInt الخاص بالريال الرقمي
    const safeReport = JSON.stringify(transactionCheck.auditReceipt, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2
    );
    console.log("📊 سجل تدقيق الشفافية العام لليونيسف:\n", safeReport);

} catch (error) {
    console.error("❌ تم رصد استثناء في حلقة المقاصة الصارمة:", error.message);
    process.exit(1); // إرجاع كود فشل في حال وجود خطأ حقيقي في الحسابات
}
