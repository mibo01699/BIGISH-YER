// tests/smartContract.test.js
/**
 * BIGISH-YER: Smart Contract Unit Tests & Liquidity Pool Assertions
 * Aligned with Pi Network v2.0 DEX Guidelines & Security Frameworks
 */

const chai = require('chai');
const { expect } = chai;

// محاكاة سريعة لهيكل العقد الذكي لـ Solidity (YERSettlementPool) بغرض الفحص السريع داخل بيئة Node CI
class MockYERSettlementPool {
    constructor(tokenAddress) {
        this.tokenAddress = tokenAddress;
        this.processedPiPayments = new Set();
        this.totalLiquidityInPool = 1000000; // رصيد مبدئي في المجمع لمحاكاة الـ 30% سيولة
    }

    // محاكاة دالة تنفيذ تسوية المقاصة التبادلية على البلوكشين (executeOnChainClearing)
    async executeOnChainClearing(piPaymentId, merchantWallet, amountYER) {
        if (!merchantWallet) throw new Error("Clearing Failed: Invalid receiver address.");
        if (amountYER <= 0) throw new Error("Clearing Failed: Volume must be positive.");
        
        // جدار الحماية ضد التكرار لمنع الإنفاق المزدوج
        if (this.processedPiPayments.has(piPaymentId)) {
            throw new Error("Security Alert: Duplicate settlement attempt blocked.");
        }

        if (this.totalLiquidityInPool < amountYER) {
            throw new Error("Liquidity Failure: Insufficient reserve in clearing vault.");
        }

        // إتمام التسوية بنجاح وتثبيتها في سجلات البلوكشين لمنع ثغرات إعادة الدخول
        this.processedPiPayments.add(piPaymentId);
        this.totalLiquidityInPool -= amountYER;

        return {
            status: "SUCCESS_ON_CHAIN",
            remainingLiquidity: this.totalLiquidityInPool
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
     * الاختبار الأول: التحقق من نجاح تسوية المقاصة ونقل رصيد YER لمحفظة التاجر (GAV POS)
     */
    it('1. Should successfully execute on-chain clearance for valid unique Pi payments', async () => {
        const mockPaymentId = "pay_blockchain_valid_9988";
        const merchantWallet = "0xMerchantGAVTerminalSanaa";
        const amountYER = 50000; // 50,000 YER

        const result = await settlementPool.executeOnChainClearing(mockPaymentId, merchantWallet, amountYER);
        
        expect(result.status).to.equal("SUCCESS_ON_CHAIN");
        expect(result.remainingLiquidity).to.equal(950000); // تأكيد خصم المبلغ بدقة من مجمع المقاصة
    });

    /**
     * الاختبار الثاني: التحقق من قوة جدار الحماية ضد التكرار (Anti-Double Dipping) وحظر محاولات الاختراق
     */
    it('2. Should strictly REJECT duplicate Pi Payment IDs on the contract level', async () => {
        const duplicatePaymentId = "pay_blockchain_exploit_attempt";
        const merchantWallet = "0xMerchantGAVTerminalAden";
        const amountYER = 10000;

        // تنفيذ عملية المقاصة للمرة الأولى بنجاح
        await settlementPool.executeOnChainClearing(duplicatePaymentId, merchantWallet, amountYER);

        // محاولة إعادة إرسال نفس الطلب ومعرف الدفع للمرة الثانية لتكرار سحب العملات
        try {
            await settlementPool.executeOnChainClearing(duplicatePaymentId, merchantWallet, amountYER);
            // إذا مر الطلب دون إطلاق خطأ، يفشل الاختبار تلقائياً
            expect.fail("The contract allowed a double dipping security breach.");
        } catch (error) {
            // التوقع البرمجي الصارم: يجب إطلاق استثناء أمني يطابق جدار الحماية في Solidity
            expect(error.message).to.include("Duplicate settlement attempt blocked.");
        }
    });

    /**
     * الاختبار الثالث: منع إتمام التسوية في حال عجز السيولة الاحتياطية في العقد الذكي
     */
    it('3. Should block transaction if request exceeds the pool reserve limits', async () => {
        const mockPaymentId = "pay_excessive_volume_01";
        const merchantWallet = "0xMerchantGAVTerminalTaiz";
        const hugeAmountYER = 2000000; // طلب 2 مليون بينما الاحتياطي المتوفر 1 مليون فقط

        try {
            await settlementPool.executeOnChainClearing(mockPaymentId, merchantWallet, hugeAmountYER);
            expect.fail("The contract processed an overdraft transfer.");
        } catch (error) {
            // التوقع البرمجي الصارم: حظر المعاملة فوراً بسبب عجز السيولة
            expect(error.message).to.include("Insufficient reserve in clearing vault.");
        }
    });
});
