/**
 * AJYAL Smart Aid & Civil Payroll Engine
 * Optimized for humanitarian distribution with Zero Floating-Point Precision
 */

class AjyalSmartAidEngine {
    constructor(exchangeRateYERtoPi) {
        // السعر مخزن كرقم صحيح لضمان الحسابات الصفرية الصارمة
        this.exchangeRate = BigInt(exchangeRateYERtoPi); 
        this.activeDistributionLocks = new Map();
    }

    /**
     * معالجة صرف الرواتب أو المساعدات بأمان كامل
     */
    async processSovereignPayroll(beneficiaryId, amountInYER) {
        const amount = BigInt(amountInYER);
        
        // 1. حماية فورية ضد التكرار والصرف المزدوج للمستفيد في نفس الوقت
        if (this.activeDistributionLocks.get(beneficiaryId)) {
            throw new Error(`SECURITY ALERT: Concurrent payout blocked for beneficiary ${beneficiaryId}`);
        }
        this.activeDistributionLocks.set(beneficiaryId, true);

        try {
            // 2. حساب قيمة التوزيع الثنائي الفوري: 50% عملة محلية و 50% عملة مشفرة
            const localYERTender = amount / 2n;
            const cryptoPiTender = amount / 2n;

            // 3. تحويل حصة Pi إلى نظام الوحدات الصغير (Stroops) دون كسور
            // 1 Pi = 10,000,000 Stroops
            const piStroopsUnit = 10000000n;
            const totalPiStroopsPayload = (cryptoPiTender * piStroopsUnit) / this.exchangeRate;

            return {
                status: "APPROVED",
                timestamp: new Date().toISOString(),
                beneficiary: beneficiaryId,
                distribution: {
                    yer_sub_units: localYERTender.toString(),
                    pi_stroops_payload: totalPiStroopsPayload.toString()
                }
            };
        } finally {
            // فك قفل المعاملة بأمان فور الانتهاء
            this.activeDistributionLocks.delete(beneficiaryId);
        }
    }
}

module.exports = AjyalSmartAidEngine;
