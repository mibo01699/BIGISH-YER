// ============================================
// BIGISH-YER Wallet — Authentication
// ============================================

let currentUser = null;

/**
 * تسجيل الدخول عبر Pi
 */
async function loginWithPi() {
    const btn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('login-error');

    btn.disabled = true;
    btn.textContent = 'جارٍ الاتصال بـ Pi...';
    errorDiv.style.display = 'none';

    try {
        // طلب المصادقة من Pi SDK
        const auth = await Pi.authenticate(
            ['username', 'payments', 'wallet_address'],
            onIncompletePaymentFound
        );

        console.log("✅ Pi Auth success:", auth);

        // إرسال التوكن إلى الخادم للتحقق
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: auth.accessToken })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'فشل التحقق من التوكن');
        }

        // حفظ بيانات المستخدم
        currentUser = {
            uid: data.user.uid,
            username: data.user.username,
            accessToken: auth.accessToken
        };

        // حفظ في الذاكرة المحلية (للجلسة)
        localStorage.setItem('bigish_user', JSON.stringify({
            uid: currentUser.uid,
            username: currentUser.username
        }));

        // عرض المحفظة
        onLoginSuccess(currentUser);

    } catch (err) {
        console.error("❌ Login error:", err);
        errorDiv.textContent = 'فشل تسجيل الدخول: ' + err.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = '🚀 تسجيل الدخول بحساب Pi';
    }
}

/**
 * معالجة نجاح تسجيل الدخول
 */
function onLoginSuccess(user) {
    // تحديث الشريط العلوي
    document.getElementById('username').textContent = user.username;
    document.getElementById('logout-btn').style.display = 'inline-block';

    // تحديث بيانات المستخدم في الصفحة الرئيسية
    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-id').textContent = user.uid;

    // إخفاء شاشة تسجيل الدخول
    document.getElementById('page-login').classList.remove('active');

    // إظهار القائمة السفلية
    document.getElementById('bottom-nav').style.display = 'flex';

    // عرض الصفحة الرئيسية
    showPage('home');

    // تحميل الرصيد
    if (typeof loadBalance === 'function') loadBalance();
    if (typeof refreshHistory === 'function') refreshHistory();
    if (typeof loadQR === 'function') loadQR();
}

/**
 * معالجة الدفعات غير المكتملة
 */
function onIncompletePaymentFound(payment) {
    console.log("⚠️ Incomplete payment found:", payment);
    // إرسال الدفعة للخادم لإكمالها
    fetch('/api/payments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            paymentId: payment.identifier,
            txid: payment.transaction?.txid
        })
    }).catch(err => console.error("Complete payment error:", err));
}

/**
 * تسجيل الخروج
 */
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('bigish_user');
        currentUser = null;
        location.reload();
    }
}

/**
 * استعادة الجلسة عند إعادة تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('bigish_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            // ملاحظة: لا يمكن استعادة accessToken تلقائياً لأسباب أمنية
            // لذا سيُطلب من المستخدم إعادة تسجيل الدخول
            console.log("Previous session found for:", user.username);
        } catch (e) {
            localStorage.removeItem('bigish_user');
        }
    }
});