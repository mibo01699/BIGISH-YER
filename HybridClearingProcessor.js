// HybridClearingProcessor.js - النسخة المُحدثة المرنة

class HybridClearingProcessor {
    /**
     * معالجة المقاصة الهجينة بنسب مرنة وتوافقية
     * @param {BigInt} totalBidInYCOIN - القيمة الإجمالية للعطاء بالوحدات الصغرى للعملة الاستقرارية
     * @param {BigInt} gcvPiRateInYCOIN - سعر عملة Pi بناءً على قيمة الـ GCV مقومة بالعملة المحلية
     * @param {number} piRatioPercentage - النسبة المئوية المخصصة للدفع بـ Pi (مثلاً: 30، 50، 70، أو 100)
     */
    static processFlexibleClearing(totalBidInYCOIN, gcvPiRateInYCOIN, piRatioPercentage) {
        // 1. التحقق من صحة النسبة المدخلة (بين 0% و 100%)
        if (piRatioPercentage < 0 || piRatioPercentage > 100) {
            throw new Error("Invalid Pi ratio percentage. Must be between 0 and 100.");
        }

        const BigIntPercentage = BigInt(piRatioPercentage);
        const BigIntOneHundred = 100n;

        // 2. حساب حصة عملة Pi ديناميكياً بناءً على النسبة التوافقية
        const yerShareInYCOIN = (totalBidInYCOIN * (BigIntOneHundred - BigIntPercentage)) / BigIntOneHundred;
        const piShareInYCOIN = totalBidInYCOIN - yerShareInYCOIN; // تفادي أي كسور متبقية

        // 3. تحويل حصة الـ Pi إلى وحدات صغرى (Stroops) بناءً على سعر GCV المتوافق عليه
        // يتم الضرب في 10^7 (دقة Pi) والقسمة على سعر الـ GCV الثابت لمنع الكسور العائمة
        const piPrecisionMultiplier = 10000000n; // 10^7
        let requiredPiInStroops = 0n;

        if (piShareInYCOIN > 0n && gcvPiRateInYCOIN > 0n) {
            requiredPiInStroops = (piShareInYCOIN * piPrecisionMultiplier) / gcvPiRateInYCOIN;
        }

        return {
            allocatedPiPercentage: piRatioPercentage,
            allocatedYerPercentage: 100 - piRatioPercentage,
            yerLedgerRequirement: yerShareInYCOIN,         // المبلغ المطلوب تسويته محلياً بالعملة المستقرة
            piLedgerRequirementStroops: requiredPiInStroops // المبلغ المطلوب تسويته على بلوكشين Pi (Stroops)
        };
    }
}

module.exports = HybridClearingProcessor;
