/**
 * @file PiYerAMMExchange.js
 * @description محرك صانع السوق الآلي (AMM) لزوج التداول (Pi / YER) المعتمد على ثابت المقاصة الحجمي X * Y = K لمنع أخطاء النقطة العائمة.
 */

class PiYerAMMExchange {
    constructor() {
        this.PI_SCALE = 10000000n;        // دقة 7 خانات لشبكة Pi (Stroops)
        this.YER_SCALE = 10000000000n;    // دقة 10 خانات لرمز YER

        // تهيئة مجمع السيولة الأولي (40 مليون YER مقابل ما يعادله من Pi)
        this.poolYer = 40000000n * this.YER_SCALE;
        this.poolPi = 200000n * this.PI_SCALE; // كمية أصلية مبدئية لعملة Pi للتسعير التوازني

        // حساب ثابت المنتج الصارم لـ DEX (Constant Product K)
        this.constantK = this.poolYer * this.poolPi;
    }

    /**
     * حساب كمية YER المستقبلة عند إيداع كمية محددة من Pi (صيغة Swap Pi to YER)
     * @param {bigint} piInputStroops الكمية المدخلة من عملة Pi بالـ Stroops
     * @returns {bigint} الكمية الصافية المستحقة من YER بالوحدات الصغرى
     */
    getSwapOutputPiToYer(piInputStroops) {
        if (piInputStroops <= 0n) throw new Error("خطأ DEX: يجب أن تكون القيمة المدخلة أكبر من الصفر.");

        // الرسوم اللامركزية للمجمع 0.3% لدعم التعدين والمقاصة الإجمالية
        const feeMultiplier = 997n;
        const piInputWithFee = piInputStroops * feeMultiplier;

        // حساب المخرج الحجمي بناءً على بروتوكول X * Y = K الصارم
        const numerator = piInputWithFee * this.poolYer;
        const denominator = (this.poolPi * 1000n) + piInputWithFee;
        
        const yerOutputSubUnits = numerator / denominator;

        // صمام أمان لضمان عدم سحب سيولة أكبر من المتاح في الـ AMM
        if (yerOutputSubUnits >= this.poolYer) {
            throw new Error("عجز السيولة: الكمية المطلوبة تتجاوز المتاح في مجمع المقاصة الحالي.");
        }

        return yerOutputSubUnits;
    }

    /**
     * تنفيذ التبادل الحقيقي وتحديث الأرصدة الداخلية للمجمع فوراً (Execute Swap)
     */
    executeSwapPiToYer(piInputStroops) {
        const yerOutput = this.getSwapOutputPiToYer(piInputStroops);

        // تحديث مجمعات السيولة بشكل صارم ومتزامن
        this.poolPi += piInputStroops;
        this.poolYer -= yerOutput;

        // إعادة ضبط وعيار الثابت K لمنع أي تسرب حسابي
        this.constantK = this.poolPi * this.poolYer;

        return {
            spentPiStroops: piInputStroops.toString(),
            receivedYerSubUnits: yerOutput.toString(),
            currentPoolPi: this.poolPi.toString(),
            currentPoolYer: this.poolYer.toString()
        };
    }
}

module.exports = PiYerAMMExchange;
