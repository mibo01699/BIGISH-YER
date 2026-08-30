// hybrid-payment.js - Sandbox Payment UI Logic (No Pi SDK, No Floating Point)

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("hybridRatioSlider");
    const piLabel = document.getElementById("piRatioLabel");
    const yerLabel = document.getElementById("yerRatioLabel");
    const piBreakdown = document.getElementById("piStroopsBreakdown");
    const yerBreakdown = document.getElementById("yerSubunitsBreakdown");
    const btnExecute = document.getElementById("btnExecuteHybridPayment");

    // محاكاة قيمة الفاتورة الأساسية (كنص لضمان الدقة)
    const INVOICE_AMOUNT = "1000"; 

    // الثوابت العشرية الصارمة المعتمدة في المستودع
    const PI_SCALE = 10000000n;        // دقة 7 خانات لـ Pi
    const YER_SCALE = 10000000000n;    // دقة 10 خانات لـ YER

    // دالة تحديث الواجهة اللحظية ومنع أي كسور عشرية قبل الإرسال
    function updateLiveBreakdown() {
        // تحويل قيمة الشريط إلى BigInt مباشرة (بدون parseInt)
        const piRatio = BigInt(slider.value);
        const yerRatio = 100n - piRatio;

        piLabel.innerText = slider.value;
        yerLabel.innerText = (100n - piRatio).toString();

        // حساب الحصص الأساسية بدقة
        const totalInvoiceBig = BigInt(INVOICE_AMOUNT);
        const piShareRaw = (totalInvoiceBig * piRatio) / 100n;
        let yerShareRaw = (totalInvoiceBig * yerRatio) / 100n;

        // التحقق من الفائض الحسابي وإضافته لـ YER
        const checkTotal = piShareRaw + yerShareRaw;
        if (checkTotal < totalInvoiceBig) {
            yerShareRaw += (totalInvoiceBig - checkTotal);
        }

        // إظهار الوحدات الدقيقة للمستخدم (كنصوص وليس أرقام عائمة)
        piBreakdown.innerText = (piShareRaw * PI_SCALE).toString() + " Stroops";
        yerBreakdown.innerText = (yerShareRaw * YER_SCALE).toString() + " Sub-units";
    }

    // الاستماع لحدث سحب الشريط وتحديث الأرقام مباشرة
    slider.addEventListener("input", updateLiveBreakdown);

    // تنفيذ عملية الدفع وإرسال البيانات ديناميكياً للسيرفر الخلفي
    btnExecute.addEventListener("click", async () => {
        // بناء الحمولة باستخدام BigInt وتحويلها إلى نصوص
        const payload = {
            invoiceAmount: INVOICE_AMOUNT,
            piRatio: slider.value, // يُرسل كنص
            yerRatio: (100n - BigInt(slider.value)).toString(), // يُرسل كنص
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
                // استبدال alert بـ console.log لبيئة الاختبارات
                console.log(`🎯 تم الدفع بنجاح! \nالـ Pi بالـ Stroops: ${result.data.piPaymentStroops}\nالـ YER بالـ Sub-units: ${result.data.yerPaymentSubUnits}`);
            } else {
                console.error("فشلت المعاملة: " + result.error);
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالشبكة اللامركزية: " + error.message);
        } finally {
            btnExecute.disabled = false;
            btnExecute.innerText = "تأكيد ودفع المعاملة الهجينة";
        }
    });

    // تشغيل التحديث الأولي عند تحميل الصفحة
    updateLiveBreakdown();
});