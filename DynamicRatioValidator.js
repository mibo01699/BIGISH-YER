/**
 * @file DynamicRatioValidator.js
 * @description محرك التحقق والديناميكية للنسب الهجينة لمدفوعات Pi و YER لمنع الكسور العائمة وضمان دقة النظام المالي.
 */

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
        const piPctBig = BigInt(piPercentage);
        const yerPctBig = BigInt(yerPercentage);

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
}

module.exports = DynamicRatioValidator;
