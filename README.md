# BIGISH-YER: Macroeconomic Stabilization & Sovereign Tokenized Asset Infrastructure for Yemen

[![Ecosystem Status](https://shields.io)](#)
[![Compliance](https://shields.io)](#)
[![License](https://shields.io)](LICENSE)
[![Standards](https://shields.io)](#)

This repository implements **Research Papers No. 11046 and No. 11129 (Published via EasyChair)**, providing a sovereign Web3 public utility to address Yemen's liquidity and hyperinflation crises by deploying the **Tokenized YER Asset** on a **Pi-Compatible Adapter (Testnet-first)**.

---

## 🌐 Vision & Institutional Compliance

The platform uses transparent **On-Chain Tokenized Asset Infrastructure** to ensure anti-corruption and absolute auditability for humanitarian aid and payrolls.  
> **Note:** This project operates as a **Digital Public Good (DPG)** prototype. It does **NOT** claim any official partnership, certification, or funding from UNICEF, Mercy Corps, or the Pi Network Core Team.

### 🛡️ Core Architecture Safeguards
1. **Zero Floating-Point Constraint**: Uses fixed-point **Strict BigInt Arithmetic** (Pi Network scale: 7 decimals; YER token scale: 10 decimals).
2. **Strict Ecosystem Demarcation**: Operates inside a **Sandbox/Testnet-only adapter** without assuming unverified Mainnet DEX availability.

---

## ⚡ Ecosystem Integration Matrix (The Nine Protocols)

Led by **Mayass Ali**, BIGISH-YER coordinates clearings across nine specialized nodes within the **Arabian Eagle Ecosystem (A.E.C.)**:
1. **BIGISH-YER**: Core ledger, wallet management, and supply management.
2. **COBRA-Protocol**: Emergency broadband channels and telemetry.
3. **Be-well Platform**: Healthcare utility accounts and biomedical alerts.
4. **suppliers-auction Node**: Industrial procurement and split-bidding.
5. **AJYAL Framework**: Localized transactions and digital payrolls.
6. **GAV-The-Incense-Route**: Geopolitical supply line asset routing.
7. **AMAN-Protocol**: Decentralized smart insurance and programmatic payouts.
8. **Telecom-Mobile-Protocol**: A decentralized, sovereign communications platform. It offers integrated solutions for real virtual numbers and unblockable encrypted messaging. The platform enables account activation and high-quality international calling.
9. **Arab-Eagle-Sovereign-Fund-A.E.C.**: The Arab Eagle Sovereign Fund (A.E.C.) is a sovereign financial institution offering financing services, microloans, and interest-free credit management.

---

## 🛠️ Cleansed & Optimized File Mapping

* **`app.js`**: Unified entry point exposing zero floating-point clearing loops.
* **`PiYerAMMExchange.js`**: DEX Pi constant product formula with a 3% Max Slippage Guard.
* **`SovereignClearingGuard.js`**: Maps identity to a **Supported Integration Status (Sandbox)** – no claim of accessing Pi KYC.
* **`AntiDoubleDippingEngine.js`**: Atomic concurrency lock for bulk aid clearing.
* **`package.json`**: Stable dependency manifests and test commands (`npm test`).

---

# BIGISH-YER: Macroeconomic Stabilization & Sovereign Tokenized Asset Infrastructure for Yemen

## 📊 Core Tokenomics & Network Alignment
* **Sovereign Token Asset:** Yemen Economic Recovery Token (YER)
* **Fixed Maximum Supply:** **300,000,000 YER** (Strictly unified across all ecosystem repositories)
* **Allocation:**
  - 10% = 30,000,000 YER (Community & Public Utility)
  - 30% = 90,000,000 YER (Ecosystem Launch & Liquidity)
  - 60% = 180,000,000 YER (A.E.C Sovereign Fund Reserve)
* **Precision Scale:** Fixed-point Strict BigInt Arithmetic (YER: 10 decimals; Pi: 7 decimals)
* **Network Target:** Testnet-first validation environment

## 🛡️ Architectural & Valuation Safeguards
1. **Strict Zero-Float Constraint:** All financial clearing loops operate exclusively on precise micro-units using integer mathematics. The use of floating-point numbers or float-to-int transformations (`Math.floor`) is completely deprecated.
2. **Global Consensus Value (GCV) Policy:** GCV (314,159) is explicitly classified as a **Community/Internal Pricing Reference only**. It is NOT an official Pi Network Core Team valuation.
3. **Ledger Operational Model:** Operates as a **Hybrid Clearing Gateway Middleware**. On-chain settlement is routed through authorized **sandboxes**, ensuring data integrity without assuming unverified Mainnet DEX availability.

## 📊 Run & Test

Run macroeconomic telemetry simulation:
```bash
python simulation.py