// tests/yerTransfer.test.js
/**
 * BIGISH-YER: Clearing & Settlement API Core Security Tests
 * NOTE: Sandbox/Testnet validation only. No claims of official Pi Network integration.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

// استيراد الوحدات الفعلية الموجودة في المستودع
const AntiDoubleDippingEngine = require('../AntiDoubleDippingEngine');
const PiPaymentProcessor = require('../backend/PiPaymentProcessor');
const YER_TOKENOMICS = require('../YERTokenomicsCanonical');

describe('🛡️ BIGISH-YER: Clearing & Settlement API Core Security Tests', () => {

    beforeEach(() => {
        // لا نقوم بأي تنظيف حقيقي هنا لأن محرك الأمان يُدار كـ Singleton،
        // لكننا نتأكد من أن جميع الاختبارات تعمل بسلاسة.
    });

    /**
     * الاختبار الأول: التحقق من نجاح عملية التحويل عبر محرك الدفع الحقيقي (BigInt)
     */
    test('1. Should SUCCESSFULLY process hybrid payment using PiPaymentProcessor', () => {
        // استخدام المبلغ كنص (String) لضمان الدقة
        const result = PiPaymentProcessor.processHybridInvoice("1500", "2");
        
        // التحقق من النتائج
        assert.ok(result, "Expected a result from processHybridInvoice");
        assert.strictEqual(typeof result.yerSovereignUnits, 'string');
        assert.strictEqual(typeof result.piStroops, 'string');
        assert.ok(BigInt(result.yerSovereignUnits) > 0n, "YER share should be positive");
        assert.ok(BigInt(result.piStroops) > 0n, "Pi Stroops should be positive");
    });

    /**
     * الاختبار الثاني: منع تكرار المطالبات (Anti-Double Dipping) عبر محرك الأمان الحقيقي
     */
    test('2. Should BLOCK duplicate settlement attempts with same nonce (Anti-Double Dipping)', () => {
        const entityId = "buyer_123";
        const claimNonce = "pay_already_spent_999";

        // القفل الأول يجب أن ينجح
        const firstLock = AntiDoubleDippingEngine.acquireAtomicLock(entityId, claimNonce);
        assert.strictEqual(firstLock, true);

        // المحاولة الثانية لنفس الـ nonce يجب أن ترفض
        assert.throws(() => {
            AntiDoubleDippingEngine.acquireAtomicLock(entityId, claimNonce);
        }, /REPLAY_PROTECTION/);

        // تحرير القفل لتنظيف الحالة
        AntiDoubleDippingEngine.releaseLock(entityId, claimNonce);
    });

    /**
     * الاختبار الثالث: التحقق من سقف المعروض والتوزيع الإلزامي (300M / 30M / 90M / 180M)
     */
    test('3. Should enforce maximum supply of 300M YER', () => {
        // التحقق من السقف
        assert.strictEqual(YER_TOKENOMICS.maximumSupply.toString(), "300000000");

        // التحقق من التوزيع الإلزامي
        assert.strictEqual(YER_TOKENOMICS.allocations.communityPublicUtility.toString(), "30000000");
        assert.strictEqual(YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity.toString(), "90000000");
        assert.strictEqual(YER_TOKENOMICS.allocations.aecSovereignReserve.toString(), "180000000");

        // التحقق من أن مجموع التوزيع يساوي السقف
        const totalAllocation = 
            YER_TOKENOMICS.allocations.communityPublicUtility +
            YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity +
            YER_TOKENOMICS.allocations.aecSovereignReserve;
        
        assert.strictEqual(totalAllocation.toString(), YER_TOKENOMICS.maximumSupply.toString());
    });
});