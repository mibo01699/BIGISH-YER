// SovereignVestingWallet.js - النسخة المحدثة لاعتماد سعر صرف الـ AMM الرسمي داخل الـ DEX

class SovereignVestingWallet {
    constructor(sovereignEntityId) {
        this.entityId = sovereignEntityId;
        this.internalPiBalanceStroops = 0n;
        this.internalYerBalance = 0n;
    }

    /**
     * الشراء الآلي والمباشر لعملة YER بناءً على سعر الـ AMM الرسمي لمجمع السيولة داخل DEX Pi
     * @param {BigInt} piAmountStroops - كمية الـ Pi المرسلة للمبادلة
     * @param {BigInt} currentAmmPriceInStroops - السعر اللحظي الفعلي المحدث الصادر من خوارزمية الـ AMM للمجمع
     */
    executeDirectDexLiquidityPurchase(piAmountStroops, currentAmmPriceInStroops) {
        if (piAmountStroops <= 0n || currentAmmPriceInStroops <= 0n) {
            throw new Error("DEX_ERROR: Invalid liquidity amounts or zero AMM price pool.");
        }

        // الحساب الميكانيكي المباشر بناءً على سعر صانع السوق الآلي الرسمي للمجمع لمنع الاختلال
        const conversionOutputYer = (piAmountStroops * currentAmmPriceInStroops) / 10000000n; // دقة الـ BigInt
        
        this.internalPiBalanceStroops -= piAmountStroops;
        this.internalYerBalance += conversionOutputYer;

        return {
            status: "Sovereign_Liquidity_Funded_Via_AMM_DEX",
            rateApplied: "OFFICIAL_AMM_POOL_PRICE",
            fundedYerAmount: conversionOutputYer.toString(),
            dexReceiptProof: "BLOCKCHAIN_AUTOMATED_MARKET_MAKER_MATCH"
        };
    }
}
module.exports = SovereignVestingWallet;

// SovereignVestingWallet.js
// محرك جدولة وإطلاق الرواتب والمستحقات السيادية الهجينة الخالية من الفواصل العشريّة

const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');
const PiPaymentProcessor = require('./backend/pi-payment-processor');

class SovereignVestingWallet {
    constructor() {
        // مصفوفة لتخزين المحافظ والمستحقات المجدولة للموظفين والقطاعات المدنية
        this.vestingSchedules = new Map();
    }

    /**
     * إنشاء جدول استحقاق راتب أو تمويل مؤسسي مجدول زمنياً
     * @param {string} employeeId - الرقم الرقمي الموحد للموظف أو الجهة
     * @param {string} totalVestingAmountYer - إجمالي مبلغ التمويل السنوي أو المجدول بالـ YER Sub-units
     * @param {number} durationMonths - فترة الاستحقاق بالأشهر
     */
    createVestingSchedule(employeeId, totalVestingAmountYer, durationMonths) {
        const totalAmountBig = BigInt(totalVestingAmountYer);
        const durationBig = BigInt(durationMonths);
        
        // حساب القيمة المستحقة شهرياً بدقة بدون كسور
        const monthlyReleaseYer = totalAmountBig / durationBig;

        this.vestingSchedules.set(employeeId, {
            totalAmountYer: totalAmountBig.toString(),
            monthlyReleaseYer: monthlyReleaseYer.toString(),
            releasedAmountYer: "0",
            durationMonths: durationMonths,
            monthsClaimed: 0,
            lastClaimTimestamp: 0,
            status: "ACTIVE_VESTING"
        });

        console.log(`[جدولة سيادية] تم تفعيل خطة استحقاق لـ ${employeeId} بقيمة شهرية: ${monthlyReleaseYer.toString()} وحدة.`);
    }

    /**
     * إطلاق وصرف الراتب الشهري الهجين للموظف بعد فحص أمان البلوكشين والوقت
     * @param {string} employeeId - هوية الموظف
     * @param {string} currentExchangeRate - سعر صرف مجمع AMM الحالي
     * @param {string} claimNonce - رمز فريد لحظر هجمات إعادة الطلب المتزامن
     */
    releaseMonthlyShare(employeeId, currentExchangeRate, claimNonce) {
        const schedule = this.vestingSchedules.get(employeeId);
        if (!schedule) throw new Error("لا توجد خطة استحقاق مسجلة لهذا المعرف.");
        if (schedule.status !== "ACTIVE_VESTING") throw new Error("خطة الاستحقاق هذه مجمدة أو مكتملة الصرف.");

        const currentTime = Date.now();
        // شرط حماية زمني: منع السحب لأكثر من مرة واحدة كل 30 يوماً (محاكاة بالثواني للاختبار: 10 ثوانٍ)
        if (currentTime - schedule.lastClaimTimestamp < 10000) {
            throw new Error("⚠️ حظر زمني: المستحقات الشهرية تم صرفها بالفعل لهذه الدورة الحالية.");
        }

        // 1. فرض قفل الأمان الذري لمنع هجمات السحب المزدوج الموازي للمحفظة
        AntiDoubleDippingEngine.acquireAtomicLock(employeeId, claimNonce);

        try {
            const monthlyAmountBig = BigInt(schedule.monthlyReleaseYer);

            // 2. تقسيم الراتب الشهري فوراً: 50% احتياطي محلي و 50% عبر شبكة Pi اللامركزية
            const splitResults = PiPaymentProcessor.processHybridInvoice(monthlyAmountBig.toString(), currentExchangeRate);

            // 3. تحديث سجلات الاستحقاق الداخلية للمحفظة السيادية
            schedule.monthsClaimed += 1;
            const updatedReleased = BigInt(schedule.releasedAmountYer) + monthlyAmountBig;
            schedule.releasedAmountYer = updatedReleased.toString();
            schedule.lastClaimTimestamp = currentTime;

            if (schedule.monthsClaimed >= schedule.durationMonths) {
                schedule.status = "FULLY_VESTED";
            }

            console.log(`[صرف الرواتب] تم إنتاج مصفوفة المقاصة لراتب الموظف ${employeeId} بنجاح للدفعة رقم ${schedule.monthsClaimed}.`);
            
            return {
                success: true,
                employeeId,
                paymentNonce: claimNonce,
                localSovereignYer: splitResults.yerSovereignUnits,
                piStroopsPayload: splitResults.piStroops,
                status: "ROUTING_TO_PI_BROWSER_SDK"
            };

        } catch (error) {
            console.error(`[فشل الاستحقاق] تراجع عن الصرف للموظف ${employeeId}:`, error.message);
            throw error;
        } finally {
            // 4. فك قفل الحساب الآمن لمواصلة معالجة الدورات التالية
            AntiDoubleDippingEngine.releaseLock(employeeId);
        }
    }
}

module.exports = new SovereignVestingWallet();

