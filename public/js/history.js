// ============================================
// BIGISH-YER Wallet — Transaction History (v5)
// ============================================

async function refreshHistory() {
    if (!currentUser) return;
    const listDiv = document.getElementById('history-list');
    if (!listDiv) return;

    listDiv.innerHTML = '<p class="empty-state">جارٍ التحميل...</p>';

    try {
        const res = await fetch(`/api/transactions/user/${currentUser.uid}`);
        const data = await res.json();

        if (!data.transactions || data.transactions.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">لا توجد معاملات بعد.</p>';
            return;
        }

        listDiv.innerHTML = '';
        data.transactions.forEach(tx => {
            const div = document.createElement('div');
            const isOutgoing = tx.userId === currentUser.uid || tx.from === currentUser.uid;
            div.className = 'tx-item ' + (isOutgoing ? 'outgoing' : 'incoming');

            div.innerHTML = `
                <div class="tx-info">
                    <div class="tx-type">${getTxIcon(tx.type)} ${tx.type || 'معاملة'}</div>
                    <div class="tx-date">${formatDate(tx.timestamp)}</div>
                    ${getTxFeeBadge(tx)}
                </div>
                <div class="tx-amount" style="color: ${isOutgoing ? '#e74c3c' : '#2ecc71'}; text-align:left;">
                    ${formatAmount(tx, isOutgoing)}
                </div>
            `;
            div.onclick = () => showTransactionDetails(tx);
            listDiv.appendChild(div);
        });
    } catch (err) {
        console.error("History error:", err);
        listDiv.innerHTML = '<p class="empty-state">فشل تحميل السجل.</p>';
    }
}

// ============================================
// تنسيق المبلغ (مصحح بالكامل)
// ============================================
function formatAmount(tx, isOutgoing) {
    const sign = isOutgoing ? '-' : '+';

    // إيداع Pi
    if (tx.type === 'Pi Deposit') {
        return `<div style="font-weight:700;">${sign}${tx.amount} Pi</div>`;
    }

    // دفع هجين (Pi + YER)
    if (tx.type === 'Hybrid Payment') {
        return `
            <div style="font-weight:700;">${sign}${tx.piAmount} Pi</div>
            <div style="font-weight:700; font-size:0.9rem;">${sign}${tx.yerAmount} YER</div>
        `;
    }

    // تحويل Pi
    if (tx.type === 'Pi Transfer' || tx.type === 'Pi Payment') {
        return `<div style="font-weight:700;">${sign}${tx.piAmount || tx.amount} Pi</div>`;
    }

    // تحويل YER
    if (tx.type === 'YER Transfer' || tx.type === 'YER Payment') {
        return `<div style="font-weight:700;">${sign}${tx.yerAmount || tx.amount} YER</div>`;
    }

    // توزيع YER
    if (tx.type === 'YER Distribution') {
        return `<div style="font-weight:700;">${sign}${tx.amount} YER</div>`;
    }

    // افتراضي
    return `<div style="font-weight:700;">${sign}${tx.amount} ${tx.currency || 'YER'}</div>`;
}

// ============================================
// أيقونات المعاملات
// ============================================
function getTxIcon(type) {
    const icons = {
        'Pi Deposit': '⬇️',
        'Pi Payment': '🟢',
        'Pi Transfer': '🟢',
        'YER Transfer': '🟡',
        'YER Payment': '🟡',
        'Hybrid Payment': '🔀',
        'YER Distribution': '⛏️'
    };
    return icons[type] || '💳';
}

// ============================================
// شارة الرسوم
// ============================================
function getTxFeeBadge(tx) {
    if (tx.fee === 0 && tx.type !== 'Pi Deposit') {
        return '<span style="font-size:0.65rem; color:#27ae60;">✓ بدون رسوم</span>';
    }
    return '';
}

// ============================================
// تفاصيل المعاملة
// ============================================
function showTransactionDetails(tx) {
    let d = `📋 تفاصيل المعاملة\n\n`;
    d += `المعرف: ${tx.id || '—'}\n`;
    d += `النوع: ${tx.type || '—'}\n`;
    d += `الحالة: ${tx.status || '—'}\n`;

    if (tx.type === 'Pi Deposit') {
        d += `\n⬇️ إيداع:\n`;
        d += `   • المبلغ: ${tx.amount} Pi\n`;
        d += `   • من: محفظة Pi الرسمية\n`;
    } else if (tx.type === 'Hybrid Payment') {
        d += `\n🔀 دفع هجين:\n`;
        d += `   • Pi: ${tx.piAmount}\n`;
        d += `   • YER: ${tx.yerAmount}\n`;
        d += `   • الرسوم: 0 (مجاني)\n`;
    } else if (tx.type === 'YER Transfer') {
        d += `\n🟡 تحويل YER:\n`;
        d += `   • المبلغ: ${tx.yerAmount || tx.amount}\n`;
        d += `   • الرسوم: 0 (مجاني)\n`;
    } else {
        d += `العملة: ${tx.currency || '—'}\n`;
        d += `المبلغ: ${tx.amount}\n`;
    }

    if (tx.to) d += `\nإلى: ${tx.to}\n`;
    if (tx.memo) d += `ملاحظة: ${tx.memo}\n`;
    if (tx.txid) d += `\nTXID: ${tx.txid.slice(0, 30)}...\n`;
    d += `\nالتاريخ: ${formatDate(tx.timestamp)}`;

    alert(d);
}

// ============================================
// تنسيق التاريخ
// ============================================
function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'قبل لحظات';
    if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}