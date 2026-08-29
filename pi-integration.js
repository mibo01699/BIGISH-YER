/**
 * Pi Network Secure Sandbox Clearing Integration
 * Built for production-grade transaction execution
 * NOTE: Uses sandbox/testnet adapter. No official Pi KYC claims.
 */

const axios = require('axios');

class PiIntegrationBridge {
    constructor() {
        // استدعاء متغيرات البيئة من الملف الآمن .env
        this.apiKey = process.env.PI_NETWORK_SANDBOX_KEY || "mock_sandbox_key_for_testing";
        this.apiBaseUrl = "https://api.minepi.com"; // تم تصحيح الرابط
    }

    async verifyAndInjectManifest(paymentId, expectedStroops) {
        if (!paymentId || typeof paymentId !== 'string') {
            throw new Error("CRITICAL: Invalid or malicious Payment ID structural layout.");
        }

        try {
            const response = await axios.get(`${this.apiBaseUrl}/v2/payments/${paymentId}`, {
                headers: { 'Authorization': `Key ${this.apiKey}` }
            });

            const paymentData = response.data;

            // تحويل آمن من نص إلى BigInt (مع التأكد من أن المبلغ نص صحيح)
            const actualAmount = BigInt(paymentData.amount.toString());
            const expectedAmount = BigInt(expectedStroops.toString());

            if (actualAmount !== expectedAmount) {
                throw new Error("SECURITY FRAUD ALERT: Blockchain asset weights mismatch.");
            }

            return {
                verified: true,
                txHash: paymentData.transaction.txid,
                clearingStatus: "SUCCESS"
            };
        } catch (error) {
            return {
                verified: false,
                clearingStatus: "FAILED",
                reason: error.message
            };
        }
    }
}

module.exports = PiIntegrationBridge;