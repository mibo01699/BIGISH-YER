// Visa Card Sovereign Clearing Engine - Refactored Version 2026
// مدمج بمستودع BIGISH-YER - يفرض 5% أرباح عند الشراء و 0% أرباح عند التغذية
const BigNumber = require('bignumber.js');

class VisaSovereignClearing {
    constructor() {
        this.gcvPi = new BigNumber('314159.0000000'); // مرجعية GCV لـ Pi (7 خانات)
        this.withdrawalOverhead = new BigNumber('1.04'); // 4% لتغطية رسوم غاز السحب والدولار الورقي للمورد
    }

    /**
     * 1. حساب الفاتورة عند الشراء والإصدار الأول للبطاقة (تطبيق 5% أرباح بـ Pi وفق GCV)
     */
    calculateInitialPurchase(cardBaseCostUSD, yerToPiRate, piToUsdtRate) {
        const C_card = new BigNumber(cardBaseCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        // حساب 5% أرباح صافية للاحتياطي وتُدفع بـ Pi Stroops وفق GCV
        const profitUSD = C_card.times('0.05');
        const requiredPiProfitStroops = profitUSD.div(this.gcvPi).toFixed(7);

        // التكلفة الأساسية ورسوم السحب (4%) تُدفع بالكامل برمز YER
        const grossOperationalCostUSD = C_card.times(this.withdrawalOverhead);
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        return {
            txType: "INITIAL_PURCHASE",
            userDisplayCostYER: finalCostYER.toString(), // التكلفة المدفوعة بالـ YER شاملة الـ 4% رسوم سحب
            sovereignReservePi: requiredPiProfitStroops.toString(), // أرباح الشراء 5% بالـ Pi
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2), // كاش المورد لضمان صفر خسائر
            status: "PURCHASE_PROFIT_APPLIED"
        };
    }

    /**
     * 2. حساب الفاتورة عند التغذية والشحن اللاحق (صفر أرباح 0% - دفع التكلفة الصافية فقط بالـ YER)
     */
    calculateInstantReload(reloadAmountUSD, yerToPiRate, piToUsdtRate) {
        const C_reload = new BigNumber(reloadAmountUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        // تطبيق صفر أرباح 0% للمنصة بناءً على التوجيه
        const requiredPiProfitStroops = "0.0000000"; 

        // العميل يدفع فقط التكلفة الحقيقية الصافية للمبلغ مشمولاً بـ 4% رسوم السحب وضخ الدولار الورقي للمورد
        const grossOperationalCostUSD = C_reload.times(this.withdrawalOverhead);
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        return {
            txType: "INSTANT_RELOAD",
            userDisplayCostYER: finalCostYER.toString(), // التكلفة الصافية بالـ YER متضمنة فقط أعباء السحب والتحويل
            sovereignReservePi: requiredPiProfitStroops, // صفر أرباح بـ Pi عند الشحن
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2), // الأموال الموجهة بالكامل لشحن بطاقة الفيزا كاش وصفر نقص
            status: "RELOAD_ZERO_PROFIT_EXECUTIVE"
        };
    }
}

module.exports = { VisaSovereignClearing };
