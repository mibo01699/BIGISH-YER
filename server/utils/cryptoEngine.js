// server/utils/cryptoEngine.js
/**
 * BIGISH-YER: Security & Data Encryption Infrastructure
 * Built under Pi Core Team 2026 Data Privacy Compliance Guidelines
 * Uses Advanced Encryption Standard (AES-256-GCM)
 */

const crypto = require('crypto');

// خوارزمية التشفير المعتمدة عالمياً لحماية البيانات المالية
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // طول ناقل التهيئة القياسي لـ GCM
const TAG_LENGTH = 16; // طول وسم التحقق لضمان عدم التعديل

// جلب مفتاح التشفير السري من المتغيرات البيئية (يجب أن يكون 32 بايت)
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || crypto.randomBytes(32);

/**
 * تشفير البيانات الحساسة (مثل عناوين محافظ YER أو المساعدات المالية)
 * @param {string} text - النص المراد تشفيره
 * @returns {string} - النص المشفر مدمجاً معه ناقل التهيئة ووسم التحقق
 */
function encryptData(text) {
    if (!text) return null;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        // دمج المكونات الثلاثة في سلسلة نصية واحدة مفصولة بنقطتين للسهولة التخزين
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error("Encryption Engine Failure:", error.message);
        throw new Error("Critical security encryption failure.");
    }
}

/**
 * فك تشفير البيانات لاستخدامها داخل السيرفر أثناء عمليات المقاصة
 * @param {string} encryptedPayload - النص المشفر المسترجع من قاعدة البيانات
 * @returns {string} - النص الأصلي المفكوك
 */
function decryptData(encryptedPayload) {
    if (!encryptedPayload) return null;

    try {
        const [ivHex, authTagHex, encryptedHex] = encryptedPayload.split(':');
        
        if (!ivHex || !authTagHex || !encryptedHex) {
            throw new Error("Invalid encrypted data format.");
        }

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error("Decryption Engine Failure:", error.message);
        throw new Error("Critical security decryption failure or data tampering detected.");
    }
}

module.exports = { encryptData, decryptData };
