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
