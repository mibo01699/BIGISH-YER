# AMAN Protocol & BIGISH-YER Macro-Financial Integration Specification

This document details the cross-repository financial architecture binding the **AMAN Insurance Protocol** directly to the **BIGISH-YER Sovereign Clearing Infrastructure** under the Arabian Eagle Ecosystem (A.E.C.) framework for 2026.

## 💳 1. The Financial Bridge (Zero Floating-Point Mandate)
To preserve strict bank-grade precision during micro-insurance premium collections and large-scale emergency cargo/infrastructure damage liquidations, all calculations between AMAN and BIGISH-YER operate on **Strict BigInt Fixed-Point Arithmetic**:

* **Pi Network Base Token Precision**: 7 Decimal Places ($1 \text{ Pi} = 10^7 \text{ Stroops}$)
* **Yemen Stabilized Currency (YER) Precision**: 10 Decimal Places ($1 \text{ YER} = 10^{10} \text{ Sovereign Sub-units}$)

## 🔄 2. Transaction Flow & Clearing Lifecycle

1. **Premium Calculation & DEX Conversion (DEX Rate Pull)**:
   * When a beneficiary requests an insurance policy inside `AMAN-Protocol`, the dynamic premium is calculated in USD by the Multi-Agent AI Core.
   * AMAN queries the native `BIGISH-YER` decentralized constant-product ($X \times Y = K$) exchange liquidity pool to pull the exact sub-unit price relation of Pi/USD.
   * The equivalent whole Pi amount is computed via fractionless multiplication and collected seamlessly through the Pi KYC Sandbox Boundary.

2. **Automated Loss Settlement & YER Disbursal**:
   * Upon multi-party verification (AI predictive proof + verified human local field inspector report), a claim is triggered.
   * The approved compensation amount is instantly cast into 10-decimal integer space.
   * `BIGISH-YER` invokes the `AntiDoubleDippingEngine.js` and routes the liquidation payout natively to the beneficiary's wallet via the `Pi / YER` liquidity pool.
   * This structure prevents rounding exploits and rules out cumulative truncation vulnerabilities entirely.

## 🔒 3. Concurrency Protection & Compliance
* **Anti-Fraud Alignment**: Concurrent claim payments are strictly governed by transaction locks inside `SovereignClearingGuard.js`.
* **Data Sovereignty**: KYC/KYB records are decoupled from public visibility, maintaining absolute conformity with Pi Core Team guidelines and international corporate insurance directives.
