const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل الواجهة الافتراضية
app.use(express.static(path.join(__dirname, 'public')));

// مسار المقاصة الرئيسي الحاسم لليمن والـ Pi
app.post('/api/yer/transfer', (req, res) => {
    const { amount } = req.body;
    let BigAmount = BigInt(Math.floor((amount || 0) * 10000000000));
    return res.status(200).json({ success: true, processedAmount: BigAmount.toString(), status: 'Cleared_Success' });
});

app.get('/api/status', (req, res) => {
    res.json({ status: "active", ecosystem: "Arabian Eagle Ecosystem (A.E.C)", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BIGISH-YER Unified Engine is running securely on port ${PORT}`);
});

module.exports = app;
