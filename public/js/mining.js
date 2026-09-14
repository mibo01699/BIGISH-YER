async function claimMining() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');
    const btn = document.getElementById('claim-mining-btn');
    btn.disabled = true;
    btn.textContent = 'جارٍ المطالبة...';

    try {
        const res = await fetch('/api/yer/distribution/claim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.uid
            }
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ تم إضافة ' + data.claimed + ' YER إلى محفظتك');
            if (miningInterval) clearInterval(miningInterval);
            miningSessionActive = false;
            await refreshMiningStatus();
            await loadBalance();
            await refreshHistory();
        } else {
            alert('فشل المطالبة: ' + (data.error || 'خطأ غير معروف'));
        }
    } catch (err) {
        alert('خطأ في الاتصال: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '💰 المطالبة بالرصيد';
    }
}