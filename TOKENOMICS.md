# BIGISH-YER Hybrid Tokenomics (PiRC1 & Protocol 23 Compliant)

This document outlines the macroeconomic and technical specifications governing the issuance of the **Yemen Economic Recovery Token (YER)** as a native utility asset deployed via Pi Network Protocol 23 smart contracts.

## 🪙 Token Specifications
- **Token Name:** Yemen Economic Recovery Token
- **Ticker:** YER
- **Blockchain Layer:** Pi Network Layer 1 (Post-Mainnet Migration)
- **Standard Framework:** PiRC1 Utility Asset Model
- **Primary Market Pair:** YER / PI (Exclusively trading inside Pi DEX)

## 🔄 Dual-Token Atomic Payment Architecture
To protect localized purchasing power against extreme currency inflation, the platform utilizes a unique split-payment matrix inside the Pi Browser environment:
1. **Pi Coin (The Macro-Reserve Anchor):** Prices real-world goods and international donor aid disbursements using the **Global Consensus Value (GCV)** standard ($314,159 benchmark). This serves as an unalterable value-anchor to prevent merchant wealth depletion.
2. **YER Token (The Micro-Velocity Buffer):** Processes local high-frequency retail transactions, agricultural supply-chain expenses, and localized daily worker wages. YER pricing adjusts dynamically based on the automated market maker (AMM) pools on the Pi DEX.

## 🔒 Anti-Speculation & Rug-Pull Protection
In absolute compliance with the Pi Network Core Team's mandate for building genuine utility:
- **Utility-First Lock:** The YER token smart contract prohibits any token minting or public distribution until the core payroll and tracking modules are fully operational on the Pi Testnet.
- **Immutable Escrow Pools:** 100% of the Pi Coins committed during the initial initialization phase are programmatically routed to locked liquidity reserves on the Pi DEX. Developers hold zero extraction privileges, ensuring total systemic integrity for international institutional donors.


## 🛡️ Anti-Double Dipping & Multi-Platform Integrity
The ecosystem implements `AntiDoubleDippingEngine.js` to dynamically cross-reference verified Pi KYC data across BIGISH, AJYAL, and GAV, preventing dual-payouts and job role duplication.

# YER Asset Tokenomics Standard Matrix

## 🪙 Token Specification
* **Name:** Yemen Economic Recovery Token
* **Symbol:** YER
* **Total Fixed Supply:** 300,000,000 YER
* **Decimals:** 10 (Base Unit multiplied by $10^{10}$)

## 📊 Allocation and Distribution Model (Fixed Arithmetic)
All allocation limits are strictly enforced via the core clearing engine using fixed micro-units:

* **Sovereign Strategic Reserve Fund:** 20,000,000 YER (Allocated to the Sovereign Fund for institutional stabilization).
* **Ecosystem Node Allocation:** 280,000,000 YER (Distributed programmatically across authorized economic rails including GAV, AJYAL, and AMAN).

## ⚠️ Financial Compliance Rule
No floating-point operations are permitted during distribution computations. Any internal reward scaling or mining ratios must perform division only at the final presentation layer, maintaining integer precision on-chain.
