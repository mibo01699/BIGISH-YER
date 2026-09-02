# BIGISH-YER Technical Report

## 1. Introduction & Strategic Goal

The BIGISH-YER system is a sovereign software infrastructure designed to enhance economic stability and digital transformation in Yemen. It operates as a Pi-compatible adapter (Sandbox/Testnet) and does not claim any official partnership with Pi Network, UNICEF, or Mercy Corps.

## 2. Architecture & Strict Mathematical Constraints

All financial operations rely on Zero Floating-Point Arithmetic using `BigInt`:

- Pi Network Scale: 7 decimal places (1 Pi = 10^7 Stroops).
- YER Scale: 10 decimal places (1 YER = 10^10 Sub-units).

### Hybrid Clearing Flow

```

[User Payment Request]
↓
[Split 50% / 50%]
/            
   /              
  ↓                ↓
[50% YER Local Liquidity] [50% Pi via Stroops]

```

## 3. Tokenomics & Launch Sequencing

### Allocation (Fixed 300M YER)

| Category | Percentage | Amount | Release Condition |
|----------|------------|--------|-------------------|
| **Community/Public Utility** | 10% | 30,000,000 YER | **Deferred** until successful Pi Launchpad deployment |
| **Ecosystem Launch/Liquidity** | 30% | 90,000,000 YER | **Available immediately** for mining and listing |
| **A.E.C Sovereign Reserve** | 60% | 180,000,000 YER | Reserved for sovereign fund |

### Launch Sequence Protection

To prevent black-market trading that could undermine the official launch:

1. **Phase 1**: Mine 90,000,000 YER (30% - Ecosystem) fully.
2. **Phase 2**: Deploy YER on Pi Launchpad and create Pi/YER liquidity pool.
3. **Phase 3**: Successful public offering per Pi's updated requirements.
4. **Phase 4**: **Activate `YER_LAUNCHPAD_STATUS = 'DEPLOYED_SUCCESS'`**.
5. **Phase 5**: **Release 30,000,000 YER (10% - Community) to public wallets**.

## 4. Security Review (Anti-Double Dipping)

File: `AntiDoubleDippingEngine.js`
- Function: Implements an atomic concurrency lock to prevent duplicate processing and race conditions during large payments.
- Assessment: The code efficiently prevents replay attacks and ensures that only one transaction per nonce is processed. It aligns with the "Zero Float" and security rules.

## 5. Repository Structure & Configuration

| Directory / File | Description |
|------------------|-------------|
| `/engines` | Core engines (clearing, vesting, AMM, security, etc.) |
| `/tests` | Unit tests (using `node --test`) |
| `/config` | Environment configuration and reference texts |
| `/contracts` | Smart contracts (Solidity / JavaScript) |
| `/public` | Frontend UI (Sandbox demo) |

## 6. Security & Protection Recommendations

- **Environment Variables**: Strict enforcement of `.env` to prevent API keys from leaking into public repositories.
- **Dependency Management**: Use only standard Node.js modules. No external libraries like `bignumber.js` are required, as we use `BigInt` natively.
- **CI Pipeline**: All changes must pass `npm test` (using `node --test`).
- **Launch Control**: The `YER_LAUNCHPAD_STATUS` environment variable controls community allocation release. Set to `DEPLOYED_SUCCESS` only after successful launch.

This document is for informational purposes only and reflects the current project state.
