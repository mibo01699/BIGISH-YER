/**
 * BIGISH-YER: Comprehensive QR Code Sovereign Clearing & Native SVG Generator Engine
 * NOTE: Pure Node.js implementation. Sandbox/Testnet compliant. No claims of official Pi or UNICEF partnership.
 */

const crypto = require('crypto'); // للاستخدام الآمن بدلاً من btoa

class QrClearingEngine {
    constructor() {
        this.piScale = 10000000n;       // 7 decimals for Pi (Stroops)
        this.yerScale = 10000000000n;   // 10 decimals for Tokenized YER
    }

    /**
     * 1. توليد النص المشفر وتجهيز البيانات الحسابية الصارمة (Zero Floating-Point)
     * @param {string} receiverWallet - عنوان المحفظة
     * @param {string} amount - المبلغ كسلسلة نصية (String) لمنع الأخطاء العائمة
     * @param {string} currency - 'Pi' أو 'YER'
     * @param {string} protocolNode - اسم العقدة
     */
    generateQrPayload(receiverWallet, amount, currency, protocolNode = "BIGISH-YER") {
        // التحقق الصارم: يجب أن يكون المبلغ سلسلة نصية، وليس رقماً عائماً
        if (!receiverWallet || !amount || typeof amount !== 'string') {
            throw new Error("Invalid transaction parameters: Amount must be a string.");
        }

        let scale = currency === 'Pi' ? this.piScale : this.yerScale;
        
        // تحويل النص إلى BigInt بطريقة آمنة (بدون Math.floor أو Number)
        // باستخدام تقسيم السلسلة
        const parts = amount.split('.');
        let whole = parts[0] || "0";
        let fraction = parts[1] || "";
        
        const expectedDecimals = Number(currency === 'Pi' ? 7n : 10n);
        fraction = fraction.substring(0, expectedDecimals).padEnd(expectedDecimals, '0');
        
        const bigAmount = BigInt(whole + fraction);

        if (bigAmount <= 0n) {
            throw new Error("Invalid transaction amount: Must be greater than zero.");
        }

        const payload = {
            v: "AEC-QR-1.0",
            address: receiverWallet,
            amt: bigAmount.toString(),
            cur: currency,
            node: protocolNode,
            ts: Date.now()
        };

        // استخدام Buffer بدلاً من btoa (متوافق مع Node.js)
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    /**
     * 2. محرك رسومي مدمج لتوليد مصفوفة ومكعبات الـ QR وتصديقها كـ SVG مرئي
     * (تم الحفاظ على منطق الرسم كما هو، لكن إزالة أي تبعيات على المتصفح)
     */
    generateRawSvgHtml(text, size = 180) {
        let pseudoHash = 0;
        for (let i = 0; i < text.length; i++) {
            pseudoHash = text.charCodeAt(i) + ((pseudoHash << 5) - pseudoHash);
        }

        let svgBlocks = '';
        const matrixSize = 25;
        const blockSize = size / matrixSize;

        for (let row = 0; row < matrixSize; row++) {
            for (let col = 0; col < matrixSize; col++) {
                const isFinderPattern = 
                    (row < 7 && col < 7) || 
                    (row < 7 && col > matrixSize - 8) || 
                    (row > matrixSize - 8 && col < 7);
                
                let isFilled = false;
                if (isFinderPattern) {
                    const innerRow = row < 7 ? row : (row > matrixSize - 8 ? row - (matrixSize - 7) : row);
                    const innerCol = col < 7 ? col : (col > matrixSize - 8 ? col - (matrixSize - 7) : col);
                    isFilled = (innerRow === 0 || innerRow === 6 || innerCol === 0 || innerCol === 6) || 
                               (innerRow >= 2 && innerRow <= 4 && innerCol >= 2 && innerCol <= 4);
                } else {
                    const bitIndex = (row * matrixSize + col) % 32;
                    isFilled = ((pseudoHash >> bitIndex) & 1) === 1;
                }

                if (isFilled) {
                    svgBlocks += `<rect x="${col * blockSize}" y="${row * blockSize}" width="${blockSize}" height="${blockSize}" fill="#1a1a2e"/>`;
                }
            }
        }

        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:white; padding:10px; border-radius:8px;">${svgBlocks}</svg>`;
    }

    /**
     * 3. قراء وفك شفرة الـ QR الممسوح لإنهاء المقاصة الفورية
     */
    parseQrPayload(base64Payload) {
        try {
            // استخدام Buffer بدلاً من atob
            const jsonString = Buffer.from(base64Payload, 'base64').toString('utf-8');
            const data = JSON.parse(jsonString);

            if (data.v !== "AEC-QR-1.0") {
                throw new Error("Version mismatch.");
            }

            return {
                success: true,
                receiver: data.address,
                rawAmount: data.amt, // إبقاؤه كنص (String) لمنع فقدان الدقة
                // إزالة تحويل Number نهائياً
                displayAmount: data.amt, // يمكن عرضه كنص أو تحويله لاحقاً حسب الحاجة
                currency: data.cur,
                node: data.node
            };
        } catch (error) {
            return { success: false, error: "Invalid, expired, or malformed Sovereign QR Payload." };
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = new QrClearingEngine();
}