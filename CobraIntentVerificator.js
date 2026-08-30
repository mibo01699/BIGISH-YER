/**
 * @file CobraIntentVerificator.js
 * @package BIGISH-YER Sovereign Infrastructure
 * @notice بروتوكول التحقق السيادي المدمج داخل محفظة YER للاعتراف باستدعاءات تطبيق Cobra eSIM
 * @dev ممتثل تماماً لقيود الصفر العشري (Zero Floating-Point) لـ BIGISH-YER
 */

const crypto = require('crypto');

class CobraIntentVerificator {
    /**
     * @notice التحقق الفوري من شرعية وصحة ملف التفويض والاستدعاء المرسل من تطبيق Cobra
     * @param intentFilePayload ملف التعرف الرقمي المشفر المستقبل في المحفظة
     * @param appSecretKey المفتاح السري المشترك المكتوم للتحقق من التوقيع (Telecom API Key المقترن)
     */
    static verifyIncomingCobraRequest(intentFilePayload, appSecretKey) {
        try {
            // 1. فحص سلامة الهيكل البرمجي لملف الاستدعاء والتأكد من هويته الرسمية
            if (!intentFilePayload || !intentFilePayload.isVerifiedIntent || !intentFilePayload.compiledManifest) {
                return { isValid: false, reason: "YER-Error: Corrupted intent structural layout." };
            }

            const manifest = intentFilePayload.compiledManifest;

            // 2. التحقق من مطابقة المعايير الصارمة لاسم المجمع الرسمي المذكور بمستودع BIGISH-YER
            if (manifest.originAppIdentifier !== "COBRA_ESIM_PROTOCOL_WEB3" || manifest.associatedAssetPair !== "YER/Pi") {
                return { isValid: false, reason: "YER-Error: Application origin or Asset Pair mismatch." };
            }

            // 3. إعادة توليد التوقيع محلياً داخل المحفظة لمقارنته بالتوقيع القادم ومكافحة التزوير
            const reconstructedSignature = crypto
                .createHmac('sha256', appSecretKey)
                .update(JSON.stringify(manifest))
                .digest('hex');

            // 4. مطابقة التوقيعين الذريين بالثانية الواحدة
            if (reconstructedSignature !== intentFilePayload.carrierSovereignSignature) {
                return { isValid: false, reason: "YER-Error: Cryptographic signature verification failed. Tampering detected." };
            }

            // 5. التحقق من أن حجم المعاملة يتبع الأعداد الصحيحة الصارمة (Strict BigInt) لمنع الكسور
            const amountBigInt = BigInt(manifest.immutableSubUnitsAmount);
            if (amountBigInt <= 0n) {
                return { isValid: false, reason: "YER-Error: Zero or negative clearing balance block." };
            }

            // إذا نجحت جميع الفلاتر السيادية، تعترف المحفظة بالاستدعاء وتمنحه الضوء الأخضر
            return {
                isValid: true,
                targetCobraTxId: manifest.associatedCobraTxId,
                verifiedSubUnits: amountBigInt.toString(),
                networkContext: manifest.blockchainNetworkContext
            };

        } catch (error) {
            return { isValid: false, reason: `YER-Error: Verification pipeline exception: ${error.message}` };
        }
    }
}

module.exports = CobraIntentVerificator;

