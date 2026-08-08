// ============================================================
// الملف: BIGISH-YER/backend/server.js
// الدور: الخادم الخلفي لإدارة عملة YER وتكاملها مع النظام البيئي
// ============================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001; // منفذ مختلف عن تطبيق المزادات

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ============================================================
// قاعدة بيانات مؤقتة (محاكاة)
// ============================================================
const wallets = {}; // { walletId: { address: 'PiAddress', balance: 0 } }
const transactions = [];

// ============================================================
// واجهات برمجة التطبيقات (APIs) لإدارة المحافظ
// ============================================================

/**
 * إنشاء محفظة YER جديدة
 * POST /api/yer/create-wallet
 * Body: { "piAddress": "GABC123..." }
 */
app.post('/api/yer/create-wallet', (req, res) => {
    try {
        const { piAddress } = req.body;
        if (!piAddress) {
            return res.status(400).json({ error: 'عنوان Pi مطلوب' });
        }

        // التحقق من عدم وجود محفظة مسبقة لهذا العنوان
        const existingWallet = Object.values(wallets).find(w => w.address === piAddress);
        if (existingWallet) {
            return res.status(409).json({ error: 'محفظة موجودة بالفعل لهذا العنوان' });
        }

        // إنشاء محفظة جديدة
        const walletId = `YER-${Date.now()}`;
        wallets[walletId] = {
            id: walletId,
            address: piAddress,
            balance: 0,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            wallet: wallets[walletId]
        });
    } catch (error) {
        console.error('خطأ في إنشاء المحفظة:', error);
        res.status(500).json({ error: 'فشل في إنشاء المحفظة' });
    }
});

/**
 * الحصول على رصيد محفظة YER
 * GET /api/yer/balance/:walletId
 */
app.get('/api/yer/balance/:walletId', (req, res) => {
    try {
        const { walletId } = req.params;
        const wallet = wallets[walletId];
        if (!wallet) {
            return res.status(404).json({ error: 'المحفظة غير موجودة' });
        }

        res.json({
            success: true,
            balance: wallet.balance,
            walletId: walletId,
            address: wallet.address
        });
    } catch (error) {
        console.error('خطأ في الحصول على الرصيد:', error);
        res.status(500).json({ error: 'فشل في الحصول على الرصيد' });
    }
});

/**
 * الحصول على محفظة بواسطة عنوان Pi
 * GET /api/yer/wallet/by-pi/:piAddress
 */
app.get('/api/yer/wallet/by-pi/:piAddress', (req, res) => {
    try {
        const { piAddress } = req.params;
        const wallet = Object.values(wallets).find(w => w.address === piAddress);
        if (!wallet) {
            return res.status(404).json({ error: 'لا توجد محفظة مرتبطة بهذا العنوان' });
        }

        res.json({
            success: true,
            wallet: wallet
        });
    } catch (error) {
        console.error('خطأ في البحث عن المحفظة:', error);
        res.status(500).json({ error: 'فشل في البحث عن المحفظة' });
    }
});

// ============================================================
// واجهات برمجة التطبيقات (APIs) للتحويلات
// ============================================================

/**
 * تحويل YER بين محفظتين
 * POST /api/yer/transfer
 * Body: { "fromWalletId": "YER-123", "toWalletId": "YER-456", "amount": 100, "description": "دفعة مزاد" }
 */
app.post('/api/yer/transfer', (req, res) => {
    try {
        const { fromWalletId, toWalletId, amount, description } = req.body;
        
        // التحقق من صحة المدخلات
        if (!fromWalletId || !toWalletId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'بيانات التحويل غير صحيحة' });
        }

        // التحقق من وجود المحافظ
        const fromWallet = wallets[fromWalletId];
        const toWallet = wallets[toWalletId];
        if (!fromWallet || !toWallet) {
            return res.status(404).json({ error: 'إحدى المحافظ غير موجودة' });
        }

        // التحقق من كفاية الرصيد
        if (fromWallet.balance < amount) {
            return res.status(400).json({ error: 'الرصيد غير كافٍ' });
        }

        // تنفيذ التحويل
        fromWallet.balance -= amount;
        toWallet.balance += amount;

        // تسجيل المعاملة
        const transaction = {
            id: `TX-${Date.now()}`,
            from: fromWalletId,
            to: toWalletId,
            amount: amount,
            description: description || 'تحويل YER',
            timestamp: new Date().toISOString()
        };
        transactions.push(transaction);

        res.json({
            success: true,
            transaction: transaction,
            fromBalance: fromWallet.balance,
            toBalance: toWallet.balance
        });
    } catch (error) {
        console.error('خطأ في تنفيذ التحويل:', error);
        res.status(500).json({ error: 'فشل في تنفيذ التحويل' });
    }
});

