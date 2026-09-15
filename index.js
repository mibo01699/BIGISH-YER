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
    balances: {},        // { uid: { Pi: 0, YER: 100 } }
    transactions: {},
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
// API: Approve Payment
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
// API: Complete Payment (Pi Deposit)
// ============================================
// هذا الإجراء يمثل إيداع Pi في محفظة BIGISH-YER
// يتم زيادة رصيد Pi للمستخدم فقط بعد التحقق من نجاح الدفع
// ============================================
app.post('/api/payments/complete', async (req, res) => {
    const { paymentId, txid, userId, piAmount } = req.body;
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

        let alreadyCompleted = false;
        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('already_completed')) {
                alreadyCompleted = true;
                console.log('✅ Payment already completed (success)');
            } else {
                console.error('Complete error:', errorText);
                return res.status(response.status).json({ error: errorText });
            }
        }

        // ✅ إيداع Pi في محفظة BIGISH-YER
        if (userId && piAmount) {
            ensureUserExists(userId);

            // تحقق من عدم تسجيل الإيداع مرتين
            const existingTx = Object.values(db.transactions).find(
                tx => tx.paymentId === paymentId && tx.type === 'Pi Deposit'
            );

            if (!existingTx) {
                const depositAmount = parseFloat(piAmount);
                db.balances[userId].Pi = (db.balances[userId].Pi || 0) + depositAmount;

                const txId = `deposit_${paymentId}`;
                db.transactions[txId] = {
                    id: txId,
                    paymentId: paymentId,
                    txid: txid,
                    userId: userId,
                    from: 'Pi Wallet',
                    type: 'Pi Deposit',
                    currency: 'Pi',
                    amount: depositAmount.toFixed(4),
                    status: 'COMPLETED',
                    timestamp: new Date().toISOString()
                };
                console.log(`✅ Pi Deposit: +${depositAmount} Pi to ${userId}`);
            }
        }

        res.json({ success: true, paymentId, txid, alreadyCompleted });
    } catch (error) {
        console.error('Complete exception:', error);
        res.status(500).json({ error: 'Server error during completion' });
    }
});

// ============================================
// API: Internal Transfer (YER / Hybrid Internal)
// ============================================
// ⚠️ هذه العملية تحدث بالكامل داخل BIGISH-YER
// لا توجد أي استدعاءات لـ Pi SDK
// ============================================
app.post('/api/payments/internal', async (req, res) => {
    const { accessToken, piAmount, yerAmount, recipientId, orderId, memo } = req.body;

    if (!accessToken || !orderId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const pi = parseFloat(piAmount) || 0;
    const yer = parseFloat(yerAmount) || 0;
    if (pi < 0 || yer < 0 || (pi === 0 && yer === 0)) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // 1. التحقق من هوية المرسل
        const userResponse = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!userResponse.ok) return res.status(401).json({ error: 'Invalid token' });

        const user = await userResponse.json();
        const sender = ensureUserExists(user.uid);

        // 2. التحقق من كفاية الرصيد
        if ((sender.Pi || 0) < pi) {
            return res.status(400).json({
                error: 'رصيد Pi غير كافٍ',
                current: sender.Pi || 0,
                required: pi
            });
        }
        if ((sender.YER || 0) < yer) {
            return res.status(400).json({
                error: 'رصيد YER غير كافٍ',
                current: sender.YER || 0,
                required: yer
            });
        }

        // 3. خصم من المرسل
        db.balances[user.uid].Pi = (sender.Pi || 0) - pi;
        db.balances[user.uid].YER = (sender.YER || 0) - yer;

        // 4. إضافة للمستلم (إن وُجد)
        if (recipientId) {
            ensureUserExists(recipientId);
            db.balances[recipientId].Pi = (db.balances[recipientId].Pi || 0) + pi;
            db.balances[recipientId].YER = (db.balances[recipientId].YER || 0) + yer;
        }

        // 5. تسجيل المعاملة
        const txId = `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const type = pi > 0 && yer > 0 ? 'Hybrid Payment'
                    : pi > 0 ? 'Pi Transfer'
                    : 'YER Transfer';

        db.transactions[txId] = {
            id: txId,
            userId: user.uid,
            from: user.uid,
            to: recipientId || null,
            type: type,
            currency: pi > 0 && yer > 0 ? 'Pi + YER' : pi > 0 ? 'Pi' : 'YER',
            piAmount: pi,
            yerAmount: yer,
            amount: yer > 0 ? yer.toString() : pi.toString(),
            orderId: orderId,
            memo: memo || '',
            fee: 0,
            status: 'COMPLETED',
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            transactionId: txId,
            type: type,
            piAmount: pi,
            yerAmount: yer,
            newPiBalance: db.balances[user.uid].Pi,
            newYerBalance: db.balances[user.uid].YER
        });
    } catch (error) {
        console.error('Internal transfer error:', error);
        res.status(500).json({ error: 'Server error during internal transfer' });
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
// API: YER Distribution
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
// API Root + Serving
// ============================================
app.get('/api', (req, res) => {
    res.json({
        message: '🚀 BIGISH-YER API',
        version: '2.0.0',
        architecture: 'Pi deposit + internal YER/Pi transfers',
        endpoints: [
            '/api/health', '/api/tokenomics', '/api/auth', '/api/balance/:uid',
            '/api/payments/approve', '/api/payments/complete',
            '/api/payments/internal',
            '/api/transactions/user/:uid',
            '/api/yer/distribution/status', '/api/yer/distribution/start',
            '/api/yer/distribution/claim'
        ]
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ BIGISH-YER Wallet v2 running on port ${PORT} (${NODE_ENV})`);
    });
}

module.exports = app;