/**
 * @file HybridNotificationEngine.js
 * @description محرك بث الإشعارات اللحظية لعمليات المقاصة الهجينة لضمان الشفافية الفورية بين الأطراف.
 */

class HybridNotificationEngine {
    constructor() {
        // مصفوفة لمحاكاة المشتركين النشطين (التجار والمشترين) في بيئة الويب 3
        this.activeConnections = new Map();
    }

    /**
     * تسجيل مستخدم أو تاجر لتلقي الإشعارات الفورية عبر الـ WebSockets أو بث الأحداث
     */
    registerClient(userId, connection) {
        this.activeConnections.set(userId, connection);
    }

    /**
     * بث إشعار المقاصة الهجينة فور إتمام المعاملة بنجاح
     * @param {string} buyerId معرف المشتري
     * @param {string} merchantId معرف التاجر
     * @param {Object} splitManifest وثيقة توزيع الحصص الصادرة من المعالج الديناميكي
     */
    broadcastHybridReceipt(buyerId, merchantId, splitManifest) {
        const timestamp = new Date().toISOString();
        
        // تجهيز الحمولة البياناتية المخصصة للمشتري
        const buyerNotification = {
            event: "HYBRID_PAYMENT_DEBIT",
            message: `تم خصم المدفوعات بنجاح بنسبة هجينة (${splitManifest.piRatio}% Pi / ${splitManifest.yerRatio}% YER)`,
            details: {
                piStroops: splitManifest.piPaymentStroops,
                yerSubUnits: splitManifest.yerPaymentSubUnits,
                time: timestamp
            }
        };

        // تجهيز الحمولة البياناتية المخصصة للتاجر
        const merchantNotification = {
            event: "HYBRID_PAYMENT_CREDIT",
            message: `تم استلام دفعة هجينة جديدة ومقاصتها بنجاح بمعدل استقرار سيادي.`,
            details: {
                piStroops: splitManifest.piPaymentStroops,
                yerSubUnits: splitManifest.yerPaymentSubUnits,
                time: timestamp
            }
        };

        console.log(`[إشعار لحظي]: تم بث إيصال المقاصة للمشتري ${buyerId} والتاجر ${merchantId}.`);
        
        // محاكاة الإرسال اللحظي الفوري عبر القنوات المفتوحة
        this._sendToClient(buyerId, buyerNotification);
        this._sendToClient(merchantId, merchantNotification);

        return true;
    }

    _sendToClient(clientId, payload) {
        if (this.activeConnections.has(clientId)) {
            // تنفيذ الإرسال الحقيقي في بيئة الإنتاج (مثال: ws.send)
            const connection = this.activeConnections.get(clientId);
            connection.send(JSON.stringify(payload));
        }
    }
}

module.exports = HybridNotificationEngine;
