# 🔌 BIGISH-YER Unified Hybrid Gateway API Specification

Welcome to the open developer toolkit for integrating **BIGISH-YER** as your parallel cryptographic currency mechanism alongside the native Pi Network SDK. 

By utilizing this gateway, your Web3 app can accept compliant hybrid payments (Pi + YER) directly from the Pi Browser environment.

---

## 🚀 1. Architectural Architecture Integration Flow


---

## 🛠️ 2. Frontend Integration (JavaScript SDK snippet)

Include the universal configuration block inside your Web3 application interface to establish handshake capabilities with the wallet database:

```javascript
const BigishYerGateway = {
    endpoint: "https://bigish-yer.cloud",
    appId: "YOUR_REGISTERED_PI_APP_ID",

    /**
     * Executes parallel validation for the complementary cash asset component
     * @param {string} recipientPiUsername - Target user session handle
     * @param {number} yerAmount - Micro-unit value to be subtracted
     * @param {string} trackingMemo - Cross-reference identifier
     */
    initiatePayment: async function(recipientPiUsername, yerAmount, trackingMemo) {
        const payload = {
            app_id: this.appId,
            recipient: recipientPiUsername,
            amount: yerAmount * 1000000, // Converts to precision micro-units
            memo: trackingMemo,
            timestamp: Date.now()
        };

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            if (result.status === "SUCCESS") {
                console.log(`Payment Synced via Node. Tx: ${result.ledger_hash}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error("BIGISH-YER Gateway connection failed:", error);
            return false;
        }
    }
};
```

---

## 📡 3. Expected Server Core Callback Responses

When parsing structural state changes via your backend node compiler, the unified gateway returns structured JSON logs to guarantee anti-duplication states:

```json
{
  "status": "SUCCESS",
  "gateway_transaction_id": "BYG-HYBRID-992104-YER",
  "metadata": {
    "sender": "@buyer_pi_username",
    "recipient": "@merchant_pi_username",
    "micro_units_deducted": 50000000,
    "fiat_equivalent_paper": "500.00 YER"
  },
  "anti_fraud": {
    "double_dipping_check": "PASSED",
    "kyc_alignment_state": "VERIFIED_INDIVIDUAL"
  },
  "ledger_hash": "0x7ed6157036c6bb4511f19e95ea6356d8082960bc0"
}
```

---
## 📄 Compliance & Fair Use
All applications leveraging this pipeline must be fully open-source under the MIT license and strictly bind user profiles to verified Pi
