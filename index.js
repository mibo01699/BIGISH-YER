const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PI_API_KEY = process.env.PI_API_KEY || '';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// In-Memory Database
// ============================================
const db = {
    balances: {},
    transactions: {},
    idempotencyMap: {},
    miningSessions: {},
    miningHistory: []
};

function ensureUserExists(uid) {
    if (!db.balances[uid]) {
        db.balances[uid] = { Pi: 0, YER: 100 };
    }
    return db.balances[uid];
}

// ============================================
// YER Tokenomics
// ============================================
const YER_TOKENOMICS = {
    symbol: 'YER',
    name: 'YER Ecosystem Token',
    maxSupply: 300000000,
    decimals: 10,
    allocations: {
        communityPublicUtility: { percentage: 10, amount: 30000000 },
        ecosystemLaunchLiquidity: { percentage: 30, amount: 90000000 },
        aecSovereignFund: { percentage: 60, amount: 180000000 }
    }
};

// ============================================
// API: Health
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

app.get('/api/tokenomics', (req, res) => {
    res.json({ success: true, data: YER_TOKENOMICS });
});

// ============================================
// API: Auth
// ============================================
app.post('/api/auth', async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken is required' });

    try {
        const response = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });
        if (!response.ok) return res.status(401).json({ error: 'Invalid or expired token' });

        const user = await response.json();
        ensureUserExists(user.uid);
        res.json({ success: true, user: { uid: user.uid, username: user.username } });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
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
// API: Payments — Approve
// ============================================
app.post('/api/payments/approve', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });
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
            const errorText = await response.text();
            console.error('Approve error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('Approve exception:', error);
        res.status(500).json({ error: 'Server error during approval' });
    }
});

// ============================================
// API: Payments — Complete (مصحح وذكي)
// ============================================
app.post('/api/payments/complete', async (req, res) => {
    const { paymentId, txid, userId, orderId, hybridTxId } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: 'paymentId and txid are required' });
    if (!PI_API_KEY) return res.status(500).json({ error: 'PI_API_KEY not configured' });

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

        // ✅ معالجة already_completed كنجاح
        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('already_completed')) {
                console.log('✅ Payment already completed (success)');
            } else {
                console.error('Complete error:', errorText);
                return res.status(response.status).json({ error: errorText });
            }
        }

        // ✅ إذا كانت دفعة هجينة، حدّث المعاملة الأصلية
        if (hybridTxId && db.transactions[hybridTxId]) {
            const hybTx = db.transactions[hybridTxId];
            hybTx.status = 'COMPLETED';
            hybTx.piTxid = txid;
            hybTx.piPaymentId = paymentId;
            hybTx.completedAt = new Date().toISOString();
            hybTx.type = 'Hybrid Payment';
            console.log('✅ Hybrid transaction updated:', hybridTxId);
        } else {
            // دفعة Pi عادية
            const txId = `pi_${paymentId}`;
            db.transactions[txId] = {
                id: txId,
                paymentId: paymentId,
                txid: txid,
                userId: userId || null,
                from: userId || null,
                type: 'Pi Payment',
                currency: 'Pi',
                amount: '1.0',
                status: 'COMPLETED',
                timestamp: new Date().toISOString()
            };
        }

        res.json({ success: true, paymentId, txid });
    } catch (error) {
        console.error('Complete exception:', error);
        res.status(500).json({ error: 'Server error during completion' });
    }
});

