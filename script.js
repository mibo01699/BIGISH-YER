// هذا هو التنسيق القياسي الذي يطلبه فريق Pi للـ SDK
const Pi = window.Pi;

async function onIncompletePaymentFound(payment) {
    // إذا وجد التطبيق دفعة لم تكتمل، يرسلها فوراً للخادم لإكمالها
    await axios.post('/api/pi/complete', {
        paymentId: payment.identifier,
        txid: payment.transaction.txid
    });
};

// تشغيل الـ SDK
Pi.init({ version: "2.0", sandbox: true });