/**
 * الحصول على تاريخ معاملات محفظة
 * GET /api/yer/transactions/:walletId
 */
app.get('/api/yer/transactions/:walletId', (req, res) => {
    try {
        const { walletId } = req.params;
        if (!wallets[walletId]) {
            return res.status(404).json({ error: 'المحفظة غير موجودة' });
        }

        const walletTransactions = transactions.filter(
            t => t.from === walletId || t.to === walletId
        );

        res.json({
            success: true,
            transactions: walletTransactions
        });
    } catch (error) {
        console.error('خطأ في الحصول على المعاملات:', error);
        res.status(500).json({ error: 'فشل في الحصول على المعاملات' });
    }
});

// ============================================================
// واجهات برمجة التطبيقات (APIs) للرواتب والمساعدات
// ============================================================

/**
 * إنشاء دفعة رواتب أو مساعدات (تحويلات جماعية)
 * POST /api/yer/batch-transfer
 * Body: { "fromWalletId": "YER-123", "transfers": [ { "toWalletId": "YER-456", "amount": 50 } ], "type": "payroll" }
 */
app.post('/api/yer/batch-transfer', (req, res) => {
    try {
        const { fromWalletId, transfers, type } = req.body;
        
        if (!fromWalletId || !transfers || !Array.isArray(transfers) || transfers.length === 0) {
            return res.status(400).json({ error: 'بيانات غير صحيحة' });
        }

        const fromWallet = wallets[fromWalletId];
        if (!fromWallet) {
            return res.status(404).json({ error: 'المحفظة المصدر غير موجودة' });
        }

        // حساب إجمالي المبلغ المطلوب
        const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);
        if (fromWallet.balance < totalAmount) {
            return res.status(400).json({ error: 'الرصيد غير كافٍ للتحويلات الجماعية' });
        }

        // تنفيذ التحويلات
        const results = [];
        for (const transfer of transfers) {
            const toWallet = wallets[transfer.toWalletId];
            if (!toWallet) {
                results.push({ 
                    toWalletId: transfer.toWalletId, 
                    status: 'failed', 
                    error: 'المحفظة الهدف غير موجودة' 
                });
                continue;
            }

            fromWallet.balance -= transfer.amount;
            toWallet.balance += transfer.amount;

            const transaction = {
                id: `TX-${Date.now()}-${Math.random()}`,
                from: fromWalletId,
                to: transfer.toWalletId,
                amount: transfer.amount,
                description: type === 'payroll' ? 'راتب شهري' : 'مساعدة إنسانية',
                timestamp: new Date().toISOString()
            };
            transactions.push(transaction);

            results.push({
                toWalletId: transfer.toWalletId,
                status: 'success',
                amount: transfer.amount,
                transactionId: transaction.id
            });
        }

        res.json({
            success: true,
            totalAmount: totalAmount,
            fromBalance: fromWallet.balance,
            results: results
        });
    } catch (error) {
        console.error('خطأ في تنفيذ التحويلات الجماعية:', error);
        res.status(500).json({ error: 'فشل في تنفيذ التحويلات الجماعية' });
    }
});

// ============================================================
// واجهة برمجة تطبيقات (API) لصحة الخادم
// ============================================================

/**
 * التحقق من صحة الخادم
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        walletsCount: Object.keys(wallets).length,
        transactionsCount: transactions.length
    });
});

// ============================================================
// تشغيل الخادم
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 خادم BIGISH-YER يعمل على المنفذ ${PORT}`);
    console.log(`📦 APIs جاهزة للاستخدام: http://localhost:${PORT}/api`);
    console.log(`💡 عدد المحافظ: ${Object.keys(wallets).length}`);
});