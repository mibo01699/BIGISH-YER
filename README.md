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

## 💰 نظام المقاصة والدفع (Clearing & Settlement)

BIGISH-YER هو العمود الفقري المالي الذي يدير جميع عمليات الدفع، بما في ذلك تسوية مستحقات نقاط البيع التي تصرف المساعدات العينية.

### الميزات الرئيسية:
- **تحويلات مالية:** دعم التحويلات الفردية والجماعية (`/api/yer/transfer` و `/api/yer/batch-transfer`).
- **إدارة المحافظ:** إنشاء وإدارة محافظ YER للمستفيدين ونقاط البيع.
- **التكامل مع نظام المقاصة:** استقبال طلبات الدفع من نظام المقاصة في AJYAL.

### الربط مع التطبيقات الأخرى:
- **AJYAL:** يرسل طلبات الدفع لتسوية مستحقات نقاط البيع عبر نظام المقاصة.
- **GAV:** يتلقى المدفوعات في محافظ نقاط البيع.
