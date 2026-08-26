/**
 * BIGISH-YER Ecosystem - Comprehensive Security & Integrity Jest Test Suite
 * Validating Zero Floating-Point Constraints & Payout Locking Concurrency.
 */

const AjyalSmartAidEngine = require('./AjyalSmartAidEngine');
const PiIntegrationBridge = require('./pi-integration');

// محاكاة الاتصال الخارجي لـ Axios لمنع الفشل أثناء فحص الـ CI/CD المستقل
jest.mock('axios');
const axios = require('axios');

describe('=== AjyalSmartAidEngine Precision & Lock Testing ===', () => {
    let aidEngine;
    const mockExchangeRate = 250000n; // قيمة افتراضية ثابتة للسعر

    beforeEach(() => {
        aidEngine = new AjyalSmartAidEngine(mockExchangeRate);
    });

    test('Should split financial payouts into precise 50/50 parts without floating point errors', async () => {
        const beneficiary = "YEM_USER_001";
        const yerAmountInput = 1000000; // مليون وحدة فرعية من العملة
        
        const result = await aidEngine.processSovereignPayroll(beneficiary, yerAmountInput);
        
        expect(result.status).toBe("APPROVED");
        expect(result.distribution.yer_sub_units).toBe("500000"); // 50% تماماً دون كسور
        expect(BigInt(result.distribution.pi_stroops_payload)).toBeGreaterThan(0n);
    });

    test('Should block concurrent double-dipping or double disbursement attempts instantly', async () => {
        const beneficiary = "YEM_USER_FRAUD_CHECK";
        const yerAmountInput = 500000;

        // تشغيل عمليتي صرف لنفس الشخص في نفس اللحظة للتحقق من قفل الأمان البرمجي
        const firstPayout = aidEngine.processSovereignPayroll(beneficiary, yerAmountInput);
        
        await expect(aidEngine.processSovereignPayroll(beneficiary, yerAmountInput))
            .rejects
            .toThrow("SECURITY ALERT: Concurrent payout blocked");

        await firstPayout; // تنظيف الذاكرة بعد الفحص
    });
});

describe('=== PiIntegrationBridge Fraud & Validation Testing ===', () => {
    let piBridge;

    beforeEach(() => {
        process.env.PI_NETWORK_SANDBOX_KEY = "secure_test_key_123";
        piBridge = new PiIntegrationBridge();
    });

    test('Should reject structural layout manipulation or unexpected payload values', async () => {
        const fakePaymentId = ""; // إدخال قيمة فارغة خبيثة
        await expect(piBridge.verifyAndInjectManifest(fakePaymentId, 50000n))
            .rejects
            .toThrow("CRITICAL: Invalid or malicious Payment ID");
    });
});
