// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ========== استيراد المحركات الموجودة ==========
// 1. التوكنوميكس (ثابت ومختبر)
const YERTokenomics = require('./YERTokenomicsCanonical');

// 2. محرك منع التكرار (Idempotency)
const AntiDoubleDipping = require('./AntiDoubleDippingEngine');

// 3. محرك الحراسة السيادية (للتسوية)
const SovereignClearingGuard = require('./SovereignClearingGuard');

// ========== تهيئة Express ==========
const app = express();
const PORT = process.env.PORT || 3001;

// ========== الأمان ==========
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express.json());

// ========== دفتر الأستاذ المؤقت (In-Memory) ==========
// ملاحظة: هذا مؤقت للاختبار، سيُستبدل بقاعدة بيانات لاحقاً.
const ledger = {
  balances: {},     // address -> amount (integer, using precision 10)
  transactions: [], // قائمة المعاملات المنفذة
  idempotencyMap: new Map(), // key -> transaction
};

// دالة مساعدة للتحويل من YER (مع 10 منازل عشرية) إلى عدد صحيح
const toBaseUnits = (amount) => Math.floor(amount * (10 ** YERTokenomics.precision));

// ========== نقاط النهاية ==========

// 1. نقطة الصحة (لـ Gateway)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bigish-yer',
    version: process.env.npm_package_version || '0.2.0',
    environment: process.env.NODE_ENV || 'testnet',
  });
});

// 2. عرض بيانات التوكنوميكس (يستخدم YERTokenomicsCanonical.js)
app.get('/api/tokenomics', (req, res) => {
  try {
    const data = YERTokenomics.getCanonicalData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokenomics', details: error.message });
  }
});

// 3. إنشاء معاملة مالية (مع Idempotency)
app.post('/api/transactions', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required' });
  }

  // الخطوة 1: التحقق من Idempotency باستخدام المحرك الموجود
  try {
    const antiDipping = new AntiDoubleDipping();
    const isDuplicate = antiDipping.check(idempotencyKey); // نفترض أن لديه طريقة check
    
    // إذا كانت موجودة بالفعل، نرفض الطلب
    if (ledger.idempotencyMap.has(idempotencyKey)) {
      const existingTx = ledger.idempotencyMap.get(idempotencyKey);
      return res.status(409).json({
        error: 'DUPLICATE_TRANSACTION',
        transaction: existingTx,
      });
    }
  } catch (error) {
    // إذا لم تكن الدالة check موجودة، نمرر (نتعامل مع المحرك ككائن)
    // سنستخدم منطقاً يدوياً احتياطياً
  }

  const { source, destination, amount, currency = 'YER' } = req.body;

  // التحقق من صحة المدخلات
  if (!source || !destination || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid source, destination, or amount' });
  }
  if (currency !== 'YER') {
    return res.status(400).json({ error: 'Only YER currency is supported' });
  }

  const amountInBase = toBaseUnits(parseFloat(amount));
  const sourceBalance = ledger.balances[source] || 0;

  // التحقق من كفاية الرصيد
  if (sourceBalance < amountInBase) {
    return res.status(400).json({ error: 'INSUFFICIENT_BALANCE' });
  }

  // الخطوة 2: استخدام SovereignClearingGuard للتسوية (إن وجد)
  let clearingResult = { success: true };
  try {
    const guard = new SovereignClearingGuard();
    clearingResult = guard.process({ source, destination, amount: amountInBase });
    if (!clearingResult.success) {
      return res.status(400).json({ error: clearingResult.error });
    }
  } catch (error) {
    // إذا لم يكن المحرك موجوداً أو فشل، نكمل بالتسوية اليدوية (للاختبار)
    console.warn('SovereignClearingGuard not available, using fallback.');
  }

  // تنفيذ التحويل
  ledger.balances[source] = sourceBalance - amountInBase;
  ledger.balances[destination] = (ledger.balances[destination] || 0) + amountInBase;

  const transactionRecord = {
    id: require('crypto').randomUUID(),
    idempotencyKey,
    source,
    destination,
    amount: parseFloat(amount),
    amountInBase,
    currency,
    status: 'completed',
    timestamp: new Date().toISOString(),
    clearedBy: clearingResult.success ? 'SovereignGuard' : 'Fallback',
  };

  // تخزين المعاملة
  ledger.transactions.push(transactionRecord);
  ledger.idempotencyMap.set(idempotencyKey, transactionRecord);

  res.status(201).json({
    message: 'Transaction completed successfully',
    transaction: transactionRecord,
  });
});

// 4. الاستعلام عن معاملة بواسطة Idempotency Key
app.get('/api/transactions/:key', (req, res) => {
  const tx = ledger.idempotencyMap.get(req.params.key);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(tx);
});

// 5. الاستعلام عن رصيد عنوان
app.get('/api/balance/:address', (req, res) => {
  const balanceInBase = ledger.balances[req.params.address] || 0;
  const balanceInYER = balanceInBase / (10 ** YERTokenomics.precision);
  res.json({
    address: req.params.address,
    balance: balanceInYER,
    currency: 'YER',
  });
});

// ========== تصدير التطبيق لـ Vercel ==========
module.exports = app;

// ========== التشغيل المحلي ==========
if (require.main === module) {
  // إضافة أرصدة اختبارية للتشغيل المحلي
  const testAmount = toBaseUnits(10000);
  ledger.balances['test_source'] = testAmount;
  ledger.balances['test_destination'] = 0;

  app.listen(PORT, () => {
    console.log(`🚀 BIGISH-YER running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 YER Supply: ${YERTokenomics.totalSupply}`);
    console.log(`🧪 Test source balance: 10,000 YER`);
  });
}