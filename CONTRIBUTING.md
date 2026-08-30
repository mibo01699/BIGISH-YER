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

Step 2: Code Implementation Requirements

· Test Coverage: If you are adding a new core service or route, you must supply accompanying automated assertions inside the tests/ directory using Node.js Test Runner (node --test). Do not use Mocha/Chai.
· Economic Alignment: Algorithms affecting balance calculations or token velocity must be aligned with the canonical tokenomics defined in YERTokenomicsCanonical.js (Maximum Supply: 300M YER; Allocation: 10% / 30% / 60%).
· Zero Floating-Point: All financial calculations must use BigInt exclusively. No floating-point arithmetic (Number, Math.floor, parseFloat) is allowed.

Step 3: Local Quality Verification

Before submitting a Pull Request (PR), execute the validation matrix locally to ensure your changes do not break existing modules:

```bash
# Run the complete Node.js automated test suites (using node --test)
npm test
```

Step 4: Submitting a Pull Request

1. Commit your changes with descriptive, standardized headers (e.g., feat(clearing): add batch transfer support or fix(crypto): patch IV array length verification).
2. Push your localized development branch to your fork.
3. Open a Pull Request pointing to the main branch of the official BIGISH-YER repository.
4. Ensure your PR satisfies the automatic tests executing inside .github/workflows/main-ci.yml.

---

3. Code Review & Code of Conduct

· All Pull Requests require an explicit structural sign-off from at least one core maintainer before merging.
· We expect all contributors to maintain professional, supportive, and universal communication across issues, code comments, and discussion boards.