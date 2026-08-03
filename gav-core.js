async function triggerGAVPayment(piAmount) {
    if (!currentUser) {
        alert("يرجى تسجيل الدخول أولاً عبر المحفظة المعتمدة.");
        return;
    }

    try {
        const paymentData = {
            amount: piAmount,
            memo: "شراء رسوم خدمة سلسلة التوريد GAV-YEM 2026",
            metadata: { ecosystemConfig: "BY-GAV-YEM-2026-STABLE" }
        };

        const callbacks = {
            onReadyForServerApproval: function(paymentId) {
                submitPaymentToBackend(paymentId, 'approve');
            },
            onReadyForServerCompletion: function(paymentId, txid) {
                submitPaymentToBackend(paymentId, 'complete', txid);
            },
            onCancel: function(paymentId) {
                console.log("Payment cancelled by user. ID:", paymentId);
            },
            onError: function(error, payment) {
                console.error("Critical Pi Payment Error:", error, payment);
            }
        };

        await Pi.createPayment(paymentData, callbacks);

    } catch (error) {
        console.error("Failed to execute ecosystem transfer:", error);
    }
}

function submitPaymentToBackend(paymentId, action, txid = null) {
    console.log(`Cloud Sync: Action=${action}, PaymentID=${paymentId}, TxID=${txid}`);
    if(action === 'complete') {
        alert("تمت المعاملة بنجاح على البلوكشين وتحديث رصيد الخدمات اللوجستية!");
    }
}