// ============================================
// API: Payments — Hybrid (Pi + YER)
// ============================================
app.post('/api/payments/hybrid', async (req, res) => {
    const { accessToken, piAmount, yerAmount, orderId } = req.body;
    if (!accessToken || piAmount === undefined || !yerAmount || !orderId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const userResponse = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!userResponse.ok) return res.status(401).json({ error: 'Invalid token' });

        const user = await userResponse.json();
        const balance = ensureUserExists(user.uid);

        if (balance.YER < yerAmount) {
            return res.status(400).json({
                error: 'رصيد YER غير كافٍ',
                current: balance.YER,
                required: yerAmount
            });
        }

        // خصم YER
        db.balances[user.uid].YER = balance.YER - yerAmount;

        // إنشاء معاملة موحدة
        const transactionId = `hyb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const type = piAmount > 0 ? 'Hybrid Payment' : 'YER Payment';
        const status = piAmount > 0 ? 'PENDING_PI' : 'COMPLETED';

        db.transactions[transactionId] = {
            id: transactionId,
            userId: user.uid,
            from: user.uid,
            type: type,
            currency: piAmount > 0 ? 'Pi + YER' : 'YER',
            yerAmount: yerAmount,
            piAmount: piAmount,
            amount: yerAmount.toString(),
            orderId: orderId,
            status: status,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            transactionId,
            piAmount,
            yerAmount,
            orderId,
            type,
            newYerBalance: db.balances[user.uid].YER
        });
    } catch (error) {
        console.error('Hybrid error:', error);
        res.status(500).json({ error: 'Server error during hybrid payment' });
    }
});

// ============================================
// API: Transactions History
// ============================================
app.get('/api/transactions/user/:uid', (req, res) => {
    const { uid } = req.params;
    const userTxs = Object.values(db.transactions).filter(tx =>
        tx.userId === uid || tx.from === uid || tx.to === uid || tx.uid === uid
    );
    userTxs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, transactions: userTxs.slice(0, 50) });
});

// ============================================
// API: YER Distribution
// ============================================
app.get('/api/yer/distribution/status', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id header required' });

    ensureUserExists(uid);
    const session = db.miningSessions[uid];

    if (!session || !session.active) {
        return res.json({
            success: true, isDistributionActive: false,
            currentRatePerHour: '0.10', hoursRemaining: 0, unclaimedBalance: '0.00'
        });
    }

    const elapsedMs = Date.now() - session.startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const totalHours = 24;

    if (elapsedHours >= totalHours) {
        session.active = false;
        session.completed = true;
    }

    const hoursRemaining = Math.max(0, totalHours - elapsedHours);
    const unclaimed = (elapsedHours * session.rate).toFixed(4);

    res.json({
        success: true,
        isDistributionActive: session.active,
        currentRatePerHour: session.rate.toFixed(2),
        hoursRemaining: parseFloat(hoursRemaining.toFixed(2)),
        unclaimedBalance: unclaimed
    });
});

app.post('/api/yer/distribution/start', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id header required' });

    ensureUserExists(uid);
    const existing = db.miningSessions[uid];
    if (existing && existing.active) {
        return res.status(400).json({ error: 'يوجد جلسة توزيع نشطة بالفعل' });
    }

    db.miningSessions[uid] = {
        startTime: Date.now(), rate: 0.10, active: true, completed: false
    };

    res.json({
        success: true, message: 'بدأت جلسة التوزيع',
        session: { startTime: db.miningSessions[uid].startTime, rate: 0.10, duration: 24 }
    });
});

app.post('/api/yer/distribution/claim', (req, res) => {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(400).json({ error: 'x-user-id header required' });

    const session = db.miningSessions[uid];
    if (!session) return res.status(400).json({ error: 'لا توجد جلسة توزيع' });

    const elapsedMs = Date.now() - session.startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const claimable = elapsedHours * session.rate;

    if (claimable <= 0) return res.status(400).json({ error: 'لا يوجد رصيد للمطالبة' });

    const totalClaimed = db.miningHistory.reduce((sum, h) => sum + h.amount, 0);
    const COMMUNITY_CAP = 30000000;
    if (totalClaimed + claimable > COMMUNITY_CAP) {
        return res.status(400).json({ error: 'تم الوصول إلى سقف التوزيع المجتمعي' });
    }

    ensureUserExists(uid);
    db.balances[uid].YER += claimable;
    db.miningHistory.push({ uid, amount: claimable, timestamp: new Date().toISOString() });

    const txId = `mine_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    db.transactions[txId] = {
        id: txId, userId: uid, from: uid,
        type: 'YER Distribution', currency: 'YER',
        amount: claimable.toFixed(4), status: 'COMPLETED',
        timestamp: new Date().toISOString()
    };

    session.active = false;
    session.completed = true;

    res.json({
        success: true, claimed: claimable.toFixed(4),
        newBalance: db.balances[uid].YER.toFixed(4)
    });
});

// ============================================
// API Root
// ============================================
app.get('/api', (req, res) => {
    res.json({
        message: '🚀 BIGISH-YER API',
        version: '1.0.0',
        endpoints: [
            '/api/health', '/api/tokenomics', '/api/auth', '/api/balance/:uid',
            '/api/payments/approve', '/api/payments/complete', '/api/payments/hybrid',
            '/api/transactions/user/:uid', '/api/yer/distribution/status',
            '/api/yer/distribution/start', '/api/yer/distribution/claim'
        ]
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ BIGISH-YER Wallet running on port ${PORT} (${NODE_ENV})`);
    });
}

module.exports = app;