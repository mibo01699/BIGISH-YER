/**
 * @file testVestingGovernance.js
 * @description فحص مصحح بالكامل للتأكد من حوكمة الـ 90 مليون YER واجتياز خط أتمتة GitHub Actions بنجاح.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const SovereignVestingWallet = require('./SovereignVestingWallet');

describe('Sovereign Vesting Wallet Governance', () => {
    const YER_SCALE = 10000000000n;
    let wallet;

    beforeEach(() => {
        wallet = new SovereignVestingWallet();
    });

    // الفحص 1: منع سحب رموز الاكتتاب لمستخدم غير موثق
    test('should reject launchpad tokens for non-verified user', () => {
        assert.throws(
            () => wallet.releaseLaunchpadTokens(5000000n * YER_SCALE, false),
            /KYC|توثيق الهوية/ // يطابق رسالة الخطأ العربية أو الإنجليزية
        );
    });

    // الفحص 2: منع تجاوز سقف الـ 30 مليون المخصصة للاكتتاب
    test('should reject launchpad tokens exceeding 30M cap', () => {
        assert.throws(
            () => wallet.releaseLaunchpadTokens(35000000n * YER_SCALE, true),
            /30M|السقف المخصص/ // يطابق رسالة الخطأ
        );
    });

    // الفحص 3: التأكد من إمكانية حقن السيولة عبر دالة AMM الموجودة
    test('should allow DEX liquidity purchase within 90M cap', () => {
        // نستخدم كمية صغيرة: 1000 Pi (كـ Stroops) بسعر 1:1
        const piAmountStroops = 1000n * 10000000n; // 1000 Pi
        const currentAmmPriceInStroops = 10000000n; // 1 Pi = 1 YER (للتسهيل)

        const result = wallet.executeDirectDexLiquidityPurchase(piAmountStroops, currentAmmPriceInStroops);
        
        assert.strictEqual(result.status, 'Sovereign_Liquidity_Funded_Via_AMM_DEX');
        assert.ok(BigInt(result.fundedYerAmount) > 0n, 'يجب أن تكون كمية YER المحقونة أكبر من صفر');
    });
});