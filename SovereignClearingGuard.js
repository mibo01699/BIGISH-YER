/**
 * SovereignClearingGuard.js
 * Enforces UNICEF Anti-Fraud Standards and Pi Network Official KYC Sandbox Mapping.
 */

const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');

class SovereignClearingGuard {
    constructor() {
        this.verifiedWallets = new Set();
    }

    /**
     * المصادقة على الهوية الرقمية للمستفيد عبر المحفظة الرسمية لشبكة باي
     */
    async verifyBeneficiary(piWalletAddress, piKycStatus) {
        // شرط اليونيسف: الشفافية الكاملة والتحقق من الاستحقاق
        if (!piWalletAddress || piKycStatus !== 'APPROVED') {
            console.error(`[Guard Alert] Wallet ${piWalletAddress} rejected. Failed Pi KYC validation.`);
            return { approved: false, reason: 'Incomplete_Pi_KYC' };
        }

        // منع الاحتيال والتكرار (Anti-Double Dipping Lock)
        const isLocked = AntiDoubleDippingEngine.isWalletLocked ? AntiDoubleDippingEngine.isWalletLocked(piWalletAddress) : false;
        if (isLocked) {
            return { approved: false, reason: 'Concurrent_Payout_Attempt_Detected' };
        }

        this.verifiedWallets.add(piWalletAddress);
        return { approved: true, scope: 'Humanitarian_Aid_Eligible' };
    }
}

module.exports = new SovereignClearingGuard();
