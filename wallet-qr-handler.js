// wallet-qr-handler.js - موديول لقط وفك تشفير الـ QR وتنفيذ الدفع المزدوج داخل المحفظة (Sandbox)

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
            
            const piAmt = BigInt(urlParams.get('piAmt'));
            const yerAmt = BigInt(urlParams.get('yerAmt'));

            // التحقق من أن المبالغ أكبر من صفر
            if (piAmt <= 0n || yerAmt <= 0n) {
                throw new Error("المبالغ يجب أن تكون أكبر من صفر.");
            }

            return {
                invoiceId: urlParams.get('id'),
                merchantPiAddress: urlParams.get('piDest'),
                merchantYerAddress: urlParams.get('yerDest'),
                piAmountStroops: piAmt,
                yerAmountSubunits: yerAmt
            };
        } catch (error) {
            throw new Error("فشل في تحليل بيانات الرمز: " + error.message);
        }
    }

    /**
     * تنفيذ المعاملة (محاكاة Sandbox) - بدون ادعاءات Pi SDK رسمية
     */
    async executeHybridPayment(paymentDetails, piAdapterInstance, dexAmmInstance) {
        console.log(`جاري تجهيز الدفع للفاتورة: ${paymentDetails.invoiceId}`);

        // 1. محاكاة دفع Pi عبر محول متوافق (Adapter)
        const piTx = await piAdapterInstance.createTransaction({
            amount: paymentDetails.piAmountStroops, 
            paymentData: { destination: paymentDetails.merchantPiAddress },
            privateKey: this.userPiPrivateKey
        });

        // 2. محاكاة دفع YER عبر عقد السيولة الذكي (Sandbox)
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