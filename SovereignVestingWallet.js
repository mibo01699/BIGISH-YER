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

/**
 * @file SovereignVestingWallet.js
 * @description العقد الذكي والمنطق الحاكم لـ 90% من معروض YER الموجه لمنصة إطلاق Pi ومجمعات السيولة السيادية.
 */

class SovereignVestingWallet {
    constructor() {
        this.YER_SCALE = 10000000000n; // دقة 10 خانات عشرية لعملة YER
        this.TOTAL_SUPPLY = 100000000n * this.YER_SCALE; // 100 مليون المعروض الكلي

        // التخصيص الصارم للـ 90 مليون YER المقاسة بالوحدات الصغرى (BigInt)
        this.LIQUIDITY_POOL_ALLOCATION = 40000000n * this.YER_SCALE; // 40 مليون للسيولة
        this.LAUNCHPAD_IDO_ALLOCATION  = 30000000n * this.YER_SCALE; // 30 مليون للاكتتاب
        this.STAKING_MINING_ALLOCATION = 20000000n * this.YER_SCALE; // 20 مليون لمكافآت السيولة

        // سجلات تتبع الصرف البرميجي الحالي لضمان عدم تجاوز السقف
        this.releasedLiquidity = 0n;
        this.releasedIdo = 0n;
        this.releasedStaking = 0n;

        // قفل زمني لحماية المستثمرين (مثال: فتح تدريجي شهري بنسبة 5% لرموز الاكتتاب)
        this.idoReleaseRatePercent = 5n; 
    }

    /**
     * تحرير وتأمين رموز الاكتتاب الموجهة لمنصة إطلاق Pi (Pi Launchpad)
     * @param {bigint} requestedAmount المبلغ المطلوب سحبه لمنصة الإطلاق
     * @param {boolean} isKycVerified شرط تحقق الهوية الصارم من شبكة Pi
     * @returns {string} القيمة المحررة الفورية بالوحدات الصغرى
     */
    releaseLaunchpadTokens(requestedAmount, isKycVerified) {
        // الشرط السيادي الأول: يجب أن يكون المستخدم أو المنصة مستوفية لشروط الـ KYC
        if (!isKycVerified) {
            throw new Error("خطأ حوكمة: لا يمكن سحب رموز الاكتتاب دون توثيق الهوية KYC المعتمد من شبكة Pi.");
        }

        // الشرط الثاني: عدم تجاوز سقف الـ 30 مليون المخصصة للاكتتاب
        if (this.releasedIdo + requestedAmount > this.LAUNCHPAD_IDO_ALLOCATION) {
            throw new Error("حظر برميجي: الكمية المطلوبة تتجاوز السقف المخصص للعرض الأولي على Pi Launchpad.");
        }

        this.releasedIdo += requestedAmount;
        return requestedAmount.toString();
    }

    /**
     * ضخ السيولة الفورية لتثبيت السوق وتفعيل ميزة الدفع الهجين المرن
     * @param {bigint} amount القيمة المراد حقنها في مجمع المقاصة (DEX)
     * @returns {string} القيمة المحقونة بالوحدات الصغرى
     */
    injectLiquidityPool(amount) {
        if (this.releasedLiquidity + amount > this.LIQUIDITY_POOL_ALLOCATION) {
            throw new Error("حظر سيادي: تم استنفاد كامل الحصة المخصصة لعمق مجمعات السيولة.");
        }

        this.releasedLiquidity += amount;
        return amount.toString();
    }

    /**
     * صرف مكافآت التعدين الهيدروليكي المرن المحكوم بواسطة الـ DynamicMiningGovernor
     * @param {bigint} amount الحصة اللحظية المحسوبة بواسطة محرك الحوكمة
     * @returns {bigint} الحصة المصروفة فعلياً للمعدنين
     */
    disburseMiningReward(amount) {
        if (this.releasedStaking + amount > this.STAKING_MINING_ALLOCATION) {
            // في حال نفاذ الـ 20 مليون المخصصة لتعدين السيولة، يتم تصفير الصرف والاعتماد بالكامل على رسوم الدفع الهجين
            return 0n;
        }

        this.releasedStaking += amount;
        return amount;
    }
}

module.exports = SovereignVestingWallet;


