// tests/cryptoEngine.test.js
/**
 * BIGISH-YER: Automated Encryption & Security Infrastructure Tests
 * Aligned with Pi Core Team v2.0 Sandbox Protocols
 */

const chai = require('chai');
const crypto = require('crypto');
const { encryptData, decryptData } = require('../server/utils/cryptoEngine');

const { expect } = chai;

describe('🔐 BIGISH-YER: Crypto Engine & Data Integrity Tests', () => {

    // تحديد عينات بيانات مالية حساسة للمحاكاة (محفظة YER موازية لتطبيق AJYAL)
    const testWalletAddress = "YER_AJYAL_MAINNET_SANA_7711";

    /**
     * الاختبار الأول: التحقق من نجاح التشفير وفك التشفير وعودة البيانات لأصلها بدقة
     */
    it('1. Should successfully encrypt and decrypt data with complete symmetry', () => {
        const encrypted = encryptData(testWalletAddress);
        
        // التأكد من أن النص المشفر ليس فارغاً ولا يماثل النص الأصلي (مما يعني حدوث التشفير فعلياً)
        expect(encrypted).to.not.be.null;
        expect(encrypted).to.not.equal(testWalletAddress);
        expect(encrypted).to.include(':'); // التأكد من وجود الهيكل الثلاثي المفصول بنقطتين

        const decrypted = decryptData(encrypted);
        // التأكد من نجاح فك التشفير وعودة عنوان المحفظة الأصلي
        expect(decrypted).to.equal(testWalletAddress);
    });

    /**
     * الاختبار الثاني: التأكد من أن التشفير عشوائي (تغيير ناقل التهيئة IV في كل مرة)
     */
    it('2. Should produce different ciphertexts for the same input to prevent pattern attacks', () => {
        const encryptedFirst = encryptData(testWalletAddress);
        const encryptedSecond = encryptData(testWalletAddress);

        // التأكد من غياب التطابق بين العمليتين بفضل عشوائية الـ IV، وهو شرط أساسي لـ Pi Apps Blockchain
        expect(encryptedFirst).to.not.equal(encryptedSecond);
    });

    /**
     * الاختبار الثالث: كشف وحظر محاولات التلاعب بالبيانات المالية المخزنة (الإنذار الأمني الحرج)
     */
    it('3. Should BLOCK decryption and throw an error if the cipher text is tampered with', () => {
        const encrypted = encryptData(testWalletAddress);
        
        // محاكاة هجوم خبيث (Data Tampering) عبر تعديل الحرف الأخير من النص المشفر في الليدجر
        const parts = encrypted.split(':');
        let cipherTextHex = parts[2];
        
        // تبديل الحرف الأخير بحرف مختلف لكسر سلامة الكتلة المشفرة
        const tamperedCipherTextHex = cipherTextHex.substring(0, cipherTextHex.length - 1) + (cipherTextHex.endsWith('a') ? 'b' : 'a');
        const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCipherTextHex}`;

        // التوقع البرمجي: يجب على المحرك رفض المعاملة تماماً وإطلاق خطأ أمني (Exception) لمنع معالجة المقاصة
        expect(() => {
            decryptData(tamperedPayload);
        }).to.throw("Critical security decryption failure or data tampering detected.");
    });
});
