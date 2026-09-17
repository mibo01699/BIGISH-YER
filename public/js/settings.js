// ============================================
// BIGISH-YER Wallet — Settings (v2)
// ============================================

/**
 * تغيير اللغة
 */
function changeLanguage() {
    const lang = document.getElementById('language-select').value;

    if (lang === 'en') {
        if (confirm('Switch to English? The page will reload.')) {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
            localStorage.setItem('lang', 'en');
            alert('English translation coming soon. Interface remains in Arabic.');
            localStorage.setItem('lang', 'ar');
        }
    } else {
        localStorage.setItem('lang', 'ar');
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
    }
}

/**
 * اختبار Integration API
 */
async function testIntegrationAPI() {
    try {
        const res = await fetch('/api/integration/apps', {
            headers: { 'x-admin-key': 'ae-admin-2026' }
        });
        const data = await res.json();

        if (data.success) {
            let msg = '✅ التطبيقات المسجلة:\n\n';
            data.apps.forEach(app => {
                msg += `• ${app.name} (${app.id})\n`;
                msg += `  الحالة: ${app.active ? 'نشط ✅' : 'متوقف ❌'}\n\n`;
            });
            alert(msg);
        } else {
            alert('❌ خطأ: ' + (data.error || 'غير معروف'));
        }
    } catch (e) {
        alert('❌ خطأ في الاتصال: ' + e.message);
    }
}

/**
 * تطبيق اللغة المحفوظة
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'ar';
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

    const select = document.getElementById('language-select');
    if (select) select.value = savedLang;
});