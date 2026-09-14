// ============================================
// BIGISH-YER Wallet — YER Token Info
// ============================================

/**
 * تحميل معلومات الرمز من الخادم (اختياري)
 */
async function loadTokenInfo() {
    try {
        const res = await fetch('/api/tokenomics');
        const data = await res.json();

        // يمكن استخدام هذه البيانات لتحديث الصفحة ديناميكياً
        console.log("Tokenomics:", data);
    } catch (err) {
        console.error("Token info error:", err);
    }
}

// تحميل تلقائي عند الفتح
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadTokenInfo, 2000);
});