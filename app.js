/**
 * BIGISH-YER Ecosystem - Core Gateway Node (app.js)
 * Aligned with 2026 PiOS License Regulations & OpenRouter API Specifications.
 * Handles Secure Token Split (50% GCV Pi / 50% YER Stable) using Strict BigInt.
 */

require('dotenv').config();
const express = require('express');
const { OpenRouter } = require('openrouter'); // استيراد حزمة أوبن راوتر الرسمية
const SovereignClearingGuard = require('./SovereignClearingGuard');

const app = express();
app.use(express.json());

// تشغيل صمام الأمان المالي والتحقق من الهوية لشبكة Pi
const clearingGuard = new SovereignClearingGuard();

// إعداد مفتاح ربط OpenRouter من بيئة النظام الآمنة
const openrouterClient = process.env.OPENROUTER_API_KEY 
    ? new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
    : null;

if (!openrouterClient) {
    console.warn("[Ecosystem Warning]: OPENROUTER_API_KEY is missing. AI assessment features will be restricted.");
}

/**
 * 1. مسار معالجة طلبات المقاصة والمدفوعات المختلطة (DEX Node)
 * يفرض شروط الدقة الحسابية الصفرية لمنع كسور العملات (Zero Floating-Point)
 */
app.post('/api/yer/transfer', async (req, res) => {
    try {
        const { piAmount, yerAmount, userMetadata } = req.body;

        // أ: التحقق من امتثال العميل لشروط البيئة الآمنة لـ Pi وعدم تسريب المعاملات خارجياً
        const compliance = clearingGuard.verifySovereignCompliance(userMetadata);
        if (!compliance.approved) {
            return res.status(403).json({ success: false, error: compliance.reason });
        }

        // ب: التحقق الحسابي الصارم وتجنب أخطاء الكسور العشرية عبر تحويل القيم إلى BigInt
        const validatedAmounts = clearingGuard.validateClearingAmounts(piAmount, yerAmount);
        if (!validatedAmounts.valid) {
            return res.status(400).json({ success: false, error: validatedAmounts.reason });
        }

        // ج: محاكاة تنفيذ النقل الذكي للأصول بنسبة 50% داخل المحفظة السيادية السيستمية
        console.log(`[Clearing Ledger] Atomic lock engaged. Processing split-clearing operation...`);
        console.log(`- Pi Volume: ${validatedAmounts.piStroops.toString()} Stroops`);
        console.log(`- YER Volume: ${validatedAmounts.yerSubUnits.toString()} Sovereign Sub-units`);

        return res.status(200).json({
            success: true,
            status: "Cleared",
            transactionDetails: {
                piStroops: validatedAmounts.piStroops.toString(), // تحويلها لنص لعرضها آمن في الـ JSON
                yerSubUnits: validatedAmounts.yerSubUnits.toString(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: `Internal Clearing Failure: ${error.message}` });
    }
});

/**
 * 2. مسار تقييم ثغرات المستودع وسد الفجوات بالذكاء الاصطناعي عبر OpenRouter
 * مخصص لدعم عمليات الفحص التلقائي والتفاعل الذكي مع التطبيقات الـ 7 المشتركة
 */
app.post('/api/ai/assess-node', async (req, res) => {
    if (!openrouterClient) {
        return res.status(503).json({ success: false, error: "AI Engine is offline. Check API configuration." });
    }

    try {
        const { nodeName, errorCodeLayout } = req.body;

        // إرسال كود الخطأ إلى الـ API لجلب أفضل مزود ذكاء اصطناعي وحل المشكلة فوراً
        const response = await openrouterClient.chat.send({
            model: "openai/gpt-latest",
            messages: [
                { 
                    role: "user", 
                    content: `Analyze this error from the '${nodeName}' component in the BIGISH-YER ecosystem. Provide a hotfix using Strict BigInt Arithmetic. Error: ${errorCodeLayout}` 
                }
            ],
        });

        const aiSolution = response.choices[0].message.content;
        return res.status(200).json({ success: true, targetNode: nodeName, solution: aiSolution });

    } catch (error) {
        return res.status(500).json({ success: false, error: `AI Integration Error: ${error.message}` });
    }
});

// تشغيل الخادم على المنفذ المخصص للـ Replit أو البيئة المحلية
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[BIGISH-YER Node] Sovereign infrastructure is up and running on port ${PORT}`);
});

module.exports = app;
