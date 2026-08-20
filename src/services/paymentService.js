export const createPayment = async (amount, memo, metadata) => {
    try {
        const payment = await Pi.createPayment({
            amount: amount,
            memo: memo, // مثال: "شراء منتج من Bigish-YER"
            metadata: metadata, // كود الطلب الداخلي
        }, {
            onReadyForServerApproval: (paymentId) => {
                // إرسال paymentId إلى خادمك (Backend) للموافقة
                return fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ paymentId }) });
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                // إرسال txid للخادم لإكمال العملية برمجياً
                return fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ paymentId, txid }) });
            },
            onCancel: (paymentId) => console.log("تم إلغاء الدفع", paymentId),
            onError: (error, payment) => console.error("خطأ في الدفع", error, payment),
        });
        return payment;
    } catch (err) {
        console.error("فشل إنشاء الطلب:", err);
    }
};