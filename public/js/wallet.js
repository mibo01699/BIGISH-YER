// ============================================
// BIGISH-YER Wallet — Balance & Payments (v3)
// ============================================

async function loadBalance() {
    if (!currentUser) return;
    try {
        const res = await fetch(`/api/balance/${currentUser.uid}`);
        const data = await res.json();
        document.getElementById('pi-balance').textContent = parseFloat(data.Pi || 0).toFixed(2);
        document.getElementById('yer-balance').textContent = parseFloat(data.YER || 0).toFixed(2);
    } catch (err) {
        console.error("Balance load error:", err);
    }
}

// ============================================
// الدفع الفردي (Pi فقط) — مع معالجة أخطاء كاملة
// ============================================
async function payWithPi() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const amount = parseFloat(prompt('أدخل المبلغ بـ Pi:', '1.0'));
    if (!amount || amount <= 0) return;

    try {
        await Pi.createPayment({
            amount: amount,
            memo: "دفع تجريبي بـ Pi",
            metadata: { type: "pi_only", orderId: "ORDER-" + Date.now() }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                console.log('🔄 onReadyForServerApproval called:', paymentId);
                try {
                    const r = await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    const d = await r.json();
                    console.log('✅ Approve response:', d);
                    if (!r.ok) {
                        throw new Error('Approve failed: ' + (d.error || 'Unknown'));
                    }
                } catch (e) {
                    console.error('❌ Approve error:', e);
                    alert('فشل في الموافقة على الدفع: ' + e.message);
                }
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log('🔄 onReadyForServerCompletion:', paymentId, txid);
                try {
                    const r = await fetch('/api/payments/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    const d = await r.json();
                    console.log('✅ Complete response:', d);
                    if (!r.ok) {
                        throw new Error('Complete failed: ' + (d.error || 'Unknown'));
                    }
                    alert('✅ تم الدفع بنجاح!');
                    await loadBalance();
                    if (typeof refreshHistory === 'function') await refreshHistory();
                } catch (e) {
                    console.error('❌ Complete error:', e);
                    alert('فشل في إكمال الدفع: ' + e.message);
                }
            },
            onCancel: (paymentId) => {
                console.log('⚠️ Payment cancelled:', paymentId);
                alert('تم إلغاء الدفع');
            },
            onError: (error) => {
                console.error('❌ Payment error:', error);
                alert('خطأ في الدفع: ' + (error.message || 'خطأ غير معروف'));
            }
        });
    } catch (e) {
        console.error('Payment catch:', e);
        alert('خطأ: ' + e.message);
    }
}

// ============================================
// الدفع الفردي (YER فقط)
// ============================================
async function payWithYER() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const amount = parseFloat(prompt('أدخل المبلغ بـ YER:', '50'));
    if (!amount || amount <= 0) return;

    try {
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
            alert('✅ تم خصم ' + amount + ' YER بنجاح');
            await loadBalance();
            if (typeof refreshHistory === 'function') await refreshHistory();
        } else {
            alert('فشل: ' + (data.error || 'خطأ غير معروف'));
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
    const yerAmount = parseFloat(prompt('أدخل المبلغ بـ YER:', '50'));
    if (!yerAmount || yerAmount <= 0) return;

    try {
        // 1. خصم YER
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

        // 2. دفع Pi
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
                console.log('🔄 Hybrid approve:', paymentId);
                try {
                    const r = await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    if (!r.ok) throw new Error('Approve failed');
                } catch (e) {
                    console.error('❌ Hybrid approve error:', e);
                }
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log('🔄 Hybrid complete:', paymentId, txid);
                try {
                    await fetch('/api/payments/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    alert('✅ تم الدفع الهجين بنجاح!');
                    await loadBalance();
                    if (typeof refreshHistory === 'function') await refreshHistory();
                } catch (e) {
                    console.error('❌ Hybrid complete error:', e);
                }
            },
            onCancel: (paymentId) => {
                console.log('⚠️ Hybrid cancelled:', paymentId);
                alert('تم إلغاء الدفع');
            },
            onError: (error) => {
                console.error('❌ Hybrid error:', error);
                alert('خطأ: ' + (error.message || 'غير معروف'));
            }
        });
    } catch (e) {
        alert('خطأ في الدفع الهجين: ' + e.message);
    }
}