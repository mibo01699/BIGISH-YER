// ============================================
// BIGISH-YER Wallet — Navigation & Mining
// ============================================

// ============================================
// دالة التنقل بين الصفحات (مهمة جداً)
// ============================================
function showPage(pageName) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // تحديث حالة أزرار التنقل
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });

    // تحميل البيانات الخاصة بالصفحة
    if (pageName === 'history' && typeof refreshHistory === 'function') refreshHistory();
    if (pageName === 'qr' && typeof loadQR === 'function') loadQR();
    if (pageName === 'mining' && typeof refreshMiningStatus === 'function') refreshMiningStatus();

    // تمرير لأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// نظام توزيع YER (Mining/Distribution)
// ============================================

let miningSessionActive = false;
let miningInterval = null;

/**
 * جلب حالة التوزيع الحالية
 */
async function refreshMiningStatus() {
    if (!currentUser) return;

    try {
        const res = await fetch('/api/yer/distribution/status', {
            headers: { 'x-user-id': currentUser.uid }
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('mining-rate').textContent =
                data.currentRatePerHour + ' YER/ساعة';
            document.getElementById('unclaimed-balance').textContent =
                parseFloat(data.unclaimedBalance || 0).toFixed(4) + ' YER';
            document.getElementById('session-status').textContent =
                data.isDistributionActive
                    ? `نشطة (${data.hoursRemaining} ساعة متبقية)`
                    : 'غير نشطة';

            miningSessionActive = data.isDistributionActive;

            // تحديث الأزرار
            const startBtn = document.getElementById('start-mining-btn');
            const claimBtn = document.getElementById('claim-mining-btn');

            if (miningSessionActive) {
                startBtn.style.display = 'none';
                claimBtn.style.display = 'block';
            } else {
                startBtn.style.display = 'block';
                claimBtn.style.display = 'none';
            }
        }
    } catch (err) {
        console.error("Mining status error:", err);
    }
}

/**
 * بدء جلسة توزيع 24 ساعة
 */
async function startMining() {
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً');

    const btn = document.getElementById('start-mining-btn');
    btn.disabled = true;
    btn.textContent = 'جارٍ البدء...';

    try {
        const res = await fetch('/api/yer/distribution/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.uid
            }
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ بدأت جلسة التوزيع!');
            miningSessionActive = true;

            // بدء العد التنازلي
            if (miningInterval) clearInterval(miningInterval);
            miningInterval = setInterval(refreshMiningStatus, 60000); // كل دقيقة

            refreshMiningStatus();
        } else {
            alert('فشل البدء: ' + (data.error || 'خطأ غير معروف'));
        }
    } catch (err) {
        alert('خطأ في الاتصال: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '▶️ بدء جلسة توزيع (24 ساعة)';
    }
}

/**
 * المطالبة بالرصيد المتراكم
 */
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
            refreshMiningStatus();
            if (typeof loadBalance === 'function') loadBalance();
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