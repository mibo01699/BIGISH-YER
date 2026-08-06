// ============================================================
// الملف: tests/YERToken.test.js
// المسار: BIGISH-YER/tests/YERToken.test.js
// الدور: اختبارات العقد الذكي YER (محاكاة)
// ============================================================

const YERToken = require('../contracts/YERTokenContract');

describe('YERToken Contract', () => {
    let token;

    beforeEach(() => {
        token = new YERToken();
        token.initialize('admin', 1000000);
    });

    test('should initialize with correct supply', () => {
        const balance = token.balance('admin');
        expect(balance).toBe(1000000);
    });

    test('should transfer tokens between wallets', () => {
        token.transfer('admin', 'user1', 100);
        const adminBalance = token.balance('admin');
        const userBalance = token.balance('user1');
        expect(adminBalance).toBe(999900);
        expect(userBalance).toBe(100);
    });
});