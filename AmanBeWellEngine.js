// backend/AmanBeWellEngine.js
// محرك دمج التأمين الساتلي والرعاية الصحية السيادية عبر منصة المقاصة الموحدة

const PiPaymentProcessor = require('./pi-payment-processor');

class AmanBeWellEngine {
    constructor() {
        // سجل بوالص التأمين وعقود الرعاية الصحية النشطة في اليمن
        this.insurancePolicies = new Map();
    }

    /**
     * 1. بروتوكول أمان (AMAN): إنشاء عقد تأمين ذكي يحسب الأقساط بناءً على مستوى خطورة الموقع الجغرافي
     * @param {string} policyId - رقم وثيقة التأمين السيادية
     * @param {string} beneficiaryId - المستفيد (مزارع، صياد، منشأة إمداد لوجستي)
     * @param {number} satelliteRiskScore - مؤشر المخاطر القادم من بيانات الأقمار الصناعية (1 إلى 10)
     */
    registerAmanPolicy(policyId, beneficiaryId, satelliteRiskScore) {
        // قاعدة احتساب القسط الأساسي الحازم بدون فواصل: 50,000 وحدة فرعية مضروبة في مؤشر الخطر الساتلي
        const basePremiumYer = BigInt(50000) * BigInt(satelliteRiskScore);
        
        // مبلغ التغطية الأقصى في حالات الكوارث الطارئة (مثال: 100 مليون وحدة فرعية ثابتة)
        const maxCoverageYer = BigInt(100_000_000);

        this.insurancePolicies.set(policyId, {
            beneficiaryId,
            satelliteRiskScore,
            premiumYer: basePremiumYer.toString(),
            maxCoverageYer: maxCoverageYer.toString(),
            status: "POLICY_ACTIVE",
            type: "AMAN_SATELLITE_INSURANCE"
        });

        console.log(`[أمان للتأمين] تم تفعيل وثيقة تأمين ساتلية رقم ${policyId} بقسط سيادي: ${basePremiumYer.toString()} وحدة YER.`);
    }

    /**
     * 2. منصة الرعاية (Be-well): معالجة فواتير الحالات الصحية والمستشفيات العابرة للحدود وتوزيع قيمتها هجيناً
     * @param {string} patientId - الهوية الرقمية للمريض
     * @param {string} hospitalInvoiceYer - إجمالي تكلفة العلاج الطبي بالـ YER الفرعي
     * @param {string} exchangeRate - سعر صرف مجمع السيولة الحالي لـ Pi
     */
    processBeWellMedicalSettlement(patientId, hospitalInvoiceYer, exchangeRate) {
        console.log(`[منصة Be-well الصحية] جاري مراجعة الفاتورة الحيوية للمريض: ${patientId}`);
        
        const invoiceBig = BigInt(hospitalInvoiceYer);
        if (invoiceBig <= 0n) throw new Error("قيمة الفاتورة الطبية يجب أن تكون أكبر من الصفر.");

        // تقسيم الفاتورة الصحية فوراً بنظام 50% نقد مستقر لتغطية التكاليف المحلية و 50% سداد عبر بلوكشين Pi
        const clearingMatrix = PiPaymentProcessor.processHybridInvoice(invoiceBig.toString(), exchangeRate);

        return {
            patientId,
            protocol: "BE_WELL_HEALTHCARE_MATRIX",
            localYerCovered: clearingMatrix.yerSovereignUnits,
            piStroopsCovered: clearingMatrix.piStroops,
            timestamp: Date.now(),
            status: "HEALTH_CREDIT_COMPILED"
        };
    }

    /**
     * 3. تفعيل تعويض فوري طارئ (AMAN Payout) إثر الكشف الساتلي عن اضطراب إمداد أو كارثة طبيعية
     */
    triggerSatelliteEmergencyPayout(policyId, currentExchangeRate) {
        const policy = this.insurancePolicies.get(policyId);
        if (!policy) throw new Error("وثيقة التأمين غير مسجلة بالنظام.");
        if (policy.status !== "POLICY_ACTIVE") throw new Error("الوثيقة المحددة تم صرف تعويضاتها أو إلغاؤها.");

        console.log(`🚨 [إنذار ساتلي AMAN] تم رصد إشارات الخطر الساتلية لوثيقة التأمين رقم: ${policyId}. يتم معالجة التعويض الفوري...`);

        const coverageBig = BigInt(policy.maxCoverageYer);
        
        // تحويل التعويض الإجمالي الفوري إلى مصفوفة مقاصة هجينة دون ضياع أي سنت أو Stroop
        const payoutMatrix = PiPaymentProcessor.processHybridInvoice(coverageBig.toString(), currentExchangeRate);

        policy.status = "COMPENSATED_AND_CLOSED";
        policy.payoutTimestamp = Date.now();

        return {
            policyId,
            beneficiaryId: policy.beneficiaryId,
            payoutYerAmount: payoutMatrix.yerSovereignUnits,
            payoutPiStroops: payoutMatrix.piStroops,
            status: "EMERGENCY_ESCROW_RELEASED"
        };
    }
}

module.exports = new AmanBeWellEngine();
