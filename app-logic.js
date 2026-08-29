// app-logic.js
// Logic for handling purchase (Backend / Node.js compatible)

const { createPayment } = require('./paymentService'); // تأكد من وجود هذا الملف

async function handlePurchase(productId, amount, memo) {
    try {
        console.log(`بدء عملية شراء: ${productId}`);
        // استدعاء دالة الدفع من paymentService.js
        const payment = await createPayment(amount, memo, { productId: productId });
        
        if (payment) {
            return { success: true, message: "تمت العملية بنجاح! شكراً لاستخدامك Bigish-YER" };
        }
    } catch (error) {
        return { success: false, message: "حدث خطأ أثناء الدفع، يرجى المحاولة لاحقاً." };
    }
}

module.exports = { handlePurchase };