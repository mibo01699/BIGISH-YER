/**
 * AJYAL Smart Aid & Civil Payroll Engine
 * Optimized for humanitarian distribution with Zero Floating-Point Precision
 * NOTE: Operates in Sandbox/Testnet mode. Does not claim official Pi Network integration.
 */

const YER_TOKENOMICS = require('./YERTokenomicsCanonical'); // المصدر المركزي

class AjyalSmartAidEngine {
    constructor(exchangeRateYERtoPi) {
        // السعر مخزن كرقم صحيح لضمان الحسابات الصفرية الصارمة
        this.exchangeRate = BigInt(exchangeRateYERtoPi); 
        this.activeDistributionLocks = new Map();
        this.totalDistributed = 0n; // متغير لتتبع إجمالي الموزع (منع تجاوز السقف)
    }

    /**
     * معالجة صرف الرواتب أو المساعدات بأمان كامل
     * @param {string} beneficiaryId - هوية المستفيد
     * @param {string} amountInYER - المبلغ بالـ YER (كنص لضمان الدقة)
     */
    async processSovereignPayroll(beneficiaryId, amountInYER) {
        const amount = BigInt(amountInYER);
        
        // [إضافة] التحقق من أن المبلغ أكبر من صفر
        if (amount <= 0n) {
            throw new Error("INVALID_AMOUNT: Amount must be greater than zero.");
        }

        // [إضافة] التحقق من عدم تجاوز الحد الأقصى للتوزيع (30M للمجتمع)
        // هنا نستخدم حد المجتمع (30M) لأن هذا المحرك مخصص للمساعدات والرواتب
        const communityCap = YER_TOKENOMICS.allocations.communityPublicUtility;
        if (this.totalDistributed + amount > communityCap) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 30M Community Allocation cap.");
        }

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

            // [إضافة] تحديث إجمالي الموزع
            this.totalDistributed += amount;

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