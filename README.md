# BIGISH-YER API

## نظرة عامة

BIGISH-YER هي الخدمة المالية الأساسية في منظومة Arabian Eagle A.E.C. تدير عملة YER، وتنفذ المعاملات، وتطبق قواعد منع التكرار (Idempotency)، وتحتوي على محركات داخلية للتسوية السيادية، والتبادل اللامركزي، والتعدين الديناميكي، وغيرها.

**الوضع الحالي:** الخدمة تعمل على بيئة الاختبار (Testnet). لا توجد معاملات حقيقية. بعض المحركات جاهزة ولكنها غير مربوطة بنقاط نهاية بعد (سيتم ربطها في المراحل القادمة).

---

## هيكل المشروع (المحركات الداخلية)

الخدمة مبنية على مجموعة من المحركات المستقلة، كل محرك مسؤول عن وظيفة محددة:

| الملف | الوظيفة |
|-------|---------|
| `YERTokenomicsCanonical.js` | البيانات الثابتة لعملة YER (العرض، التوزيع، الدقة). يتحقق من صحة المجموع فور تحميله. |
| `AntiDoubleDippingEngine.js` | منع تنفيذ نفس المعاملة مرتين (Idempotency). يُستخدم في نقاط النهاية المالية. |
| `SovereignClearingGuard.js` | محرك للتسوية السيادية، يتحقق من صحة المعاملات قبل التنفيذ. |
| `PiYerAMMExchange.js` | محرك للتبادل اللامركزي بين Pi و YER (غير مفعّل بعد). |
| `DynamicMiningGovernor.js` | محرك للتحكم في التعدين الديناميكي (غير مفعّل بعد). |
| `AjyalSmartAidEngine.js` | محرك خاص ببروتوكول AJYAL (التعليم والشباب). |
| `CobraIntentVerificator.js` | محرك خاص ببروتوكول COBRA (الاستجابة للكوارث). |
| `GavAiSupportSystem.js` | محرك خاص ببروتوكول GAV (الحوكمة والتصويت). |
| `AmanBeWellEngine.js` | محرك خاص ببروتوكول AMAN و Be-Well (الأمن والصحة). |
| `HybridClearingProcessor.js` | معالج تسوية هجين يدمج بين عدة محركات. |

**ملاحظة:** المحركات المذكورة أعلاه (ما عدا الثلاثة الأولى) ليست مربوطة بنقاط نهاية حالياً، ولكنها موجودة وجاهزة للتكامل في المراحل القادمة.

---

## نقاط النهاية المتاحة حالياً

جميع النقاط تبدأ بـ `/api`.

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/health` | التأكد من أن الخدمة تعمل |
| GET | `/api/tokenomics` | عرض بيانات YER الأساسية |
| POST | `/api/transactions` | تنفيذ تحويل YER مع منع التكرار |
| GET | `/api/transactions/:key` | استرجاع معاملة سابقة باستخدام المفتاح |
| GET | `/api/balance/:address` | الاستعلام عن رصيد عنوان |

---

## 1. فحص الصحة

**`GET /api/health`**

يستخدمه Gateway للتحقق من أن BIGISH-YER متاحة.

**الرد:**

```json
{
  "status": "ok",
  "service": "bigish-yer",
  "version": "0.2.0",
  "environment": "testnet"
}
```

---

2. بيانات YER الأساسية

GET /api/tokenomics

يعرض المعلومات الثابتة لعملة YER كما هي محددة في YERTokenomicsCanonical.js.

الرد:

```json
{
  "supply": 300000000,
  "precision": 10,
  "allocations": {
    "community": { "percentage": 10, "amount": 30000000 },
    "ecosystem": { "percentage": 30, "amount": 90000000 },
    "reserve": { "percentage": 60, "amount": 180000000 }
  },
  "totalPercentage": 100,
  "status": "LAUNCHPAD_PENDING"
}
```

القيم ثابتة ولا تتغير. أي محاولة لتغييرها ستؤدي إلى فشل الاختبارات.

---

3. تنفيذ تحويل YER

POST /api/transactions

ينفذ تحويلاً بين حسابين. يستخدم AntiDoubleDippingEngine لمنع التكرار، ويمرر المعاملة عبر SovereignClearingGuard للتحقق من صحتها.

الرؤوس المطلوبة:

الرأس القيمة
Idempotency-Key قيمة فريدة (مثل UUID)
Content-Type application/json

محتوى الطلب:

```json
{
  "source": "عنوان المرسل",
  "destination": "عنوان المستقبل",
  "amount": 100.5,
  "currency": "YER"
}
```

الردود:

الحالة المعنى
201 تمت المعاملة بنجاح
400 خطأ في البيانات (رصيد غير كافٍ، مبلغ غير صحيح، عملة غير مدعومة)
409 مفتاح Idempotency مستخدم مسبقاً (معاملة مكررة)

مثال الرد الناجح:

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "idempotencyKey": "abc-123",
    "source": "address1",
    "destination": "address2",
    "amount": 100.5,
    "currency": "YER",
    "status": "completed",
    "timestamp": "2025-04-06T12:00:00.000Z",
    "clearedBy": "SovereignGuard"
  }
}
```

