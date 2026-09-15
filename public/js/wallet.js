// ============================================
// BIGISH-YER Wallet — Balance & Payments (v7)
// Architecture: Pi deposit + Internal transfers
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
// ① إيداع Pi (من محفظة Pi الرسمية → محفظة BIGISH-YER)
// ============================================
async function payWithPi() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const amount = parseFloat(prompt('أدخل المبلغ بـ Pi للإيداع في محفظة YER:', '1.0'));
    if (!amount || amount <= 0) return;

    try {
        await Pi.createPayment({
            amount: amount,
            memo: `إيداع Pi في محفظة BIGISH-YER`,
            metadata: {
                type: "pi_deposit",
                orderId: "DEP-" + Date.now(),
                userId: currentUser.uid,
                piAmount: amount
            }
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
                    const r = await fetch('/api/payments/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentId,
                            txid,
                            userId: currentUser.uid,
                            piAmount: amount
                        })
                    });
                    const d = await r.json();
                    if (r.ok || (d.error && d.error.includes('already_completed'))) {
                        alert(`✅ تم إيداع ${amount} Pi في محفظتك بنجاح!`);
                    }
                } catch (e) { console.error('Complete error:', e); }
                await loadBalance();
                if (typeof refreshHistory === 'function') await refreshHistory();
            },
            onCancel: () => alert('تم إلغاء الإيداع'),
            onError: (error) => alert('خطأ: ' + (error.message || 'غير معروف'))
        });
    } catch (e) { alert('خطأ: ' + e.message); }
}

// ============================================
// ④ تحويل YER داخلي (مجاني)
// ============================================
async function payWithYER() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const amount = parseFloat(prompt('أدخل المبلغ بـ YER:', '50'));
    if (!amount || amount <= 0) return;
    const recipient = prompt('معرف المستلم (recipientId) - اتركه فارغاً للمتجر:', '');

    try {
        const res = await fetch('/api/payments/internal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessToken: currentUser.accessToken,
                piAmount: 0,
                yerAmount: amount,
                recipientId: recipient || null,
                orderId: "YER-" + Date.now(),
                memo: "تحويل YER"
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ تم تحويل ${amount} YER بنجاح (بدون رسوم)`);
            await loadBalance();
            if (typeof refreshHistory === 'function') await refreshHistory();
        } else {
            alert('فشل: ' + (data.error || 'خطأ'));
        }
    } catch (e) { alert('خطأ: ' + e.message); }
}

// ============================================
// ②③ دفع هجين داخلي (Pi + YER من محفظة YER)
// لا يستدعي Pi SDK — كل شيء داخلي
// ============================================
async function payHybrid() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const piAmount = parseFloat(prompt('أدخل حصة Pi:', '0.5'));
    if (!piAmount || piAmount < 0) return;
    const yerAmount = parseFloat(prompt('أدخل حصة YER:', '50'));
    if (!yerAmount || yerAmount < 0) return;
    if (piAmount === 0 && yerAmount === 0) return alert('يجب تحديد مبلغ واحد على الأقل');
    const recipient = prompt('معرف المستلم (تاجر/خدمة):', 'merchant_demo');

    try {
        const res = await fetch('/api/payments/internal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessToken: currentUser.accessToken,
                piAmount: piAmount,
                yerAmount: yerAmount,
                recipientId: recipient,
                orderId: "HYB-" + Date.now(),
                memo: `دفع هجين: ${piAmount} Pi + ${yerAmount} YER`
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ تم الدفع الهجين بنجاح!\n${piAmount} Pi + ${yerAmount} YER`);
            await loadBalance();
            if (typeof refreshHistory === 'function') await refreshHistory();
        } else {
            alert('فشل: ' + (data.error || 'خطأ'));
        }
    } catch (e) { alert('خطأ: ' + e.message); }
}