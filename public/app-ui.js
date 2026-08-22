// public/app-ui.js
import PiNetwork from './pi-integration.js';

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

    // 1. بدء تهيئة الـ SDK والتحقق من البيئة داخل المتصفح الآمن
    const isInitialized = await PiNetwork.init();
    if (!isInitialized) {
        authStatus.innerText = "فشل الاتصال: يرجى فتح التطبيق من متصفح Pi Browser حصرًا.";
        authStatus.className = "status-badge error";
        return;
    }

    try {
        // 2. توثيق هوية المستخدم وجلب بياناته اللامركزية
        log("جاري طلب التحقق من الهوية الرقمية السيادية...");
        const user = await PiNetwork.authenticateUser();
        
        document.getElementById('username').innerText = user.username;
        document.getElementById('wallet-address').innerText = user.uid.substring(0, 15) + "...";
        
        authStatus.innerText = "تم التوثيق والربط بنجاح";
        authStatus.className = "status-badge success";
        btnPay.disabled = false; // تفعيل زر الدفع والمقاصة
        log(`المستخدم ${user.username} متصل الآن بالشبكة السيادية.`, 'success');
    } catch (err) {
        authStatus.innerText = "فشل التوثيق الرقمي";
        authStatus.className = "status-badge error";
        log("خطأ في جلب بيانات المستخدم المحدثة لشبكة Pi.", 'error');
    }

    // 3. معالجة إرسال نموذج الفاتورة وتنفيذ عملية الدفع الهجين
    document.getElementById('invoice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const totalAmount = document.getElementById('total-amount').value;
        const currentRate = document.getElementById('exchange-rate').value;
        const memo = document.getElementById('memo').value;

        btnPay.disabled = true;
        log("جاري استدعاء مصفوفة المقاصة السيادية وحساب الحصص الخالية من الكسور العشرية...");

        try {
            // إرسال البيانات للـ Backend الخاص بك لتوليد الفاتورة ومطابقتها مع أمان Anti-Double Dipping
            const response = await fetch('/api/yer/payments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalAmount, currentRate, userId: document.getElementById('username').innerText, memo })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            log(`تمت عملية التقسيم بنجاح: الحصة الرقمية المطلوبة بـ Stroops هي: ${data.piPayload.metadata.sub_unit_stroops}`, 'success');
            log("جاري إطلاق نافذة الدفع الرسمية لـ Pi Network لتأكيد النقل للبلوكشين...");

            // استدعاء نافذة الدفع للـ SDK لتوقيع المعاملة من محفظة المستخدم الفردية
            const paymentCallbacks = {
                onReadyForServerApproval: (paymentId) => log(`تم إنشاء المعاملة رقم ${paymentId} على البلوكشين، بانتظار موافقة الخادم السيادي.`, 'info'),
                onReadyForServerCompletion: async (paymentId, txid) => {
                    log(`المعاملة وقعت بنجاح بمعرف البلوكشين: ${txid}. جاري التسوية الختامية...`, 'success');
                    
                    // تأكيد التسوية في دفاتر نظام المقاصة المركزي وإغلاق الفاتورة
                    const compRes = await fetch('/api/yer/payments/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    const compData = await compRes.json();
                    if(compData.success) {
                        log("🦅 تم الانتهاء من المقاصة بالكامل وحفظ الحصص في احتياطي استقرار اليمن!", 'success');
                    }
                },
                onCancel: (paymentId) => log(`تم إلغاء عملية السداد لـ ${paymentId} من قبل المستخدم بشكل آمن.`, 'warning'),
                onError: (error, payment) => log(`تنبيه أمان: حدث خطأ أثناء توقيع المعاملة: ${error.message}`, 'error')
            };

            // تشغيل محرك الدفع لواجهة المستعرض
            window.Pi.createPayment(data.piPayload, paymentCallbacks);

        } catch (error) {
            log(`فشلت المعاملة: ${error.message}`, 'error');
        } finally {
            btnPay.disabled = false;
        }
    });
});
