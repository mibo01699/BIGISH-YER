// ============================================
// BIGISH-YER Wallet — Settings
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
            // يمكن إضافة ترجمة كاملة لاحقاً
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
 * تطبيق اللغة المحفوظة
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'ar';
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

    const select = document.getElementById('language-select');
    if (select) select.value = savedLang;
});