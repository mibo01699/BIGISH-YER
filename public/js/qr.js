// ============================================
// BIGISH-YER Wallet — QR Code
// ============================================

/**
 * تحميل QR Code
 */
async function loadQR() {
    if (!currentUser) return;

    const address = currentUser.uid;
    document.getElementById('my-address').textContent = address;

    // رسم QR بسيط باستخدام Canvas
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 250;
    canvas.width = size;
    canvas.height = size;

    // خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // حدود
    ctx.strokeStyle = '#1a4d2e';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    // نص العنوان (بديل QR حقيقي - لأن مكتبة QR غير مثبتة بعد)
    ctx.fillStyle = '#1a4d2e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', size / 2, 40);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#333';
    const parts = address.match(/.{1,20}/g) || [address];
    parts.forEach((part, i) => {
        ctx.fillText(part, size / 2, 80 + i * 18);
    });

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('BIGISH-YER Wallet', size / 2, size - 20);
}

/**
 * نسخ العنوان إلى الحافظة
 */
function copyAddress() {
    const address = document.getElementById('my-address').textContent;
    if (!address || address === '—') return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(address).then(() => {
            alert('✅ تم نسخ العنوان');
        }).catch(() => {
            fallbackCopy(address);
        });
    } else {
        fallbackCopy(address);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        alert('✅ تم نسخ العنوان');
    } catch (e) {
        alert('فشل النسخ، انسخه يدوياً:\n' + text);
    }
    document.body.removeChild(ta);
}

/**
 * مسح QR (ميزة قيد التطوير)
 */
function scanQR() {
    alert('📷 ميزة الماسح الضوئي قيد التطوير.\nسيتم تفعيلها في التحديث القادم.');
}