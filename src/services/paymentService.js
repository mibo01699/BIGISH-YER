// paymentService.js
// خدمة الدفع التجريبية (Sandbox) - لا تستخدم Pi SDK الرسمي، بل محاكاة آمنة للاختبار.

const crypto = require('crypto'); // لاستخدام randomUUID بدلاً من Math.random

/**
 * إنشاء عملية دفع تجريبية (محاكاة) - بدلاً من الاعتماد على Pi SDK الرسمي.
 * @param {string} amount - المبلغ كنص (String) لضمان الدقة.
 * @param {string} memo - وصف العملية.
 * @param {object} metadata - بيانات إضافية (مثل productId).
 * @returns {Promise<object>} - كائن العملية (محاكاة).
 */
const createPayment = async (amount, memo, metadata) => {
    try {
        // التأكد من أن المبلغ نص وليس رقماً عائماً (منع الأخطاء المالية)
        if (typeof amount !== 'string' || amount === '') {
            throw new Error("Invalid amount: Amount must be a string.");
        }

        console.log(`[Sandbox Payment] Initiating payment for: ${memo}`);

        // محاكاة إنشاء عملية دفع (بدلاً من استدعاء Pi SDK)
        const paymentId = crypto.randomUUID(); // معرف فريد وآمن
        const txid = `sandbox_tx_${crypto.randomUUID()}`;

        // محاكاة رحلة الدفع (إرسال للموافقة ثم الإكمال)
        // في بيئة حقيقية، هذا سيتم عبر خادمك، لكن هنا محاكاة للاختبارات
        const approvalResponse = await fetch('/api/yer/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
        });

        // (اختياري) التحقق من استجابة الخادم
        // const approvalData = await approvalResponse.json();
        // if (!approvalData.success) throw new Error(approvalData.error);

        const completionResponse = await fetch('/api/yer/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
        });

        // (اختياري) التحقق من استجابة الإكمال
        // const completionData = await completionResponse.json();

        // إعادة كائن العملية (محاكاة) كما تتوقعها بقية الأنظمة
        return {
            success: true,
            paymentId,
            txid,
            amount,
            memo,
            metadata,
            status: "SANDBOX_PAYMENT_COMPLETED"
        };

    } catch (err) {
        console.error("فشل إنشاء الطلب (محاكاة):", err.message);
        // إعادة كائن مع حالة فشل بدلاً من إعادة undefined
        return { success: false, error: err.message };
    }
};

module.exports = { createPayment };