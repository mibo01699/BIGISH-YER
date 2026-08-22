// AntiDoubleDippingEngine.js
// نظام الحماية والقفل التزامني الفوري لإقرار المعاملات السيادية وعمليات الرواتب الضخمة

class AntiDoubleDippingEngine {
    constructor() {
        // ذاكرة تخزين مؤقتة فائقة السرعة للأقفال النشطة (In-Memory Micro-Locks)
        this.activeLocks = new Map();
        // تتبع المعاملات التي تمت معالجتها لمنع هجمات التكرار (Replay Attacks)
        this.processedTxIds = new Set();
        // تحديد مهلة القفل التلقائي لحظر التجميد اللانهائي في الحالات الطارئة (30 ثانية)
        this.LOCK_TIMEOUT = 30000; 
    }

    /**
     * محاولة فرض قفل ذري متزامن على محفظة المستخدم قبل بدء عملية المقاصة
     * @param {string} userId - الهوية الرقمية الفرعية للمستخدم السيادي أو المؤسسة
     * @param {string} paymentNonce - معرف عشوائي فريد لكل محاولة سداد لمنع التكرار
     */
    acquireAtomicLock(userId, paymentNonce) {
        const currentTime = Date.now();

        // 1. التحقق من هجمات تكرار نفس المعاملة القديمة
        if (this.processedTxIds.has(paymentNonce)) {
            throw new Error(`[أمان عالي] هجوم تكرار مرفوض: المعاملة ذات المعرف ${paymentNonce} تم تنفيذها سابقاً.`);
        }

        // 2. التحقق من وجود قفل نشط وغير منتهي الصلاحية على حساب المستخدم
        if (this.activeLocks.has(userId)) {
            const lock = this.activeLocks.get(userId);
            if (currentTime - lock.timestamp < this.LOCK_TIMEOUT) {
                throw new Error(`[حظر التداخل] تنبيه: يوجد عملية مقاصة قيد التنفيذ حالياً على هذا الحساب. يرجى الانتظار.`);
            } else {
                // إذا انتهت صلاحية القفل القديم بدون استجابة يتم إزالته تلقائياً لتجنب شلل النظام
                this.releaseLock(userId);
            }
        }

        // 3. فرض القفل الآمن بنجاح
        this.activeLocks.set(userId, {
            nonce: paymentNonce,
            timestamp: currentTime
        });

        console.log(`[قفل آمن] تم حظر العمليات الموازية للمستخدم: ${userId} لمنع السحب المزدوج.`);
        return true;
    }

    /**
     * تحرير القفل فور إتمام دورة المقاصة ونجاح التوثيق على البلوكشين
     */
    releaseLock(userId) {
        if (this.activeLocks.has(userId)) {
            this.activeLocks.delete(userId);
            console.log(`[قفل آمن] تم فك حظر الحساب بنجاح للمستخدم: ${userId}`);
            return true;
        }
        return false;
    }

    /**
     * تسجيل المعاملة بشكل دائم لحظر إعادة إرسالها نهائياً
     */
    archiveTransaction(paymentNonce) {
        this.processedTxIds.add(paymentNonce);
    }
}

// تصدير نسخة موحدة وثابتة من المحرك لتعمل عبر جميع أجزاء المشروع (Singleton Pattern)
module.exports = new AntiDoubleDippingEngine();
