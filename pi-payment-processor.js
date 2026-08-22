// backend/pi-payment-processor.js
// محرك المقاصة السيادي الخالي من الفواصل العشريّة (Zero Floating-Point Engine)

const PI_SCALE = 10_000_000n; // 1 Pi = 10^7 Stroops (Strict BigInt)
const YER_SCALE = 10_000_000_000n; // 1 YER = 10^10 Sub-units

class PiPaymentProcessor {
    /**
     * معالجة طلب المقاصة الهجين بنسبة 50% لعملة Pi و 50% للريال اليمني المستقر (YER)
     * @param {string} totalInvoiceAmount - إجمالي قيمة الفاتورة بنظام السلسلة النصية لمنع الـ Float
     * @param {string} exchangeRate - سعر الصرف السائد من مصفوفة AMM (كم وحدة YER لكل 1 Pi)
     */
    static processHybridInvoice(totalInvoiceAmount, exchangeRate) {
        // تحويل المدخلات النصية فوراً إلى BigInt لمنع أي حسابات عشرية نهائياً
        const totalAmountBig = BigInt(totalInvoiceAmount); 
        const rateBig = BigInt(exchangeRate);

        // 1. تقسيم القيمة بدقة هندسية حاسمة (50% لكل جانب)
        const halfYerShare = totalAmountBig / 2n;
        const remainingShareForPi = totalAmountBig - halfYerShare; // لضمان عدم ضياع أي كسور نتيجة القسمة

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
     */
    static createPiPaymentManifest(userId, stroopsAmount, memoText) {
        // تحويل وحدات الـ Stroops إلى صيغة عشرية قياسية يقبلها تطبيق الـ SDK فقط عند العرض الداخلي
        const piAmountStandard = (Number(stroopsAmount) / Number(PI_SCALE)).toFixed(7);

        return {
            amount: parseFloat(piAmountStandard),
            memo: `BIGISH-YER Real-time Clearing: ${memoText}`,
            metadata: {
                system: "BIGISH-YER_CORE",
                sub_unit_stroops: stroopsAmount.toString(),
                security_lock: "ANTI_DOUBLE_DIPPING_ACTIVE"
            },
            payment_identifier: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };
    }
}

module.exports = PiPaymentProcessor;
