const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PI_API_KEY = process.env.PI_API_KEY || '';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// ============================================
// In-memory Ledger (للاختبار فقط)
// ============================================
const ledger = { balances: {}, transactions: {}, idempotencyMap: {} };

// ============================================
// نقاط النهاية
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    service: 'bigish-yer-wallet',
    status: 'ONLINE',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    pi: {
      authentication: PI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
      payments: PI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED'
    },
    token: { symbol: 'YER', status: 'NOT_DEPLOYED', maxSupply: '300000000' }
  });
});

// POST /api/auth - التحقق من توكن Pi (server-side verification)
app.post('/api/auth', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'accessToken is required' });

  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
    });
    if (!response.ok) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = await response.json();
    res.json({ success: true, user: { uid: user.uid, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// POST /api/payments/approve - موافقة الخادم على الدفع
app.post('/api/payments/approve', async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });
  if (!PI_API_KEY) return res.status(500).json({ error: 'PI_API_KEY not configured' });

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
    res.json({ success: true, paymentId });
  } catch (error) {
    res.status(500).json({ error: 'Server error during approval' });
  }
});

// POST /api/payments/complete - إكمال الدفع
app.post('/api/payments/complete', async (req, res) => {
  const { paymentId, txid } = req.body;
  if (!paymentId || !txid) return res.status(400).json({ error: 'paymentId and txid are required' });
  if (!PI_API_KEY) return res.status(500).json({ error: 'PI_API_KEY not configured' });

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid })
    });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
    ledger.transactions[paymentId] = { id: paymentId, txid, status: 'COMPLETED', timestamp: new Date().toISOString() };
    res.json({ success: true, paymentId, txid });
  } catch (error) {
    res.status(500).json({ error: 'Server error during completion' });
  }
});

// POST /api/payments/hybrid - دفع هجين (Pi + YER)
app.post('/api/payments/hybrid', async (req, res) => {
  const { accessToken, piAmount, yerAmount, orderId } = req.body;
  if (!accessToken || !piAmount || !yerAmount || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userResponse = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!userResponse.ok) return res.status(401).json({ error: 'Invalid token' });
    const user = await userResponse.json();

    const yerBalance = ledger.balances[user.uid]?.YER || 0;
    if (yerBalance < yerAmount) return res.status(400).json({ error: 'Insufficient YER balance' });

    ledger.balances[user.uid] = { ...ledger.balances[user.uid], YER: yerBalance - yerAmount };

    const transactionId = `hybrid_${Date.now()}`;
    ledger.transactions[transactionId] = {
      id: transactionId, userId: user.uid, type: 'HYBRID',
      piAmount, yerAmount, orderId, status: 'PENDING_PI_PAYMENT', timestamp: new Date().toISOString()
    };

    res.json({ success: true, transactionId, piAmount, yerAmount, orderId });
  } catch (error) {
    res.status(500).json({ error: 'Server error during hybrid payment' });
  }
});

// GET /api/balance/:uid
app.get('/api/balance/:uid', (req, res) => {
  const balance = ledger.balances[req.params.uid] || { Pi: 0, YER: 0 };
  res.json({ uid: req.params.uid, ...balance });
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ BIGISH-YER Wallet running on port ${PORT} (${NODE_ENV})`));
}
module.exports = app;