---

4. استرجاع معاملة سابقة

GET /api/transactions/:key

يستخدم لاسترجاع تفاصيل معاملة باستخدام مفتاحها الفريد.

مثال: GET /api/transactions/abc-123

الردود:

· 200: تعيد تفاصيل المعاملة
· 404: المفتاح غير موجود

---

5. الاستعلام عن رصيد عنوان

GET /api/balance/:address

يعيد رصيد عنوان معين بوحدة YER.

مثال: GET /api/balance/test_source

الرد:

```json
{
  "address": "test_source",
  "balance": 9850.0,
  "currency": "YER"
}
```

---

أمثلة باستخدام cURL

```bash
# فحص الصحة
curl http://localhost:3001/api/health

# عرض التوكنوميكس
curl http://localhost:3001/api/tokenomics

# تحويل 10 YER
curl -X POST http://localhost:3001/api/transactions \
  -H "Idempotency-Key: test-123" \
  -H "Content-Type: application/json" \
  -d '{"source":"test_source","destination":"dest","amount":10,"currency":"YER"}'

# الاستعلام عن معاملة
curl http://localhost:3001/api/transactions/test-123

# الاستعلام عن الرصيد
curl http://localhost:3001/api/balance/test_source
```

---

القيود الفنية الحالية (يجب أن يكون الجمهور على دراية بها)

· التخزين المؤقت: جميع المعاملات والأرصدة تُحفظ في الذاكرة فقط. إعادة تشغيل الخدمة تفقد البيانات.
· لا تكامل مع Pi Network: المصادقة والمدفوعات عبر Pi غير مفعلة حالياً.
· لا قاعدة بيانات: سيتم إضافتها في المرحلة القادمة.
· المحركات غير المربوطة: AMM، التعدين الديناميكي، ومحركات البروتوكولات التسعة موجودة في الملفات ولكنها غير مربوطة بنقاط نهاية بعد.

---

الخريطة المستقبلية

المرحلة الميزة
قادم ربط PiYerAMMExchange بنقطة نهاية للتبادل بين Pi و YER
قادم ربط DynamicMiningGovernor لتوزيع المكافآت
قادم ربط محركات AJYAL، COBRA، GAV، AMAN، Be-Well بنقاط نهاية خاصة
قادم استبدال الذاكرة بقاعدة بيانات دائمة (PostgreSQL)
قادم تكامل كامل مع Pi Developer Portal (App Wallet، المدفوعات)

---

أمان

· جميع نقاط النهاية محمية بـ helmet و cors و rate-limit.
· لا يتم تخزين أي مفاتيح خاصة أو حساسة.
· جميع الطلبات يجب أن تأتي عبر HTTPS في الإنتاج.
· Idempotency-Key يُستخدم للتدقيق ومنع التكرار.

---

آخر تحديث: أبريل 2025
الإصدار: 0.2.0
البيئة: Testnet (لا توجد معاملات حقيقية)
