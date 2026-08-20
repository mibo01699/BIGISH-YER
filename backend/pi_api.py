import requests

PI_API_KEY = "الخاص_بك_من_لوحة_تحكم_المطورين"

def verify_payment_with_pi(payment_id):
    headers = {'Authorization': f'Key {PI_API_KEY}'}
    # التحقق من خادم Pi مباشرة
    response = requests.get(f'https://api.minepi.com/v2/payments/{payment_id}', headers=headers)
    if response.status_code == 200:
        payment_data = response.json()
        # تأكد من أن المبلغ والوجهة صحيحة قبل الموافقة
        return True
    return False