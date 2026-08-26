// Visa Card Sovereign Clearing Engine - Refactored Version 2026
// مدمج بمستودع BIGISH-YER - يفرض 5% أرباح عند الشراء و 0% أرباح عند التغذية
const BigNumber = require('bignumber.js');

class VisaSovereignClearing {
    constructor() {
        this.gcvPi = new BigNumber('314159.0000000'); // مرجعية GCV لـ Pi (7 خانات)
        this.withdrawalOverhead = new BigNumber('1.04'); // 4% لتغطية رسوم غاز السحب والدولار الورقي للمورد
    }

    calculateInitialPurchase(cardBaseCostUSD, yerToPiRate, piToUsdtRate) {
        const C_card = new BigNumber(cardBaseCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        const profitUSD = C_card.times('0.05');
        const requiredPiProfitStroops = profitUSD.div(this.gcvPi).toFixed(7);

        const grossOperationalCostUSD = C_card.times(this.withdrawalOverhead);
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        return {
            txType: "INITIAL_PURCHASE",
            userDisplayCostYER: finalCostYER.toString(),
            sovereignReservePi: requiredPiProfitStroops.toString(),
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2),
            status: "PURCHASE_PROFIT_APPLIED"
        };
    }

    calculateInstantReload(reloadAmountUSD, yerToPiRate, piToUsdtRate) {
        const C_reload = new BigNumber(reloadAmountUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        const requiredPiProfitStroops = "0.0000000"; 

        const grossOperationalCostUSD = C_reload.times(this.withdrawalOverhead);
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        return {
            txType: "INSTANT_RELOAD",
            userDisplayCostYER: finalCostYER.toString(),
            sovereignReservePi: requiredPiProfitStroops,
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2),
            status: "RELOAD_ZERO_PROFIT_EXECUTIVE"
        };
    }
}

module.exports = { VisaSovereignClearing };
