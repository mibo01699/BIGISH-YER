// Starlink Sovereign Query & Billing Engine (BigInt Version)

const axios = require('axios');

class StarlinkSovereignBilling {
    constructor() {
        // تم استبدال BigNumber بـ BigInt (لا نستخدم القيم العشرية)
        this.gcvPi = 314159n; // GCV كمرجع داخلي فقط (غير رسمي)
        this.profitRate = 102n; // 2% (أساس 100)
        this.withdrawalOverhead = 104n; // 4% (أساس 100)
        this.SCALE = 10000000000n; // دقة YER
    }

    async fetchLiveStarlinkInvoice(starlinkAccountId, starlinkProviderApiUrl, apiKey) {
        try {
            const response = await axios.get(`${starlinkProviderApiUrl}/v1/accounts/${starlinkAccountId}/invoice`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            // إرجاع المبلغ كنص (عدد صحيح بالدولار أو بالسنت)
            return BigInt(Math.round(parseFloat(response.data.amountUSD) * 100)); // تحويل بسيط للدولار، لكن نفضل نص
        } catch (error) {
            throw new Error(`فشل الاستعلام عن حساب ستارلينك: ${error.message}`);
        }
    }

    async processPayment(invoiceUSD, paymentMethod, yerToPiRate, piToUsdtRate) {
        // تحويل المدخلات إلى BigInt (بافتراض أن المدخلات نصوص أرقام صحيحة أو يمكن تحويلها)
        const C_invoice = BigInt(invoiceUSD);
        const X_yer_pi = BigInt(yerToPiRate);
        const X_pi_usdt = BigInt(piToUsdtRate);

        // حساب التكلفة الإجمالية بالدولار شاملة الأرباح ورسوم التحويل
        const totalRequiredUSD = (C_invoice * this.profitRate * this.withdrawalOverhead) / (100n * 100n);

        let finalCost = "0";
        if (paymentMethod === "YER") {
            // الدفع الكامل برمز YER
            const requiredPi = (totalRequiredUSD * this.SCALE) / X_pi_usdt;
            finalCost = ((requiredPi * this.SCALE) / X_yer_pi).toString();
        } else if (paymentMethod === "PI") {
            // الدفع الكامل بعملة Pi (Stroops)
            finalCost = ((totalRequiredUSD * 10000000n) / X_pi_usdt).toString();
        } else {
            throw new Error("طريقة الدفع غير مدعومة");
        }

        return {
            paymentMethod,
            amountRequired: finalCost,
            fiatPaperTargetUSD: ((C_invoice * this.withdrawalOverhead) / 100n).toString(),
            status: "INVOICE_QUERIED_AND_PRICED"
        };
    }
}

module.exports = new StarlinkSovereignBilling();