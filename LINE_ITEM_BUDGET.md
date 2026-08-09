# BIGISH-YER: Detailed Line-Item Operational Budget

This document presents the detailed line-item expenditures required for the deployment, maintenance, and multi-app integration (AJYAL & GAV) of the BIGISH-YER Macroeconomic Stabilization platform within the Pi Network framework.

---

## 1. Personnel & Engineering Costs (Annual)

| Line Item ID | Description | Unit Cost | Quantity | Total Allocation |
| :--- | :--- | :--- | :--- | :--- |
| **PERS-01** | Lead Blockchain Architect (Pi SDK v2.0 Compliance) | $1,200 / mo | 1 | $14,400 |
| **PERS-02** | Full-Stack Engineer (Clearing Node & Express API Maintenance) | $800 / mo | 1 | $9,600 |
| **PERS-03** | AI/RAG Data Engineer (Maintaining `SMART_SUPPORT.md` Vectors) | $600 / mo | 1 | $7,200 |

---

## 2. Infrastructure, Cloud & Node Hardware (Annual)

| Line Item ID | Description | Unit Cost | Quantity | Total Allocation |
| :--- | :--- | :--- | :--- | :--- |
| **INFRA-01** | Secure Cloud Server Hosting (Redundant HTTPS Web Sandbox) | $100 / mo | 12 mo | $1,200 |
| **INFRA-02** | Encrypted Database Node Instance (`cryptoEngine.js` Backing) | $50 / mo | 12 mo | $600 |
| **INFRA-03** | SSL/TLS Certificate & Dedicated IP Router Address | $150 / yr | 1 | $150 |
| **INFRA-04** | API Traffic Bandwidth (Handling high-volume `/api/yer/transfer`) | $250 / yr | 1 | $250 |

---

## 3. Operational & Security Compliance Software (Annual)

| Line Item ID | Description | Unit Cost | Quantity | Total Allocation |
| :--- | :--- | :--- | :--- | :--- |
| **SOFT-01** | AI Model Tokens API Quota (Providing instantaneous smart responses) | $0.02 / req | 40,000 req | $800 |
| **SOFT-02** | Vector DB Cluster Storage subscription (Knowledge base vectors) | $30 / mo | 12 mo | $360 |
| **SOFT-03** | CI/CD Automated Test Pipeline Extension Runner (GitHub Actions) | $120 / yr | 1 | $120 |

---

## 4. Ledger Auditing & Verification Parameters

1. All monetary expenses logged inside this line-item index must align strictly with the tokenomics percentages defined in `BUDGET.md`.
2. Financial audit hooks verify that code deployments under `.github/workflows/node-ci.yml` do not alter the macro-liquidity index baseline calculated by `simulation.py`.
