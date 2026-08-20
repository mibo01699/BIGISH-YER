// وظيفة معالجة الشراء
async function handlePurchase(productId, amount, memo) {
    try {
        console.log(`بدء عملية شراء: ${productId}`);
        // استدعاء دالة الدفع من paymentService.js
        const payment = await createPayment(amount, memo, { productId: productId });
        
        if (payment) {
            alert("تمت العملية بنجاح! شكراً لاستخدامك Bigish-YER");
        }
    } catch (error) {
        alert("حدث خطأ أثناء الدفع، يرجى المحاولة لاحقاً.");
    }
}

// تحديث واجهة المستخدم بعد تسجيل الدخول
window.addEventListener('authSuccess', (e) => {
    const user = e.detail;
    document.getElementById('user-info').innerText = `مرحباً، ${user.username}`;
});