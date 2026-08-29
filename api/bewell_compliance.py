# api/bewell_compliance.py
"""
BIGISH-YER Compliance & Verification Gateway for Be-Well Protocol
يتحقق من حالة الهوية الداخلية ويمنع صرف المساعدات والمطالبات المكررة.
ملاحظة: لا يخزن أو يصل إلى أي بيانات KYC رسمية من شبكة Pi. يعمل كطبقة تحقق محلية معتمدة.
"""

import hashlib

class BeWellComplianceGuard:
    def __init__(self, registered_identities_db):
        self.db = registered_identities_db
        self.processed_signatures = set()  # مخزن مؤقت لمنع الازدواجية

    def verify_incoming_settlement_signature(self, user_id, amount_yer, reference_id):
        """ التحقق من مطابقة الهوية ومصداقية مرجع المعاملة قبل صرف الـ YER """
        
        # 1. إنشاء توقيع تشفيري فريد للمعاملة لمنع هجمات التكرار (Replay Attacks)
        tx_data = f"{user_id}_{amount_yer}_{reference_id}"
        tx_signature = hashlib.sha256(tx_data.encode()).hexdigest()

        if tx_signature in self.processed_signatures:
            print("[⚠️ SECURITY ALERT] تم رصد محاولة صرف مزدوج مكررة لنفس المعاملة!")
            return False, "DOUBLE_DIPPING_DETECTED"

        # 2. التحقق من وجود الهوية الموحدة في السجل التشاركي (حالة تحقق داخلية)
        user_exists = self.db.get_user_identity(user_id)
        if not user_exists:
            print(f"[⚠️ COMPLIANCE] المستخدم {user_id} غير مسجل في سجل الهوية الموحد.")
            return False, "UNAUTHORIZED_IDENTITY"

        # 3. اعتماد التوقيع وإضافته لقفل الحماية من الازدواجية
        self.processed_signatures.add(tx_signature)
        return True, "VERIFICATION_SUCCESSFUL"