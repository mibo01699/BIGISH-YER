const express = require('express');
const axios = require('axios'); // لعمل طلبات لخوادم Pi
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// مفتاح API الخاص بك من منصة مطوري Pi (يجب وضعه في Replit Secrets)
const PI_API_KEY = process.env.PI_API_KEY; 

// 1. نقطة الموافقة على الدفع (Approve)
app.post('/api/pi/approve', async (req, res) => {
    const { paymentId } = req.body;
    try {
        // التواصل مع Pi API للموافقة على الدفعة
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { 'Authorization': `Key ${PI_API_KEY}` }
        });
        res.json({ message: "تمت الموافقة من قبل الخادم" });
    } catch (error) {
        console.error("خطأ في Approve:", error.response.data);
        res.status(500).json({ error: "فشل في الموافقة على الدفعة" });
    }
});

// 2. نقطة إكمال الدفع (Complete)
app.post('/api/pi/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    try {
        // إبلاغ Pi API بأن العملية اكتملت بنجاح في قاعدة بياناتك
        const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            txid: txid
        }, {
            headers: { 'Authorization': `Key ${PI_API_KEY}` }
        });
        res.json({ message: "تم تأكيد العملية بنجاح", data: response.data });
    } catch (error) {
        console.error("خطأ في Complete:", error.response.data);
        res.status(500).json({ error: "فشل في إكمال الدفعة" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`الخادم يعمل على منفذ ${PORT}`));
/**
 * @file server.js
 * @description خادم التشغيل والمقاصة الرئيسي لمحفظة BIGISH-YER
 */

const express = require('express');
const piIntegration = require('./pi-integration');

const app = express();
app.use(express.json());

// ربط بوابات التكامل الخاصة بـ Pi Browser والـ DEX
app.use('/api/pi', piIntegration);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`[سيرفر سيادي]: المحفظة تعمل بنجاح على المنفذ ${PORT}`);
    });
}

module.exports = app;
