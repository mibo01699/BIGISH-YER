// هذا هو التنسيق القياسي الذي يطلبه فريق Pi للـ SDK
const Pi = window.Pi;

async function onIncompletePaymentFound(payment) {
    // إذا وجد التطبيق دفعة لم تكتمل، يرسلها فوراً للخادم لإكمالها
    await axios.post('/api/pi/complete', {
        paymentId: payment.identifier,
        txid: payment.transaction.txid
    });
};

// تشغيل الـ SDK
Pi.init({ version: "2.0", sandbox: true });

/**
 * نظام إدارة واجهة الدفع الهجين والتكامل مع السيرفر الخلفي لمشروع BIGISH-YER
 */
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("hybridRatioSlider");
    const piLabel = document.getElementById("piRatioLabel");
    const yerLabel = document.getElementById("yerRatioLabel");
    const piBreakdown = document.getElementById("piStroopsBreakdown");
    const yerBreakdown = document.getElementById("yerSubunitsBreakdown");
    const btnExecute = document.getElementById("btnExecuteHybridPayment");

    // محاكاة قيمة الفاتورة الأساسية القادمة من المزاد أو نقطة البيع لـ AJYAL
    const INVOICE_AMOUNT = 1000; 
    
    // الثوابت العشرية الصارمة المعتمدة في المستودع الرئيسي لـ BIGISH-YER
    const PI_SCALE = 10000000n;        // دقة 7 خانات لـ Pi
    const YER_SCALE = 10000000000n;    // دقة 10 خانات لـ YER

    // دالة تحديث الواجهة اللحظية ومنع أي كسور عشرية قبل الإرسال
    function updateLiveBreakdown() {
        const piRatio = BigInt(slider.value);
        const yerRatio = 100n - piRatio;

        piLabel.innerText = slider.value;
        yerLabel.innerText = (100n - piRatio).toString();

        // حساب الحصص الأساسية بشكل صحيح ومحاذاة الفائض
        const totalInvoiceBig = BigInt(INVOICE_AMOUNT);
        const piShareRaw = (totalInvoiceBig * piRatio) / 100n;
        let yerShareRaw = (totalInvoiceBig * yerRatio) / 100n;

        // التحقق من الفائض الحسابي وإضافته لـ YER
        const checkTotal = piShareRaw + yerShareRaw;
        if (checkTotal < totalInvoiceBig) {
            yerShareRaw += (totalInvoiceBig - checkTotal);
        }

        // إظهار الوحدات الدقيقة للمستخدم
        piBreakdown.innerText = (piShareRaw * PI_SCALE).toString() + " Stroops";
        yerBreakdown.innerText = (yerShareRaw * YER_SCALE).toString() + " Sub-units";
    }

    // الاستماع لحدث سحب الشريط وتحديث الأرقام مباشرة
    slider.addEventListener("input", updateLiveBreakdown);

    // تنفيذ عملية الدفع وإرسال البيانات ديناميكياً للسيرفر الخلفي
    btnExecute.addEventListener("click", async () => {
        const payload = {
            invoiceAmount: INVOICE_AMOUNT,
            piRatio: parseInt(slider.value),
            yerRatio: 100 - parseInt(slider.value),
            merchantId: "merchant_yemen_pos_01"
        };

        try {
            btnExecute.disabled = true;
            btnExecute.innerText = "جاري المقاصة البرمجية الحالية...";

            const response = await fetch("/api/yer/transfer-hybrid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                alert(`🎯 تم الدفع بنجاح! \nالـ Pi بالـ Stroops: ${result.data.piPaymentStroops}\nالـ YER بالـ Sub-units: ${result.data.yerPaymentSubUnits}`);
            } else {
                alert("فشلت المعاملة: " + result.error);
            }
        } catch (error) {
            alert("خطأ في الاتصال بالشبكة اللامركزية: " + error.message);
        } finally {
            btnExecute.disabled = false;
            btnExecute.innerText = "تأكيد ودفع المعاملة الهجينة";
        }
    });

    // تشغيل التحديث الأولي عند تحميل الصفحة
    updateLiveBreakdown();
});
