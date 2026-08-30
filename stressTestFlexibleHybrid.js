/**
 * @file stressTestFlexibleHybrid.js
 * @description اختبار ضغط ومقاصة برمجية مكثف للتحقق من ثبات محرك الدفع الهجين ومنع تسرب أو ضياع الكسور الحسابية العائمة.
 * NOTE: Sandbox/Testnet validation only. No claims of official Pi Network integration.
 */

const DynamicRatioValidator = require('./DynamicRatioValidator');
const validator = new DynamicRatioValidator();

function runMacroStressTest() {
    console.log("=========================================================================");
    console.log("🚀 جاري بدء اختبار الضغط والمقاصة البرمجية لمحرك الدفع الهجين لـ BIGISH-YER (Sandbox)");
    console.log("=========================================================================");

    const TOTAL_ITERATIONS = 1000000; // محاكاة مليون عملية دفع هجين
    let successfulClearingCount = 0;
    let failedClearingCount = 0;
    
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_ITERATIONS; i++) {
        // توليد مبالغ فواتير عشوائية (أعداد صحيحة فقط)
        const simulatedInvoiceBase = BigInt(Math.floor(Math.random() * 500000) + 137);
        
        // توليد نسب دفع هجينة عشوائية
        const piRatio = Math.floor(Math.random() * 101); // 0 إلى 100
        const yerRatio = 100 - piRatio;

        try {
            const result = validator.validateAndSplit(simulatedInvoiceBase, piRatio, yerRatio);
            
            // إعادة بناء المبالغ للتأكد من دقة المجموع
            const reconstructedPiBase = BigInt(result.piPaymentStroops) / 10000000n;
            const reconstructedYerBase = BigInt(result.yerPaymentSubUnits) / 10000000000n;
            
            if (reconstructedPiBase + reconstructedYerBase === simulatedInvoiceBase) {
                successfulClearingCount++;
            } else {
                failedClearingCount++;
            }
        } catch (error) {
            failedClearingCount++;
        }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log("\n📊 نتائج اختبار المحاكاة والضغط المالي الكلي:");
    console.log(`- إجمالي المدفوعات الهجينة المختبرة: ${TOTAL_ITERATIONS.toLocaleString()} عملية دفع.`);
    console.log(`- العمليات الناجحة (مطابقة صفرية الأخطاء): \x1b[32m${successfulClearingCount.toLocaleString()}\x1b[0m`);
    console.log(`- العمليات الفاشلة أو المسربة للكسور: \x1b[31m${failedClearingCount}\x1b[0m`);
    console.log(`- الزمن المستغرق لإتمام المحاكاة: ${duration} ثانية.`);
    console.log("=========================================================================");
    
    if (failedClearingCount === 0) {
        console.log("\x1b[32m✔ نجاح: محرك الدفع الهجين المرن مستقر ومقاوم تماماً للأخطاء الحسابية!\x1b[0m");
    } else {
        console.log("\x1b[31m❌ تحذير: تم رصد عدم تطابق في الحسابات، يرجى مراجعة قيود معالجة الفائض.\x1b[0m");
    }
    console.log("=========================================================================");
}

runMacroStressTest();