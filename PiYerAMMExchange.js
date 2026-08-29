/**
 * BIGISH-YER: Tokenized Asset Liquidity Hub
 * Handles on-chain liquidity monitoring for the tokenized YER asset.
 * NOTE: This is a sandbox/testnet simulation. Does not claim official Pi Network integration.
 */

class PiYerAMMExchange {
    constructor() {
        // الالتزام بحسابات الأعداد الكبيرة الخالية من الفواصل (Strict BigInt Arithmetic)
        this.piScale = 10000000n;       // 7 decimals for Pi (Stroops)
        this.yerScale = 10000000000n;   // 10 decimals for Tokenized YER
        
        // محاكاة مجمع السيولة على البلوكشين (On-chain Pool Liquidity Verification)
        this.poolPiReserve = 5000000n * this.piScale;
        this.poolYerReserve = 1000000000n * this.yerScale;
    }

    /**
     * حساب السعر الآلي بناءً على معادلة مجمع السيولة الثابتة (X * Y = K) داخل DEX Pi
     * @returns {string} السعر كنص صريح (YER لكل Pi) لضمان الدقة
     */
    getOnChainPrice() {
        if (this.poolPiReserve === 0n) return "0";
        // حساب النسبة الرياضية الثابتة بدون كسور (النتيجة بالـ YER Sub-units)
        const priceRatio = (this.poolYerReserve * this.piScale) / this.poolPiReserve;
        return priceRatio.toString(); // إرجاع نص بدلاً من رقم عائم
    }

    /**
     * فحص أمان المعاملة لمنع الانزلاق السعري العالي (Slippage Guard)
     * @param {string} amountPiStr - كمية الـ Pi كنص
     * @param {string} expectedYerStr - كمية الـ YER المتوقعة كنص
     * @returns {boolean} هل الانزلاق ضمن الحدود المسموحة؟
     */
    validateTransactionSlippage(amountPiStr, expectedYerStr) {
        const amountPi = BigInt(amountPiStr);
        const expectedYer = BigInt(expectedYerStr);
        
        // حساب السعر الحالي
        const currentPrice = this.getOnChainPrice();
        const currentPriceBig = BigInt(currentPrice);
        
        // حساب القيمة المتوقعة (Pi * السعر)
        const calculatedExpected = (amountPi * currentPriceBig) / this.piScale;

        // حساب الانزلاق (الفرق بين المتوقع والفعلي مقسوماً على المتوقع) بدون Float
        if (calculatedExpected === 0n) return false;
        
        const diff = calculatedExpected > expectedYer ? calculatedExpected - expectedYer : expectedYer - calculatedExpected;
        const slippage = (diff * 10000n) / calculatedExpected; // حساب الانزلاق بالنسبة المئوية (أساس 10000)

        // الحد الأقصى للانزلاق المسموح به هو 3% (أي 300 من 10000)
        return slippage <= 300n;
    }
}

module.exports = new PiYerAMMExchange();