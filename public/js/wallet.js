// ============================================
// BIGISH-YER Wallet — Balance & Payments (v6)
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
// معالج إكمال الدفع (يتجاهل already_completed)
// ============================================
async function handleCompletePayment(paymentId, txid, extra = {}) {
    try {
        const body = {
            paymentId,
            txid,
            userId: currentUser ? currentUser.uid : null,
            ...extra
        };
        const r = await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const d = await r.json();

        if (!r.ok) {
            if (d.error && d.error.includes('already_completed')) {
                console.log('✅ Payment already completed (success)');
                return { success: true, alreadyCompleted: true };
            }
            throw new Error('Complete failed: ' + (d.error || 'Unknown'));
        }
        return { success: true };
    } catch (e) {
        console.error('❌ Complete error:', e);
        throw e;
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
            metadata: { type: "pi_only", orderId: "ORDER-" + Date.now() }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                try {
                    await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                } catch (e) { console.error('Approve error:', e); }
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                    await handleCompletePayment(paymentId, txid);
                    alert('✅ تم الدفع بنجاح!');
                } catch (e) { /* silent */ }
                await loadBalance();
                if (typeof refreshHistory === 'function') await refreshHistory();
            },
            onCancel: (paymentId) => alert('تم إلغاء الدفع'),
            onError: (error) => alert('خطأ: ' + (error.message || 'غير معروف'))
        });
    } catch (e) { alert('خطأ: ' + e.message); }
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
    } catch (e) { alert('خطأ: ' + e.message); }
}

// ============================================
// الدفع الهجين (Pi + YER) — مع ربط المعاملة
// ============================================
async function payHybrid() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const piAmount = parseFloat(prompt('أدخل المبلغ بـ Pi:', '0.5'));
    if (!piAmount || piAmount <= 0) return;
    const yerAmount = parseFloat(prompt('أدخل المبلغ بـ YER:', '50'));
    if (!yerAmount || yerAmount <= 0) return;

    try {
        // 1. خصم YER وإنشاء معاملة هجينة
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

        // ✅ تحديث السجل مباشرة بعد خصم YER
        await loadBalance();
        if (typeof refreshHistory === 'function') await refreshHistory();

        // 2. دفع Pi مع ربط المعاملة الهجينة
        await Pi.createPayment({
            amount: piAmount,
            memo: `دفع هجين: ${piAmount} Pi + ${yerAmount} YER`,
            metadata: {
                type: "hybrid",
                hybridTxId: hybData.transactionId,
                orderId: hybData.orderId,
                yerAmount: yerAmount
            }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                try {
                    await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                } catch (e) { console.error('Hybrid approve error:', e); }
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                    await handleCompletePayment(paymentId, txid, {
                        orderId: hybData.orderId,
                        hybridTxId: hybData.transactionId
                    });
                    alert('✅ تم الدفع الهجين بنجاح!');
                } catch (e) { /* silent */ }
                await loadBalance();
                if (typeof refreshHistory === 'function') await refreshHistory();
            },
            onCancel: (paymentId) => alert('تم إلغاء الدفع'),
            onError: (error) => alert('خطأ: ' + (error.message || 'غير معروف'))
        });
    } catch (e) { alert('خطأ في الدفع الهجين: ' + e.message); }
}