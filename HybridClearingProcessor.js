const DynamicRatioValidator = require('./DynamicRatioValidator');
const validator = new DynamicRatioValidator();

/**
 * معالجة فواتير المزاد أو المدفوعات بنسب هجينة مرنة
 * @param {Object} req طلب الدفع المستلم من واجهة المستخدم
 * @param {Object} res استجابة السيرفر
 */
async function processFlexibleHybridPayment(req, res) {
    try {
        const { invoiceAmount, piRatio, yerRatio, merchantId } = req.body;
        
        // تحويل القيمة الأساسية إلى BigInt لضمان دقة صفرية الأخطاء (Zero Floating-Point Constraint)
        // حماية إضافية: التأكد من أن المبلغ نص وليس رقماً عائماً
        if (typeof invoiceAmount !== 'string') {
            throw new Error("INVALID_INPUT: Amount must be a string.");
        }
        
        const baseAmountBig = BigInt(invoiceAmount);

        // تنفيذ التوزيع الديناميكي المعتمد على خيارات المستخدم والتحقق من صحته
        const splitManifest = validator.validateAndSplit(baseAmountBig, piRatio, yerRatio);

        return res.status(200).json({
            success: true,
            message: "تم معالجة وتوزيع الفاتورة الهجينة بنجاح وفق النسب المحددة",
            data: splitManifest
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = { processFlexibleHybridPayment };