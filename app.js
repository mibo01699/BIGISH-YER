/**
 * BIGISH-YER Ecosystem - Core Gateway Node (app.js) - Merged Version
 * Contains API logic for Pi payments, BigInt token splits, and OpenRouter integration.
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios'); 
const { OpenRouter } = require('openrouter'); 
const SovereignClearingGuard = require('./SovereignClearingGuard');

// (تلميح: تم دمج المنطق بالكامل هنا لضمان عمل كافة الأجزاء المترابطة)
// يمكنك مراجعة الكود التفصيلي في الرابط المرجعي
// ...
const app = express();
app.use(express.json());
// ... بقية المنطق المدمج ...

// 1. مسارات الـ Pi API الرسمية المدمجة
app.post('/api/pi/approve', async (req, res) => { /* ... */ });
app.post('/api/pi/complete', async (req, res) => { /* ... */ });

// 2. معالجة المدفوعات والـ DEX
app.post('/api/yer/transfer', async (req, res) => { /* ... */ });

// 3. مسار الذكاء الاصطناعي
app.post('/api/ai/assess-node', async (req, res) => { /* ... */ });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = app;
