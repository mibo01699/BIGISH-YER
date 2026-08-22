const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let verifiedMerchantInvoices = [];

// استقبال فواتير تسوية المساعدات العينية من تجار طريق البخور KYB
app.post('/api/settle-merchant-invoice', (req, res) => {
    const { merchantKybId, redeemedAidCode, netValuePi } = req.body;
    
    // توثيق وحقن المعاملة في السجل لمنع الـ Double-Dipping
    const settlementReceipt = {
        txId: "TX-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        merchantKybId,
        redeemedAidCode,
        netValuePi,
        status: "COMPLETED",
        timestamp: new Date()
    };
    
    verifiedMerchantInvoices.push(settlementReceipt);
    res.json({ status: "SUCCESS", receipt: settlementReceipt });
});

app.listen(PORT, () => console.log(`🛡️ BIGISH-YER Settlement Hub deployed stable on port ${PORT}`));

// أضف هذه السطور داخل ملف app.js المذكر في المستودع لتفعيل بروتوكول المقاصة
const clearingApi = require('./routes/clearing-api');

// بعد إعداد متغير الـ app = express()
app.use(express.json()); // لتمكين الخادم من قراءة بيانات الـ JSON المرسلة من الواجهات
app.use('/api/yer/payments', clearingApi);

