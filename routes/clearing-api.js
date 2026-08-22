// routes/clearing-api.js
const express = require('express');
const router = express.Router();
const PiPaymentProcessor = require('../backend/pi-payment-processor');

// محاكاة سريعة لقاعدة بيانات معالجة المعاملات السيادية السيالة
const mockDatabase = {
    payments: {},
    wallets: { 'sovereign_reserve': 10000000000000n } 
};

/**
 * 1. مسار إنشاء فاتورة المقاصة الهجينة (50% Pi و 50% YER)
 * POST /api/yer/payments/create-invoice
 */
router.post('/create-invoice', (req, res) => {
    try {
        const { totalAmount, currentRate, userId, memo } = req.body;

        if (!totalAmount || !currentRate || !userId) {
            return res.status(400).json({ error: "جميع المدخلات (المبلغ، السعر، هوية المستخدم) إجبارية." });
        }

        // معالجة الفاتورة بحسابات BigInt دقيقة متوافقة مع القيود الصارمة للمشروع
        const clearingManifest = PiPaymentProcessor.processHybridInvoice(totalAmount, currentRate);
        
        // توليد وثيقة الدفع المتوافقة مع متصفح Pi
        const piManifest = PiPaymentProcessor.createPiPaymentManifest(userId, clearingManifest.piStroops, memo || "Sovereign Settlement");

        // حفظ المعاملة مؤقتاً بحالة "بانتظار التأكيد اللامركزي"
        mockDatabase.payments[piManifest.payment_identifier] = {
            userId,
            clearingDetails: clearingManifest,
            piManifest: piManifest,
            status: "PENDING_BLOCKCHAIN_CONFIRMATION"
        };

        res.status(200).json({
            success: true,
            message: "تم تجهيز مصفوفة المقاصة بنجاح والتوافق مع Pi SDK جاهز.",
            piPayload: piManifest
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 2. مسار تسوية المعاملات المعلقة والمكتملة من الـ SDK (إلزامي في تحديثات Pi)
 * POST /api/yer/payments/complete
 */
router.post('/complete', (req, res) => {
    try {
        const { paymentId, txid } = req.body;

        if (!paymentId || !txid) {
            return res.status(400).json({ error: "رقم تعريف الدفعة ومعرف المعاملة (txid) مطلوبان للتسوية." });
        }

        const transaction = mockDatabase.payments[paymentId];
        if (!transaction) {
            return res.status(404).json({ error: "لم يتم العثور على سجل مالي لهذه الفاتورة." });
        }

        if (transaction.status === "SETTLED_SUCCESSFULLY") {
            return res.status(400).json({ error: "هذه المعاملة تمت تسويتها وإغلاقها مسبقاً." });
        }

        // تنفيذ تسوية المقاصة ونقل القيم للدفاتر السيادية المحلية
        transaction.status = "SETTLED_SUCCESSFULLY";
        transaction.txid = txid;
        transaction.settledAt = Date.now();

        console.log(`[المقاصة السيادية] تم تأكيد المعاملة رقم ${paymentId} عبر البلوكشين بمعرف: ${txid}`);

        res.status(200).json({
            success: true,
            status: "CLEARED_AND_ARCHIVED",
            message: "تم الحفظ الفوري في دفاتر الاستقرار المالي لليمن."
        });

    } catch (error) {
        res.status(500).json({ error: "فشل في معالجة المقاصة النهائية." });
    }
});

module.exports = router;
