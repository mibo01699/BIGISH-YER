// UnifiedIdentityRegistry.js - السجل السيادي للهوية الرقمية الموحدة لشبكة Pi
class UnifiedIdentityRegistry {
    constructor() {
        this.profiles = new Map(); // مفتاح الخريطة هو عنوان محفظة Pi للمستخدم
    }

    /**
     * تسجيل أو تحديث الملف الشخصي الثلاثي الموحد لمنع تكرار البنود
     */
    registerOrUpdateProfile(piWalletAddress, kycData, kybData = null, kygData = null) {
        const existingProfile = this.profiles.get(piWalletAddress) || {
            piWallet: piWalletAddress,
            individualKYC: { status: "PENDING", verifiedAt: null, baseData: {} },
            commercialKYB: { status: "NOT_APPLICABLE", taxId: null, enterpriseData: {} },
            governmentalKYG: { status: "NOT_APPLICABLE", employeeId: null, gradeData: {} },
            linkedYerWallet: null
        };

        // 1. المستوى الفردي المعتمد على Pi Network KYC الرسمي
        if (kycData) {
            existingProfile.individualKYC = {
                status: "VERIFIED",
                verifiedAt: Date.now(),
                baseData: { ...existingProfile.individualKYC.baseData, ...kycData }
            };
        }

        // 2. المستوى التجاري (KYB) لتطبيقات GAV، المزاد، و esIM
        if (kybData) {
            existingProfile.commercialKYB = {
                status: "VERIFIED_MERCHANT",
                taxId: kybData.taxId,
                enterpriseData: { ...existingProfile.commercialKYB.enterpriseData, ...kybData }
            };
        }

        // 3. المستوى الوظيفي والسيادي (KYG) لإدارة الرتب الوظيفية والمرتبات
        if (kygData) {
            existingProfile.governmentalKYG = {
                status: "ACTIVE_OFFICIAL",
                employeeId: kygData.employeeId,
                gradeData: { ...existingProfile.governmentalKYG.gradeData, ...kygData }
            };
        }

        this.profiles.set(piWalletAddress, existingProfile);
        return existingProfile;
    }
}
module.exports = UnifiedIdentityRegistry;
