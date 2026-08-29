// public/app-ui.js
// واجهة المستخدم التجريبية (Sandbox Demo) - لا تدعي الوصول الرسمي لشبكة Pi.
document.addEventListener('DOMContentLoaded', async () => {
    const authStatus = document.getElementById('auth-status');
    const btnPay = document.getElementById('btn-pay');
    const logsBox = document.getElementById('telemetry-logs');

    function log(message, type = 'info') {
        const p = document.createElement('p');
        p.className = `log-item ${type}`;
        p.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
        logsBox.appendChild(p);
        logsBox.scrollTop = logsBox.scrollHeight;
    }

    // 1. محاكاة تهيئة طبقة التكامل التجريبية (بدلاً من Pi SDK الرسمي)
    // ملاحظة: لا يوجد تحقق من وجود Pi Browser، فقط بيئة محاكاة.
    const isInitialized = true; // محاكاة النجاح دائمًا في بيئة الاختبار
    if (!isInitialized) {
        authStatus.innerText = "فشل الاتصال: بيئة الاختبار غير متاحة.";
        authStatus.className = "status-badge error";
        return;
    }

    try {
        // 2. محاكاة توثيق المستخدم (لا توجد هوية حقيقية من Pi)
        log("جاري محاكاة طلب التحقق من الهوية الداخلية...");
        const user = { username: "test_user", uid: "12345" }; // بيانات وهمية
        document.getElementById('username').innerText = user.username;
        document.getElementById('wallet-address').innerText = user.uid.substring(0, 15) + "...";
        
        authStatus.innerText = "تم الربط (وضع المحاكاة)";
        authStatus.className = "status-badge success";
        btnPay.disabled = false; // تفعيل زر الدفع
        log(`المستخدم ${user.username} متصل الآن بالوضع التجريبي.`, 'success');
    } catch (err) {
        authStatus.innerText = "فشل المحاكاة";
        authStatus.className = "status-badge error";
        log("خطأ في محاكاة بيانات المستخدم.", 'error');
    }

    // 3. معالجة إرسال نموذج الفاتورة (محاكاة كاملة)
    document.getElementById('invoice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const totalAmount = document.getElementById('total-amount').value;
        const currentRate = document.getElementById('exchange-rate').value;
        const memo = document.getElementById('memo').value;

        btnPay.disabled = true;
        log("جاري محاكاة استدعاء نظام المقاصة وحساب الحصص...");

        try {
            // إرسال بيانات إلى Backend لإنشاء فاتورة تجريبية
            const response = await fetch('/api/yer/payments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalAmount, currentRate, userId: 'test_user', memo })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            // عرض معلومات الفاتورة التجريبية
            log(`تمت محاكاة التقسيم: الحصة الرقمية (Stroops) هي: ${data.piPayload?.metadata?.sub_unit_stroops || 'N/A'}`, 'success');
            log("جاري محاكاة نافذة الدفع (بدون Pi SDK رسمي)...");

            // محاكاة تأكيد الدفع (بدلاً من window.Pi.createPayment)
            // هنا يمكننا فقط تسجيل رسالة نجاح افتراضية
            log("تمت عملية الدفع بنجاح (محاكاة) - التسوية الختامية جارية...", 'success');
            
            // تأكيد التسوية للـ Backend (محاكاة)
            const compRes = await fetch('/api/yer/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: 'demo_payment_123', txid: 'demo_tx_abc' })
            });
            const compData = await compRes.json();
            if(compData.success) {
                log("🦅 تم الانتهاء من المقاصة (محاكاة) وحفظ الحصص!", 'success');
            }

        } catch (error) {
            log(`فشلت المحاكاة: ${error.message}`, 'error');
        } finally {
            btnPay.disabled = false;
        }
    });
});