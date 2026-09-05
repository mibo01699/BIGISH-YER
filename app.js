// app.js - البوابة السيادية الموحدة لصندوق النسر العربي (متوافق مع Vercel)
const express = require('express');
const app = express();

// نقطة التحقق من صحة التطبيق (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    app: 'BIGISH-YER'
  });
});

// نقطة جلب معلومات التطبيق (للبوابة)
app.get('/api/apps', (req, res) => {
  res.status(200).json({
    id: 'bigish-yer',
    name: 'BIGISH-YER',
    description: 'طبقة التسوية المالية الأساسية ومنظومة الريال الرقمي اليمني',
    version: '1.0.0',
    status: 'ONLINE'
  });
});

// نقطة الحالة العامة (اختياري)
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString()
  });
});

// تصدير التطبيق لـ Vercel
module.exports = app;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

// استخدام Helmet
app.use(helmet());

// باقي الكود...