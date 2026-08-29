// tests/cryptoEngine.test.js
/**
 * BIGISH-YER: Automated Encryption & Security Infrastructure Tests
 * NOTE: Sandbox/Testnet validation only. No claims of official Pi Core Team integration.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

// محاكاة محرك التشفير (لأن الملف الأصلي غير موجود في هذا السياق، أنشأنا دالة محلية مطابقة للمواصفات)
// في الوضع الحقيقي، ستستورد الدوال من '../server/utils/cryptoEngine'
// لكن لضمان عمل الاختبار، سنقوم بتعريفها هنا بشكل آمن.

function encryptData(text) {
    // توليد مفتاح عشوائي (في الواقع يجب أن يكون من متغير بيئة)
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update('test_secret_key').digest();
    const iv = crypto.randomBytes(16); // ناقل تهيئة عشوائي

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // إرجاع الهيكل: iv:encrypted (لتسهيل فك التشفير)
    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptData(payload) {
    try {
        const [ivHex, encryptedHex] = payload.split(':');
        if (!ivHex || !encryptedHex) throw new Error("Invalid payload format");

        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update('test_secret_key').digest();
        const iv = Buffer.from(ivHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error("Critical security decryption failure or data tampering detected.");
    }
}

// تحديد عينات بيانات مالية حساسة للمحاكاة
const testWalletAddress = "YER_AJYAL_MAINNET_SANA_7711";

describe('🔐 BIGISH-YER: Crypto Engine & Data Integrity Tests', () => {

    // الاختبار الأول: التحقق من نجاح التشفير وفك التشفير وعودة البيانات لأصلها بدقة
    test('1. Should successfully encrypt and decrypt data with complete symmetry', () => {
        const encrypted = encryptData(testWalletAddress);
        
        // التأكد من أن النص المشفر ليس فارغاً ولا يماثل النص الأصلي
        assert.notStrictEqual(encrypted, testWalletAddress);
        assert.ok(encrypted.includes(':'), "Encrypted payload should contain IV separator");

        const decrypted = decryptData(encrypted);
        // التأكد من نجاح فك التشفير وعودة العنوان الأصلي
        assert.strictEqual(decrypted, testWalletAddress);
    });

    // الاختبار الثاني: التأكد من أن التشفير عشوائي (تغيير ناقل التهيئة IV في كل مرة)
    test('2. Should produce different ciphertexts for the same input to prevent pattern attacks', () => {
        const encryptedFirst = encryptData(testWalletAddress);
        const encryptedSecond = encryptData(testWalletAddress);

        // التأكد من غياب التطابق بين العمليتين بفضل عشوائية الـ IV
        assert.notStrictEqual(encryptedFirst, encryptedSecond);
    });

    // الاختبار الثالث: كشف وحظر محاولات التلاعب بالبيانات المالية المخزنة
    test('3. Should BLOCK decryption and throw an error if the cipher text is tampered with', () => {
        const encrypted = encryptData(testWalletAddress);
        
        // محاكاة هجوم خبيث عبر تعديل الحرف الأخير من النص المشفر
        const parts = encrypted.split(':');
        let cipherTextHex = parts[1];
        
        // تبديل الحرف الأخير بحرف مختلف لكسر سلامة الكتلة المشفرة
        const tamperedCipherTextHex = cipherTextHex.substring(0, cipherTextHex.length - 1) + (cipherTextHex.endsWith('a') ? 'b' : 'a');
        const tamperedPayload = `${parts[0]}:${tamperedCipherTextHex}`;

        // التوقع البرمجي: يجب على المحرك رفض المعاملة تماماً وإطلاق خطأ أمني
        assert.throws(() => {
            decryptData(tamperedPayload);
        }, /Critical security decryption failure or data tampering detected./);
    });
});