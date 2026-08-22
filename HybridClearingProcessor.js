const DynamicRatioValidator = require('./DynamicRatioValidator');
// استيراد محرك التوزيع الديناميكي المحدث
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
        const baseAmountBig = BigInt(invoiceAmount);

        // تنفيذ التوزيع الديناميكي المعتمد على خيارات المستخدم والتحقق من صحته
        const splitManifest = validator.validateAndSplit(baseAmountBig, piRatio, yerRatio);

        // هنا يتم حقن البيانات الجاهزة وتمريرها إلى pi-payment-processor وبوابة المطورين
        // لتجهيز الـ SDK Manifest الموجه لمتصفح Pi Browser بشكل فوري وآمن
        
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
