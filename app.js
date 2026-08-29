/**
 * BIGISH-YER: Macroeconomic Clearing & Hybrid Gateway Engine
 * Architecture Target: Protocol 26 Compatible
 * Compliance: A.E.C. Canonical Specification v1.0.0 (300M Fixed Supply)
 */

// A. توحيد المعروض المالي الصارم عند 300 مليون (Constraint A)
const YER_MAX_SUPPLY = 300000000n; // 300 Million Fixed Max Supply
const YER_DECIMALS = 10n;
const YER_SCALE = 10n ** YER_DECIMALS; // 10^10

const PI_DECIMALS = 7n;
const PI_SCALE = 10n ** PI_DECIMALS;  // 10^7

// C. تحويل المفهوم إلى هجين (Hybrid Middleware) وتثبيت الحالة الأولية برمجياً
let state = {
    currentTotalSupply: 300000000n * YER_SCALE, // المعروض الكلي الموحد بالوحدات الصغيرة (Micro-units)
    minedBySovereignFund: 20000000n * YER_SCALE, // الحصة المخصصة للصندوق السيادي
    ledgerType: "Hybrid Clearing Middleware (On-Chain Settlement Pending)"
};

/**
 * B. الحل الجذري لمنع الـ Floating Point نهائياً (Constraint B)
 * يستقبل النص الرقمي المالي مباشرة ويحوله إلى BigInt دون أي وسيط عائم
 */
function parseToFixedPoint(amountStr, scale) {
    if (!amountStr || typeof amountStr !== 'string') {
        throw new Error("Invalid input: Amount must be a precise string to prevent floating-point corruption.");
    }
    
    const parts = amountStr.trim().split('.');
    let whole = parts[0] || "0";
    let fraction = parts[1] || "";
    
    const expectedDecimals = Number(scale === YER_SCALE ? YER_DECIMALS : PI_DECIMALS);
    fraction = fraction.substring(0, expectedDecimals).padEnd(expectedDecimals, '0');
    
    return BigInt(whole + fraction);
}

// واجهة تحويل المقاصة الهجينة (Clearing API Endpoint)
function clearTransaction(amountString, assetType) {
    const scale = assetType === 'YER' ? YER_SCALE : PI_SCALE;
    
    // التنفيذ باستخدام الـ Strict Fixed-Point
    const parsedAmountUnits = parseToFixedPoint(amountString, scale);
    
    return {
        status: "Cleared_Success",
        engine: state.ledgerType,
        clearedUnits: parsedAmountUnits.toString(),
        notice: "Transaction processed via middleware. Awaiting official Pi Network Mainnet on-chain settlement."
    };
}

module.exports = {
    YER_MAX_SUPPLY,
    parseToFixedPoint,
    clearTransaction,
    state
};

