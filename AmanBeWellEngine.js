// backend/AmanBeWellEngine.js
// محرك دمج التأمين الساتلي والرعاية الصحية السيادية عبر منصة المقاصة الموحدة

const PiPaymentProcessor = require('./PiPaymentProcessor'); // [إصلاح] تم تصحيح المسار
const YER_TOKENOMICS = require('../YERTokenomicsCanonical'); // [إضافة] استيراد المصدر المركزي

class AmanBeWellEngine {
    constructor() {
        // سجل بوالص التأمين وعقود الرعاية الصحية النشطة في اليمن
        this.insurancePolicies = new Map();

        // [إضافة] حدود قصوى للتوزيع (للتأمين والرعاية الصحية)
        // نفترض أن التأمين والرعاية يتبعان تخصيص المجتمع (30M) أو النظام البيئي (90M).
        // هنا سنستخدم تخصيص المجتمع (30M) كحد أقصى صارم للتعويضات.
        this.maxSettlementCap = YER_TOKENOMICS.allocations.communityPublicUtility; // 30M
        this.totalAmanPayouts = 0n;
        this.totalBeWellSettlements = 0n;
    }

    /**
     * 1. بروتوكول أمان (AMAN): إنشاء عقد تأمين ذكي
     * @param {string} policyId - رقم وثيقة التأمين السيادية
     * @param {string} beneficiaryId - المستفيد
     * @param {number|string} satelliteRiskScore - مؤشر المخاطر الساتلي (1 إلى 10)
     */
    registerAmanPolicy(policyId, beneficiaryId, satelliteRiskScore) {
        // [إصلاح] تحويل آمن إلى BigInt
        const riskScoreBig = BigInt(satelliteRiskScore);
        
        // قاعدة احتساب القسط الأساسي: 50,000 وحدة فرعية مضروبة في مؤشر الخطر
        const basePremiumYer = BigInt(50000) * riskScoreBig;
        
        // [إصلاح] تحديد مبلغ التغطية ضمن حدود التخصيص (30M)
        const maxCoverageYer = this.maxSettlementCap;

        this.insurancePolicies.set(policyId, {
            beneficiaryId,
            satelliteRiskScore: riskScoreBig.toString(),
            premiumYer: basePremiumYer.toString(),
            maxCoverageYer: maxCoverageYer.toString(),
            status: "POLICY_ACTIVE",
            type: "AMAN_SATELLITE_INSURANCE"
        });

        console.log(`[أمان للتأمين] تم تفعيل وثيقة تأمين ساتلية رقم ${policyId} بقسط سيادي: ${basePremiumYer.toString()} وحدة YER.`);
    }

    /**
     * 2. منصة الرعاية (Be-well): معالجة فواتير الحالات الصحية
     */
    processBeWellMedicalSettlement(patientId, hospitalInvoiceYer, exchangeRate) {
        console.log(`[منصة Be-well الصحية] جاري مراجعة الفاتورة الحيوية للمريض: ${patientId}`);
        
        const invoiceBig = BigInt(hospitalInvoiceYer);
        if (invoiceBig <= 0n) throw new Error("قيمة الفاتورة الطبية يجب أن تكون أكبر من الصفر.");

        // [إضافة] التحقق من الحد الأقصى للتوزيع (30M)
        if (this.totalBeWellSettlements + invoiceBig > this.maxSettlementCap) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 30M Community Allocation cap for healthcare.");
        }

        // تقسيم الفاتورة الصحية بنظام 50% نقد محلي و 50% عبر بلوكشين Pi
        const clearingMatrix = PiPaymentProcessor.processHybridInvoice(invoiceBig.toString(), exchangeRate);
        
        // [إضافة] تحديث الإجمالي
        this.totalBeWellSettlements += invoiceBig;

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
     * 3. تفعيل تعويض فوري طارئ (AMAN Payout)
     */
    triggerSatelliteEmergencyPayout(policyId, currentExchangeRate) {
        const policy = this.insurancePolicies.get(policyId);
        if (!policy) throw new Error("وثيقة التأمين غير مسجلة بالنظام.");
        if (policy.status !== "POLICY_ACTIVE") throw new Error("الوثيقة المحددة تم صرف تعويضاتها أو إلغاؤها.");

        const coverageBig = BigInt(policy.maxCoverageYer);

        // [إضافة] التحقق من الحد الأقصى للتوزيع قبل الصرف
        if (this.totalAmanPayouts + coverageBig > this.maxSettlementCap) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 30M Community Allocation cap for insurance payouts.");
        }
        
        // تحويل التعويض الإجمالي الفوري إلى مصفوفة مقاصة هجينة
        const payoutMatrix = PiPaymentProcessor.processHybridInvoice(coverageBig.toString(), currentExchangeRate);

        // [إضافة] تحديث الإجمالي
        this.totalAmanPayouts += coverageBig;

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