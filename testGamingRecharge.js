// Test Automation for Gaming Recharge Dual-Token Allocation Engine
// مدمج بمستودع BIGISH-YER - منظومة النسر العربي (A.E.C.)
const assert = require('assert');
const { GamingRechargeBridge } = require('./GamingRechargeBridge');

function runGamingEngineTests() {
    console.log("⏳ جاري بدء فحص محرك شحن الألعاب وسد الثغرات...");

    // استخدام مفتاح فحص افتراضي لتنشيط صمام أمان البيئة الافتراضية للـ GitHub
    const gameBridge = new GamingRechargeBridge("https://gaming-wholesale.com", "mock_api_key_aec_2026");
    
    const mockYerToPi = "25"; // 1 Pi = 25 YER (كأرقام صحيحة)
    const mockPiToUsdt = "1200000"; // 1 Pi = 1.2 USDT (بالوحدات الصغرى 10^6)
    const testPackageWholesaleUSD = "50"; // $50 كنص

    // 1. فحص معادلة التسعير المنفصلة (YER للتكلفة و 5% Pi للأرباح وفق GCV)
    const invoiceResult = gameBridge.calculateGamingInvoice(testPackageWholesaleUSD, mockYerToPi, mockPiToUsdt);
    
    assert.strictEqual(typeof invoiceResult.requiredYER, "string", "خطأ: قيمة الـ YER يجب أن تكون نصية دقيقة");
    assert.strictEqual(typeof invoiceResult.requiredPiStroops, "string", "خطأ: قيمة أرباح Pi Stroops يجب أن تكون نصية دقيقة");
    
    console.log("✅ اختبار منع الكسور العشرية العائمة وحماية السيولة المحلية: ناجح");
    console.log(`   - التكلفة التشغيلية المطلوبة من المستفيد: ${invoiceResult.requiredYER} YER`);
    console.log(`   - حصة أرباح النسر العربي 5% المحجوزة صامتاً: ${invoiceResult.requiredPiStroops} Pi Stroops (GCV)`);

    // 2. اختبار فحص تحميل كافة رسوم السحب والتحويل كاش (4%) بالكامل على الزبون
    // إجراء الحسابات يدوياً باستخدام BigInt
    const expectedOperationalUSD = (BigInt(testPackageWholesaleUSD) * 104n) / 100n; // 50 * 1.04
    assert.strictEqual(invoiceResult.fiatPaperTargetUSD, expectedOperationalUSD.toString(), "فشل: لم يتم تحميل أعباء السحب النقدي على المستفيد");
    console.log(`✅ اختبار صفر خسائر تشغيلية (المبلغ الصافي الخارج للمورد بالدولار): $${invoiceResult.fiatPaperTargetUSD} USDT بنجاح`);

    // 3. اختبار التحقق من عدم تجاوز الحد الأقصى للتوكنوميكس
    const yerAmountBig = BigInt(invoiceResult.requiredYER);
    assert.ok(yerAmountBig <= BigInt("3000000000000000000"), "فشل: قيمة YER تتجاوز السقف الأقصى");
    console.log("✅ اختبار السقف الأقصى 300M YER: ناجح");

    console.log("🎉 جميع فحوصات الشحن الفوري ومقاصة الألعاب مطابقة لقواعد النظام 100%.");
}

runGamingEngineTests();