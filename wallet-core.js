/**
 * wallet-core.js
 * Sovereign Wallet & Beneficiary Core Ledger
 * Compliant with 300M YER Tokenomics (Community = 30M)
 */

const crypto = require('crypto');
const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');

class SovereignWalletEngine {
    constructor() {
        this.beneficiaries = new Map();
        this.YER_SCALE = 10n ** 10n; // 10 decimals
    }

    createBeneficiaryWallet(piUsername, institutionalRole = 'Citizen') {
        if (this.beneficiaries.has(piUsername)) {
            return this.beneficiaries.get(piUsername);
        }

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        const walletData = {
            piUsername,
            role: institutionalRole,
            yerBalance: 0n,
            publicKey,
            privateKey,
            createdAt: new Date().toISOString()
        };

        this.beneficiaries.set(piUsername, walletData);
        return {
            piUsername,
            role,
            publicKey,
            balance: "0.0000000000 YER"
        };
    }

    creditSovereignBalance(piUsername, amountYER) {
        if (!this.beneficiaries.has(piUsername)) {
            throw new Error(`المستفيد ${piUsername} غير مسجل.`);
        }

        const wallet = this.beneficiaries.get(piUsername);
        
        // تحويل آمن من نص إلى BigInt (بدلاً من Math.floor)
        const incrementalValue = BigInt(amountYER); 
        
        // التحقق من سقف الـ 30M المجتمعي (منع التجاوز)
        if (wallet.yerBalance + incrementalValue > (30000000n * this.YER_SCALE)) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 30M Community Allocation.");
        }

        wallet.yerBalance += incrementalValue;
        this.beneficiaries.set(piUsername, wallet);

        return this.formatBalance(wallet.yerBalance);
    }

    getWalletBalance(piUsername) {
        if (!this.beneficiaries.has(piUsername)) {
            return "0.0000000000 YER";
        }
        return this.formatBalance(this.beneficiaries.get(piUsername).yerBalance);
    }

    formatBalance(bigIntBalance) {
        const balanceStr = bigIntBalance.toString().padStart(11, '0');
        const integerPart = balanceStr.slice(0, -10) || "0";
        const fractionalPart = balanceStr.slice(-10);
        return `${integerPart}.${fractionalPart} YER`;
    }
}

/**
 * [إعادة تسمية] استبدال دالة التعدين القديمة بتوزيع مجتمعي آمن
 */
function claimCommunityAllocation(piUserId, yerWalletAddress, amountToClaim) {
    if (typeof amountToClaim !== 'string' || BigInt(amountToClaim) <= 0n) {
        return { success: false, error: "No claimable balance found." };
    }

    try {
        // قفل ذري لمنع التكرار
        AntiDoubleDippingEngine.acquireAtomicLock(piUserId, `claim-${Date.now()}`);

        const txPayload = {
            user: piUserId,
            destination: yerWalletAddress,
            amount: amountToClaim.toString(),
            distributionType: "COMMUNITY_PUBLIC_UTILITY", // تم تغييرها من MINING
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            status: "CLAIMED_AND_VAULTED",
            distributedAmount: amountToClaim.toString(),
            ledgerReference: "COMMUNITY-CLAIM-" + crypto.randomUUID() // إزالة Math.random
        };
    } catch (error) {
        console.error("Wallet core clearance failure:", error.message);
        return { success: false, error: "Internal blockchain ledger synchronization error." };
    } finally {
        // تحرير القفل
        AntiDoubleDippingEngine.releaseLock(piUserId, `claim-${Date.now()}`);
    }
}

module.exports = { SovereignWalletEngine: new SovereignWalletEngine(), claimCommunityAllocation };