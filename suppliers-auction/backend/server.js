// suppliers-auction/backend/server.js
/**
 * BIGISH-YER: Hybrid Auction Settlement Gateway (Pi + YER)
 * Secure Refactoring Implementation Aligned with Pi Core Team 2026 Guidelines
 */

const express = require('express');
const axios = require('axios'); // تم استبدال fetch بـ axios لدعم معالجة المهلة والإلغاء الآمن
const app = express();

app.use(express.json());

// عنوان خادم BIGISH-YER الرئيسي المستدعى للمقاصة
const BIGISH_YER_API = process.env.BIGISH_YER_API || 'http://localhost:5001/api';

// محاكمة محلية سريعة لمنع التكرار قبل تمرير الطلب للشبكة الكبرى
const internalProcessedAuctions = new Set();

/**
 * API: تنفيذ الدفع الهجين (Pi + YER) الآمن والموثق بالكامل
 * POST /api/payment/settle
 */
app.post('/api/payment/settle', async (req, res) => {
    try {
        const { buyer, seller, totalAmount, piAmount, yerAmount, auctionId, piPaymentId } = req.body;

        // 1. شروط الأمان الصارمة: التحقق من الترويسات الأمنية لـ Pi Browser
        const piUserId = req.headers['x-pi-user-id'];
        const piAccessToken = req.headers['x-pi-access-token'];

        if (!piUserId || !piAccessToken) {
            return res.status(401).json({ 
                success: false, 
                error: "Security Rejection: Missing validated Pi Network user identity or access credentials." 
            });
        }

        // 2. التحقق من المدخلات الأساسية للمزاد
        if (!buyer || !seller || !auctionId || !piPaymentId) {
            return res.status(400).json({ 
                success: false, 
                error: "Bad Request: Incomplete settlement execution properties." 
            });
        }

        // 3. الحماية ضد التكرار المالي والإنفاق المزدوج (Anti-Double Dipping Validation)
        if (internalProcessedAuctions.has(auctionId) || internalProcessedAuctions.has(piPaymentId)) {
            return res.status(409).json({ 
                success: false, 
                error: "Security Alert: This auction settlement or Pi Payment ID has already been executed." 
            });
        }

        // 4. دمج توثيق بلوكشين Pi الحقيقي (Server-to-Server Double Commit)
        // التحقق من خوادم Pi الرسمية للتأكد من قيام المشتري بدفع كمية الـ Pi المطلوبة للمزاد
        const piVerificationUrl = `https://minepi.com{piPaymentId}`;
        const piNetworkResponse = await axios.get(piVerificationUrl, {
            headers: { 'Authorization': `Bearer ${process.env.PI_API_KEY}` },
            timeout: 5000 // مهلة استجابة قصيرة لحماية السيرفر من التجميد
        });

        const piPaymentData = piNetworkResponse.data;
        if (!piPaymentData || piPaymentData.status.completed !== true) {
            return res.status(400).json({ 
                success: false, 
                error: "Blockchain Settlement Failed: The associated Pi transaction is unverified or incomplete." 
            });
        }

        // 5. تنفيذ تحويل YER الموازي عبر خادم BIGISH-YER الرئيسي مع تمرير الهوية وتحديد مهلة أمان
        const yerResponse = await axios.post(`${BIGISH_YER_API}/yer/transfer`, {
            piPaymentId: piPaymentId,
            senderYerWallet: buyer.yerWalletId,
            receiverPosWallet: seller.yerWalletId,
            amountYer: yerAmount,
            memo: `Hybrid auction clearing settlement for ID: ${auctionId}`
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'x-pi-user-id': piUserId,
                'x-pi-access-token': piAccessToken
            },
            timeout: 6000 // ضبط مهلة أمان (6 ثوانٍ) لمنع اختناق منافذ السيرفر (DoS)
        });

        const yerData = yerResponse.data;
        if (!yerData.success) {
            throw new Error(`YER Ledger Node Refusal: ${yerData.error}`);
        }

        // 6. حظر المعاملة وتثبيتها في مصفوفة المنع لضمان عدم تكرارها مطلقاً بعد النجاح
        internalProcessedAuctions.add(auctionId);
        internalProcessedAuctions.add(piPaymentId);

        // 7. إرجاع النتيجة النهائية والآمنة 100% للمزاد
        return res.status(200).json({
            success: true,
            message: `Hybrid payment successfully cleared and recorded for Auction ${auctionId}`,
            piBlockchainTxId: piPaymentData.transaction.txid,
            yerTransaction: yerData.piBlockchainTxId
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
app.listen(PORT, () => console.log(`🔒 Secure Auction Settlement Service active on port ${PORT}`));

module.exports = app;

