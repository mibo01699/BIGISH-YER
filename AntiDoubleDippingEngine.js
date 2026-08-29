/**
 * @file AntiDoubleDippingEngine.js
 * @description محرك الأمان الصارم لمنع السحب المزدوج، إعادة استخدام الـ Nonce، والعمليات المتوازية.
 * يضمن تحرير الأقفال في حال حدوث أي خطأ لمنع تجميد النظام.
 */

class AntiDoubleDippingEngine {
    constructor() {
        // خريطة الأقفال الذرية (Atomic Locks) - المفتاح: entityId/claimNonce
        this.locks = new Map();
        // سجل الـ Nonces المستخدمة لمنع إعادة الاستخدام (Replay Protection)
        this.usedNonces = new Set();
    }

    /**
     * قفل الحساب ذرياً لمنع السحب المزدوج أو التنفيذ المتوازي
     * @param {string} entityId - هوية الكيان أو الموظف
     * @param {string} claimNonce - رمز فريد للمعاملة
     * @returns {boolean} - نجاح القفل
     */
    acquireAtomicLock(entityId, claimNonce) {
        const lockKey = `${entityId}:${claimNonce}`;

        // [حماية 1] منع إعادة استخدام نفس الـ Nonce (Replay Protection)
        if (this.usedNonces.has(lockKey)) {
            throw new Error("REPLAY_PROTECTION: This nonce has already been used.");
        }

        // [حماية 2] منع القفل المزدوج (Duplicate Lock) إذا كان القفل موجوداً بالفعل
        if (this.locks.has(lockKey)) {
            throw new Error("DOUBLE_DIPPING_LOCK: Entity is already locked for this nonce.");
        }

        // [حماية 3] تسجيل القفل
        this.locks.set(lockKey, true);
        this.usedNonces.add(lockKey); // نضيف الـ Nonce فوراً لمنع إعادة استخدامه حتى بعد تحرير القفل

        return true;
    }

    /**
     * تحرير القفل الذري بعد انتهاء العملية (أو في حال الفشل)
     * @param {string} entityId - هوية الكيان
     * @param {string} claimNonce - رمز المعاملة
     */
    releaseLock(entityId, claimNonce) {
        const lockKey = `${entityId}:${claimNonce}`;
        this.locks.delete(lockKey);
    }

    /**
     * التحقق من حالة القفل الحالية (لأغراض المراقبة والاختبارات)
     * @param {string} entityId - هوية الكيان
     * @param {string} claimNonce - رمز المعاملة
     * @returns {boolean} - حالة القفل
     */
    isLocked(entityId, claimNonce) {
        return this.locks.has(`${entityId}:${claimNonce}`);
    }
}

// تصدير الكلاس كنسخة واحدة لتوحيد الحالة في جميع أنحاء النظام
module.exports = new AntiDoubleDippingEngine();