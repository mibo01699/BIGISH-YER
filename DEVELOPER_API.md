# 🔌 BIGISH-YER Unified Hybrid Gateway API Specification

Welcome to the open developer toolkit for integrating **BIGISH-YER** as your parallel cryptographic currency mechanism alongside a **Pi-compatible Adapter (Sandbox/Testnet)**.

By utilizing this gateway, your Web3 app can accept compliant hybrid payments (Pi + YER) within a **sandboxed environment** (no official Pi Network affiliation claimed).

---

## 🚀 1. Architectural Integration Flow

The gateway operates on a **hybrid clearing model**:
- **Pi Path:** Processes a portion of the invoice value using Pi coins (scaled via GCV as a community reference only).
- **YER Path:** Processes the remaining portion using YER tokens (fixed supply: 300,000,000 YER; distribution: 10% / 30% / 60%).

All financial calculations must use **BigInt** exclusively. No floating-point arithmetic is allowed.

---

## 🛠️ 2. Frontend Integration (JavaScript SDK snippet)

Include the universal configuration block inside your Web3 application interface to establish handshake capabilities with the wallet database:

```javascript
const BigishYerGateway = {
    endpoint: "https://bigish-yer.cloud", // Sandbox endpoint
    appId: "YOUR_REGISTERED_APP_ID", // Internal ID (not Pi-specific)

    /**
     * Executes parallel validation for the complementary cash asset component
     * @param {string} recipientUsername - Target user session handle
     * @param {string} yerAmount - Micro-unit value to be subtracted (as string)
     * @param {string} trackingMemo - Cross-reference identifier
     */
    initiatePayment: async function(recipientUsername, yerAmount, trackingMemo) {
        // Ensure yerAmount is a string (for BigInt compatibility)
        const amountStr = String(yerAmount);
        const payload = {
            app_id: this.appId,
            recipient: recipientUsername,
            amount: amountStr, // Passed as string, no multiplication
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