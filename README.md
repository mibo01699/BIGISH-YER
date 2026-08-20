# BIGISH-YER: Macroeconomic Stabilization & Sovereign Clearing Infrastructure for Yemen

This repository contains the production-grade decentralized software framework and economic clearing engines implementing **Research Papers No. 11046 and No. 11129 (Published via EasyChair)**. The project constructs a practical, sovereign Web3 infrastructure designed to resolve the catastrophic liquidity crisis, mitigate hyperinflation, and heal the financial fragmentation of the Republic of Yemen by leveraging the decentralized ledger of the Pi Network.

---

## 🚀 Vision, Social Impact & International Institutional Alignment

In conflict-affected and hyperinflationary environments like Yemen, financial partitioning severely degrades local market health, affecting small businesses, youth, and vulnerable supply lines. 

Aligned with the digital public utility benchmarks of **UNICEF Innovation** and the resource allocation standards of **Mercy Corps**, this platform bridges macro-financial policies with strict tokenomic validation. It provides a reliable distribution vehicle for humanitarian aid, civil payrolls, and multi-tier institutional clearing while ensuring continuous financial inclusion.

---

## 🌐 Ecosystem Integration Matrix (The Seven Interconnected Protocols)

`BIGISH-YER` functions as the central micro-financial clearinghouse, liquidity anchor, and settlement hub ($X \times Y = K$ AMM/DEX) for the entire **Arabian Eagle Ecosystem (A.E.C.)** led by **Mayass Ali**. It dynamically coordinates real-time token shifts and clearing manifests across seven specialized nodes:

1.  **BIGISH-YER (The Core Ledger)**: Manages sovereign individual/batch digital wallets, liquidity pools, and zero floating-point fractionless clearing macros.
2.  **COBRA-Protocol**: Secures emergency, disaster-resilient open broadband channels and handles telemetry reporting to trigger predictive network routing.
3.  **Be-well Platform**: Settles cross-border healthcare utility accounts and automates critical bio-medical vital alert notifications.
4.  **suppliers-auction Node**: Regulates industrial procurement auctions and split-bidding states divided evenly between core crypto-assets and stable local tenders.
5.  **AJYAL Framework**: Distributes instant, real-time localized transactions, digital payroll lines, and point-of-sale (POS) merchant clearing cycles.
6.  **GAV-The-Incense-Route**: Traces secure asset routing across historic geopolitical supply lines and releases escrowed multi-party logistics balances.
7.  **AMAN-Protocol**: Governs decentralized smart insurance contracts, calculates dynamic premiums based on satellite metadata, and routes programmatic claim payouts under cross-repo clearings.

---

## 🛠 Architectural Overview & Component Mapping

To secure institutional banking precision and defeat transaction-rounding vulnerabilities, all currency transformations across this cross-repo pipeline enforce a **Zero Floating-Point Constraint**. All state-machine engines leverage fixed-point **Strict BigInt Arithmetic**:

*   **Pi Network Token Scale**: 7 Decimal Places ($1 \text{ Pi} = 10^7 \text{ Stroops/Units}$)
*   **Yemen Stabilized Currency (YER) Scale**: 10 Decimal Places ($1 \text{ YER} = 10^{10} \text{ Sovereign Sub-units}$)

### 1. Core Directory & File Mapping
*   `AntiDoubleDippingEngine.js`: Enforces an atomic concurrency lock preventing overlapping concurrent payouts during bulk clearing cycles.
*   `wallet-core.js` & `gav-core.js`: Processes secure transfer loops (`/api/yer/transfer`) and registers points-of-sale settlement inputs.
*   `HybridClearingProcessor.js`: Splits incoming marketplace auction bids into 50% Global Consensus Value (GCV) Pi Tokens and 50% YER Local Liquidity balances.
*   `SovereignClearingGuard.js`: Implements the simplified Know-Your-Business (KYB) and Know-Your-Customer (KYC) checking layers chained to the Pi Network secure sandbox.
*   `app-replit-ext.js`: Extends the main express app lifecycle with active REST API configurations and maps the underlying decentralized exchange asset matrix.
*   `simulation.py`: A comprehensive python-driven telemetry simulation verifying hyperinflation containment curves.

---

## 💳 Hybrid Payment & Automated Clearing Specification

Whenever an operational application node (such as `suppliers-auction` or `AMAN-Protocol`) submits a settlement invoice, the clearing workflow triggers integer conversions:

1.  **DEX Conversion Rate Fetch**: The system queries the native `BIGISH-YER` AMM matrix to extract the absolute integer-space asset weight relations.
2.  **Fractionless Splitting Execution**: The baseline contract value is immediately cast into 10-decimal integer space. 50% of the asset volume routes directly to local stable ledger reserves, while the remaining 50% converts into sub-unit Pi Stroops using absolute multiplication isolating zero decimal remainders.
3.  **SDK Manifest Injection**: The compiled payload output constructs compliant data packages ready for direct execution within the Pi Browser (`manifest.json`) using secure sandbox paradigms.

---

## 📊 How to Run the Simulation

Ensure you have Python 3.10+ installed within your active execution context, then trigger the localized macroeconomic simulation script:
```bash
python simulation.py
```

---

## 🔗 Academic References & Groundwork
*   **Paper 11046**: *A Radical Solution to the Liquidity Crisis via Pi Network Decentralized Infrastructures* ([EasyChair Institutional Presentation](https://easychair.org)).
*   **Paper 11129**: *Macroeconomic and Institutional Framework for Stabilization and Financial Inclusion* ([EasyChair Institutional Presentation](https://easychair.org)).

---

## 🚀 Sandbox Deployment Guide (Target: Replit Environment)

To deploy and build this sovereign institutional clearing node inside your localized runtime container:
1. Clone this repository directly into your active workspace.
2. Install production dependencies via: `npm install`.
3. Boot the unified ecosystem gateway utilizing: `node app.js`.
