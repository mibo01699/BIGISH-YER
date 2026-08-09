# BIGISH-YER: Local Infrastructure & Field Network Topology

This document specifies the technical and hardware layout required to maintain stable cryptographic clearing nodes, point-of-sale (POS) connections, and sync local merchant loops (GAV App) with the macro-ledger framework (BIGISH-YER Backend) within the economic landscape of Yemen.

---

## 1. Network Topology & Hybrid Architecture

Due to local internet connectivity limitations and power grid constraints in conflict-affected regions, the framework implements a **Hybrid Offline-First Sync Topology**:

```text
  [ Local POS Device / GAV App ]  <─── Local BLE / Offline QR Exchange ───>  [ Beneficiary Wallet / AJYAL ]
                 │
      (Periodic Internet Sync)
                 │
                 ▼
     [ Regional Edge Proxy Node ] ─── Encrypted Tunnel (cryptoEngine.js) ───> [ BIGISH-YER Core Ledger Server ]
```

### 📶 Offline-First Settlement Fallback
* **Local Caching Protocol**: If the merchant device loses connection during a clearing request, transaction payload structures are cryptographically signed and securely queued inside local memory.
* **Anti-Double Dipping Check**: Once a connection to the server is re-established, the ledger uses `AntiDoubleDippingEngine.js` to cross-examine and verify the integrity of the offline queues before flushing state values into the core database.

---

## 2. Hardware Deployment Specifications

To establish a functional infrastructure footprint supporting humanitarian aid distribution and commercial operations:

### 📟 Merchant Point-of-Sale (POS) Terminal Specifications
- **Operating System**: Android 10+ or Linux-embedded runtime.
- **Hardware Integrations**: Biometric scanner compatibility, secure element hardware module for cryptographic key retention, and offline-compatible QR rendering matrix.
- **Client Deployment**: Pre-installed with the production build of the **GAV Core client**.

### 🖥️ Regional Gateway Proxy Nodes
- **Hardware Node Requirement**: Mini-PC or single-board compute clustering module deployed locally inside designated provincial clearing sectors (e.g., Sana'a, Aden).
- **Functionality**: Acts as a localized transaction aggregation filter, managing data routing to the core Pi Network SDK APIs over optimized lower-bandwidth data pipes.

---

## 3. Local Operational Compliance & Security Verification

1. Local merchant nodes must cycle encryption keys daily via updates triggered by the server's `cryptoEngine.js` module.
2. In-App mining processes outlined in `mining.js` are paused locally on the device if hardware integrity checks (SafetyNet / device attestation) report compromised client environments.
3. Every local connection endpoint must parse authorization telemetry conforming to the automated integration checkpoints defined inside `.github/workflows/node-ci.yml`.
