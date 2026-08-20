# BIGISH-YER: Macroeconomic Stabilization for Yemen via Pi Network Architecture

This repository contains the software framework and economic simulation models implementing **Research Papers No. 11046 and No. 11129 (Published via EasyChair)**. The project designs a practical blockchain-based blueprint to resolve the liquidity crisis and stabilize the macroeconomic infrastructure of the Republic of Yemen utilizing the decentralized framework of the Pi Network.

## 🚀 Vision & Social Impact (UNICEF & Mercy Corps Alignment)
In conflict-affected zones like Yemen, financial fragmentation and hyperinflation severely impact small businesses, youth, and families. This project bridges **Web3 Technology (Pi SDK)** with **Macroeconomic Policy** to foster institutional recovery, digital financial inclusion, and reliable liquidity distribution.

## 🛠️ Repository Components & Tech Stack
- **`simulation.py`**: A Python-based simulation engine mimicking how Pi token reserves and utility integration mitigate hyperinflation and improve stability indices.
- **Pi Network SDK Blueprint**: Architectural mapping to bridge the Pi Wallet API with institutional ledger frameworks.
- **License**: Fully Open Source under the MIT License (Digital Public Good standard).

## 📊 How to Run the Simulation
Ensure you have Python installed, then execute:
```bash
python simulation.py
```

## 🔗 Academic References
- **Paper 11046**: A Radical Solution to the Crisis via Pi Network Infrastructure ([EasyChair Presentation](https://easychair.org))
- **Paper 11129**: Macroeconomic and Institutional Framework for Stabilization ([EasyChair Presentation](https://easychair.org))

## 💰 Clearing & Settlement System

BIGISH-YER is the financial backbone that manages all payment processes, including the settlement of POS receivables disbursed for in-kind assistance.

### Key Features:
- **Financial Transfers:** Supports individual and batch transfers (`/api/yer/transfer` and `/api/yer/batch-transfer`).

- **Wallet Management:** Create and manage YER wallets for beneficiaries and POS.

- **Clearing System Integration:** Receive payment requests from the AJYAL clearing system.

### Integration with Other Applications:
- **AJYAL:** Sends payment requests to settle POS receivables via the clearing system.

- **GAV:** Receives payments in POS wallets.
# BIGISH-YER: Macroeconomic Stabilization & Sovereign Clearing Infrastructure

The decentralized blockchain backbone engineered to mitigate liquidity crises, resolve financial fragmentation, and promote structured financial inclusion in the Republic of Yemen using the Pi Network infrastructure. This repository implements academic blueprints (Research Papers No. 11046 and No. 11129 via EasyChair) aligned with the United Nations Innovation standards.

---

## 🛠 Architectural Overview & Component Mapping

This project serves as an institutional clearing house and digital public wallet interface, integrating procurement auctions with immediate peer-to-peer distribution networks.

### 1. Core Financial Architecture (Zero Floating-Point Constraint)
To maintain bank-grade precision and prevent cumulative truncation or rounding exploits, all monetary calculations across this infrastructure strictly forbid floating-point mathematics. Financial state machines utilize **Strict BigInt Fixed-Point Arithmetic**:
*   **Pi Network Token Precision**: 7 Decimal Places ($1 \text{ Pi} = 10^7 \text{ Stroops/Units}$)
*   **Yemen Stabilized Currency (YER) Precision**: 10 Decimal Places ($1 \text{ YER} = 10^{10} \text{ Sovereign Sub-units}$)

### 2. File Repository Directory Mapping
*   `AntiDoubleDippingEngine.js`: Enforces an atomic concurrency lock preventing beneficiaries or vendors from receiving double allocations or overlapping concurrent payouts during bulk clearing cycles.
*   `wallet-core.js` & `gav-core.js`: Manages individual/batch monetary transfers (`/api/yer/transfer` and `/api/yer/batch-transfer`) and receives automated POS settlement inputs from the GAV node application layer.
*   `HybridClearingProcessor.js`: The algorithmic bridge separating joint marketplace auction bids into 50% GCV (Global Consensus Value) Pi Token ledger requirements and 50% YER Local Liquidity Pool adjustments.
*   `SovereignClearingGuard.js`: Implements the simplified KYB (Know Your Business) verification engine, chaining the core Pi Network KYC identity status to official institutional vendor profiles while managing concurrent transactional locks.
*   `app-replit-ext.js`: Extends the main express lifecycle (`app.js`) with secure REST endpoints and maps the simulated Constant Product ($X \times Y = K$) Pi/YER Decentralized Exchange (DEX) liquidity pool.

---

## 💳 Hybrid Payment & Automated Clearing Specification

When a supplier auction inside the `suppliers-auction` subsystem triggers a settlement, the clearing cycle is processed through strict integer transformations:

1.  **DEX Rate Pull**: The system queries the native `BIGISH-YER` liquidity pool state to fetch the absolute BigInt price relation (expressed as YER sub-units per 1 whole Pi).
2.  **Fractionless Splitting**: The nominal bid is instantly cast into 10-decimal integer space. Half is routed natively to the YER core balance ledgers, and the remaining half is programmatically converted to Pi Token base units utilizing pure multiplication and division isolating zero decimal remainders.
3.  **SDK Manifest Injection**: The generated structural output feeds data payloads directly ready for compliance execution within the Pi Browser (`manifest.json`) using secure sandbox paradigms.

---

## 🌍 Open Source & UNICEF Innovation Fund Alignment

This infrastructure meets the stringent compliance guidelines for deployment as a public utility in crisis-affected environments:
*   **Digital Public Good Standard**: Fully open-source under the permissive MIT License, ensuring transparent utility for humanitarian organizations and government systems.
*   **Sovereign KYB Model**: Leverages Pi Network's decentralized identity KYC to securely validate local merchants without introducing prohibitive administrative friction or data privacy vulnerabilities.
*   **Anti-Exploit Concurrency**: Mitigates regional systemic vulnerabilities through decentralized cryptographic transaction locking profiles, defending resource allocation lines against transactional manipulation.

---

## 🚀 Future Deployment Guide (Target: Replit Sandbox)

To transition this repository from GitHub into an active local runtime environment:
1. Clone this repository directly into your workspace.
2. Install dependencies via `npm install`.
3. Boot the environment utilizing `node app.js` to expose local verification nodes.




✅ The BIGISH-YER repository incorporates a decentralized blockchain infrastructure designed to alleviate liquidity crises, address financial fragmentation, and promote financial inclusion in Yemen using the Pi Network. The repository functions as a hybrid central clearinghouse (DEX/AMM) connecting seven interconnected projects, including: COBRA-Protocol: for securing emergency communication channels and transmitting biometric data; Be-well: for settling cross-border healthcare bills; suppliers-auction: for managing industrial supply auctions split between Pi tokens and local currency; AJYAL: for distributing instant payments and point-of-sale terminals; GAV-The-Incense-Route: for verifying supply chains and releasing temporary balances; and AMAN-Protocol: for calculating dynamic premiums and clearing claims.
