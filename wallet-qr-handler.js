// wallet-qr-handler.js - موديول لقط وفك تشفير الـ QR وتنفيذ الدفع المزدوج داخل المحفظة

class WalletQRProcessor {
    constructor(userPiPrivateKey, userYerPrivateKey) {
        this.userPiPrivateKey = userPiPrivateKey;
        this.userYerPrivateKey = userYerPrivateKey;
    }

    /**
     * دالة تحليل النص الملقوط من كاميرا المحفظة بعد مسح الـ QR
     */
    parseScannedQR(qrString) {
        try {
            if (!qrString.startsWith("pi-hybrid://pos-pay")) {
                throw new Error("رمز QR غير صالحة أو لا يدعم الدفع الهجين المعتمد.");
            }

            const urlParams = new URLSearchParams(qrString.split('?')[1]);
            
            return {
                invoiceId: urlParams.get('id'),
                merchantPiAddress: urlParams.get('piDest'),
                merchantYerAddress: urlParams.get('yerDest'),
                piAmountStroops: BigInt(urlParams.get('piAmt')),
                yerAmountSubunits: BigInt(urlParams.get('yerAmt'))
            };
        } catch (error) {
            throw new Error("فشل في تحليل بيانات الرمز: " + error.message);
        }
    }

    /**
     * توقيع المعاملتين وإرسالهما إلى البلوكشين (Pi Network Layer 1 - Protocol 23)
     */
    async executeHybridPayment(paymentDetails, piSdkInstance, dexAmmInstance) {
        console.log(`جاري تجهيز الدفع للفاتورة: ${paymentDetails.invoiceId}`);

        // 1. تنفيذ معالجة دفع عملة Pi الأساسية عبر Pi SDK 
        const piTx = await piSdkInstance.createTransaction({
            amount: paymentDetails.piAmountStroops, 
            paymentData: { destination: paymentDetails.merchantPiAddress },
            privateKey: this.userPiPrivateKey
        });

        // 2. تنفيذ معالجة دفع رمز YER عبر عقد السيولة الذكي أو محفظة المتجر
        const yerTx = await dexAmmInstance.transferTokens({
            amount: paymentDetails.yerAmountSubunits,
            destination: paymentDetails.merchantYerAddress,
            privateKey: this.userYerPrivateKey
        });

        // إرجاع الـ Hashes لنقطة البيع لإتمام الفاتورة
        return {
            invoiceId: paymentDetails.invoiceId,
            txPiHash: piTx.hash,
            txYerHash: yerTx.hash,
            status: "SUCCESS"
        };
    }
}

module.exports = WalletQRProcessor;
