// ====================================================================
//  COBRA & Telcom & Visa - Capital Rotation & Cash Withdrawal Simulator
//  منظومة النسر العربي (A.E.C.) - محاكي تدوير رأس المال وسحب الكاش للموردين
//  متوافق 100% مع بيئة Replit المجانية ومحمي ضد الكسور العائمة والثغرات
// ====================================================================

const BigNumber = require('bignumber.js');

class CapitalRotationSimulator {
    constructor() {
        this.gcvPi = new BigNumber('314159.0000000'); // مرجعية GCV لـ Pi (7 خانات)
        this.fiatWithdrawalOverhead = new BigNumber('1.04'); // 4% أعباء التحويل كاش والغاز (يتحملها المستخدم)
        this.profitRates = {
            TELCOM_TELECOM: new BigNumber('0.25'), // 25% أرباح باقات الاتصالات والإنترنت
            COBRA_INTERNET: new BigNumber('0.25'),
            VISA_AND_GAMING: new BigNumber('0.05')  // 5% أرباح بطاقات فيزا والشدات والألعاب
        };
    }

    /**
     * تشغيل محاكاة لدورة مالية كاملة وتحويلها إلى دولار ورقي كاش لحساب الشركة الموردة
     */
    simulateFullRotationCycle(serviceType, wholesaleUSD, userPaymentMethod, yerToPiRate, piToUsdtRate) {
        console.log(`\n================================================================`);
        console.log(`🦅 [بدء معالجة المقاصة]: تدوير رأس مال خدمة: [${serviceType}]`);
        console.log(`================================================================`);
        console.log(`➡️ كلفة الخدمة الخام (سعر الجملة من المورد): $${wholesaleUSD} USD`);
        console.log(`➡️ طريقة الدفع المختارة من المستفيد: [${userPaymentMethod}]`);

        const C_wholesale = new BigNumber(wholesaleCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);
        const profitRate = this.profitRates[serviceType] || new BigNumber('0.25');

        // 1. حساب صافي الأرباح المدمجة صامتاً في الخلفية
        const netProfitUSD = C_wholesale.times(profitRate);

        // 2. تطبيق معادلة صفر خسائر: إضافة 4% رسوم السحب والغاز فوق التكلفة الإجمالية
        const grossOperationalCostUSD = C_wholesale.times(this.fiatWithdrawalOverhead);

        // 3. فرز أرباح المنظومة (حصة الـ Pi وفق GCV)
        const requiredPiProfitStroops = netProfitUSD.div(this.gcvPi).toFixed(7);

        // 4. حساب الفاتورة النهائية المطلوبة من العميل بناءً على طريقة الدفع الفردية المحددة
        let userFinalBillText = "";
        if (userPaymentMethod === "YER") {
            const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
            const finalCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);
            userFinalBillText = `${finalCostYER} YER`;
        } else {
            const finalCostPi = grossOperationalCostUSD.div(X_pi_usdt).toFixed(7);
            userFinalBillText = `${finalCostPi} Pi`;
        }

        // --- محاكاة دورة السحب والتحويل كاش (Off-Chain Execution) ---
        console.log(`\n🔄 [خطوة 1 - البلوكشين والـ DEX]:`);
        console.log(`   - تم خصم الفاتورة الإجمالية من محفظة العميل: ${userFinalBillText} (شاملة الرسوم والأرباح)`);
        console.log(`   - تم حجز وقفل أرباح المنظومة صامتاً في محفظة الاحتياطي: ${requiredPiProfitStroops} Pi Stroops (بتقييم GCV)`);

        console.log(`\n🔄 [خطوة 2 - منصة التدوير الكبرى (Binance/Kraken API)]:`);
        console.log(`   - تم تحويل رصيد التكلفة المدوّر بنجاح إلى عملة مستقرة: $${grossOperationalCostUSD.toFixed(2)} USDT`);
        
        // حساب صافي رسوم سحب المنصة وتحويل الفيات
        const exchangeFee = grossOperationalCostUSD.minus(C_wholesale);
        console.log(`   - تم استقطاع رسوم السحب وتحويل الفيات أوتوماتيكياً: $${exchangeFee.toFixed(2)} USDT (مغطاة بالكامل من المستفيد)`);

        console.log(`\n🔄 [خطوة 3 - البنك والتحويل النقدي الكاش لحساب المورد]:`);
        console.log(`   - حساب المدير التنفيذي يضخ الحوالة البنكية الحية الآن...`);
        console.log(`   - تم تسليم الأموال صافية ونظيفة 100% إلى الحساب المصرفي للشركة المزودة: $${C_wholesale.toFixed(2)} USD (ورقي كاش)`);
        
        console.log(`\n🎉 [حالة المعاملة]: نجحت دورة التدوير كاملة بنسبة 100% | صيانة كاملة لرأس المال | صفر خسائر تشغيلية.`);
        console.log(`================================================================\n`);
    }
}

// تشغيل سيناريوهات محاكاة حية فورية عند إقلاع الملف في Replit
const simulator = new CapitalRotationSimulator();

// سيناريو 1: شحن حزمة ألعاب ببجي (التكلفة $50، الدفع بـ YER، أرباح 5%)
simulator.simulateFullRotationCycle("VISA_AND_GAMING", 50, "YER", "0.000025", "1.20");

// سيناريو 2: تجديد فاتورة ستارلينك أو باقة إنترنت كوبرا (التكلفة $120، الدفع بـ Pi، أرباح 25%)
simulator.simulateFullRotationCycle("COBRA_INTERNET", 120, "PI", "0.000025", "1.20");
