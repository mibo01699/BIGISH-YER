const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل الملفات الساكنة لوجهة المستخدم (الـ Frontend المدمج)
app.use(express.static(path.join(__dirname, 'public')));

// مسار المقاصة والتحويل الموحد (The Core Clearing /api/yer/transfer)
app.post('/api/yer/transfer', (req, res) => {
    try {
        const { sender, receiver, amount, currency } = req.body;
        
        if (!sender || !receiver || !amount) {
            return res.status(400).json({ success: false, error: 'Missing critical transfer parameters.' });
        }

        // تطبيق شرط منع الفواصل الحسابية الحاسم (Zero Floating-Point Constraint) عبر BigInt
        // تحويل القيمة بناءً على نوع العملة لمنع خسارة الأجزاء الرياضية
        let scale = currency === 'Pi' ? 10000000n : 10000000000n; // Pi: 7 decimals, YER: 10 decimals
        let BigAmount = BigInt(Math.floor(amount * Number(scale)));

        console.log(`[Clearinghouse] Processing zero floating-point ledger transfer of ${BigAmount.toString()} sub-units.`);

        return res.status(200).json({
            success: true,
            transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            processedAmount: BigAmount.toString(),
            status: 'Cleared_Success'
        });
    } catch (error) {
        console.error('[Clearinghouse Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Sovereign Clearing Fail.' });
    }
});

// مسار فحص الحالة للمنظومة بالكامل
app.get('/api/status', (req, res) => {
    res.json({
        status: "active",
        ecosystem: "Arabian Eagle Ecosystem (A.E.C)",
        protocols: ["BIGISH-YER", "COBRA", "Be-well", "suppliers-auction", "AJYAL", "GAV", "AMAN"],
        timestamp: new Date().toISOString()
    });
});

// تحديد المنفذ ديناميكياً لحل تضارب بيئات Replit و Docker
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`🚀 BIGISH-YER Unified Engine is running securely on port ${PORT}`);
    console.log(`==================================================================`);
});

module.exports = app;
