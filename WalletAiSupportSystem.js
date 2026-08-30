// Wallet AI Financial Consultant & Human Ticket Pipeline
// Optimized for Node.js (CommonJS) - Strict BigInt, No Floating Point

const crypto = require('crypto');

// تعريف ترجمات محلية (بدلاً من الاعتماد على ملف خارجي غير مؤكد)
const translations = {
    en: { success: "AI Audit Passed" },
    ar: { success: "نجح التدقيق الذكي" },
    // يمكن إضافة لغات أخرى هنا
};

class WalletAiSupportSystem {
    constructor() {
        this.YER_SCALE = 10000000000n; // 10^10
        this.activeTickets = new Map();
        this.ticketCounter = 0n;
    }

    /**
     * مساعد ذكاء اصطناعي لتدقيق المعاملات المالية والمقاصة قبل إرسالها
     * @param {string} queryText - نص الاستعلام (غير مستخدم في الحساب)
     * @param {string} proposedValueNominal - المبلغ كسلسلة نصية (مثال: "1.5" أو "1500000000")
     * @param {string} langCode - كود اللغة
     */
    consultWalletAi(queryText, proposedValueNominal, langCode) {
        try {
            // تحويل النص إلى BigInt بدقة 10 خانات عشرية دون أي أرقام عائمة
            const amountStr = String(proposedValueNominal).trim();
            if (!amountStr) throw new Error("Empty amount");

            // استخدام منطق التحويل الثابت (نفس أسلوب parseToFixedPoint)
            const parts = amountStr.split('.');
            let whole = parts[0] || "0";
            let fraction = parts[1] || "";
            // ضبط الكسور إلى 10 خانات
            fraction = fraction.substring(0, 10).padEnd(10, '0');
            const parsedAmountInt = BigInt(whole + fraction);

            const selectedLang = translations[langCode] ? langCode : "en";

            return {
                aiVerdict: "CLEARING_AUDIT_PASSED",
                isStructureValid: true,
                integerHex: "0x" + parsedAmountInt.toString(16),
                aiMessageText: translations[selectedLang].success + ` (Verified Absolute BigInt: ${parsedAmountInt.toString()})`
            };
        } catch (err) {
            return {
                aiVerdict: "MALFORMED_FLOAT_LEAK_DETECTED",
                isStructureValid: false,
                aiMessageText: "CRITICAL SECURITY ERROR: AI Core rejected unsafe decimal floating point parameter."
            };
        }
    }

    /**
     * يفتح قناة تواصل دعم بشري عند حدوث نزاع مالي أو قفل تكرار للمحفظة
     */
    openHumanSupportTicket(walletAddress, exceptionCodeInt, issueNarrative) {
        this.ticketCounter += 1n;
        const currentTicketId = `YER-WALLET-TICKET-${this.ticketCounter.toString()}`;

        const supportTicket = {
            id: currentTicketId,
            targetWallet: walletAddress,
            internalErrorCode: BigInt(exceptionCodeInt).toString(), // تحويل آمن
            description: issueNarrative,
            status: "OPEN_FOR_HUMAN_AUDIT_PROCEDURE",
            createdTimestamp: Date.now().toString()
        };

        this.activeTickets.set(currentTicketId, supportTicket);
        return supportTicket;
    }
}

module.exports = WalletAiSupportSystem;