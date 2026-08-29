// UnifiedIdentityRegistry.js - السجل السيادي الموحد لمنع تكرار البيانات والازدواجية الإدارية
// ملاحظة امتثال هامة: هذا السجل يخزن حالات الهوية المحلية (Local Verification Status) 
// ولا يخزن أو يطلب بيانات KYC الرسمية الحساسة من شبكة Pi.

class UnifiedIdentityRegistry {
    constructor() {
        this.profiles = new Map(); // مفتاح الخريطة: عنوان محفظة Pi (اختياري)
    }

    /**
     * تخصيص نوعي موحد يجمع البيانات على 3 مستويات في ملف شخصي واحد
     * @param {string} piWalletAddress - عنوان المحفظة
     * @param {Object} identityData - البيانات التعريفية المحلية (بدون بيانات KYC رسمية)
     * @param {Object} businessData - بيانات الكيان التجاري (اختياري)
     * @param {Object} governmentData - بيانات الجهة الحكومية (اختياري)
     */
    registerOrUpdateProfile(piWalletAddress, identityData, businessData = null, governmentData = null) {
        const existingProfile = this.profiles.get(piWalletAddress) || {
            piWallet: piWalletAddress,
            individualIdentity: { status: "UNVERIFIED", metaData: {} }, // تم تغيير KYC إلى Identity
            commercialEntity: { status: "NOT_APPLICABLE", taxId: null, metaData: {} }, // تم تغيير KYB إلى Entity
            governmentEntity: { status: "NOT_APPLICABLE", employeeId: null, metaData: {} } // تم تغيير KYG إلى Entity
        };

        if (identityData) existingProfile.individualIdentity = { status: "VERIFIED_INTERNAL", metaData: identityData };
        if (businessData) existingProfile.commercialEntity = { status: "VERIFIED_MERCHANT", taxId: businessData.taxId, metaData: businessData };
        if (governmentData) existingProfile.governmentEntity = { status: "ACTIVE_OFFICIAL", employeeId: governmentData.employeeId, metaData: governmentData };

        this.profiles.set(piWalletAddress, existingProfile);
        return existingProfile;
    }
}
module.exports = UnifiedIdentityRegistry;