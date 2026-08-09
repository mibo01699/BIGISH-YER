// tests/yerTransfer.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const nock = require('nock'); // مكتبة لمحاكاة ردود سيرفرات Pi الخارجية
const yerTransferRouter = require('../server/routes/yerTransfer');

const { expect } = chai;
chai.use(chaiHttp);

// إعداد سيرفر اختبار مصغر
const app = express();
app.use(express.json());

// محاكاة محرك منع التكرار المالي لغرض الفحص
const AntiDoubleDippingEngine = require('../AntiDoubleDippingEngine');

// دمج راوتر المقاصة في سيرفر الاختبار
app.use('/', yerTransferRouter);

describe('🛡️ BIGISH-YER: Clearing & Settlement API Core Security Tests', () => {
    
    beforeEach(() => {
        // تنظيف محاكي الشبكة قبل كل اختبار
        nock.cleanAll();
    });

    /**
     * الاختبار الأول: التحقق من نجاح عملية المقاصة عند تمرير بيانات صحيحة وموثقة من Pi
     */
    it('1. Should SUCCESSFULLY execute settlement when Pi payment is valid and unique', (done) => {
        const mockPaymentId = "pay_valid_123456789";

        // محاكاة استجابة خوادم Pi Network الرسمية بالنجاح (v2 API)
        nock('https://minepi.com')
            .get(`/v2/payments/${mockPaymentId}`)
            .reply(200, {
                id: mockPaymentId,
                status: { completed: true },
                transaction: { txid: "pi_tx_hash_9988776655" }
            });

        // محاكاة محرك الأمان للتأكد أن المعاملة فريدة ولم يسبق صرفها
        AntiDoubleDippingEngine.verifyTransactionUniqueness = async () => true;

        chai.request(app)
            .post('/api/yer/transfer')
            .set('x-pi-user-id', 'pi_test_user_pioneer') // ترويسة الهوية الموثقة
            .set('x-pi-access-token', 'valid_secure_token')
            .send({
                piPaymentId: mockPaymentId,
                senderYerWallet: "YER_AJYAL_SRC_01",
                receiverPosWallet: "YER_GAV_POS_02",
                amountYer: 1500.00,
                memo: "Humanitarian stabilization transfer batch"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('ledgerIndex');
                expect(res.body.piBlockchainTxId).to.equal("pi_tx_hash_9988776655");
                done();
            });
    });

    /**
     * الاختبار الثاني: منع حظر المعاملة في حال غياب ترويسات الأمان الخاصة بـ Pi SDK
     */
    it('2. Should REJECT settlement with 401 if Pi Network identity headers are missing', (done) => {
        chai.request(app)
            .post('/api/yer/transfer')
            // نرسل الطلب بدون ترويسات x-pi-user-id لبيان قوة الأمان لـ Pi App Sandbox
            .send({
                piPaymentId: "pay_some_id",
                senderYerWallet: "YER_AJYAL_SRC_01",
                receiverPosWallet: "YER_GAV_POS_02",
                amountYer: 500.00
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success', false);
                expect(res.body.error).to.include("Missing verified Pi Identity");
                done();
            });
    });

    /**
     * الاختبار الثالث: حظر واكتشاف محاولات التكرار والإنفاق المزدوج للعملة الهجينة
     */
    it('3. Should BLOCK duplicate settlement attempts with 409 (Anti-Double Dipping Alert)', (done) => {
        const mockDuplicatePaymentId = "pay_already_spent_999";

        // خوادم بي ترسل أن المعاملة مكتملة
        nock('https://minepi.com')
            .get(`/v2/payments/${mockDuplicatePaymentId}`)
            .reply(200, {
                id: mockDuplicatePaymentId,
                status: { completed: true },
                transaction: { txid: "pi_tx_hash_old" }
            });

        // محاكاة محرك الأمان لإرجاع "false" مما يعني أن المعاملة مكررة وموجودة مسبقاً في الليدجر
        AntiDoubleDippingEngine.verifyTransactionUniqueness = async () => false;

        chai.request(app)
            .post('/api/yer/transfer')
            .set('x-pi-user-id', 'pi_test_user_pioneer')
            .set('x-pi-access-token', 'valid_secure_token')
            .send({
                piPaymentId: mockDuplicatePaymentId,
                senderYerWallet: "YER_AJYAL_SRC_01",
                receiverPosWallet: "YER_GAV_POS_02",
                amountYer: 2000.00
            })
            .end((err, res) => {
                expect(res).to.have.status(409); // تعارض بسبب التكرار
                expect(res.body).to.have.property('success', false);
                expect(res.body.error).to.include("Duplicate settlement attempt blocked");
                done();
            });
    });
});
