// suppliers-auction/backend/server.js
/**
 * BIGISH-YER: Hybrid Auction Settlement Gateway (Sandbox)
 * NOTE: Local Sandbox validation only. No access to Pi Mainnet. No claims of official Pi integration.
 */

const express = require('express');
const app = express();

// المحركات الداخلية للحماية والتوزيع
const AntiDoubleDippingEngine = require('../../../AntiDoubleDippingEngine');
const DynamicRatioValidator = require('../../../DynamicRatioValidator');
const YER_TOKENOMICS = require('../../../YERTokenomicsCanonical');

app.use(express.json());

// محاكاة محلية سريعة لمنع التكرار (بدلاً من الاتصال بالشبكة)
const internalProcessedAuctions = new Set();
const validator = new DynamicRatioValidator();

/**
 * API: تنفيذ الدفع الهجين (Sandbox) - تحويل المبالغ إلى BigInt
 * POST /api/payment/settle
 */
app.post('/api/payment/settle', async (req, res) => {
    try {
        const { buyer, seller, totalAmount, piAmount, yerAmount, auctionId, piPaymentId } = req.body;

        // 1. التحقق من المدخلات الأساسية
        if (!buyer || !seller || !auctionId || !piPaymentId) {
            return res.status(400).json({ 
                success: false, 
                error: "Bad Request: Incomplete settlement execution properties." 
            });
        }

        // 2. تحويل جميع المبالغ إلى نصوص و BigInt (منع الأخطاء العائمة)
        if (typeof totalAmount !== 'string' || typeof piAmount !== 'string' || typeof yerAmount !== 'string') {
            return res.status(400).json({ success: false, error: "Invalid Amount Types: Amounts must be strings." });
        }

        const totalBig = BigInt(totalAmount);
        const piBig = BigInt(piAmount);
        const yerBig = BigInt(yerAmount);

        // 3. التحقق من أن Pi + YER = Total (باستخدام محرك النسب)
        const splitCheck = validator.validateAndSplit(totalBig, Number(piBig * 100n / totalBig), Number(yerBig * 100n / totalBig));
        if (!splitCheck) {
            return res.status(400).json({ success: false, error: "Ratio Mismatch: Pi and YER amounts do not sum to total." });
        }

        // 4. الحماية ضد التكرار المالي (Anti-Double Dipping)
        if (internalProcessedAuctions.has(auctionId) || internalProcessedAuctions.has(piPaymentId)) {
            return res.status(409).json({ 
                success: false, 
                error: "Security Alert: This auction settlement or Pi Payment ID has already been executed." 
            });
        }

        // 5. القفل الذري للمعاملة (محاكاة)
        AntiDoubleDippingEngine.acquireAtomicLock(`auction-${auctionId}`, piPaymentId);

        // 6. التحقق من سقف 300M (لا يمكن تجاوز المعروض الكلي)
        const currentSupply = BigInt(YER_TOKENOMICS.maximumSupply);
        // في الوضع الحقيقي، يجب قراءة الرصيد الفعلي، هنا نتحقق منطقياً من أن المبلغ لا يتجاوز السقف
        if (yerBig > currentSupply) {
            throw new Error("SUPPLY_CAP_ERROR: Cannot allocate more than 300M YER.");
        }

        // 7. محاكاة نجاح عملية التحويل (بدون الاتصال بـ Pi)
        console.log(`[Sandbox] Simulating hybrid settlement for auction ${auctionId}`);
        
        // 8. تثبيت المعاملة
        internalProcessedAuctions.add(auctionId);
        internalProcessedAuctions.add(piPaymentId);

        // 9. تحرير القفل بعد النجاح
        AntiDoubleDippingEngine.releaseLock(`auction-${auctionId}`, piPaymentId);

        // 10. إرجاع النتيجة النهائية
        return res.status(200).json({
            success: true,
            message: `Hybrid payment successfully cleared and recorded for Auction ${auctionId} (Sandbox)`,
            piBlockchainTxId: `sandbox_pi_tx_${piPaymentId}`,
            yerTransaction: `sandbox_yer_tx_${auctionId}`
        });

    } catch (error) {
        console.error('Critical Hybrid Payment Execution Error:', error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Ledger Routing Timeout: Please contact the macro-operations desk." 
        });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🔒 Secure Auction Settlement Service (Sandbox) active on port ${PORT}`));

module.exports = app;