// Wallet Multi-Language Translation and Strict Notification Engine
// Sandbox/Testnet compliant. No claims of official Pi Network or UNICEF partnership.

const crypto = require('crypto'); // غير مستخدم حالياً، لكن مفيد للتوليد المستقبلي

class WalletNotificationEngine {
    constructor() {
        this.YER_SCALE = 10000000000n; // 10^10 Precision mapping

        // مصفوفة اللغات الـ 11 المطلوبة لرواد ومجتمعات المحفظة
        this.translations = {
            "ar": { success: "تمت تسوية عملية تحويل الرصيد المالي سيادياً بنجاح.", locked: "تنبيه الأمان: تم تفعيل قفل المقاصة لمنع الإنفاق المزدوج والتكرار." },
            "en": { success: "Sovereign balance transfer settled and logged successfully.", locked: "Security alert: Clearing lock activated to prevent double dipping." },
            "zh": { success: "主权余额转账已成功结算并记录。", locked: "安全警报：结算锁已激活，以防止重复申领。" },
            "th": { success: "การโอนยอดคงเหลือหลักได้รับการชำระและบันทึกสำเร็จแล้ว.", locked: "แจ้งเตือนความปลอดภัย: ล็อคการชำระบัญชีเปิดใช้งานเพื่อป้องกันการรับซ้ำ." },
            "tl": { success: "Matagumpay na na-settle at na-log ang paglipat ng balanse.", locked: "Babala sa seguridad: Na-activate ang clearing lock upang maiwasan ang double dipping." },
            "ms": { success: "Pindahan baki kedaulatan diselesaikan dan direkodkan dengan jaya.", locked: "Amaran keselamatan: Kunci penjelasan diaktifkan untuk menghalang tuntutan bertindih." },
            "tr": { success: "Egemen bakiye transferi başarıyla kapatıldı ve kaydedildi.", locked: "Güvenlik uyarısı: Çift harcamayı önlemek için takas kilidi aktif hale getirildi." },
            "ko": { success: "주권 잔액 이체가 성공적으로 정산 및 기록되었습니다.", locked: "보안 경고: 중복 수령을 방지하기 위해 정산 잠금이 활성화되었습니다." },
            "ru": { success: "Суверенный перевод баланса успешно завершен и зарегистрирован.", locked: "Предупреждение системы безопасности: Активирована блокировка для предотвращения повторного списания." },
            "hi": { success: "संप्रभु शेष राशि हस्तांतरण सफलतापूर्वक सु입ोजित और लॉग किया गया।", locked: "सुरक्षा अलर्ट: डबल डिपिंग को रोकने के लिए समाशोधन लॉक सक्रिय किया गया है।" },
            "ur": { success: "خودمختار بیلنس کی منتقلی کامیابی کے ساتھ طے پا گئی ہے اور درج ہو گئی ہے۔", locked: "سیکیورٹی الرٹ: ڈبل ڈیپنگ کو روکنے کے لیے کلیئرنگ لاک فعال کر دیا گیا ہے۔" }
        };
    }

    /**
     * يولد إشعارات المعاملات المالية بالرقم الصحيح المطلق دون فواصل عائمة
     * @param {string} recipientAddress - عنوان المستلم
     * @param {bigint} eventTypeInt - نوع الحدث (1 = نجاح، 2 = قفل)
     * @param {string} rawAmountNominal - المبلغ كسلسلة نصية (مثال: "1.5")
     * @param {string} langCode - كود اللغة
     */
    generateWalletNotice(recipientAddress, eventTypeInt, rawAmountNominal, langCode) {
        // تحويل صارم من النص إلى BigInt (بدون parseFloat أو Math.round)
        const amountStr = String(rawAmountNominal).trim();
        if (!amountStr) throw new Error("Invalid amount");

        const parts = amountStr.split('.');
        let whole = parts[0] || "0";
        let fraction = parts[1] || "";
        // ضبط الكسور إلى 10 خانات عشرية
        fraction = fraction.substring(0, 10).padEnd(10, '0');
        const amountUnitsInt = BigInt(whole + fraction);

        const selectedLang = this.translations[langCode] ? langCode : "en";
        
        const coreMessage = eventTypeInt === 1n 
            ? this.translations[selectedLang].success 
            : this.translations[selectedLang].locked;

        return {
            recipient: recipientAddress,
            eventCode: eventTypeInt.toString(),
            ledgerValueSubUnits: amountUnitsInt.toString(),
            translatedNotice: `${coreMessage} [Sub-Units: ${amountUnitsInt.toString()}]`,
            timestamp: Date.now().toString()
        };
    }
}

module.exports = WalletNotificationEngine;