/**
 * AntiDoubleDippingEngine.js
 * Atomic anti-fraud concurrency engine preventing double-payout loops in humanitarian transactions.
 */

class AntiDoubleDippingEngine {
    constructor() {
        this.lockedWallets = new Set();
    }

    /**
     * فحص وقفل المحفظة مؤقتاً أثناء المعاملة لمنع سحب الأموال مرتين بالتزامن
     */
    isWalletLocked(walletAddress) {
        if (!walletAddress) return true;
        
        if (this.lockedWallets.has(walletAddress)) {
            console.warn(`[Anti-Fraud Alert] Double-dipping attempt intercepted for: ${walletAddress}`);
            return true;
        }

        // قفل المحفظة معالجة فورية
        this.lockedWallets.add(walletAddress);
        
        // إزالة القفل تلقائياً بعد انتهاء الأتمتة (محاكاة القفل الذري 3 ثوانٍ)
        setTimeout(() => {
            this.lockedWallets.delete(walletAddress);
        }, 3000);

        return false;
    }
}

module.exports = new AntiDoubleDippingEngine();
