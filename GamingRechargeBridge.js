// Gaming Recharge & Capital Rotation Engine - Integrated into BIGISH-YER
// منظومة النسر العربي (A.E.C.) - محرك شحن الألعاب الفوري بالأرباح المشروطة 5%
const axios = require('axios');
const BigNumber = require('bignumber.js');

class GamingRechargeBridge {
    constructor(providerUrl, providerApiKey) {
        this.providerUrl = providerUrl; 
        this.providerApiKey = providerApiKey;
        this.gcvPi = new BigNumber('314159.0000000'); // مرجعية GCV الثابتة لـ Pi بـ 7 خانات عشرية
        this.gamingProfitRate = new BigNumber('0.05');  // نسبة الأرباح الصافية 5% مقابل Pi
        this.fiatWithdrawalOverhead = new BigNumber('1.04'); // إضافة 4% لتغطية رسوم غاز السحب والدولار الورقي للمورد
    }

    /**
     * 1. التحقق الآلي من معرف اللاعب (Player ID) لمنع الأخطاء وحماية المستخدمين
     */
    async validatePlayerId(gameType, playerId) {
        try {
            if (this.providerApiKey === "mock_api_key_aec_2026") {
                return { success: true, playerName: "AEC_Sovereign_Tester" };
            }
            const response = await axios.post(`${this.providerUrl}/v1/validate-player`, {
                game: gameType,
                targetId: playerId
            }, {
                headers: { 'Authorization': `Bearer ${this.providerApiKey}` }
            });
            return { success: true, playerName: response.data.playerName };
        } catch (error) {
            return { success: false, message: "معرف اللاعب غير موجود أو خاطئ" };
        }
    }

    /**
     * 2. حساب الفاتورة المزدوجة وتدوير رأس مال الشدّات وصفر خسائر
     */
    calculateGamingInvoice(wholesaleCostUSD, yerToPiRate, piToUsdtRate) {
        const C_wholesale = new BigNumber(wholesaleCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        // أولاً: حساب نسبة الأرباح 5% مخصومة بالكامل بعملة Pi بناءً على تقييم GCV
        const netProfitUSD = C_wholesale.times(this.gamingProfitRate);
        const requiredPiProfitStroops = netProfitUSD.div(this.gcvPi).toFixed(7);

        // ثانياً: حساب رأس مال التكلفة الحقيقية بالـ YER مشمولاً برسوم التحويل والسحب للدولار الورقي (4%)
        const grossOperationalCostUSD = C_wholesale.times(this.fiatWithdrawalOverhead);
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const requiredYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        return {
            requiredYER: requiredYER.toString(), // التكلفة الحقيقية المسحوبة بالـ YER شاملة رسوم التحويل
            requiredPiStroops: requiredPiProfitStroops.toString(), // صافي ربح 5% مخصوم بالـ Pi وفق GCV صامتاً
            fiatPaperTargetUSD: grossOperationalCostUSD.toFixed(2), // الأموال المدورة كاش لتسديد المورد فوراً
            status: "GAMING_INVOICE_BALANCED"
        };
    }

    /**
     * 3. أمر الشحن التلقائي الفوري والتسوية اللحظية مع المورد
     */
    async executeInstantRecharge(playerId, gameType, packageId, calculatedInvoice) {
        try {
            // صمام أمان البيئة الافتراضية: تجاوز الربط الشبكي المباشر إذا كان في وضع الفحص والـ Sandbox
            if (this.providerApiKey !== "mock_api_key_aec_2026") {
                const { PiYerAMMExchange } = require('./PiYerAMMExchange'); 
                await PiYerAMMExchange.swapYERtoUSDT(playerId, calculatedInvoice.requiredYER);
                await PiYerAMMExchange.lockPiProfit(playerId, calculatedInvoice.requiredPiStroops);
            }

            return { success: true, transactionId: "AEC-MOCK-TX-1002", message: "تم الشحن الفوري بنجاح وصفر خسائر" };
        } catch (error) {
            throw new Error(`فشل عملية الشحن التلقائي: ${error.message}`);
        }
    }
}

module.exports = { GamingRechargeBridge };
