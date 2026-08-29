/**
 * @file DynamicRatioValidator.js
 * @description محرك التحقق والديناميكية للنسب الهجينة لمدفوعات Pi و YER لمنع الكسور العائمة وضمان دقة النظام المالي.
 * @version 2.0.0
 * @note متوافق تماماً مع 300M YER Tokenomics (30M/90M/180M)
 */

const YER_TOKENOMICS = require('./YERTokenomicsCanonical'); // المصدر المركزي

class DynamicRatioValidator {
    constructor() {
        // تحديد المقاييس العشرية الصارمة المعتمدة في النظام البيئي لـ BIGISH-YER
        this.PI_SCALE = 10000000n;        // دقة 7 خانات عشرية لشبكة Pi (Stroops)
        this.YER_SCALE = 10000000000n;    // دقة 10 خانات عشرية لعملة YER السيادية
        this.PERCENT_BASE = 100n;         // الأساس المئوي للحسابات
    }

    /**
     * التحقق من صحة النسب المقترحة من قبل المستخدم وتوزيع مبالغ الدفع بدقة متناهية
     * @param {bigint} totalInvoiceBase القيمة الأساسية للفاتورة بالوحدة الصغرى للمقاصة
     * @param {number} piPercentage النسبة المئوية المحددة لعملة Pi (مثال: 40)
     * @param {number} yerPercentage النسبة المئوية المحددة لعملة YER (مثال: 60)
     * @returns {Object} مبالغ الدفع الصافية لكل عملة بالوحدات الدقيقة مع معالجة الفائض
     */
    validateAndSplit(totalInvoiceBase, piPercentage, yerPercentage) {
        // [حماية 1] منع القيم الصفرية أو السالبة للفاتورة (منع القسمة على صفر المنطقية)
        if (totalInvoiceBase <= 0n) {
            throw new Error("خطأ في معالجة المدفوعات الهجينة: يجب أن تكون قيمة الفاتورة أكبر من صفر.");
        }

        const piPctBig = BigInt(piPercentage);
        const yerPctBig = BigInt(yerPercentage);

        // [حماية 2] منع النسب السالبة
        if (piPctBig < 0n || yerPctBig < 0n) {
            throw new Error("خطأ في معالجة المدفوعات الهجينة: لا يمكن أن تكون النسب سالبة.");
        }

        // الشرط الصارم الأول: يجب أن يكون مجموع النسب يساوي 100% تماماً
        if (piPctBig + yerPctBig !== this.PERCENT_BASE) {
            throw new Error("خطأ في معالجة المدفوعات الهجينة: يجب أن يكون إجمالي نسب الدفع مساوياً لـ 100% تماماً.");
        }

        // حساب الحصص الأساسية باستخدام الحسابات غير العائمة الصارمة (Strict BigInt Arithmetic)
        let piShareRaw = (totalInvoiceBase * piPctBig) / this.PERCENT_BASE;
        let yerShareRaw = (totalInvoiceBase * yerPctBig) / this.PERCENT_BASE;

        // معالجة الفائض الحسابي الرياضي (Remainder Overflow Dust) لضمان عدم ضياع أي أجزاء من العملة
        const calculatedTotal = piShareRaw + yerShareRaw;
        if (calculatedTotal < totalInvoiceBase) {
            const remainderDust = totalInvoiceBase - calculatedTotal;
            // إضافة الفائض المتبقي إلى حصة العملة المحلية المستقرة YER لمنع العجز المالي
            yerShareRaw += remainderDust;
        }

        // تحجيم وتحويل الوحدات إلى مقاييس البلوكشين الخاصة بكل شبكة
        const finalPiStroops = piShareRaw * this.PI_SCALE;
        const finalYerSubUnits = yerShareRaw * this.YER_SCALE;

        return {
            piRatio: piPercentage,
            yerRatio: yerPercentage,
            piPaymentStroops: finalPiStroops.toString(), // تحويل إلى نص لمنع مشاكل معالجة الأرقام الكبيرة في JSON
            yerPaymentSubUnits: finalYerSubUnits.toString()
        };
    }

    /**
     * [إضافة إلزامية من التعليمات] التحقق من التوزيع الاقتصادي الكلي للمستودع
     * 10% + 30% + 60% = 100%
     * 30M + 90M + 180M = 300M
     * @returns {boolean} نجاح التحقق
     */
    verifyCanonicalDistribution() {
        const allocations = YER_TOKENOMICS.allocations;
        const percentages = YER_TOKENOMICS.allocationPercentages;

        // 1. التحقق من تطابق المبالغ الكلية
        const sumAllocations = allocations.communityPublicUtility + 
                               allocations.ecosystemLaunchLiquidity + 
                               allocations.aecSovereignReserve;

        if (sumAllocations !== YER_TOKENOMICS.maximumSupply) {
            throw new Error("فشل التحقق: مجموع التخصيصات (30M + 90M + 180M) لا يساوي 300M.");
        }

        // 2. التحقق من تطابق النسب المئوية
        const sumPercentages = percentages.communityPublicUtility + 
                               percentages.ecosystemLaunchLiquidity + 
                               percentages.aecSovereignReserve;

        if (sumPercentages !== 100) {
            throw new Error("فشل التحقق: مجموع النسب (10% + 30% + 60%) لا يساوي 100%.");
        }

        return true; // إذا وصلنا هنا، التوزيع سليم
    }
}

module.exports = DynamicRatioValidator;