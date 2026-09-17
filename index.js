const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PI_API_KEY = process.env.PI_API_KEY || '';
const ADMIN_KEY = process.env.ADMIN_KEY || 'ae-admin-2026';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// In-Memory Database
// ============================================
const db = {
    balances: {},
    transactions: {},
    miningSessions: {},
    miningHistory: [],
    partnerApps: {
        // التطبيقات الشريكة المسجلة مسبقاً
        'gav': {
            id: 'gav',
            name: 'GAV Incense Route',
            apiKey: 'gav-secret-' + Math.random().toString(36).slice(2, 15),
            active: true,
            walletAddress: 'GAV_WALLET_PLACEHOLDER',
            registeredAt: new Date().toISOString()
        },
        'cobra': {
            id: 'cobra',
            name: 'COBRA Protocol',
            apiKey: 'cobra-secret-' + Math.random().toString(36).slice(2, 15),
            active: true,
            walletAddress: 'COBRA_WALLET_PLACEHOLDER',
            registeredAt: new Date().toISOString()
        },
        'telcom': {
            id: 'telcom',
            name: 'Telcom Mobile Protocol',
            apiKey: 'telcom-secret-' + Math.random().toString(36).slice(2, 15),
            active: true,
            walletAddress: 'TELCOM_WALLET_PLACEHOLDER',
            registeredAt: new Date().toISOString()
        }
    }
};

function ensureUserExists(uid) {
    if (!db.balances[uid]) db.balances[uid] = { Pi: 0, YER: 100 };
    return db.balances[uid];
}

// ============================================
// YER Tokenomics
// ============================================
const YER_TOKENOMICS = {
    symbol: 'YER', name: 'YER Ecosystem Token',
    maxSupply: 300000000, decimals: 10,
    allocations: {
        communityPublicUtility: { percentage: 10, amount: 30000000 },
        ecosystemLaunchLiquidity: { percentage: 30, amount: 90000000 },
        aecSovereignFund: { percentage: 60, amount: 180000000 }
    }
};

// ============================================
// Middleware: التحقق من API Key
// ============================================
function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const appId = req.headers['x-app-id'];

    if (!apiKey || !appId) {
        return res.status(401).json({ error: 'x-api-key and x-app-id headers required' });
    }

    const partner = db.partnerApps[appId];
    if (!partner) {
        return res.status(401).json({ error: 'Unknown app' });
    }
    if (!partner.active) {
        return res.status(403).json({ error: 'App is not active' });
    }
    if (partner.apiKey !== apiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    req.partner = partner;
    next();
}

// ============================================
// API: Health
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        service: 'bigish-yer-wallet', status: 'ONLINE',
        environment: NODE_ENV, timestamp: new Date().toISOString(),
        pi: {
            authentication: PI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
            payments: PI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED'
        },
        token: { symbol: 'YER', status: 'NOT_DEPLOYED', maxSupply: '300000000' },
        partnerApps: Object.keys(db.partnerApps).length
    });
});

app.get('/api/tokenomics', (req, res) => {
    res.json({ success: true, data: YER_TOKENOMICS });
});

