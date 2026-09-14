// ============================================
// BIGISH-YER Wallet — Transaction History (v2)
// ============================================

async function refreshHistory() {
    if (!currentUser) return;
    const listDiv = document.getElementById('history-list');
    listDiv.innerHTML = '<p class="empty-state">جارٍ التحميل...</p>';

    try {
        const res = await fetch(`/api/transactions/user/${currentUser.uid}`);
        const data = await res.json();

        console.log("History response:", data);

        if (!data.transactions || data.transactions.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">لا توجد معاملات بعد.</p>';
            return;
        }

        listDiv.innerHTML = '';
        data.transactions.forEach(tx => {
            const div = document.createElement('div');
            const isOutgoing = tx.type?.includes('Payment') || tx.type?.includes('Distribution');
            div.className = 'tx-item ' + (isOutgoing ? 'outgoing' : 'incoming');

            div.innerHTML = `
                <div class="tx-info">
                    <div class="tx-type">${getTxIcon(tx.type)} ${tx.type || 'معاملة'}</div>
                    <div class="tx-date">${formatDate(tx.timestamp)}</div>
                    <div class="tx-date" style="font-family: monospace; font-size:0.7rem;">${(tx.id || '').slice(0, 20)}</div>
                </div>
                <div class="tx-amount" style="color: ${isOutgoing ? '#e74c3c' : '#2ecc71'};">
                    ${isOutgoing ? '-' : '+'}${tx.amount} ${tx.currency || 'Pi'}
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

function getTxIcon(type) {
    if (!type) return '💳';
    if (type.includes('Hybrid')) return '🔀';
    if (type.includes('Distribution')) return '⛏️';
    if (type.includes('Pi Payment')) return '🟢';
    return '💳';
}

function showTransactionDetails(tx) {
    alert(`📋 تفاصيل المعاملة:

معرف: ${tx.id || '—'}
النوع: ${tx.type || '—'}
العملة: ${tx.currency || '—'}
المبلغ: ${tx.amount || '—'}
الحالة: ${tx.status || '—'}
التاريخ: ${formatDate(tx.timestamp)}`);
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