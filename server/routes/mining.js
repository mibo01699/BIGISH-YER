// server/routes/mining.js
const express = require('express');
const router = express.Router();

// محاكاة قاعدة بيانات ليدجر التعدين لرمز YER
const miningDatabase = {
    getUserSession: async (piUserId) => {
        // إرجاع بيانات الجلسة الحالية للمستخدم (معدل التعدين الأساسي 0.1 YER/ساعة)
        return {
            pi_user_id: piUserId,
            is_mining_active: true,
            base_rate: 0.10, 
            team_bonus_rate: 0.05, // مكافأة الإحالة والتكامل مع AJYAL/GAV
            last_click_time: new Date(Date.now() - 12 * 60 * 60 * 1000), // منذ 12 ساعة
            unclaimed_balance: 1.80
        };
    },
    saveMiningSession: async (piUserId, sessionData) => {
        console.log(`Mining Session Saved for ${piUserId}:`, sessionData);
        return true;
    }
};

/**
 * @route   GET /api/yer/mining/status
 * @desc    جلب حالة التعدين الحالية ورصيد المستخدم غير المطالب به
 * @access  Protected via Pi SDK Token
 */
router.get('/api/yer/mining/status', async (req, res) => {
    const piUserId = req.headers['x-pi-user-id'];
    if (!piUserId) return res.status(401).json({ success: false, error: "Unauthorized" });

    try {
        const session = await miningDatabase.getUserSession(piUserId);
        
        // حساب الوقت المنقضي بالساعات (جلسة التعدين مدتها 24 ساعة وفق معايير Pi)
        const hoursElapsed = (Date.now() - new Date(session.last_click_time).getTime()) / (1000 * 60 * 60);
        const activeHours = Math.min(24, hoursElapsed);
        
        const currentRate = session.base_rate + session.team_bonus_rate;
        const newlyMined = activeHours * currentRate;
        const totalUnclaimed = session.unclaimed_balance + newlyMined;

        res.status(200).json({
            success: true,
            isMiningActive: hoursElapsed < 24,
            currentRatePerHour: currentRate,
            hoursRemaining: Math.max(0, 24 - hoursElapsed),
            unclaimedBalance: parseFloat(totalUnclaimed.toFixed(4))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Mining status retrieval failed." });
    }
});

/**
 * @route   POST /api/yer/mining/start
 * @desc    تفعيل زر التعدين لبدء جلسة جديدة مدتها 24 ساعة (تمديد التعدين السحابي)
 */
router.post('/api/yer/mining/start', async (req, res) => {
    const piUserId = req.headers['x-pi-user-id'];
    if (!piUserId) return res.status(401).json({ success: false, error: "Unauthorized" });

    try {
        const newSession = {
            last_click_time: new Date(),
            is_mining_active: true
        };
        await miningDatabase.saveMiningSession(piUserId, newSession);
        
        res.status(200).json({
            success: true,
            message: "⚡ YER Mining session successfully activated for the next 24 hours!"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to initiate mining loop." });
    }
});

module.exports = router;
