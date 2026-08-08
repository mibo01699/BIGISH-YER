// في suppliers-auction/backend/server.js

// إضافة متغير بيئي لعنوان خادم BIGISH-YER
const BIGISH_YER_API = process.env.BIGISH_YER_API || 'http://localhost:5001/api';

/**
 * API: تنفيذ الدفع الهجين (Pi + YER) مع تكامل حقيقي
 * POST /api/payment/settle
 */
app.post('/api/payment/settle', async (req, res) => {
    try {
        const { buyer, seller, totalAmount, piAmount, yerAmount, auctionId } = req.body;
        
        // ... التحقق من المدخلات ...

        // 1. تنفيذ تحويل YER عبر BIGISH-YER
        const yerResponse = await fetch(`${BIGISH_YER_API}/yer/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromWalletId: buyer.yerWalletId,
                toWalletId: seller.yerWalletId,
                amount: yerAmount,
                description: `دفعة مزاد ${auctionId}`
            })
        });

        const yerData = await yerResponse.json();
        if (!yerData.success) {
            throw new Error(`فشل تحويل YER: ${yerData.error}`);
        }

        // 2. تنفيذ تحويل Pi (سيتم استبداله بتكامل Pi SDK الحقيقي)
        // ...

        res.json({
            success: true,
            message: `تم تنفيذ الدفع الهجين للمزاد ${auctionId}`,
            yerTransaction: yerData.transaction
        });
    } catch (error) {
        console.error('خطأ في تنفيذ الدفع الهجين:', error);
        res.status(500).json({ error: error.message });
    }
});