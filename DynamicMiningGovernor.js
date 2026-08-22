/**
 * @file DynamicMiningGovernor.js
 * @description محرك حوكمة التعدين اللحظي لرمز YER المقيد بسقف 10% من إجمالي المعروض (10 مليون YER).
 */

class DynamicMiningGovernor {
    constructor() {
        // الإعدادات العشرية الصارمة للمستودع الحالية
        this.YER_SCALE = 10000000000n; // دقة 10 خانات عشرية لعملة YER
        
        // القيد الصارم المحدث: 10% من 100 مليون = 10 مليون YER بالوحدات الصغرى
        this.FREE_MINING_POOL_CAP = 10000000n * this.YER_SCALE; 

        this.BASE_MINING_RATE = 1000000000n; // معدل الأساس الهيدروليكي: 0.1 YER للساعة
        this.MIN_POSSIBLE_RATE = 100000000n; // الحد الأدنى للمكافأة (0.01 YER) لمنع توقف التفاعل
    }

    /**
     * حساب معدل التعدين اللحظي الحقيقي مع التحقق الصارم من سقف الـ 10%
     * @param {bigint} totalTokensMinedSoFar إجمالي ما تم تعدينه مجاناً من الشبكة حتى الآن
     * @param {bigint} lockedLiquidityPool حجم السيولة المجمّدة في مجمعات المقاصة
     * @param {bigint} tokensBurned24h حجم الرموز المحروقة في آخر 24 ساعة عبر الدفع الهجين
     * @returns {string} معدل التعدين اللحظي للساعة القادمة (يعيد 0 في حال نفاد المجمع)
     */
    calculateInstantRate(totalTokensMinedSoFar, lockedLiquidityPool, tokensBurned24h) {
        // صمام الأمان الصارم: إذا وصل التعدين المجاني لسقف 10 مليون YER، يتوقف التعدين فوراً ويتحول التعدين كلياً للسيولة
        if (totalTokensMinedSoFar >= this.FREE_MINING_POOL_CAP) {
            console.log("[حظر حوكمة التعدين]: تم الوصول إلى الحد الأقصى للتعدين المجاني (10% من المعروض).");
            return "0";
        }

        // حساب المتبقي في مجمع التعدين المجاني
        const remainingMiningPool = this.FREE_MINING_POOL_CAP - totalTokensMinedSoFar;
        const TOTAL_SUPPLY = 100000000n * this.YER_SCALE; // 100 مليون YER المعروض الكلي

        // 1. حساب معامل السيولة ودعم السوق المتبادل
        const liquidityFactor = (lockedLiquidityPool * 100n) / TOTAL_SUPPLY;

        // 2. حساب حافز حرق المدفوعات الهجينة الساعي
        let burnBonus = tokensBurned24h / 24n;

        // 3. دمج المؤشرات لتوليد الحسبة اللحظية
        let calculatedInstantRate = (this.BASE_MINING_RATE * liquidityFactor) / 50n; // معايرة على أساس مستهدف سيولة 50%
        calculatedInstantRate += burnBonus;

        // 4. تطبيق الحدود الدنيا والقصوى
        if (calculatedInstantRate < this.MIN_POSSIBLE_RATE) {
            calculatedInstantRate = this.MIN_POSSIBLE_RATE;
        }
        
        const MAX_POSSIBLE_RATE = this.BASE_MINING_RATE * 5n;
        if (calculatedInstantRate > MAX_POSSIBLE_RATE) {
            calculatedInstantRate = MAX_POSSIBLE_RATE;
        }

        // صمام أمان الكسر الأخير: إذا كان المعدل اللحظي أكبر من المتبقي في المجمع، امنح المستخدم المتبقي فقط واقفل التعدين
        if (calculatedInstantRate > remainingMiningPool) {
            calculatedInstantRate = remainingMiningPool;
        }

        return calculatedInstantRate.toString();
    }
}

module.exports = DynamicMiningGovernor;
