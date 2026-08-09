// server/routes/yerTransfer.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // تستخدم للتحقق من واجهات برمجيات Pi الرسمية

// استيراد محرك منع التكرار المالي الموجود في مستودع مشروعك لمنع الاحتيال
const AntiDoubleDippingEngine = require('../AntiDoubleDippingEngine'); 

// محاكاة لقاعدة بيانات ليدجر المستودع BIGISH-YER
const ledgerDatabase = {
    checkWalletExists: async (address) => true,
    saveTransaction: async (txData) => {
        console.log("Ledger: Transmitted to internal economic stabilization database.", txData);
        return { success: true, ledgerIndex: Math.floor(Math.random() * 100000) };
    }
};

/**
 * @route   POST /api/yer/transfer
 * @desc    تنفيذ طلب تسوية المقاصة والتحويل الموازي بين المحافظ ونقاط البيع (AJYAL -> GAV)
 * @access  Protected via Pi SDK Network Identity Validation
 */
router.post('/api/yer/transfer', async (req, res) => {
    const { 
        piPaymentId,      // معرف عملية الدفع الذي تم إنشاؤه عبر الدالة Pi.createPayment في الفرونت إند
        senderYerWallet,  // محفظة الـ YER الرقمية الخاصة بالمرسل (تطبيق AJYAL)
        receiverPosWallet,// محفظة الـ YER الرقمية الخاصة بنقطة البيع المستفيدة (تطبيق GAV)
        amountYer,        // القيمة المطلوب تسويتها برمز YER الموازي
        memo 
    } = req.body;

    // 1. التحقق من وجود الترويسة الأمنية ومعرف هوية مستخدم شبكة Pi
    const piUserId = req.headers['x-pi-user-id'];
    const piAccessToken = req.headers['x-pi-access-token']; // التوكن السري الممرر من متصفح Pi Browser

    if (!piUserId || !piAccessToken) {
        return res.status(401).json({ 
            success: false, 
            error: "Unauthorized: Missing core Pi Network identity verification parameters." 
        });
    }

    // 2. التحقق من اكتمال مدخلات التسوية الاقتصادية لـ YER
    if (!piPaymentId || !senderYerWallet || !receiverPosWallet || !amountYer) {
        return res.status(400).json({ 
            success: false, 
            error: "Bad Request: Missing clearing details (Payment ID, Wallets, or Amount)." 
        });
    }

    try {
        // 3. تطبيق شروط Pi Core Team الصارمة لعام 2026: التحقق الثنائي من السيرفر (Server-to-Server Double Commit)
        // نقوم بإرسال طلب لخوادم Pi Network الرسمية للتأكد من أن الـ piPaymentId حقيقي وتم دفعه للمشروع بنجاح
        const piVerificationUrl = `https://minepi.com{piPaymentId}`;
        
        const piNetworkResponse = await axios.get(piVerificationUrl, {
            headers: { 'Authorization': `Bearer ${process.env.PI_API_KEY}` } // مفتاح المطور السري لتطبيقك
        });

        const piPaymentData = piNetworkResponse.data;

        // التأكد من أن الدفعة الموثقة على البلوكشين مكتملة ومتطابقة
        if (!piPaymentData || piPaymentData.status.completed !== true) {
            return res.status(400).json({ 
                success: false, 
                error: "Blockchain Verification Failed: Pi payment is not approved or incomplete." 
            });
        }

        // 4. الحماية ضد التلاعب بالتكرار المالي والإنفاق المزدوج (Anti-Double Dipping Validation)
        const isTxUnique = await AntiDoubleDippingEngine.verifyTransactionUniqueness(piPaymentId);
        if (!isTxUnique) {
            return res.status(409).json({ 
                success: false, 
                error: "Security Alert: Duplicate settlement attempt blocked by AntiDoubleDippingEngine." 
            });
        }

        // 5. التحقق من سلامة وصلاحية محافظ YER الرقمية في اليمن (تكامل أطراف AJYAL و GAV)
        const isSenderValid = await ledgerDatabase.checkWalletExists(senderYerWallet);
        const isReceiverValid = await ledgerDatabase.checkWalletExists(receiverPosWallet);

        if (!isSenderValid || !isReceiverValid) {
            return res.status(422).json({ 
                success: false, 
                error: "Settlement Failed: Invalid local economic infrastructure wallet routing addresses." 
            });
        }

        // 6. تنفيذ التسوية وحفظ المعاملة في ليدجر نظام الاستقرار الكلي للمستودع
        const transactionPayload = {
            pi_payment_id: piPaymentId,
            pi_user_uid: piUserId,
            sender_yer: senderYerWallet,
            receiver_yer: receiverPosWallet,
            amount_yer: amountYer,
            status: "SETTLED",
            timestamp: new Date()
        };

        const ledgerResult = await ledgerDatabase.saveTransaction(transactionPayload);

        // 7. الرد بنجاح التسوية وإرسال الإشعار التلقائي للأنظمة الفرعية الأخرى
        return res.status(200).json({
            success: true,
            message: "Clearing & Settlement executed successfully across macro-channels.",
            ledgerIndex: ledgerResult.ledgerIndex,
            piBlockchainTxId: piPaymentData.transaction.txid // المعرف الفريد للمعاملة على البلوكشين
        });

    } catch (error) {
        console.error("Core Ledger Framework Error:", error.message);
        
        // 8. التعامل مع الأخطاء التقنية الحرجة وتوجيهها مباشرة إلى نظام الدعم HUMAN_SUPPORT
        return res.status(500).json({
            success: false,
            error: "Internal Technical Settlement Timeout.",
            escalationPath: "/api/support/escalate-ticket",
            actionRequired: "If tokens were deducted, please contact the Macro-Operations-Yemen desk with your Pi Payment ID immediately."
        });
    }
});

module.exports = router;
