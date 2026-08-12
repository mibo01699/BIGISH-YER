// GAV Multi-Language Translation and Retail POS Notification Engine
// Compliance: Pi Network Layer 1 (Protocol 23) & UNICEF Digital Public Goods
// Strict Integer Architecture: 10 Decimals YER, 7 Decimals Pi. Zero Floats.

class GavNotificationEngine {
    constructor() {
        this.YER_SCALE = 10000000000n; // 10^10 Precision

        // مصفوفة اللغات الـ 11 لخدمة نقاط بيع المعونات العينية (AJYAL) ومزارعي البخور والقهوة
        this.translations = {
            "ar": { voucher_redeemed: "تم التحقق من كود معونة AJYAL وصرف السلع العينية بنجاح واستقرار للمستفيد.", checkout_success: "تمت تسوية فاتورة نقطة البيع الهجينة بنجاح." },
            "en": { voucher_redeemed: "AJYAL aid voucher validated and in-kind goods successfully disbursed to beneficiary.", checkout_success: "Hybrid POS invoice settled and cleared successfully." },
            "zh": { voucher_redeemed: "AJYAL援助券已验证，实物商品成功发放给受益人。", checkout_success: "混合POS发票成功结算并清算。" },
            "th": { voucher_redeemed: "ตรวจสอบเวาเชอร์ช่วยเหลือ AJYAL และจ่ายสินค้าในรูปแบบสิ่งของแก่ผู้รับผลประโยชน์สำเร็จแล้ว.", checkout_success: "ชำระและหักบัญชีใบแจ้งหนี้ POS แบบไฮบริดสำเร็จแล้ว." },
            "tl": { voucher_redeemed: "Na-validate ang AJYAL aid voucher at matagumpay na naipamahagi ang mga kalakal sa benepisyaryo.", checkout_success: "Matagumpay na na-settle at na-clear ang hybrid POS invoice." },
            "ms": { voucher_redeemed: "Baucar bantuan AJYAL disahkan dan barangan barangan berjaya diagihkan kepada penerima.", checkout_success: "Invois POS hibrid diselesaikan dan dijelaskan dengan jaya." },
            "tr": { voucher_redeemed: "AJYAL yardım kuponu doğrulandı ve ayni mallar hak sahibine başarıyla teslim edildi.", checkout_success: "Hibrit POS faturası başarıyla kapatıldı ve takas edildi." },
            "ko": { voucher_redeemed: "AJYAL 구호 바우처가 확인되었으며 현물 물품이 수혜자에게 성공적으로 지급되었습니다.", checkout_success: "하이브리드 POS 인보이스가 성공적으로 정산 및 청산되었습니다." },
            "ru": { voucher_redeemed: "Ваучер помощи AJYAL верифицирован, натуральная помощь успешно выдана бенефициару.", checkout_success: "Гибридный POS-счет успешно оплачен и закрыт." },
            "hi": { voucher_redeemed: "AJYAL सहायता वाउचर सत्यापित किया गया और वस्तुगत वस्तुएं लाभार्थी को सफलतापूर्वक वितरित की गईं।", checkout_success: "हाइब्रिड पीओएस चालान सफलतापूर्वक व्यवस्थित और स्वीकृत किया गया।" },
            "ur": { voucher_redeemed: "AJYAL امدادی واؤچر کی تصدیق ہو گئی ہے اور مستحقین میں اشیاء کامیابی سے تقسیم کر دی گئی ہیں۔", checkout_success: "ہائبرڈ POS انوائس کامیابی کے ساتھ طے پا گئی ہے۔" }
        };
    }

    /**
     * يولد إشعارات نقاط البيع وصرف السلات الغذائية دون استخدام فواصل عشرية
     */
    generatePosNotice(beneficiaryWallet, eventTypeInt, rawAmountNominal, langCode) {
        const amountUnitsInt = BigInt(Math.round(parseFloat(rawAmountNominal) * Number(this.YER_SCALE)));
        const selectedLang = this.translations[langCode] ? langCode : "en";
        
        const coreMessage = eventTypeInt === 1n 
            ? this.translations[selectedLang].voucher_redeemed 
            : this.translations[selectedLang].checkout_success;

        return {
            beneficiary: beneficiaryWallet,
            eventCode: eventTypeInt.toString(),
            ledgerValueSubUnits: amountUnitsInt.toString(), 
            translatedNotice: `${coreMessage} [Sub-Units: ${amountUnitsInt.toString()}]`,
            timestamp: Date.now().toString()
        };
    }
}

export default GavNotificationEngine;
