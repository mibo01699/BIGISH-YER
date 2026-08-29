/**
 * BIGISH-YER - Hybrid Payment & Tokenomics Smart Contract
 * NOTE: Sandbox/Testnet integration layer only. No claims of official Pi Network Protocol or PiRC1 compliance.
 */

const YER_TOKENOMICS = require('./YERTokenomicsCanonical'); // المصدر المركزي (300M)

class YERTokenContract {
    constructor() {
        this.tokenName = "Yemen Economic Recovery Token";
        this.ticker = "YER";
        this.totalSupply = 0n; // BigInt
        this.piDexLiquidityPool = 0n; // BigInt
        this.balances = {}; // { address: BigInt }
        this.isLaunched = false;
    }

    initializeLaunchpad(developerApiKey) {
        if (!developerApiKey) throw new Error("API Key required.");
        this.isLaunched = true;
        console.log("YER Launchpad initialized successfully (Sandbox Mode).");
    }

    async purchaseAndLockLiquidity(buyerPiUser, piAmountStr) {
        if (!this.isLaunched) throw new Error("Token launchpad is not active yet.");
        
        // تحويل آمن من نص إلى BigInt (منع الأخطاء العائمة)
        const piAmount = BigInt(piAmountStr);
        if (piAmount <= 0n) throw new Error("Invalid Pi amount.");

        try {
            // استخدام محاكاة الدفع بدلاً من PiSDK الرسمي (لا ندعي الوصول الرسمي)
            const paymentResult = { status: "completed", txid: "sandbox_tx_" + Date.now() };

            if (paymentResult.status === "completed") {
                this.piDexLiquidityPool += piAmount;
                
                // استخدام سعر صرف افتراضي (أو تمريره كمعامل) مع الحفاظ على BigInt
                const rate = 100n; 
                const yerToMint = piAmount * rate;

                // فحص صارم للسقف الأقصى (300M) قبل السك
                if (this.totalSupply + yerToMint > YER_TOKENOMICS.maximumSupply) {
                    throw new Error("SUPPLY_CAP_ERROR: Cannot exceed 300M YER Maximum Supply.");
                }

                this.totalSupply += yerToMint;
                this.balances[buyerPiUser] = (this.balances[buyerPiUser] || 0n) + yerToMint;

                return {
                    success: true,
                    txId: paymentResult.txid,
                    mintedYER: yerToMint.toString(),
                    message: "Pi locked into DEX Pool. YER minted safely."
                };
            }
        } catch (error) {
            console.error("Payment Failed: Sandbox restriction enforced.", error);
            return { success: false, error: error.message };
        }
    }

    distributeAidOrPayroll(senderAdmin, recipientPiUser, amountYER) {
        const amountBig = BigInt(amountYER); // تحويل آمن

        if (!this.balances[senderAdmin] || this.balances[senderAdmin] < amountBig) {
            throw new Error("Insufficient YER balance in the treasury.");
        }
        this.balances[senderAdmin] -= amountBig;
        this.balances[recipientPiUser] = (this.balances[recipientPiUser] || 0n) + amountBig;
        
        // إزالة ادعاء KYC الرسمي واستخدام مصطلحات محايدة
        console.log(`[Distribution] ${amountBig.toString()} YER sent to supported user: ${recipientPiUser}`);
        return { success: true, timestamp: Date.now() };
    }
}

module.exports = YERTokenContract;