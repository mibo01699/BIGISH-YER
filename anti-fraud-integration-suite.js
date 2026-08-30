// anti-fraud-integration-suite.js - محرك الفحص الموحد لمكافحة الاحتيال وغسيل الأموال (Sandbox)
const UnifiedIdentityRegistry = require('./UnifiedIdentityRegistry');
const SovereignVestingWallet = require('./SovereignVestingWallet');

class AntiFraudIntegrationSuite {
    constructor() {
        this.registry = new UnifiedIdentityRegistry();
        // حد رقابي: 1,000 عملة Pi لكل عملية (بالوحدات الصغرى)
        this.amlSuspiciousLimitStroops = 10000000000n; 
    }

    /**
     * فحص الصفقة والتحقق من الهوية (عبر Supported Integration Status) قبل السماح بالمقاصة
     */
    verifyAndProcessSovereignTrade(walletAddress, totalAmountInYcoin, piDexAmountStroops, identityStatus, businessStatus, governmentStatus) {
        console.log(`\n🔍 [رقابة AML] جاري فحص الحساب الرقمي: ${walletAddress}`);

        // 1. فرض التفتيش ومنع الازدواجية عبر الهوية الرقمية الموحدة (بدون KYC حساس)
        const userProfile = this.registry.registerOrUpdateProfile(walletAddress, identityStatus, businessStatus, governmentStatus);
        
        // التحقق من أن الهوية مدعومة (Supported) وليست "KYC"
        if (userProfile.individualIdentity.status !== "VERIFIED_INTERNAL" && userProfile.individualIdentity.status !== "SUPPORTED_SANDBOX") {
            throw new Error("AML_REJECTION: Unsupported Identity Status.");
        }

        // 2. مكافحة غسيل الأموال - فحص حجم التداول
        if (piDexAmountStroops > this.amlSuspiciousLimitStroops) {
            console.warn(`⚠️ تنبيه أمني: حجم التداول يتجاوز الحد المسموح به! تفعيل التدقيق المعمق (EDD)...`);
            if (userProfile.commercialEntity.status !== "VERIFIED_MERCHANT" && userProfile.governmentEntity.status !== "ACTIVE_OFFICIAL") {
                throw new Error("AML_BLOCK: Suspicious large transaction without valid business/government status.");
            }
        }

        // 3. محاكاة الربط مع مجمع سيولة (Sandbox) واستخدام سعر صرف افتراضي صحيح
        const sovereignWallet = new SovereignVestingWallet(walletAddress);
        
        sovereignWallet.internalPiBalanceStroops += piDexAmountStroops;
        
        // استخدام سعر صرف رقمي صحيح (سعر افتراضي 1:1) بدلاً من نص
        const dexReceipt = sovereignWallet.executeDirectDexLiquidityPurchase(piDexAmountStroops, 10000000n);

        return {
            auditStatus: "COMPLIANT_AND_CLEARED",
            identityAllocation: {
                hasIndividualVerification: true,
                hasCommercialVerification: userProfile.commercialEntity.status === "VERIFIED_MERCHANT",
                hasGovernmentVerification: userProfile.governmentEntity.status === "ACTIVE_OFFICIAL"
            },
            dexSovereignSettlement: dexReceipt
        };
    }
}

module.exports = AntiFraudIntegrationSuite;