/**
 * SovereignClearingGuard.js
 * Enforces Supported Integration Verification and Sandbox-Based Identity Mapping.
 * No claims of official Pi Network KYC access or UNICEF funding are made.
 */

const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');

class SovereignClearingGuard {
    constructor() {
        // لتتبع الحالات المدعومة (Supported Integration) - لا يخزن أي بيانات KYC حساسة
        this.verifiedEntities = new Set();
    }

    /**
     * التحقق من الأهلية من خلال حالة التكامل المدعومة (Supported Integration Status)
     * لا يقوم بالوصول الفعلي لبيانات Pi KYC، بل يعتمد على محول (Adapter) يدعم التحقق في بيئة الاختبار (Sandbox).
     * @param {string} entityId - المعرف الرقمي الموحد للجهة أو المستفيد
     * @param {string} integrationStatus - حالة التكامل (مثال: "SUPPORTED_SANDBOX", "SUPPORTED_TESTNET")
     * @param {string} claimNonce - رمز فريد لمنع إعادة الاستخدام
     */
    verifyBeneficiary(entityId, integrationStatus, claimNonce) {
        // التحقق من حالة التكامل المدعومة (وليس ادعاء الوصول الرسمي لبيانات KYC من Pi)
        if (!entityId || !integrationStatus || !integrationStatus.startsWith('SUPPORTED_')) {
            console.error(`[Guard Alert] Entity ${entityId} rejected: Integration status is not supported or incomplete.`);
            return { approved: false, reason: 'Unsupported_Integration_Status' };
        }

        // منع الاحتيال والتكرار باستخدام محرك الأمان الحالي
        // نتحقق إذا كان الكيان مقفلاً برمجياً مع nonce معين
        if (AntiDoubleDippingEngine.isLocked(entityId, claimNonce)) {
            return { approved: false, reason: 'Concurrent_Payout_Attempt_Detected' };
        }

        // تسجيل الكيان كمدعوم (Supported) وليس كـ KYC رسمي
        this.verifiedEntities.add(entityId);
        
        return { 
            approved: true, 
            scope: 'Community_Public_Utility_Eligible' 
        };
    }
}

module.exports = new SovereignClearingGuard();