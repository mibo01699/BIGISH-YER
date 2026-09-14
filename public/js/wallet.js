// ============================================
// BIGISH-YER Wallet — Balance & Payments
// ============================================

/**
 * تحميل رصيد المستخدم
 */
async function loadBalance() {
    if (!currentUser) return;

    try {
        const res = await fetch(`/api/balance/${currentUser.uid}`);
        const data = await res.json();

        document.getElementById('pi-balance').textContent =
            parseFloat(data.Pi || 0).toFixed(2);
        document.getElementById('yer-balance').textContent =
            parseFloat(data.YER || 0).toFixed(2);

    } catch (err) {
        console.error("Balance load error:", err);
    }
}

// ============================================
// الدفع الفردي (Pi فقط)
// ============================================
async function payWithPi() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');

    const amount = parseFloat(prompt('أدخل المبلغ بـ Pi:', '1.0'));
    if (!amount || amount <= 0) return;

    try {
        await Pi.createPayment({
            amount: amount,
            memo: "دفع تجريبي بـ Pi",
            metadata: {
                type: "pi_only",
                orderId: "ORDER-" + Date.now()
            }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                await fetch('/api/payments/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });
                alert('✅ تم الدفع بنجاح!');
                loadBalance();
                refreshHistory();
            },
            onCancel: (paymentId) => console.log('Payment cancelled:', paymentId),
            onError: (error) => {
                console.error('Payment error:', error);
                alert('خطأ في الدفع: ' + error.message);
            }
        });
    } catch (e) {
        alert('خطأ: ' + e.message);
    }
}

// ============================================
// الدفع الفردي (YER فقط)
// ============================================
async function payWithYER() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');

    const amount = parseFloat(prompt('أدخل المبلغ بـ YER:', '100'));
    if (!amount || amount <= 0) return;

    try {
        // دفع YER يتم عبر الخادم (لأن Pi SDK لا يدعمه مباشرة بعد)
        const res = await fetch('/api/payments/hybrid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessToken: currentUser.accessToken,
                piAmount: 0,
                yerAmount: amount,
                orderId: "YER-" + Date.now()
            })
        });

        const data = await res.json();
        if (data.success) {
            alert('✅ تم خصم ' + amount + ' YER');
            loadBalance();
            refreshHistory();
        } else {
            alert('فشل: ' + data.error);
        }
    } catch (e) {
        alert('خطأ: ' + e.message);
    }
}

// ============================================
// الدفع الهجين (Pi + YER)
// ============================================
async function payHybrid() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');

    const piAmount = parseFloat(prompt('أدخل المبلغ بـ Pi:', '0.5'));
    if (!piAmount || piAmount <= 0) return;

    const yerAmount = parseFloat(prompt('أدخل المبلغ بـ YER:', '100'));
    if (!yerAmount || yerAmount <= 0) return;

    try {
        // 1. خصم YER من الخادم
        const hybRes = await fetch('/api/payments/hybrid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessToken: currentUser.accessToken,
                piAmount: piAmount,
                yerAmount: yerAmount,
                orderId: "HYB-" + Date.now()
            })
        });

        const hybData = await hybRes.json();
        if (!hybData.success) throw new Error(hybData.error);

        // 2. دفع Pi عبر SDK
        await Pi.createPayment({
            amount: piAmount,
            memo: `دفع هجين: ${piAmount} Pi + ${yerAmount} YER`,
            metadata: {
                type: "hybrid",
                transactionId: hybData.transactionId,
                yerAmount: yerAmount,
                orderId: hybData.orderId
            }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                await fetch('/api/payments/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });
                alert('✅ تم الدفع الهجين بنجاح!');
                loadBalance();
                refreshHistory();
            },
            onCancel: (paymentId) => console.log('Hybrid cancelled:', paymentId),
            onError: (error) => console.error('Hybrid error:', error)
        });
    } catch (e) {
        alert('خطأ في الدفع الهجين: ' + e.message);
    }
}