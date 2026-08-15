// FeeManagementProcessor.js - محرك إدارة الرسوم السيادية والتنافسية للمنظومة الخماسية لعام 2026

class FeeManagementProcessor {
    /**
     * احتساب رسوم الخدمة لعمليات التحويل والمقاصة بناءً على نوع المنصة والجهة
     * @param {BigInt} amountInSubUnits - المبلغ الإجمالي للعملية بالوحدات الصغرى
     * @param {string} platformType - نوع المنصة المصدر للطلب ('P2P_TRANSFER', 'SOVEREIGN_GOV', 'AJYAL', 'GAV', 'AUCTION')
     */
    static calculatePlatformFee(amountInSubUnits, platformType) {
        if (amountInSubUnits <= 0n) return 0n;

        let feeAmount = 0n;

        switch (platformType) {
            case 'P2P_TRANSFER':
                // 1. التحويلات العادية بين حسابات ومحافظ الأفراد YER مجانية بالكامل
                feeAmount = 0n;
                break;

            case 'SOVEREIGN_GOV':
                // 2. رسوم خدمة رمزية جداً (0.1%) على الجهات السيادية الممولة لدفع المرتبات والمساعدات
                feeAmount = (amountInSubUnits * 1n) / 1000n; 
                break;

            case 'AJYAL':
                // 3. منصة أجيال الإنسانية والتعليمية مجانية بالكامل للمستفيدين والطلاب والمنظمات الإغاثية
                feeAmount = 0n;
                break;

            case 'GAV':
                // 4. نسبة رسوم تنافسية جداً (0.5%) لنقاط بيع وتجارة المحاصيل (مقارنة بـ 2% إلى 5% في الأسواق التقليدية)
                feeAmount = (amountInSubUnits * 5n) / 1000n;
                break;

            case 'AUCTION':
                // 5. نسبة رسوم تنافسية (0.75%) على عقود وترسية مناقصات مزاد الموردين الكبرى
                feeAmount = (amountInSubUnits * 75n) / 10000n;
                break;

            default:
                throw new Error("FEE_ERROR: Unsupported platform transaction type.");
        }

        return feeAmount;
    }
}

module.exports = FeeManagementProcessor;
