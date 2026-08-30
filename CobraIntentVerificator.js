# Contributing to BIGISH-YER Macroeconomic Stabilization Framework

Thank you for your interest in contributing to the BIGISH-YER ecosystem! This project bridges academic economic modeling with blockchain engineering inside a **Pi-compatible Sandbox/Testnet framework** to drive financial inclusion and cross-application clearing (AJYAL & GAV) in Yemen.

To maintain the absolute integrity of our ledger and transaction workflows, all contributors must strictly adhere to the guidelines detailed below.

---

## 1. Security Compliance Standards (Mandatory)

Because this platform processes financial clearing and token distribution, code submissions that violate the following principles will be automatically rejected:
* **Zero Trust Data Handling**: Any new endpoint or data model dealing with payment parameters must implement the AES-256-GCM authenticated encryption modules defined in `cryptoEngine.js`.
* **Anti-Double Dipping Enforcement**: Modifications to payment pipelines must pass structural uniqueness validation hooks via the `AntiDoubleDippingEngine.js` layer.
* **Supported Integration Status**: No external financial routing or balance adjustments are authorized without validating user identity via supported adapter/integration status (e.g., `SUPPORTED_SANDBOX`, `SUPPORTED_TESTNET`). It is strictly forbidden to claim, store, or request raw Pi KYC data.

---

## 2. Technical Contribution Workflow

Please follow this structured process to submit updates, features, or bug fixes to the repository:

### Step 1: Fork & Local Environment Setup
1. Fork the repository and clone your fork locally.
2. Setup your private test environment environment variables using `.env.example` as a baseline template:
   ```bash
   cp .env.example .env