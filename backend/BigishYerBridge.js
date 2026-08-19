// backend/BigishYerBridge.js
/**
 * جسر الربط المالي المشترك: Be-Well <-> BIGISH-YER
 * يربط معايير المقاصة اللحظية وسجل الهوية الموحد بمحرك الـ YER Token Liquidity Engine
 */

const UnifiedIdentityRegistry = require('./UnifiedIdentityRegistry');

class BigishYerBridge {
    constructor(bigishYerApiUrl, dexOracleUrl) {
        this.bigishYerApiUrl = bigishYerApiUrl; // رابط باكيند محفظة BIGISH-YER المشغل على ريبليت
        this.dexOracleUrl = dexOracleUrl;       // مجمع السيولة التلقائي لـ AMM Pi/YER
    }

    /**
     * تحويل الأقساط أو صرف التعويضات اللحظية عبر الـ SWAP
     */
    async executeSettlement(piUserId, amountInPi, destinationYerWallet, serviceType) {
        try {
            // 1. جلب سعر الصرف اللحظي التنافسي من الـ Oracle المدمج بـ DEX Pi
            const oracleResponse = await fetch(`${this.dexOracleUrl}/api/v1/quote?pair=Pi_YER`);
            const priceData = await oracleResponse.json();
            const piToYerRate = priceData.rate; // كم يساوي الـ Pi مقابل الـ YER

            // 2. احتساب القيمة الصافية المستهدفة لعملية المقاصة
            const totalYerToMintOrTransfer = amountInPi * piToYerRate;

            // 3. توجيه أمر الصرف أو الـ Payroll المباشر إلى محفظة BIGISH-YER عبر الـ API
            const payload = {
                target_wallet: destinationYerWallet,
                amount_yer: totalYerToMintOrTransfer,
                meta_source: "Be-Well-Insurance-Utility",
                reference_id: `BRIDGE_TX_${Date.now()}`,
                service_context: serviceType // مثل: مساعدات إنسانية، رواتب مدققين، رواتب أطباء
            };

            const response = await fetch(`${this.bigishYerApiUrl}/api/v1/payments/mint-settle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("BIGISH_YER_SETTLEMENT_REJECTED");
            
            const result = await response.json();
            console.log(`✅ تم المقاصة والتسوية بنجاح: تم تحويل الـ Pi وصرف ${totalYerToMintOrTransfer} YER.`);
            return { success: true, tx_hash: result.blockchain_tx_hash };

        } catch (error) {
            console.error("❌ فشل التكامل المالي عبر الجسر الثنائي:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = BigishYerBridge;
