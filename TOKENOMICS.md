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
