// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// استيراد المحركات الموجودة (بدون افتراضات)
const YERTokenomics = require('./YERTokenomicsCanonical');
const AntiDoubleDipping = require('./AntiDoubleDippingEngine');
const SovereignClearingGuard = require('./SovereignClearingGuard');

const app = express();
const PORT = process.env.PORT || 3001;

// الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json());

// دفتر الأستاذ المؤقت (in-memory)
const ledger = {
  balances: {},
  transactions: [],
  idempotencyMap: new Map(),
};

// ===== نقاط النهاية =====

// 1. الصحة
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bigish-yer',
    version: process.env.npm_package_version || '0.2.0',
    environment: process.env.NODE_ENV || 'testnet',
  });
});

// 2. التوكنوميكس
app.get('/api/tokenomics', (req, res) => {
  try {
    const data = YERTokenomics.getCanonicalData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokenomics' });
  }
});

// 3. إنشاء معاملة
app.post('/api/transactions', (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required' });
  }

  // التحقق من التكرار
  if (ledger.idempotencyMap.has(idempotencyKey)) {
    return res.status(409).json({
      error: 'DUPLICATE_TRANSACTION',
      transaction: ledger.idempotencyMap.get(idempotencyKey),
    });
  }

  const { source, destination, amount, currency = 'YER' } = req.body;
  if (!source || !destination || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid source, destination, or amount' });
  }
  if (currency !== 'YER') {
    return res.status(400).json({ error: 'Only YER currency is supported' });
  }

  // التحقق من الرصيد
  const sourceBalance = ledger.balances[source] || 0;
  const amountInBase = Math.floor(amount * (10 ** YERTokenomics.precision));
  if (sourceBalance < amountInBase) {
    return res.status(400).json({ error: 'INSUFFICIENT_BALANCE' });
  }

  // تنفيذ التحويل
  ledger.balances[source] = sourceBalance - amountInBase;
  ledger.balances[destination] = (ledger.balances[destination] || 0) + amountInBase;

  const transaction = {
    id: require('crypto').randomUUID(),
    idempotencyKey,
    source,
    destination,
    amount: parseFloat(amount),
    currency,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };

  ledger.transactions.push(transaction);
  ledger.idempotencyMap.set(idempotencyKey, transaction);

  res.status(201).json({
    message: 'Transaction completed successfully',
    transaction,
  });
});

// 4. استرجاع معاملة
app.get('/api/transactions/:key', (req, res) => {
  const tx = ledger.idempotencyMap.get(req.params.key);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

// 5. رصيد عنوان
app.get('/api/balance/:address', (req, res) => {
  const balance = (ledger.balances[req.params.address] || 0) / (10 ** YERTokenomics.precision);
  res.json({ address: req.params.address, balance, currency: 'YER' });
});

// ===== تصدير لـ Vercel =====
module.exports = app;

// ===== التشغيل المحلي =====
if (require.main === module) {
  // رصيد تجريبي
  const initBalance = Math.floor(10000 * (10 ** YERTokenomics.precision));
  ledger.balances['test_source'] = initBalance;

  app.listen(PORT, () => {
    console.log(`BIGISH-YER running on port ${PORT}`);
    console.log(`Test source balance: 10,000 YER`);
  });
}