let currentUser = null;

// ============================================
// تسجيل الدخول
// ============================================
document.getElementById('login-btn').addEventListener('click', async function() {
  const btn = this;
  const errorDiv = document.getElementById('login-error');
  btn.disabled = true; btn.textContent = 'جارٍ الاتصال...';
  errorDiv.style.display = 'none';

  try {
    const auth = await Pi.authenticate(['username', 'payments', 'wallet_address'], function(payment) {
      console.log('Incomplete payment:', payment);
    });
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: auth.accessToken })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Auth failed');
    currentUser = { ...data.user, accessToken: auth.accessToken };
    document.getElementById('user-name').textContent = data.user.username;
    document.getElementById('user-id').textContent = data.user.uid;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('wallet-section').style.display = 'block';
    fetchBalance();
  } catch (err) {
    errorDiv.textContent = 'فشل تسجيل الدخول: ' + err.message;
    errorDiv.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = '🚀 تسجيل الدخول بحساب Pi';
  }
});

// ============================================
// جلب الرصيد
// ============================================
async function fetchBalance() {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/balance/${currentUser.uid}`);
    const data = await res.json();
    document.getElementById('pi-balance').textContent = (data.Pi || 0).toFixed(2);
    document.getElementById('yer-balance').textContent = (data.YER || 0).toFixed(2);
  } catch (e) { console.error('Balance fetch failed:', e); }
}

// ============================================
// الدفع الفردي (Pi فقط)
// ============================================
document.getElementById('pay-pi-btn').addEventListener('click', async function() {
  try {
    await Pi.createPayment({
      amount: 1.0,
      memo: "دفع تجريبي بـ Pi",
      metadata: { type: "pi_only", orderId: "ORDER-" + Date.now() }
    }, {
      onReadyForServerApproval: (paymentId) => {
        fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) });
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, txid }) }).then(() => fetchBalance());
      },
      onCancel: (paymentId) => console.log('Cancelled:', paymentId),
      onError: (error) => console.error('Error:', error)
    });
  } catch (e) { alert('خطأ في الدفع: ' + e.message); }
});

// ============================================
// الدفع الفردي (YER فقط) - عبر tokenCanonical
// ============================================
document.getElementById('pay-yer-btn').addEventListener('click', async function() {
  try {
    await Pi.createPayment({
      amount: 100,
      memo: "دفع تجريبي بـ YER",
      tokenCanonical: "YER",
      metadata: { type: "yer_only", orderId: "YER-" + Date.now() }
    }, {
      onReadyForServerApproval: (paymentId) => {
        fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) });
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, txid }) }).then(() => fetchBalance());
      },
      onCancel: (paymentId) => console.log('Cancelled:', paymentId),
      onError: (error) => console.error('Error:', error)
    });
  } catch (e) { alert('خطأ: ' + e.message); }
});

// ============================================
// الدفع الهجين (Pi + YER)
// ============================================
document.getElementById('pay-hybrid-btn').addEventListener('click', async function() {
  try {
    // 1. خصم YER من الخادم
    const hybRes = await fetch('/api/payments/hybrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: currentUser.accessToken, piAmount: 0.5, yerAmount: 100, orderId: "HYB-" + Date.now() })
    });
    const hybData = await hybRes.json();
    if (!hybData.success) throw new Error(hybData.error);

    // 2. دفع Pi عبر SDK
    await Pi.createPayment({
      amount: hybData.piAmount,
      memo: `دفع هجين: ${hybData.piAmount} Pi + ${hybData.yerAmount} YER`,
      metadata: { type: "hybrid", transactionId: hybData.transactionId, yerAmount: hybData.yerAmount, orderId: hybData.orderId }
    }, {
      onReadyForServerApproval: (paymentId) => {
        fetch('/api/payments/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) });
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        fetch('/api/payments/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, txid }) }).then(() => fetchBalance());
      },
      onCancel: (paymentId) => console.log('Cancelled:', paymentId),
      onError: (error) => console.error('Error:', error)
    });
    fetchBalance();
  } catch (e) { alert('خطأ في الدفع الهجين: ' + e.message); }
});