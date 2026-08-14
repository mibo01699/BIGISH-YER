// UnifiedIdentityRegistry.js - السجل السيادي الموحد لمنع تكرار البيانات والازدواجية الإدارية
class UnifiedIdentityRegistry {
    constructor() {
        this.profiles = new Map(); // مفتاح الخريطة: عنوان محفظة Pi
    }

    /**
     * تخصيص نوعي موحد يجمع البيانات على 3 مستويات في ملف شخصي واحد
     */
    registerOrUpdateProfile(piWalletAddress, kycData, kybData = null, kygData = null) {
        const existingProfile = this.profiles.get(piWalletAddress) || {
            piWallet: piWalletAddress,
            individualKYC: { status: "PENDING", baseData: {} },
            commercialKYB: { status: "NOT_APPLICABLE", taxId: null, enterpriseData: {} },
            governmentalKYG: { status: "NOT_APPLICABLE", employeeId: null, gradeData: {} }
        };

        if (kycData) existingProfile.individualKYC = { status: "VERIFIED", baseData: kycData };
        if (kybData) existingProfile.commercialKYB = { status: "VERIFIED_MERCHANT", taxId: kybData.taxId, enterpriseData: kybData };
        if (kygData) existingProfile.governmentalKYG = { status: "ACTIVE_OFFICIAL", employeeId: kygData.employeeId, gradeData: kygData };

        this.profiles.set(piWalletAddress, existingProfile);
        return existingProfile;
    }
}
module.exports = UnifiedIdentityRegistry;
