// FeeManagementProcessor.js - محرك إدارة الرسوم السيادية والتنافسية للمنظومة الخماسية لعام 2026
// متوافق تماماً مع دقة BigInt و 300M YER Tokenomics

class FeeManagementProcessor {
    /**
     * احتساب رسوم الخدمة لعمليات التحويل والمقاصة بناءً على نوع المنصة والجهة
     * @param {BigInt} amountInSubUnits - المبلغ الإجمالي للعملية بالوحدات الصغرى
     * @param {string} platformType - نوع المنصة المصدر للطلب
     */
    static calculatePlatformFee(amountInSubUnits, platformType) {
        if (amountInSubUnits <= 0n) return 0n;

        let feeAmount = 0n;

        switch (platformType) {
            case 'P2P_TRANSFER':
                // التحويلات العادية مجانية
                feeAmount = 0n;
                break;

            case 'SOVEREIGN_GOV':
                // رسوم خدمة رمزية جداً (0.1%) على الجهات السيادية
                feeAmount = (amountInSubUnits * 1n) / 1000n; 
                break;

            case 'AJYAL':
                // منصة أجيال الإنسانية مجانية بالكامل
                feeAmount = 0n;
                break;

            case 'GAV':
                // نسبة رسوم تنافسية جداً (0.5%)
                feeAmount = (amountInSubUnits * 5n) / 1000n;
                break;

            case 'AUCTION':
                // نسبة رسوم تنافسية (0.75%)
                feeAmount = (amountInSubUnits * 75n) / 10000n;
                break;

            default:
                throw new Error("FEE_ERROR: Unsupported platform transaction type.");
        }

        return feeAmount;
    }
}

module.exports = FeeManagementProcessor;