// ============================================
// BIGISH-YER Wallet — Transaction History (v3)
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
                    ${getTxStatusBadge(tx.status)}
                </div>
                <div class="tx-amount" style="color: ${isOutgoing ? '#e74c3c' : '#2ecc71'};">
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

function formatAmount(tx, isOutgoing) {
    const sign = isOutgoing ? '-' : '+';
    // دفع هجين
    if (tx.type === 'Hybrid Payment') {
        return `${sign}${tx.piAmount} Pi<br><small style="font-size:0.75rem;">+ ${tx.yerAmount} YER</small>`;
    }
    // دفعات Pi
    if (tx.type === 'Pi Payment') {
        return `${sign}${tx.amount} Pi`;
    }
    // دفعات YER
    return `${sign}${tx.amount} ${tx.currency || 'YER'}`;
}

function getTxIcon(type) {
    if (!type) return '💳';
    if (type === 'Hybrid Payment') return '🔀';
    if (type === 'Pi Payment') return '🟢';
    if (type === 'YER Payment') return '🟡';
    if (type === 'YER Distribution') return '⛏️';
    return '💳';
}

function getTxStatusBadge(status) {
    if (!status || status === 'COMPLETED') return '';
    if (status === 'PENDING_PI') {
        return '<span style="font-size:0.7rem; color:#f39c12; background:#fff3cd; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:4px;">⏳ بانتظار Pi</span>';
    }
    return `<span style="font-size:0.7rem; color:#7f8c8d;">${status}</span>`;
}

function showTransactionDetails(tx) {
    let details = `📋 تفاصيل المعاملة:\n\n`;
    details += `معرف: ${tx.id || '—'}\n`;
    details += `النوع: ${tx.type || '—'}\n`;
    details += `الحالة: ${tx.status || '—'}\n`;

    if (tx.type === 'Hybrid Payment') {
        details += `\n🔀 دفع هجين:\n`;
        details += `   • Pi: ${tx.piAmount} Pi\n`;
        details += `   • YER: ${tx.yerAmount} YER\n`;
        if (tx.piTxid) details += `   • TXID Pi: ${tx.piTxid.slice(0, 20)}...\n`;
    } else {
        details += `العملة: ${tx.currency || '—'}\n`;
        details += `المبلغ: ${tx.amount}\n`;
    }

    if (tx.txid) details += `\nTXID: ${tx.txid.slice(0, 30)}...\n`;
    details += `\nالتاريخ: ${formatDate(tx.timestamp)}`;

    alert(details);
}

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