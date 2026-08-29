/**
 * @file DynamicMiningGovernor.js
 * @description محرك توزيع الحوكمة المجتمعي لرمز YER المقيد بسقف 30 مليون YER (10% من الـ 300M).
 * NOTE: تم تحويل هذا المحرك من "تعدين" إلى "Community & Public Utility Distribution" ليتوافق مع التعليمات،
 * مع الحفاظ على نفس اسم الواجهة (API) لتوافق البرمجيات القديمة.
 */

const YER_TOKENOMICS = require('./YERTokenomicsCanonical');

class CommunityDistributionGovernor {
    constructor() {
        // الإعدادات العشرية الصارمة للمستودع الحالية
        this.YER_SCALE = 10000000000n; // دقة 10 خانات عشرية لعملة YER
        
        // القيد الصارم: 30 مليون YER (10% من 300M) مخصصة للمنفعة المجتمعية والعامة
        this.COMMUNITY_DISTRIBUTION_CAP = YER_TOKENOMICS.allocations.communityPublicUtility; // 30M

        // معدل التوزيع الأساسي (بدلاً من معدل التعدين)
        this.BASE_DISTRIBUTION_RATE = 1000000000n; // 0.1 YER للساعة
        this.MIN_POSSIBLE_RATE = 100000000n; // 0.01 YER (لضمان استمرارية التفاعل)
    }

    /**
     * حساب معدل التوزيع اللحظي الحقيقي مع التحقق الصارم من سقف الـ 30M
     * @param {bigint} totalTokensDistributedSoFar إجمالي ما تم توزيعه على المجتمع حتى الآن
     * @param {bigint} lockedLiquidityPool حجم السيولة المجمّدة في مجمعات المقاصة
     * @param {bigint} tokensBurned24h حجم الرموز المحروقة في آخر 24 ساعة عبر الدفع الهجين
     * @returns {string} معدل التوزيع اللحظي للساعة القادمة (يعيد 0 في حال نفاد المجمع)
     */
    calculateInstantRate(totalTokensDistributedSoFar, lockedLiquidityPool, tokensBurned24h) {
        // صمام الأمان الصارم: إذا وصل التوزيع المجتمعي لسقف 30 مليون YER، يتوقف فوراً
        if (totalTokensDistributedSoFar >= this.COMMUNITY_DISTRIBUTION_CAP) {
            console.log("[حظر حوكمة التوزيع]: تم الوصول إلى الحد الأقصى لتوزيع المنفعة المجتمعية (30% من المعروض الكلي؟ لا، 10% من 300M).");
            return "0";
        }

        // حساب المتبقي في مجمع التوزيع المجتمعي
        const remainingDistributionPool = this.COMMUNITY_DISTRIBUTION_CAP - totalTokensDistributedSoFar;
        const TOTAL_SUPPLY = YER_TOKENOMICS.maximumSupply; // 300 مليون YER (بدلاً من 100M القديمة)

        // 1. حساب معامل السيولة ودعم السوق المتبادل
        const liquidityFactor = (lockedLiquidityPool * 100n) / TOTAL_SUPPLY;

        // 2. حساب حافز حرق المدفوعات الهجينة الساعي
        let utilityBurnBonus = tokensBurned24h / 24n;

        // 3. دمج المؤشرات لتوليد الحسبة اللحظية
        // (تم تعديل المعايرة لتناسب المعروض الجديد 300M)
        let calculatedInstantRate = (this.BASE_DISTRIBUTION_RATE * liquidityFactor) / 50n; 
        calculatedInstantRate += utilityBurnBonus;

        // 4. تطبيق الحدود الدنيا والقصوى
        if (calculatedInstantRate < this.MIN_POSSIBLE_RATE) {
            calculatedInstantRate = this.MIN_POSSIBLE_RATE;
        }
        
        const MAX_POSSIBLE_RATE = this.BASE_DISTRIBUTION_RATE * 5n;
        if (calculatedInstantRate > MAX_POSSIBLE_RATE) {
            calculatedInstantRate = MAX_POSSIBLE_RATE;
        }

        // صمام أمان الكسر الأخير: إذا كان المعدل اللحظي أكبر من المتبقي في المجمع، امنح المتبقي فقط واقفل التوزيع
        if (calculatedInstantRate > remainingDistributionPool) {
            calculatedInstantRate = remainingDistributionPool;
        }

        return calculatedInstantRate.toString();
    }
}

// تصدير الكلاس الجديد تحت نفس الاسم القديم (Alias) للحفاظ على التوافق البرمجي
module.exports = CommunityDistributionGovernor;
// تصدير احتياطي للتوافق المباشر مع الاسم القديم إن وجد في مشاريع أخرى
module.exports.DynamicMiningGovernor = CommunityDistributionGovernor;