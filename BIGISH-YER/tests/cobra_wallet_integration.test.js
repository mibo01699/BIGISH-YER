const { expect } = require("chai");
const crypto = require("crypto");
const CobraIntentVerificator = require("../src/protocols/CobraIntentVerificator");

describe("BIGISH-YER: اختبار كاشف واعتراف استدعاءات Cobra eSIM", function () {
    const secretApiKey = "sk_live_prod_cobra_telecom_secured_key_8892";
    const YER_DECIMALS = 10n ** 10n;

    it("يجب أن يعترف بالملف الموقّع رقمياً ويمنحه الضوء الأخضر بالأعداد الصحيحة", function () {
        const cobraTxId = "COBRA-9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C";
        const yerAmountSubUnits = 92500000000n; // 9.25 YER

        // محاكاة بناء ملف التعرف المشفر تماماً كما يصدره خادم Cobra eSIM
        const intentManifest = {
            originAppIdentifier: "COBRA_ESIM_PROTOCOL_WEB3",
            associatedCobraTxId: cobraTxId,
            associatedAssetPair: "YER/Pi",
            immutableSubUnitsAmount: yerAmountSubUnits.toString(),
            blockchainNetworkContext: "Pi_Open_Mainnet_Ecosystem",
            antiTamperSalt: "mock_salt_1699"
        };

        const signature = crypto
            .createHmac('sha256', secretApiKey)
            .update(JSON.stringify(intentManifest))
            .digest('hex');

        const intentFilePayload = {
            isVerifiedIntent: true,
            compiledManifest: intentManifest,
            carrierSovereignSignature: signature
        };

        // تشغيل بروتوكول التحقق الفوري داخل المحفظة
        const audit = CobraIntentVerificator.verifyIncomingCobraRequest(intentFilePayload, secretApiKey);
        
        expect(audit.isValid).to.be.true;
        expect(BigInt(audit.verifiedSubUnits)).to.equal(yerAmountSubUnits);
    });
});
