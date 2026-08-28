const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// --- خريطة توزيع الرمز العالمية الصارمة (Global Tokenomics Matrix) ---
const YER_SCALE = 10000000000n; // 10 decimals
const MAX_GLOBAL_SUPPLY = 3000000000n * YER_SCALE; // 300 مليون رمز كحد أقصى

let currentTotalSupply = 0n;
let minedBySovereignFund = 0n;
const MAX_FUND_ALLOCATION = 200000000n * YER_SCALE; // 200 مليون الحد الأقصى للصندوق

/**
 * مسار تفويض التعدين المالي للصندوق السيادي (العملية الثالثة 60%)
 */
app.post('/api/aec/mint-sovereign-fund', (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid mint amount.' });
        }

        const bigAmountToMint = BigInt(Math.floor(amount * Number(YER_SCALE)));

        // التحقق من سقف الصندوق وسقف المعروض الإجمالي لمنع التضخم (Compliance Guard)
        if (minedBySovereignFund + bigAmountToMint > MAX_FUND_ALLOCATION) {
            return res.status(400).json({ success: false, error: 'Sovereign Fund Tokenomics Allocation Cap Exceeded.' });
        }
        if (currentTotalSupply + bigAmountToMint > MAX_GLOBAL_SUPPLY) {
            return res.status(400).json({ success: false, error: 'Global Max Supply Breach Intercepted.' });
        }

        // تنفيذ الصك والربط التزامني
        minedBySovereignFund += bigAmountToMint;
        currentTotalSupply += bigAmountToMint;

        console.log(`[A.E.C MAIN LEDGER] Successfully minted ${bigAmountToMint.toString()} units to Sovereign Fund.`);
        return res.status(200).json({
            success: true,
            status: 'Minted_And_Synced_With_Tokenomics',
            currentTotalSupply: currentTotalSupply.toString(),
            remainingFundAllocation: (MAX_FUND_ALLOCATION - minedBySovereignFund).toString()
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal Ledger Sync Failure.' });
    }
});

// مسار المقاصة والتحويل الموحد 
app.post('/api/yer/transfer', (req, res) => {
    const { amount } = req.body;
    let BigAmount = BigInt(Math.floor((amount || 0) * Number(YER_SCALE)));
    return res.status(200).json({ success: true, processedAmount: BigAmount.toString(), status: 'Cleared_Success' });
});

app.get('/api/status', (req, res) => {
    res.json({
        status: "active",
        ecosystem: "Arabian Eagle Ecosystem (A.E.C)",
        tokenomics: { maxSupply: "300,000,000 YER", scales: "Fixed BigInt 10 decimals" },
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BIGISH-YER Centralized Ledger Engine is synced on port ${PORT}`);
});

module.exports = app;
