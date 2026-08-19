# api/bewell_compliance.py
"""
BIGISH-YER Compliance & Verification Gateway for Be-Well Protocol
يتأكد من معايير الهوية الموحدة (KYC/KYB) ويمنع صرف المساعدات والمطالبات المكررة
"""

import hashlib

class BeWellComplianceGuard:
    def __init__(self, registered_identities_db):
        self.db = registered_identities_db
        self.processed_signatures = set() # مخزن مؤقت لمنع الازدواجية والصرف المتكرر

    def verify_incoming_settlement_signature(self, pi_user_id, amount_yer, reference_id):
        """ التحقق من مطابقة الهوية ومصداقية مرجع المعاملة قبل صك الـ YER """
        
        # 1. إنشاء توقيع تشفيري فريد للمعاملة لمنع هجمات التكرار (Replay Attacks)
        tx_data = f"{pi_user_id}_{amount_yer}_{reference_id}"
        tx_signature = hashlib.sha256(tx_data.encode()).hexdigest()

        if tx_signature in self.processed_signatures:
            print("[⚠️ SECURITY ALERT] تم رصد محاولة صرف مزدوج مكررة لنفس المعاملة!")
            return False, "DOUBLE_DIPPING_DETECTED"

        # 2. التحقق من وجود الهوية الموحدة في السجل التشاركي
        user_exists = self.db.get_user_identity(pi_user_id)
        if not user_exists:
            print(f"[⚠️ COMPLIANCE] المستخدم {pi_user_id} غير موثق بسجل الهوية الموحد.")
            return False, "UNAUTHORIZED_IDENTITY"

        # 3. اعتماد التوقيع وإضافته لقفل الحماية من الازدواجية
        self.processed_signatures.add(tx_signature)
        return True, "VERIFICATION_SUCCESSFUL"