// ============================================
// API: Auth
// ============================================
app.post('/api/auth', async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

    try {
        const response = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });
        if (!response.ok) return res.status(401).json({ error: 'Invalid token' });

        const user = await response.json();
        ensureUserExists(user.uid);
        res.json({ success: true, user: { uid: user.uid, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// API: Balance
// ============================================
app.get('/api/balance/:uid', (req, res) => {
    const balance = ensureUserExists(req.params.uid);
    res.json({ uid: req.params.uid, Pi: balance.Pi || 0, YER: balance.YER || 0 });
});

// ============================================
// API: Pi Deposit
// ============================================
app.post('/api/payments/approve', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId required' });
    if (!PI_API_KEY) return res.status(500).json({ error: 'PI_API_KEY not configured' });

    try {
        const response = await fetch(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }
        res.json({ success: true, paymentId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/payments/complete', async (req, res) => {
    const { paymentId, txid, userId, piAmount } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: 'paymentId and txid required' });

    let alreadyCompleted = false;
    if (PI_API_KEY) {
        try {
            const response = await fetch(
                `https://api.minepi.com/v2/payments/${paymentId}/complete`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Key ${PI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ txid })
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                if (errorText.includes('already_completed')) alreadyCompleted = true;
            }
        } catch (e) { console.error('Complete exception:', e); }
    }

    if (userId && piAmount) {
        ensureUserExists(userId);
        const depositAmount = parseFloat(piAmount);
        const existingTx = Object.values(db.transactions).find(
            tx => tx.paymentId === paymentId && tx.type === 'Pi Deposit'
        );
        if (!existingTx) {
            db.balances[userId].Pi = (db.balances[userId].Pi || 0) + depositAmount;
            const txId = `deposit_${paymentId}`;
            db.transactions[txId] = {
                id: txId, paymentId, txid, userId, from: 'Pi Wallet',
                type: 'Pi Deposit', currency: 'Pi',
                amount: depositAmount.toFixed(4), status: 'COMPLETED',
                timestamp: new Date().toISOString()
            };
        }
    }

    res.json({ success: true, paymentId, txid, alreadyCompleted });
});

// ============================================
// API: Internal Transfer
// ============================================
app.post('/api/payments/internal', async (req, res) => {
    const { accessToken, piAmount, yerAmount, recipientId, orderId, memo } = req.body;
    if (!accessToken || !orderId) return res.status(400).json({ error: 'accessToken and orderId required' });

    const pi = parseFloat(piAmount) || 0;
    const yer = parseFloat(yerAmount) || 0;
    if (pi < 0 || yer < 0 || (pi === 0 && yer === 0)) return res.status(400).json({ error: 'Invalid amount' });

    try {
        const userResponse = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!userResponse.ok) return res.status(401).json({ error: 'Invalid token' });

        const user = await userResponse.json();
        const sender = ensureUserExists(user.uid);

        if ((sender.Pi || 0) < pi) return res.status(400).json({ error: 'رصيد Pi غير كافٍ', current: sender.Pi || 0, required: pi });
        if ((sender.YER || 0) < yer) return res.status(400).json({ error: 'رصيد YER غير كافٍ', current: sender.YER || 0, required: yer });

        db.balances[user.uid].Pi = (sender.Pi || 0) - pi;
        db.balances[user.uid].YER = (sender.YER || 0) - yer;

        if (recipientId) {
            ensureUserExists(recipientId);
            db.balances[recipientId].Pi = (db.balances[recipientId].Pi || 0) + pi;
            db.balances[recipientId].YER = (db.balances[recipientId].YER || 0) + yer;
        }

        const txId = `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const type = pi > 0 && yer > 0 ? 'Hybrid Payment' : pi > 0 ? 'Pi Transfer' : 'YER Transfer';
        db.transactions[txId] = {
            id: txId, userId: user.uid, from: user.uid, to: recipientId || null,
            type, currency: pi > 0 && yer > 0 ? 'Pi + YER' : pi > 0 ? 'Pi' : 'YER',
            piAmount: pi, yerAmount: yer,
            amount: yer > 0 ? yer.toString() : pi.toString(),
            orderId, memo: memo || '', fee: 0,
            status: 'COMPLETED', timestamp: new Date().toISOString()
        };

        res.json({
            success: true, transactionId: txId, type,
            piAmount: pi, yerAmount: yer,
            newPiBalance: db.balances[user.uid].Pi,
            newYerBalance: db.balances[user.uid].YER
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// API: Transactions History
// ============================================
app.get('/api/transactions/user/:uid', (req, res) => {
    const { uid } = req.params;
    const userTxs = Object.values(db.transactions).filter(tx =>
        tx.userId === uid || tx.from === uid || tx.to === uid
    );
    userTxs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, transactions: userTxs.slice(0, 50) });
});

// ============================================
// YER Distribution (Mining)
// ============================================
app.get('/api/yer/distribution/status', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id required' });
    ensureUserExists(uid);
    const session = db.miningSessions[uid];
    if (!session || !session.active) {
        return res.json({ success: true, isDistributionActive: false, currentRatePerHour: '0.10', hoursRemaining: 0, unclaimedBalance: '0.00' });
    }
    const elapsedHours = (Date.now() - session.startTime) / 3600000;
    if (elapsedHours >= 24) { session.active = false; session.completed = true; }
    res.json({
        success: true,
        isDistributionActive: session.active,
        currentRatePerHour: session.rate.toFixed(2),
        hoursRemaining: parseFloat(Math.max(0, 24 - elapsedHours).toFixed(2)),
        unclaimedBalance: (elapsedHours * session.rate).toFixed(4)
    });
});

app.post('/api/yer/distribution/start', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id required' });
    ensureUserExists(uid);
    const existing = db.miningSessions[uid];
    if (existing && existing.active) return res.status(400).json({ error: 'جلسة نشطة موجودة' });
    db.miningSessions[uid] = { startTime: Date.now(), rate: 0.10, active: true, completed: false };
    res.json({ success: true, message: 'بدأت الجلسة' });
});

app.post('/api/yer/distribution/claim', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id required' });
    const session = db.miningSessions[uid];
    if (!session) return res.status(400).json({ error: 'لا توجد جلسة' });

    const elapsedHours = (Date.now() - session.startTime) / 3600000;
    const claimable = elapsedHours * session.rate;
    if (claimable <= 0) return res.status(400).json({ error: 'لا يوجد رصيد' });

    const totalClaimed = db.miningHistory.reduce((sum, h) => sum + h.amount, 0);
    if (totalClaimed + claimable > 30000000) return res.status(400).json({ error: 'سقف التوزيع' });

    ensureUserExists(uid);
    db.balances[uid].YER += claimable;
    db.miningHistory.push({ uid, amount: claimable, timestamp: new Date().toISOString() });

    const txId = `mine_${Date.now()}`;
    db.transactions[txId] = {
        id: txId, userId: uid, from: uid,
        type: 'YER Distribution', currency: 'YER',
        amount: claimable.toFixed(4), status: 'COMPLETED',
        timestamp: new Date().toISOString()
    };

    session.active = false;
    session.completed = true;
    res.json({ success: true, claimed: claimable.toFixed(4), newBalance: db.balances[uid].YER.toFixed(4) });
});

// ============================================
// INTEGRATION API (للتطبيقات الشريكة)
// ============================================

// تسجيل تطبيق شريك (يتطلب مفتاح الإدارة)
app.post('/api/integration/register', (req, res) => {
    const { appId, name, adminKey } = req.body;
    if (adminKey !== ADMIN_KEY) return res.status(403).json({ error: 'Invalid admin key' });
    if (!appId || !name) return res.status(400).json({ error: 'appId and name required' });
    if (db.partnerApps[appId]) return res.status(400).json({ error: 'App already registered' });

    const apiKey = `${appId}-secret-${Math.random().toString(36).slice(2, 15)}`;
    db.partnerApps[appId] = {
        id: appId, name, apiKey, active: true,
        walletAddress: `${appId.toUpperCase()}_WALLET`,
        registeredAt: new Date().toISOString()
    };
    res.json({ success: true, appId, apiKey, message: 'احتفظ بمفتاح API في مكان آمن' });
});

// عرض التطبيقات المسجلة (يتطلب مفتاح الإدارة)
app.get('/api/integration/apps', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== ADMIN_KEY) return res.status(403).json({ error: 'Invalid admin key' });

    const apps = Object.values(db.partnerApps).map(a => ({
        id: a.id, name: a.name, active: a.active, registeredAt: a.registeredAt
    }));
    res.json({ success: true, apps });
});

// الدفع عبر التطبيق الشريك (يستخدم x-api-key و x-app-id)
app.post('/api/integration/pay', verifyApiKey, async (req, res) => {
    const { accessToken, piAmount, yerAmount, orderId, memo } = req.body;
    if (!accessToken || !orderId) return res.status(400).json({ error: 'accessToken and orderId required' });

    const pi = parseFloat(piAmount) || 0;
    const yer = parseFloat(yerAmount) || 0;
    if (pi < 0 || yer < 0 || (pi === 0 && yer === 0)) return res.status(400).json({ error: 'Invalid amount' });

    try {
        const userResponse = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!userResponse.ok) return res.status(401).json({ error: 'Invalid token' });

        const user = await userResponse.json();
        const sender = ensureUserExists(user.uid);
        const partner = req.partner;

        if ((sender.Pi || 0) < pi) return res.status(400).json({ error: 'رصيد Pi غير كافٍ', current: sender.Pi || 0, required: pi });
        if ((sender.YER || 0) < yer) return res.status(400).json({ error: 'رصيد YER غير كافٍ', current: sender.YER || 0, required: yer });

        db.balances[user.uid].Pi = (sender.Pi || 0) - pi;
        db.balances[user.uid].YER = (sender.YER || 0) - yer;

        const txId = `int_${partner.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const type = pi > 0 && yer > 0 ? 'Hybrid Payment' : pi > 0 ? 'Pi Transfer' : 'YER Transfer';
        db.transactions[txId] = {
            id: txId, userId: user.uid, from: user.uid,
            to: partner.id, appId: partner.id, appName: partner.name,
            type, currency: pi > 0 && yer > 0 ? 'Pi + YER' : pi > 0 ? 'Pi' : 'YER',
            piAmount: pi, yerAmount: yer,
            amount: yer > 0 ? yer.toString() : pi.toString(),
            orderId, memo: memo || '', fee: 0,
            status: 'COMPLETED', timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            transactionId: txId,
            appId: partner.id,
            type,
            piAmount: pi,
            yerAmount: yer,
            newPiBalance: db.balances[user.uid].Pi,
            newYerBalance: db.balances[user.uid].YER
        });
    } catch (error) {
        console.error('Integration pay error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// التحقق من حالة معاملة (للتطبيق الشريك)
app.get('/api/integration/status/:txId', verifyApiKey, (req, res) => {
    const tx = db.transactions[req.params.txId];
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.appId !== req.partner.id) return res.status(403).json({ error: 'Transaction belongs to another app' });
    res.json({ success: true, transaction: tx });
});

// ============================================
// Root & Serving
// ============================================
app.get('/api', (req, res) => {
    res.json({
        message: '🚀 BIGISH-YER API',
        version: '4.0.0',
        endpoints: [
            '/api/health', '/api/tokenomics', '/api/auth', '/api/balance/:uid',
            '/api/payments/approve', '/api/payments/complete', '/api/payments/internal',
            '/api/transactions/user/:uid',
            '/api/yer/distribution/status', '/api/yer/distribution/start', '/api/yer/distribution/claim',
            '/api/integration/register', '/api/integration/apps', '/api/integration/pay', '/api/integration/status/:txId'
        ]
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ BIGISH-YER Wallet v4 running on port ${PORT} (${NODE_ENV})`);
    });
}

module.exports = app;