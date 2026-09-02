/**
 * SovereignClearingGuard.js
 * Enforces Supported Integration Verification and Sandbox-Based Identity Mapping.
 * No claims of official Pi Network KYC access or UNICEF funding are made.
 * 
 * تم التحديث: منع ترحيل حصة الجمهور (10%) حتى نجاح الإطلاق
 */

const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');
const YER_TOKENOMICS = require('./YERTokenomicsCanonical');

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
     * @param {string} purpose - الغرض من العملية (مثال: "community_distribution", "ecosystem_mining")
     */
    verifyBeneficiary(entityId, integrationStatus, claimNonce, purpose = 'generic') {
        // التحقق من حالة التكامل المدعومة
        if (!entityId || !integrationStatus || !integrationStatus.startsWith('SUPPORTED_')) {
            console.error(`[Guard Alert] Entity ${entityId} rejected: Integration status is not supported or incomplete.`);
            return { approved: false, reason: 'Unsupported_Integration_Status' };
        }

        // منع الاحتيال والتكرار
        if (AntiDoubleDippingEngine.isLocked(entityId, claimNonce)) {
            return { approved: false, reason: 'Concurrent_Payout_Attempt_Detected' };
        }

        // ✅ الشرط الجديد: منع ترحيل حصة الجمهور قبل الإطلاق
        if (purpose === 'community_distribution') {
            if (!YER_TOKENOMICS.canReleaseCommunityAllocation()) {
                console.error(`[Guard Alert] Community distribution blocked: Launchpad not deployed yet.`);
                return {
                    approved: false,
                    reason: 'COMMUNITY_ALLOCATION_BLOCKED',
                    message: '🚫 ترحيل YER إلى محافظ الجمهور مؤقت حتى اكتمال إطلاق رمز YER على منصة Pi Launchpad ومجمع السيولة Pi/YER.'
                };
            }
        }

        // تسجيل الكيان كمدعوم
        this.verifiedEntities.add(entityId);
        
        return {
            approved: true,
            scope: purpose === 'community_distribution' ? 'Community_Release_Approved' : 'Ecosystem_Mining_Approved'
        };
    }

    /**
     * التحقق من صلاحية عملية تعدين للنظام البيئي (30%)
     * متاحة دائماً بغض النظر عن حالة الإطلاق
     */
    verifyEcosystemMining(entityId, integrationStatus, claimNonce) {
        return this.verifyBeneficiary(entityId, integrationStatus, claimNonce, 'ecosystem_mining');
    }

    /**
     * التحقق من صلاحية ترحيل حصة الجمهور (10%)
     * محظورة حتى نجاح الإطلاق
     */
    verifyCommunityDistribution(entityId, integrationStatus, claimNonce) {
        return this.verifyBeneficiary(entityId, integrationStatus, claimNonce, 'community_distribution');
    }
}

module.exports = new SovereignClearingGuard();