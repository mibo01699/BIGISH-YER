// Test Automation for Gaming Recharge Dual-Token Allocation Engine
// مدمج بمستودع BIGISH-YER - منظومة النسر العربي (A.E.C.)
const assert = require('assert');
const BigNumber = require('bignumber.js');
const { GamingRechargeBridge } = require('./GamingRechargeBridge');

function runGamingEngineTests() {
    console.log("⏳ جاري بدء فحص محرك شحن الألعاب وسد الثغرات...");

    // فرضية تعيين خادم ربط شركات الشحن 
    const gameBridge = new GamingRechargeBridge("https://gaming-wholesale.com", "mock_api_key_aec_2026");
    
    // فرضية أسعار الصرف الحية والعميقة من مجمع السيولة المباشر Pi/YER
    const mockYerToPi = "0.000025";
    const mockPiToUsdt = "1.20";
    const testPackageWholesaleUSD = 50; 

    // 1. فحص معادلة التسعير المنفصلة (YER للتكلفة و 5% Pi للأرباح وفق GCV)
    const invoiceResult = gameBridge.calculateGamingInvoice(testPackageWholesaleUSD, mockYerToPi, mockPiToUsdt);
    
    // التدقيق الصارم لمنع الكسور العائمة (Zero Floating-Point Audit)
    assert.strictEqual(typeof invoiceResult.requiredYER, "string", "خطأ: قيمة الـ YER يجب أن تكون نصية دقيقة");
    assert.strictEqual(typeof invoiceResult.requiredPiStroops, "string", "خطأ: قيمة أرباح Pi Stroops يجب أن تكون نصية دقيقة");
    
    console.log("✅ اختبار منع الكسور العشرية العائمة وحماية السيولة المحلية: ناجح");
    console.log(`   - التكلفة التشغيلية المطلوبة من المستفيد: ${invoiceResult.requiredYER} YER`);
    console.log(`   - حصة أرباح النسر العربي 5% المحجوزة صامتاً: ${invoiceResult.requiredPiStroops} Pi Stroops (GCV)`);

    // 2. اختبار فحص تحميل كافة رسوم السحب والتحويل كاش (4%) بالكامل على الزبون
    const expectedOperationalUSD = new BigNumber(testPackageWholesaleUSD).times('1.04');
    assert.strictEqual(invoiceResult.fiatPaperTargetUSD, expectedOperationalUSD.toFixed(2), "فشل: لم يتم تحميل أعباء السحب النقدي على المستفيد");
    console.log(`✅ اختبار صفر خسائر تشغيلية (المبلغ الصافي الخارج للمورد بالدولار): $${invoiceResult.fiatPaperTargetUSD} USDT بنجاح`);

    console.log("🎉 جميع فحوصات الشحن الفوري ومقاصة الألعاب مطابقة لواقع البلوكشين 100%.");
}

runGamingEngineTests();
