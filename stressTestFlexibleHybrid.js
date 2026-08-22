/**
 * @file stressTestFlexibleHybrid.js
 * @description اختبار ضغط ومقاصة برمجية مكثف للتحقق من ثبات محرك الدفع الهجين ومنع تسرب أو ضياع الكسور الحسابية العائمة.
 */

const DynamicRatioValidator = require('./DynamicRatioValidator');
const validator = new DynamicRatioValidator();

function runMacroStressTest() {
    console.log("=========================================================================");
    console.log("🚀 جاري بدء اختبار الضغط والمقاصة البرمجية لـ محرك الدفع الهجين المحدث لـ BIGISH-YER");
    console.log("=========================================================================");

    const TOTAL_ITERATIONS = 1000000; // محاكاة مليون عملية دفع هجين متزامنة ونسب عشوائية
    let successfulClearingCount = 0;
    let failedClearingCount = 0;
    
    // رصد البداية الزمنية للاختبار
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_ITERATIONS; i++) {
        // توليد مبالغ فواتير عشوائية معقدة لاختبار دقة كسر الأرقام
        const simulatedInvoiceBase = BigInt(Math.floor(Math.random() * 500000) + 137);
        
        // توليد نسب دفع هجينة عشوائية وديناميكية من اختيار المستخدمين
        const piRatio = Math.floor(Math.random() * 101); // نسبة بين 0 و 100
        const yerRatio = 100 - piRatio;                 // المتبقي لـ YER لضمان الإجمالي 100%

        try {
            // معالجة واختبار الفاتورة عبر محرك المقاصة الصارم المصمم للأنظمة السيادية
            const result = validator.validateAndSplit(simulatedInvoiceBase, piRatio, yerRatio);
            
            // مراجعة عكسية داخلية رياضية للتأكد من أن المجموع الموزع يطابق الفاتورة الأصلية بدقة 100%
            const reconstructedPiBase = BigInt(result.piPaymentStroops) / 10000000n;
            const reconstructedYerBase = BigInt(result.yerPaymentSubUnits) / 10000000000n;
            
            if (reconstructedPiBase + reconstructedYerBase === simulatedInvoiceBase) {
                successfulClearingCount++;
            } else {
                // في حال حدوث أي خطأ ناتج عن تقريب الخانات العائمة (Zero Floating-Point Constraint Violation)
                failedClearingCount++;
            }
        } catch (error) {
            failedClearingCount++;
        }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log("\n📊 نتائج اختبار المحاكاة والضغط المالي الكلي:");
    console.log(`- إجمالي المدفوعات الهجينة المختبرة: ${TOTAL_ITERATIONS.toLocaleString()} عملية دفع ديناميكية.`);
    console.log(`- العمليات الناجحة (مطابقة صفرية الأخطاء للمجموع): \x1b[32m${successfulClearingCount.toLocaleString()}\x1b[0m`);
    console.log(`- العمليات الفاشلة أو المسربة للكسور: \x1b[31m${failedClearingCount}\x1b[0m`);
    console.log(`- الزمن المستغرق لإتمام المحاكاة والتسوية: ${duration} ثانية.`);
    console.log("=========================================================================");
    
    if (failedClearingCount === 0) {
        console.log("\x1b[32m✔ نجاح باهر: محرك الدفع الهجين المرن مستقر ومقاوم تماماً للأخطاء الحسابية الحجمية وجاهز للنشر السيادي!\x1b[0m");
    } else {
        console.log("\x1b[31m❌ تحذير: تم رصد عدم تطابق في الحسابات الحجمية، يرجى مراجعة قيود معالجة الفائض (Dust Buffer).\x1b[0m");
    }
    console.log("=========================================================================");
}

// تنفيذ اختبار المحاكاة الشامل فوراً
runMacroStressTest();
