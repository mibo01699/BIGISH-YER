// تهيئة وإعداد Pi SDK
const Pi = window.Pi;
Pi.init({ version: "2.0", sandbox: false });

let currentUser = null;

async function authenticatePiUser() {
    const loginBtn = document.getElementById('loginBtn');
    const authStatus = document.getElementById('authStatus');
    const mainDashboard = document.getElementById('mainDashboard');
    const piUsernameSpan = document.getElementById('piUsername');

    try {
        loginBtn.disabled = true;
        authStatus.innerHTML = "<p>⏳ جاري المصادقة الآمنة عبر Pi KYC SDK...</p>";

        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        currentUser = authResult.user;
        
        authStatus.style.borderLeftColor = "#22c55e";
        authStatus.innerHTML = `<p>🟢 تم التحقق بنجاح. معرف المحفظة متصل آمن.</p>`;
        piUsernameSpan.innerText = currentUser.username;
        
        loginBtn.style.display = "none";
        mainDashboard.style.display = "block";
        
        fetchUserYERBalance(currentUser.username);

    } catch (error) {
        console.error("Pi Authentication Failed:", error);
        authStatus.style.borderLeftColor = "#ef4444";
        authStatus.innerHTML = `<p>❌ فشل التحقق: يرجى فتح التطبيق من داخل متصفح Pi Browser الرسمي حصراً.</p>`;
        loginBtn.disabled = false;
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Found incomplete payment:", payment);
    if (window.completePendingPaymentOnServer) {
        window.completePendingPaymentOnServer(payment.paymentId);
    }
}

function fetchUserYERBalance(username) {
    document.getElementById('yerBalance').innerText = "150.000000";
}
