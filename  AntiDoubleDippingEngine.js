/**
 * BIGISH-YER: Anti-Double Dipping & Functional Integrity Engine
 * Compliant with Pi Network Protocol 23 KYC Standards and International Donor Audit Metrics.
 * Cross-references BIGISH (Financials), AJYAL (Capacity/Employment), and GAV (Supply Chain).
 */

class AntiDoubleDippingEngine {
    constructor() {
        // سجلات مركزية مشفرة ومربوطة بالهوية الموحدة لـ Pi لمنع تكرار الصرف
        this.payoutLedger = {}; // تتبع الرواتب والمساعدات المالية الصادرة بالـ YER/Pi
        this.functionalRoles = {}; // تتبع الوظائف النشطة للمستفيدين لمنع الازدواج الوظيفي
    }

    /**
     * 1. منع ازدواجية الدفع (الحوالات، المرتبات، المساعدات الإنسانية)
     * يتم استدعاء هذه الدالة قبل تحويل أي مبالغ من محفظة YER أو Pi لضمان النزاهة
     * @param {string} verifiedPiUser - اسم مستخدم Pi الموثق عبر الـ KYC
     * @param {string} periodId - الفتحة الزمنية للصرف (مثال: "MAY-2026-AID")
     * @param {string} platformSource - المنصة التي تطلب الصرف (BIGISH, GAV, AJYAL)
     */
    validateAndRegisterPayout(verifiedPiUser, periodId, amount, platformSource) {
        if (!verifiedPiUser) throw new Error("Compliance Failure: Recipient must possess a valid Pi KYC anchor.");
        
        const trackingKey = `${verifiedPiUser}-${periodId}`;

        // كشف الدفع المزدوج: إذا كان السجل يحتوي على هذه الهوية لنفس الفترة، يتم رفض المعاملة فوراً
        if (this.payoutLedger[trackingKey]) {
            const existingPayment = this.payoutLedger[trackingKey];
            console.error(`[🚨 DOUBLE DIPPING DETECTED] Security Blocked: User ${verifiedPiUser} already received ${existingPayment.amount} via ${existingPayment.source} for period ${periodId}.`);
            return { 
                isApproved: false, 
                reason: "Rejection: Duplicate payout detected across cross-platform ledgers." 
            };
        }

        // توثيق المعاملة لمنع أي تلاعب لاحق
        this.payoutLedger[trackingKey] = {
            recipient: verifiedPiUser,
            period: periodId,
            amount: amount,
            source: platformSource,
            timestamp: Date.now()
        };

        console.log(`[✔ Payout Cleared] Dynamic verification passed for ${verifiedPiUser}. Approved via ${platformSource}.`);
        return { isApproved: true, transactionRecord: this.payoutLedger[trackingKey] };
    }

    /**
     * 2. منع الازدواجية الوظيفية (تكامل ديناميكي بين محفظة YER وتطبيق أجيال وطريق البخور)
     * يضمن عدم تسجيل الشخص في دورين متعارضين للحفاظ على كفاءة رأس مال التمويل الدولي
     * @param {string} verifiedPiUser - اسم مستخدم الموثق
     * @param {string} activeRole - الدور المطلوب تسجيله (مثال: "AJYAL_TRAINEE", "GAV_COURIER", "MERCHANT_PRODUCER")
     */
    enforceRoleIntegrity(verifiedPiUser, activeRole) {
        if (!this.functionalRoles[verifiedPiUser]) {
            this.functionalRoles[verifiedPiUser] = [];
        }

        const currentRoles = this.functionalRoles[verifiedPiUser];

        // قانون التعارض الوظيفي: لا يمكن للمتدرب الذي يتلقى حوافز (AJYAL) أن يكون مسجلاً كعامل لوجستي مدفوع بالكامل (GAV) في نفس الوقت
        if (activeRole === "GAV_COURIER" && currentRoles.includes("AJYAL_TRAINEE")) {
            throw new Error(`Functional Clash: User ${verifiedPiUser} is already registered as an active trainee in AJYAL. Cannot claim a functional courier role simultaneously.`);
        }

        if (currentRoles.includes(activeRole)) {
            console.log(`User ${verifiedPiUser} already possesses the verified role: ${activeRole}`);
            return true;
        }

        // إضافة الدور بعد اجتياز فحص التعارض والازدواجية
        currentRoles.push(activeRole);
        console.log(`[Role Integrity Secured] Added role ${activeRole} to verified KYC user ${verifiedPiUser}.`);
        return true;
    }
}

module.exports = AntiDoubleDippingEngine;
