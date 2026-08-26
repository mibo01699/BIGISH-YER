// Visa Card Issuance & Capital Rotation Engine
// مدمج بمستودع BIGISH-YER - منظومة النسر العربي (A.E.C.)
const BigNumber = require('bignumber.js');
const { PiYerAMMExchange } = require('./PiYerAMMExchange'); // استدعاء مجمع السيولة المباشر للمستودع

class VisaSovereignClearing {
    constructor() {
        this.gcvPi = new BigNumber('314159.0000000'); // مرجعية GCV الثابتة بـ 7 خانات عشرية
        this.visaProfitRate = new BigNumber('0.05');    // نسبة الأرباح الصافية 5% مقابل Pi
        this.fiatWithdrawalOverhead = new BigNumber('1.04'); // إضافة 4% لتغطية رسوم غاز البلوكشين والتحويل البنكي كاش على المستفيد
    }

    /**
     * حساب الفاتورة الإجمالية لإصدار أو شحن بطاقة فيزا وتدوير رأس المال لشركات الإصدار
     * @param {number|string} cardCostUSD - التكلفة المطلوبة للبطاقة أو مبلغ الشحن بالدولار
     * @param {number|string} yerToPiRate - سعر الـ YER مقابل الـ Pi من مجمع الـ AMM
     * @param {number|string} piToUsdtRate - سعر الـ Pi مقابل الـ USDT من الـ DEX
     */
    calculateVisaInvoiceAndRotation(cardCostUSD, yerToPiRate, piToUsdtRate) {
        const C_card = new BigNumber(cardCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        // 1. حساب صافي الأرباح (5%) المدمجة صامتاً في الخلفية لخصمها بـ Pi
        const netProfitUSD = C_card.times(this.visaProfitRate);

        // 2. تحميل كافة رسوم السحب والغاز والتحويل (4%) على المستفيد لضمان وصول المبلغ للمورد كاملاً وصفر خسائر
        const grossOperationalCostUSD = C_card.times(this.fiatWithdrawalOverhead);
        
        // 3. التحويل الديناميكي العكسي لمعرفة القيمة الإجمالية المطلوبة بـ YER لتغطية رأس مال المورد
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalRetailCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10); // 10 خانات عشرية لـ YER

        // 4. فرز وتجميد الـ 5% أرباح صافية بوحدات الـ Stroops وتحويلها للاحتياطي بـ Pi بناءً على GCV
        const backendPiProfitStroops = netProfitUSD.div(this.gcvPi).toFixed(7); // 7 خانات عشرية لـ Pi

        return {
            userDisplayCostYER: finalRetailCostYER.toString(), // السعر الإجمالي النهائي الظاهر للمستخدم بالـ YER شامل الرسوم
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2), // كاش الدولار الرقمي الموجه فوراً لحساب المدير التنفيذي لتغذية شركات فيزا
            sovereignReservePi: backendPiProfitStroops.toString(), // حصة أرباح النسر العربي 5% المحفوظة بـ Pi
            status: "VISA_ROTATION_SECURED_ZERO_LOSS"
        };
    }
}

module.exports = { VisaSovereignClearing };
