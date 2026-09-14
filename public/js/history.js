// ============================================
// BIGISH-YER Wallet — Transaction History
// ============================================

/**
 * تحديث سجل المعاملات
 */
async function refreshHistory() {
    if (!currentUser) return;

    const listDiv = document.getElementById('history-list');
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
            const isOutgoing = tx.from === currentUser.uid;

            div.className = 'tx-item ' + (isOutgoing ? 'outgoing' : 'incoming');
            div.innerHTML = `
                <div class="tx-info">
                    <div class="tx-type">
                        ${isOutgoing ? '⬆️ إرسال' : '⬇️ استقبال'}
                        ${tx.currency || 'Pi'}
                    </div>
                    <div class="tx-date">${formatDate(tx.timestamp)}</div>
                </div>
                <div class="tx-amount" style="color: ${isOutgoing ? '#e74c3c' : '#2ecc71'};">
                    ${isOutgoing ? '-' : '+'}${tx.amount}
                </div>
            `;

            // عند الضغط، عرض التفاصيل
            div.onclick = () => showTransactionDetails(tx);
            listDiv.appendChild(div);
        });

    } catch (err) {
        console.error("History error:", err);
        listDiv.innerHTML = '<p class="empty-state">فشل تحميل السجل.</p>';
    }
}

/**
 * عرض تفاصيل معاملة
 */
function showTransactionDetails(tx) {
    const details = `
📋 تفاصيل المعاملة:

معرف: ${tx.id || tx.txid || '—'}
النوع: ${tx.type || 'دفع'}
العملة: ${tx.currency || 'Pi'}
المبلغ: ${tx.amount}
من: ${tx.from || '—'}
إلى: ${tx.to || '—'}
الحالة: ${tx.status || 'COMPLETED'}
التاريخ: ${formatDate(tx.timestamp)}
    `;
    alert(details);
}

/**
 * تنسيق التاريخ
 */
function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'قبل لحظات';
    if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;

    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}