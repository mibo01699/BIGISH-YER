-- جدول تفضيلات الدفع الهجين المخصص للتجار وبوابات البيع لـ BIGISH-YER
CREATE TABLE IF NOT EXISTS merchant_hybrid_preferences (
    merchant_id VARCHAR(255) PRIMARY KEY,
    merchant_name VARCHAR(255) NOT NULL,
    min_pi_ratio_accepted INT DEFAULT 0,       -- الحد الأدنى المسموح به لنسبة عملة Pi في المتجر
    max_yer_ratio_accepted INT DEFAULT 100,    -- الحد الأقصى المقبول لنسبة رمز YER المحلي لحفظ السيولة
    auto_settle_to_stable BOOLEAN DEFAULT TRUE,-- تفعيل التحويل التلقائي الفوري لتفادي التقلبات
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إدراج تهيئة افتراضية لتاجر تجريبي (مثال لمتجر إلكتروني يمني محلي عبر تطبيق AJYAL أو مجمعات المزاد)
INSERT INTO merchant_hybrid_preferences (merchant_id, merchant_name, min_pi_ratio_accepted, max_yer_ratio_accepted, auto_settle_to_stable)
VALUES ('merchant_yemen_pos_01', 'مؤسسة الأجيال للتجارة الرقمية', 30, 70, true)
ON CONFLICT (merchant_id) DO NOTHING;
