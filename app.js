/**
 * BIGISH-YER: Macroeconomic Clearing & Hybrid Gateway Engine
 * Architecture Target: Protocol 26 Compatible
 * Compliance: A.E.C. Canonical Specification v1.0.0 (300M Fixed Supply)
 */

// A. توحيد المعروض المالي الصارم عند 300 مليون (Constraint A) - استيراد المصدر المركزي
const YER_TOKENOMICS = require('./YERTokenomicsCanonical');
const YER_MAX_SUPPLY = YER_TOKENOMICS.maximumSupply; // 300M
const YER_DECIMALS = BigInt(YER_TOKENOMICS.precision);
const YER_SCALE = 10n ** YER_DECIMALS; // 10^10

const PI_DECIMALS = 7n;
const PI_SCALE = 10n ** PI_DECIMALS; // 10^7

// C. تحويل المفهوم إلى هجين (Hybrid Middleware) وتثبيت الحالة الأولية برمجياً
// قاعدة صارمة: لا يتم تعيين المعروض الحالي على 300M أبداً، بل يبدأ من 0 ويُسك تدريجياً
let state = {
    maximumSupply: YER_MAX_SUPPLY,
    mintedSupply: 0n,          // يبدأ من صفر
    circulatingSupply: 0n,     // يبدأ من صفر
    allocatedSupply: 0n,       // يتم تخصيصه لاحقاً من سجلات الكانونيكال
    releasedSupply: 0n,        // يبدأ من صفر
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
// تمت إضافة الحماية الصارمة: لا يمكن إضافة معروض جديد يتجاوز 300M
function clearTransaction(amountString, assetType) {
    const scale = assetType === 'YER' ? YER_SCALE : PI_SCALE;
    
    // التنفيذ باستخدام الـ Strict Fixed-Point
    const parsedAmountUnits = parseToFixedPoint(amountString, scale);
    
    // منع أي سك يتجاوز الحد الأقصى (Hard Cap Enforcement)
    if (assetType === 'YER' && (state.mintedSupply + parsedAmountUnits > state.maximumSupply)) {
        throw new Error("SUPPLY_CAP_ERROR: Cannot mint more than 300M YER Maximum Supply.");
    }

    // تحديث الحالة الفعلية (المصروف / المتداول)
    if (assetType === 'YER') {
        state.mintedSupply += parsedAmountUnits;
        state.circulatingSupply += parsedAmountUnits;
    }

    return {
        status: "Cleared_Success",
        engine: state.ledgerType,
        clearedUnits: parsedAmountUnits.toString(),
        currentMintedYer: state.mintedSupply.toString(), // لتوضيح أن المعروض الحالي يتزايد
        notice: "Transaction processed via middleware. Awaiting official Pi Network Mainnet on-chain settlement."
    };
}

module.exports = {
    YER_MAX_SUPPLY,
    parseToFixedPoint,
    clearTransaction,
    state
};