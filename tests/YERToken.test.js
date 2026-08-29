// ============================================================
// الملف: tests/YERToken.test.js
// المسار: BIGISH-YER/tests/YERToken.test.js
// الدور: اختبارات YERTokenContract (محاكاة Sandbox - متوافقة مع 300M)
// ============================================================

const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const YERToken = require('../YERTokenContract'); // تصحيح المسار

describe('YERToken Contract (Sandbox)', () => {
    let token;

    beforeEach(() => {
        // إنشاء نسخة جديدة وتهيئة الـ Launchpad
        token = new YERToken();
        token.initializeLaunchpad('test_api_key');
    });

    test('should initialize with correct supply (0 before minting)', () => {
        // بعد التهيئة فقط، يجب أن يكون المعروض 0 (لم يُسك أي شيء بعد)
        assert.strictEqual(token.totalSupply.toString(), "0");
    });

    test('should mint tokens via Pi liquidity and distribute aid (BigInt)', async () => {
        // 1. محاكاة شراء Pi (الكمية كنص لضمان الدقة)
        const purchaseResult = await token.purchaseAndLockLiquidity('buyer_user', "100");
        
        assert.strictEqual(purchaseResult.success, true);
        // 100 Pi * معدل 100 = 10,000 YER (ولكن يجب التأكد من أن الرقم نص)
        assert.strictEqual(purchaseResult.mintedYER, "10000");

        // 2. توزيع المساعدات (توزيع 2000 YER من المشتري لمستخدم آخر)
        const distributionResult = token.distributeAidOrPayroll(
            purchaseResult.buyerPiUser || 'buyer_user', 
            'recipient_user', 
            "2000"
        );

        assert.strictEqual(distributionResult.success, true);
        
        // 3. التحقق من الأرصدة (استخدام نص و BigInt)
        const buyerBalance = token.balances['buyer_user'];
        const recipientBalance = token.balances['recipient_user'];
        
        // 10,000 - 2,000 = 8,000
        assert.strictEqual(buyerBalance.toString(), "8000");
        assert.strictEqual(recipientBalance.toString(), "2000");
    });

    test('should reject minting above 300M supply cap', async () => {
        // محاولة سك كمية ضخمة تتجاوز الـ 300M
        const hugeAmount = "300000001"; // 300,000,001 Pi
        const result = await token.purchaseAndLockLiquidity('buyer_user', hugeAmount);
        
        // يجب أن تفشل العملية لأنها ستتجاوز السقف
        assert.strictEqual(result.success, false);
        assert.match(result.error, /SUPPLY_CAP_ERROR/);
    });
});