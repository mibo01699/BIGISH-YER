// PiPaymentProcessor.js
// محرك المقاصة السيادي الخالي من الفواصل العشريّة (Zero Floating-Point Engine)
// نسخة متوافقة مع BigInt بشكل كامل، ولا تستخدم أي عمليات عائمة في المسار المالي.

const crypto = require('crypto'); // مطلوب لتوليد UUID آمن
const YER_TOKENOMICS = require('../YERTokenomicsCanonical'); // [تم الإصلاح] رفع المسار لمستوى الجذر

const PI_SCALE = 10_000_000n; // 1 Pi = 10^7 Stroops (Strict BigInt)
const YER_SCALE = 10_000_000_000n; // 1 YER = 10^10 Sub-units

class PiPaymentProcessor {
    /**
     * معالجة طلب المقاصة الهجين بنسبة 50% لعملة Pi و 50% للريال اليمني المستقر (YER)
     * @param {string} totalInvoiceAmount - إجمالي قيمة الفاتورة بنظام السلسلة النصية (String)
     * @param {string} exchangeRate - سعر الصرف السائد من مصفوفة AMM (كم وحدة YER لكل 1 Pi)
     */
    static processHybridInvoice(totalInvoiceAmount, exchangeRate) {
        // [إلزامي] التأكد من أن المدخلات نصوص لتحويلها لـ BigInt بأمان (منع تمرير Float)
        if (typeof totalInvoiceAmount !== 'string' || typeof exchangeRate !== 'string') {
            throw new Error("PIP: Inputs must be stringified to prevent floating-point corruption.");
        }

        const totalAmountBig = BigInt(totalInvoiceAmount); 
        const rateBig = BigInt(exchangeRate);

        // 1. تقسيم القيمة بدقة هندسية حاسمة (50% لكل جانب)
        const halfYerShare = totalAmountBig / 2n;
        const remainingShareForPi = totalAmountBig - halfYerShare; // لضمان عدم ضياع أي كسور

        // 2. تحويل حصة الـ Pi إلى Stroops بناءً على سعر الصرف السيادي المعتمد
        // المعادلة: (الحصة بالـ YER * معامل تحجيم Pi) / سعر الصرف
        const piStroopsAmount = (remainingShareForPi * PI_SCALE) / rateBig;

        if (piStroopsAmount === 0n) {
            throw new Error("فشل العملية: القيمة المدخلة ضئيلة جداً ولا يمكن تحويلها لوحدات Stroops الفرعية.");
        }

        return {
            yerSovereignUnits: halfYerShare.toString(), // الحصة المخزنة لدعم السيولة المحلية (YER)
            piStroops: piStroopsAmount.toString(),      // القيمة التي ستُرسل إلى Pi Network API
            timestamp: Date.now(),
            status: "MANIFEST_COMPILED"
        };
    }

    /**
     * إنشاء وثيقة الدفع (Manifest Payload) الجاهزة للإرسال إلى Pi Browser App
     * [تصحيح حاسم]: تم إزالة Number() و parseFloat() نهائياً. الآن يتم إرجاع القيم كنصوص.
     */
    static createPiPaymentManifest(userId, stroopsAmount, memoText) {
        // التحقق من أن stroopsAmount هو نص/سلسلة BigInt وليس رقماً عائماً
        if (typeof stroopsAmount !== 'string') {
            stroopsAmount = stroopsAmount.toString(); // تحويل آمن لو كان BigInt
        }

        return {
            // إزالة التحويل العائم نهائياً، وإرجاع الـ Stroops كنص صريح (هذا ما يقبله SDK إذا أردت الإرسال بدقة)
            amount: stroopsAmount, // لاحظ: تم تغيير name إلى "amount_stroops" لدقة أكبر أو يمكن تركه amount لكن كنص!
            // بعض الأنظمة تتطلب صيغة عشرية، لكن إبقاؤها نصاً يمنع فقدان الدقة.
            amount_stroops: stroopsAmount, 
            memo: `BIGISH-YER Real-time Clearing: ${memoText}`,
            metadata: {
                system: "BIGISH-YER_CORE",
                sub_unit_stroops: stroopsAmount,
                security_lock: "ANTI_DOUBLE_DIPPING_ACTIVE",
                // لا ندعي أننا Pi Official، بل فقط Adapter
                integration_type: "Pi-Compatible Adapter (Sandbox)"
            },
            // استخدام بديل آمن لـ Math.floor + Math.random لتوليد معرفات فريدة
            payment_identifier: `PAY-${Date.now()}-${crypto.randomUUID()}`
        };
    }
}

module.exports = PiPaymentProcessor;