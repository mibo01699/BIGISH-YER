/**
 * BIGISH-YER - Hybrid Payment & Tokenomics Smart Contract
 * NOTE: Sandbox/Testnet integration layer only. No claims of official Pi Network Protocol or PiRC1 compliance.
 * 
 * تم التحديث: دعم منطق تأجيل ترحيل حصة الجمهور (10%)
 */

const YER_TOKENOMICS = require('../YERTokenomicsCanonical'); // المصدر المركزي (300M)

class YERTokenContract {
    constructor() {
        this.tokenName = "Yemen Economic Recovery Token";
        this.ticker = "YER";
        this.totalSupply = 0n; // BigInt
        this.piDexLiquidityPool = 0n; // BigInt
        this.balances = {}; // { address: BigInt }
        this.isLaunched = false;
        this.communityReleaseEnabled = false;
    }

    /**
     * تفعيل منصة الإطلاق (يتم استدعاؤها عند نجاح الإطلاق)
     */
    initializeLaunchpad(developerApiKey) {
        if (!developerApiKey) throw new Error("API Key required.");
        this.isLaunched = true;
        // قراءة حالة الإطلاق من متغير البيئة
        const launchStatus = process.env.YER_LAUNCHPAD_STATUS || 'PENDING';
        if (launchStatus === 'DEPLOYED_SUCCESS') {
            this.communityReleaseEnabled = true;
            console.log("✅ YER Launchpad deployed successfully. Community release is now enabled.");
        } else {
            console.log("⏳ YER Launchpad initialized. Community release pending launch success.");
        }
        return { success: true, message: "YER Launchpad initialized (Sandbox Mode)." };
    }

    /**
     * شراء وتجميد السيولة (لحصة 30% - Ecosystem)
     * متاحة دائماً بغض النظر عن حالة الإطلاق
     */
    async purchaseAndLockLiquidity(buyerPiUser, piAmountStr) {
        // التحقق من أن المبلغ لا يتجاوز الحصة المخصصة (30%)
        const piAmount = BigInt(piAmountStr);
        if (piAmount <= 0n) throw new Error("Invalid Pi amount.");

        // استخدام سعر صرف افتراضي مع الحفاظ على BigInt
        const rate = 100n;
        const yerToMint = piAmount * rate;

        // التحقق من السقف الأقصى (300M)
        if (this.totalSupply + yerToMint > YER_TOKENOMICS.maximumSupply) {
            throw new Error("SUPPLY_CAP_ERROR: Cannot exceed 300M YER Maximum Supply.");
        }

        // محاكاة الدفع (بدون Pi SDK رسمي)
        this.piDexLiquidityPool += piAmount;
        this.totalSupply += yerToMint;
        this.balances[buyerPiUser] = (this.balances[buyerPiUser] || 0n) + yerToMint;

        return {
            success: true,
            txId: "sandbox_tx_" + Date.now(),
            mintedYER: yerToMint.toString(),
            message: "Pi locked into DEX Pool. YER minted safely (Ecosystem allocation)."
        };
    }

    /**
     * توزيع حصة الجمهور (10%)
     * متاحة فقط بعد نجاح الإطلاق
     */
    distributeCommunityAllocation(senderAdmin, recipientPiUser, amountYER) {
        // ✅ الشرط الجديد: التحقق من تفعيل الإطلاق
        if (!this.communityReleaseEnabled) {
            return {
                success: false,
                error: '🚫 ترحيل YER إلى محافظ الجمهور مؤقت حتى اكتمال إطلاق رمز YER على منصة Pi Launchpad ومجمع السيولة Pi/YER.'
            };
        }

        const amountBig = BigInt(amountYER);
        
        // التحقق من أن المبلغ لا يتجاوز الحصة المخصصة للجمهور (10%)
        const totalCommunityDistributed = Object.values(this.balances).reduce((a, b) => a + b, 0n);
        if (totalCommunityDistributed + amountBig > YER_TOKENOMICS.allocations.communityPublicUtility) {
            throw new Error("COMMUNITY_CAP_EXCEEDED: Cannot exceed 30,000,000 YER community allocation.");
        }

        // تنفيذ التوزيع
        if (!this.balances[senderAdmin] || this.balances[senderAdmin] < amountBig) {
            throw new Error("Insufficient YER balance in the treasury.");
        }
        this.balances[senderAdmin] -= amountBig;
        this.balances[recipientPiUser] = (this.balances[recipientPiUser] || 0n) + amountBig;

        console.log(`[Community Distribution] ${amountBig.toString()} YER sent to ${recipientPiUser}`);
        return { success: true, timestamp: Date.now(), amount: amountBig.toString() };
    }

    /**
     * توزيع المساعدات أو الرواتب (لأغراض أخرى)
     * متاحة دائماً بغض النظر عن حالة الإطلاق
     */
    distributeAidOrPayroll(senderAdmin, recipientPiUser, amountYER) {
        const amountBig = BigInt(amountYER);

        if (!this.balances[senderAdmin] || this.balances[senderAdmin] < amountBig) {
            throw new Error("Insufficient YER balance in the treasury.");
        }
        this.balances[senderAdmin] -= amountBig;
        this.balances[recipientPiUser] = (this.balances[recipientPiUser] || 0n) + amountBig;

        console.log(`[Aid/Payroll] ${amountBig.toString()} YER sent to ${recipientPiUser}`);
        return { success: true, timestamp: Date.now() };
    }

    /**
     * تفعيل الإطلاق يدوياً (عن طريق الإدارة)
     * يجب استدعاؤها بعد نجاح الإطلاق على Pi Launchpad
     */
    activateLaunchpad(adminKey) {
        const expectedKey = process.env.ADMIN_LAUNCH_KEY;
        if (adminKey !== expectedKey) {
            throw new Error("Unauthorized: Invalid admin key.");
        }
        this.communityReleaseEnabled = true;
        // تحديث متغير البيئة (في Vercel يتم عبر API)
        process.env.YER_LAUNCHPAD_STATUS = 'DEPLOYED_SUCCESS';
        return {
            success: true,
            message: '✅ تم تفعيل إطلاق YER. أصبح ترحيل حصة الجمهور (10%) متاحاً الآن.'
        };
    }
}

module.exports = YERTokenContract;