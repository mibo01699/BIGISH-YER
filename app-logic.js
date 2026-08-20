// إدارة حالة التطبيق
const AppState = {
    user: null,
    cart: [],
    isPiBrowser: !!window.Pi,
};

// وظيفة الدخول التلقائي عند فتح التطبيق في متصفح Pi
async function initApp() {
    if (AppState.isPiBrowser) {
        try {
            const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
            AppState.user = auth.user;
            document.getElementById('user-name').innerText = `مرحباً، ${auth.user.username}`;
            console.log("تم تسجيل الدخول بنجاح");
        } catch (error) {
            console.error("فشل تسجيل الدخول:", error);
        }
    } else {
        alert("يرجى فتح التطبيق من داخل متصفح Pi للاستفادة من كامل الميزات.");
    }
}

// إضافة منتج للسلة (مثال وظيفي)
function addToCart(productId, price) {
    AppState.cart.push({ id: productId, price: price });
    updateCartUI();
}

function updateCartUI() {
    const cartCount = AppState.cart.length;
    document.getElementById('cart-badge').innerText = cartCount;
}

window.onload = initApp;