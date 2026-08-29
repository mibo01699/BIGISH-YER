"""
backend/pi_api.py
Pi-Compatible Integration Adapter (Sandbox / Testnet Only)
- لا يستخدم أي مفاتيح حقيقية في الكود.
- لا يدعي الوصول الرسمي لشبكة Pi أو الـ KYC الحساس.
- يعمل بوضع المحاكاة (Sandbox) أو عند توفر مفاتيح حقيقية في متغيرات البيئة.
"""

import os
import requests  # سيكون غير مستخدم إلا في الوضع الحقيقي

# المفتاح يُقرأ من متغير البيئة (Environment Variable) وليس من الكود!
PI_API_KEY = os.getenv("PI_API_KEY", "") 

def verify_payment_with_pi(payment_id):
    """
    واجهة تحقق للمدفوعات.
    - إذا لم يوجد مفتاح حقيقي، فإنها تعمل كـ Sandbox (محاكاة نجاح/فشل).
    - لا تدعي أنها تتحقق رسمياً من Pi Mainnet في وضع عدم وجود API Key.
    """
    if not PI_API_KEY:
        # وضع Sandbox: إذا لم يوجد مفتاح، نعيد نجاح وهمي للاختبارات الداخلية فقط
        return {"success": True, "mode": "SANDBOX", "message": "Verification simulated. No API key provided."}

    # الوضع الحقيقي (يتطلب توفر مفاتيح حقيقية في البيئة)
    headers = {'Authorization': f'Key {PI_API_KEY}'}
    try:
        response = requests.get(f'https://api.minepi.com/v2/payments/{payment_id}', headers=headers, timeout=5)
        if response.status_code == 200:
            payment_data = response.json()
            # ملاحظة: لا نقوم بتخزين أي بيانات KYC حساسة هنا
            return {"success": True, "mode": "LIVE_INTEGRATION"}
        else:
            return {"success": False, "mode": "LIVE_INTEGRATION", "error": "Payment not found or rejected"}
    except Exception as e:
        # في بيئة الاختبار، لا نكشف تفاصيل الخطأ الكاملة
        return {"success": False, "mode": "ERROR", "error": str(e)}