// تهيئة Pi SDK
const Pi = window.Pi;

export const initPi = () => {
    Pi.init({ version: "2.0", sandbox: true }); // غير sandbox إلى false عند الإطلاق الفعلي
};

export const authenticatePi = async () => {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        return auth;
    } catch (err) {
        console.error("خطأ في المصادقة:", err);
    }
};

// التعامل مع المدفوعات غير المكتملة (شرط أساسي من Pi)
const onIncompletePaymentFound = (payment) => {
    console.log("هناك دفعة معلقة:", payment);
    // كود لإرسال معرف الدفعة للخلفية لتأكيدها
};