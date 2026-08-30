// tests/stressTest.js
/**
 * BIGISH-YER: High-Throughput Performance & Stress Testing Suite
 * NOTE: Sandbox/Testnet validation only. No claims of Pi Network or official guidelines.
 * Simulates 10,000 concurrent clearing operations using BigInt-safe random amounts.
 */

const { performance } = require('perf_hooks'); // لتوقيت دقيق

// إعداد معايير الفحص والضغط النقدي
const TOTAL_CONCURRENT_REQUESTS = 10000;
const TARGET_API_URL = process.env.TEST_API_URL || 'http://localhost:5000/api/yer/transfer';

// محاكاة حمولة بيانات المقاصة والتسوية لرمز YER (توليد أرقام صحيحة آمنة)
function generateMockClearingPayload(index) {
    // توليد مبلغ عشوائي آمن كـ BigInt (من 100 إلى 5100، بدون كسور)
    const randomBase = Math.floor(Math.random() * 5000) + 100; // نستخدم Math.floor هنا، لكن الناتج عدد صحيح
    const amountYer = randomBase.toString(); // تحويل إلى نص لضمان BigInt

    return {
        piPaymentId: `pay_stress_test_hash_${index}_${Date.now()}`,
        senderYerWallet: `YER_AJYAL_STRESS_SRC_${index}`,
        receiverPosWallet: `YER_GAV_STRESS_POS_${index}`,
        amountYer: amountYer, // نص
        memo: "Automated high-throughput macroeconomic stabilization benchmark"
    };
}

async function executeEcosystemStressTest() {
    console.log(`\n🚀 Initializing BIGISH-YER Infrastructure Stress Test...`);
    console.log(`📊 Target Load: Sending ${TOTAL_CONCURRENT_REQUESTS.toLocaleString()} concurrent clearance transactions to ${TARGET_API_URL}\n`);

    const startTime = performance.now();
    let successfulTransactions = 0;
    let failedTransactions = 0;

    // توليد مصفوفة من الوعود (Promises) لضمان الإطلاق المتزامن
    const requestPool = Array.from({ length: TOTAL_CONCURRENT_REQUESTS }, async (_, index) => {
        const payload = generateMockClearingPayload(index);
        
        try {
            // استخدام fetch (المدمج في Node.js 18) بدلاً من axios
            const response = await fetch(TARGET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(5000) // مهلة 5 ثوانٍ
            });
            
            const data = await response.json();
            if (response.status === 200 && data.success) {
                successfulTransactions++;
            } else {
                failedTransactions++;
            }
        } catch (error) {
            failedTransactions++;
        }
    });

    // إطلاق العمليات دفعة واحدة والانتظار
    await Promise.all(requestPool);

    const endTime = performance.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const transactionsPerSecond = TOTAL_CONCURRENT_REQUESTS / durationInSeconds;

    // طباعة تقرير الكفاءة والسرعة النهائي
    console.log("=======================================================");
    console.log("🏁 STRESS TEST EXECUTION COMPLETE - BENCHMARK REPORT");
    console.log("=======================================================");
    console.log(`• Total Requests Processed   : ${TOTAL_CONCURRENT_REQUESTS.toLocaleString()}`);
    console.log(`• Successful Clearances (OK) : ${successfulTransactions.toLocaleString()}`);
    console.log(`• Failed / Timed Out (ERR)   : ${failedTransactions.toLocaleString()}`);
    console.log(`• Total Execution Duration   : ${durationInSeconds.toFixed(2)} seconds`);
    console.log(`• System Throughput (TPS)    : ${transactionsPerSecond.toFixed(1)} Transactions/Sec`);
    console.log(`• Infrastructure Status      : ${failedTransactions === 0 ? '🏆 OPTIMAL CAPACITY' : '⚠️ SCALING OPTIMIZATION REQUIRED'}`);
    console.log("=======================================================\n");
}

// نقطة الإطلاق التلقائي عند تشغيل الملف مباشرة
if (require.main === module) {
    executeEcosystemStressTest().catch(err => console.error("Stress Test Crashed:", err));
}