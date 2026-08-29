// tests/smartContract.test.js
/**
 * BIGISH-YER: Smart Contract Unit Tests & Liquidity Pool Assertions
 * NOTE: Sandbox/Testnet validation only. No claims of official Pi Network integration.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

// محاكاة سريعة لهيكل العقد الذكي لـ Solidity (YERSettlementPool) بغرض الفحص السريع داخل بيئة Node CI
class MockYERSettlementPool {
    constructor(tokenAddress) {
        this.tokenAddress = tokenAddress;
        this.processedPiPayments = new Set();
        // تحويل المبالغ إلى BigInt (باستخدام نص)
        this.totalLiquidityInPool = 1000000n; // رصيد مبدئي (1 مليون وحدة صغرى)
    }

    // محاكاة دالة تنفيذ تسوية المقاصة التبادلية على البلوكشين
    async executeOnChainClearing(piPaymentId, merchantWallet, amountYER) {
        if (!merchantWallet) throw new Error("Clearing Failed: Invalid receiver address.");
        
        // تحويل المدخل إلى BigInt (إذا كان نصاً)
        const amountBig = BigInt(amountYER);
        if (amountBig <= 0n) throw new Error("Clearing Failed: Volume must be positive.");
        
        // جدار الحماية ضد التكرار
        if (this.processedPiPayments.has(piPaymentId)) {
            throw new Error("Security Alert: Duplicate settlement attempt blocked.");
        }

        if (this.totalLiquidityInPool < amountBig) {
            throw new Error("Liquidity Failure: Insufficient reserve in clearing vault.");
        }

        // إتمام التسوية
        this.processedPiPayments.add(piPaymentId);
        this.totalLiquidityInPool -= amountBig;

        return {
            status: "SUCCESS_ON_CHAIN",
            remainingLiquidity: this.totalLiquidityInPool.toString()
        };
    }
}

describe('📜 BIGISH-YER: On-Chain Liquidity & Pool Contract Assertions', () => {
    let settlementPool;

    beforeEach(() => {
        // تهيئة المجمع الوهمي قبل كل اختبار
        settlementPool = new MockYERSettlementPool("0xYERTokenBlockchainAddress12345");
    });

    /**
     * الاختبار الأول: التحقق من نجاح تسوية المقاصة ونقل رصيد YER لمحفظة التاجر
     */
    test('1. Should successfully execute on-chain clearance for valid unique Pi payments', async () => {
        const mockPaymentId = "pay_blockchain_valid_9988";
        const merchantWallet = "0xMerchantGAVTerminalSanaa";
        const amountYER = "50000"; // كنص لضمان دقة BigInt

        const result = await settlementPool.executeOnChainClearing(mockPaymentId, merchantWallet, amountYER);
        
        assert.strictEqual(result.status, "SUCCESS_ON_CHAIN");
        // 1,000,000 - 50,000 = 950,000
        assert.strictEqual(result.remainingLiquidity, "950000");
    });

    /**
     * الاختبار الثاني: التحقق من قوة جدار الحماية ضد التكرار
     */
    test('2. Should strictly REJECT duplicate Pi Payment IDs on the contract level', async () => {
        const duplicatePaymentId = "pay_blockchain_exploit_attempt";
        const merchantWallet = "0xMerchantGAVTerminalAden";
        const amountYER = "10000";

        // تنفيذ العملية الأولى بنجاح
        await settlementPool.executeOnChainClearing(duplicatePaymentId, merchantWallet, amountYER);

        // محاولة تكرار نفس العملية
        await assert.rejects(
            () => settlementPool.executeOnChainClearing(duplicatePaymentId, merchantWallet, amountYER),
            /Duplicate settlement attempt blocked./
        );
    });

    /**
     * الاختبار الثالث: منع إتمام التسوية في حال عجز السيولة الاحتياطية
     */
    test('3. Should block transaction if request exceeds the pool reserve limits', async () => {
        const mockPaymentId = "pay_excessive_volume_01";
        const merchantWallet = "0xMerchantGAVTerminalTaiz";
        const hugeAmountYER = "2000000"; // 2 مليون (أكبر من 1 مليون)

        await assert.rejects(
            () => settlementPool.executeOnChainClearing(mockPaymentId, merchantWallet, hugeAmountYER),
            /Insufficient reserve in clearing vault./
        );
    });
});