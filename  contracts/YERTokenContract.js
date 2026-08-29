// SovereignVestingWallet.js
// الإصدار الموحد (Class واحدة + Export واحد) - متوافق مع 300M YER Tokenomics
// يعتمد على المصدر المركزي (يجب إنشاء ملف YERTokenomicsCanonical.js كما في المرحلة 3)

const AntiDoubleDippingEngine = require('./AntiDoubleDippingEngine');
const PiPaymentProcessor = require('./backend/pi-payment-processor');
const YER_TOKENOMICS = require('./YERTokenomicsCanonical'); // المصدر المركزي الجديد

class SovereignVestingWallet {
    constructor(entityId = "AEC_SOVEREIGN_ENTITY") {
        this.entityId = entityId;
        this.YER_SCALE = 10000000000n; // دقة 10 خانات عشرية

        // المصدر الاقتصادي الحقيقي (يتم استيراده من الملف المركزي)
        this.MAX_SUPPLY = YER_TOKENOMICS.maximumSupply; // 300M
        this.COMMUNITY_ALLOCATION = YER_TOKENOMICS.allocations.communityPublicUtility; // 30M
        this.ECOSYSTEM_ALLOCATION = YER_TOKENOMICS.allocations.ecosystemLaunchLiquidity; // 90M
        this.RESERVE_ALLOCATION = YER_TOKENOMICS.allocations.aecSovereignReserve; // 180M

        // المحافظ الداخلية
        this.internalPiBalanceStroops = 0n;
        this.internalYerBalance = 0n;

        // سجلات التتبع والتخصيص الفعلي (تبدأ من الصفر، لأنها لم تُسك بعد)
        this.currentMintedSupply = 0n;
        this.releasedCommunity = 0n;
        this.releasedEcosystem = 0n;
        this.releasedReserve = 0n;

        // سجلات الرواتب والاستحقاق
        this.vestingSchedules = new Map();
    }

    /**
     * (الوظيفة 1) الشراء المباشر من DEX - لا يزال يستخدم لضخ السيولة في مجمع AMM
     * @param {BigInt} piAmountStroops 
     * @param {BigInt} currentAmmPriceInStroops 
     */
    executeDirectDexLiquidityPurchase(piAmountStroops, currentAmmPriceInStroops) {
        if (piAmountStroops <= 0n || currentAmmPriceInStroops <= 0n) {
            throw new Error("DEX_ERROR: Invalid liquidity amounts or zero AMM price pool.");
        }
        // فحص سقف الـ 90M للسيولة
        if (this.releasedEcosystem + piAmountStroops > this.ECOSYSTEM_ALLOCATION) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Cannot allocate more than 90M to Ecosystem Liquidity.");
        }

        const conversionOutputYer = (piAmountStroops * currentAmmPriceInStroops) / 10000000n;
        
        this.internalPiBalanceStroops -= piAmountStroops;
        this.internalYerBalance += conversionOutputYer;
        this.releasedEcosystem += conversionOutputYer;

        return {
            status: "Sovereign_Liquidity_Funded_Via_AMM_DEX",
            rateApplied: "OFFICIAL_AMM_POOL_PRICE",
            fundedYerAmount: conversionOutputYer.toString(),
            dexReceiptProof: "BLOCKCHAIN_AUTOMATED_MARKET_MAKER_MATCH"
        };
    }

    /**
     * (الوظيفة 2) إنشاء جدول استحقاق الرواتب
     */
    createVestingSchedule(employeeId, totalVestingAmountYer, durationMonths) {
        const totalAmountBig = BigInt(totalVestingAmountYer);
        const durationBig = BigInt(durationMonths);
        
        if (totalAmountBig > this.COMMUNITY_ALLOCATION) {
             throw new Error("SOVEREIGN_LIMIT_ERROR: Vesting amount exceeds 30M Community Allocation.");
        }

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
     * (الوظيفة 2) صرف الراتب مع الحماية الزمنية ومنع السحب المزدوج
     */
    releaseMonthlyShare(employeeId, currentExchangeRate, claimNonce) {
        const schedule = this.vestingSchedules.get(employeeId);
        if (!schedule) throw new Error("لا توجد خطة استحقاق مسجلة لهذا المعرف.");
        if (schedule.status !== "ACTIVE_VESTING") throw new Error("خطة الاستحقاق هذه مجمدة أو مكتملة الصرف.");

        const currentTime = Date.now();
        if (currentTime - schedule.lastClaimTimestamp < 10000) {
            throw new Error("⚠️ حظر زمني: المستحقات الشهرية تم صرفها بالفعل لهذه الدورة الحالية.");
        }

        // قفل ذري لمنع الـ Double-Dipping
        AntiDoubleDippingEngine.acquireAtomicLock(employeeId, claimNonce);

        try {
            const monthlyAmountBig = BigInt(schedule.monthlyReleaseYer);
            // منع تجاوز السقف الإجمالي للـ Community (30M)
            if (this.releasedCommunity + monthlyAmountBig > this.COMMUNITY_ALLOCATION) {
                throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 30M Community Allocation cap.");
            }

            const splitResults = PiPaymentProcessor.processHybridInvoice(monthlyAmountBig.toString(), currentExchangeRate);

            schedule.monthsClaimed += 1;
            const updatedReleased = BigInt(schedule.releasedAmountYer) + monthlyAmountBig;
            schedule.releasedAmountYer = updatedReleased.toString();
            this.releasedCommunity += monthlyAmountBig; // تحديث المصروف الفعلي
            schedule.lastClaimTimestamp = currentTime;

            if (schedule.monthsClaimed >= schedule.durationMonths) {
                schedule.status = "FULLY_VESTED";
            }

            return { success: true, employeeId, paymentNonce: claimNonce, localSovereignYer: splitResults.yerSovereignUnits, piStroopsPayload: splitResults.piStroops };

        } catch (error) {
            throw error;
        } finally {
            AntiDoubleDippingEngine.releaseLock(employeeId);
        }
    }

    /**
     * (الوظيفة 3) إطلاق رموز الـ Community / Launchpad (بدلاً من التعدين القديم)
     * @param {BigInt} requestedAmount 
     * @param {boolean} isKycVerified 
     */
    releaseLaunchpadTokens(requestedAmount, isKycVerified) {
        if (!isKycVerified) {
            throw new Error("خطأ حوكمة: لا يمكن سحب رموز الاكتتاب دون توثيق الهوية KYC.");
        }
        if (this.releasedCommunity + requestedAmount > this.COMMUNITY_ALLOCATION) {
            throw new Error("حظر برمجي: الكمية المطلوبة تتجاوز السقف المخصص (30M).");
        }
        this.releasedCommunity += requestedAmount;
        return requestedAmount.toString();
    }

    /**
     * (الوظيفة 3) صرف من احتياطي A.E.C (180M)
     * تم استبدال `disburseMiningReward` بـ `disburseSovereignReserve` لعدم وجود تعدين بعد الآن
     */
    disburseSovereignReserve(amount) {
        if (this.releasedReserve + amount > this.RESERVE_ALLOCATION) {
            throw new Error("SOVEREIGN_LIMIT_ERROR: Exceeds 180M Reserve cap.");
        }
        this.releasedReserve += amount;
        return amount.toString();
    }
}

// تصدير واحد فقط، مع السماح بإنشاء نسخ جديدة
module.exports = SovereignVestingWallet;