# BIGISH-YER Technical Report

## 1. Introduction & Strategic Goal
The BIGISH-YER system is a sovereign software infrastructure designed to enhance economic stability and digital transformation in Yemen. It operates as a **Pi-compatible adapter (Sandbox/Testnet)** and does not claim any official partnership with Pi Network, UNICEF, or Mercy Corps.

## 2. Architecture & Strict Mathematical Constraints
All financial operations rely on **Zero Floating-Point Arithmetic** using `BigInt`:
- **Pi Network Scale:** 7 decimal places (1 Pi = 10^7 Stroops).
- **YER Scale:** 10 decimal places (1 YER = 10^10 Sub-units).

### Hybrid Clearing Flow

                    |
                    v
            [Split 50% / 50%]
              /            \
             /              \
            v                v
[50% YER Local Liquidity]  [50% Pi via Stroops]



## 3. Security Review (Anti-Double Dipping)
**File:** `AntiDoubleDippingEngine.js`
- **Function:** Implements an atomic concurrency lock to prevent duplicate processing and race conditions during large payments.
- **Assessment:** The code efficiently prevents replay attacks and ensures that only one transaction per nonce is processed. It aligns with the "Zero Float" and security rules.

## 4. Repository Structure & Configuration
The repository is organized as follows:

| Directory / File | Description |
| :--- | :--- |
| `/engines` | Core engines (clearing, vesting, AMM, security, etc.) |
| `/tests` | Unit tests (using `node --test`) |
| `/config` | Environment configuration and reference texts |
| `/contracts` | Smart contracts (Solidity / Rust) |
| `/public` | Frontend UI (Sandbox demo) |

## 5. Security & Protection Recommendations
1. **Environment Variables:** Strict enforcement of `.env` to prevent API keys from leaking into public repositories.
2. **Dependency Management:** Use only standard Node.js modules. No external libraries like `bignumber.js` are required, as we use `BigInt` natively.
3. **CI Pipeline:** All changes must pass `npm test` (using `node --test`).

---

*This document is for informational purposes only and reflects the current project state.*
