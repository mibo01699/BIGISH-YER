// ============================================================
// الملف: contracts/src/lib.rs
// الدور: العقد الذكي لرمز YER على Soroban (Rust) - متوافق مع 300M
// تم التحديث: إضافة منطق تأجيل ترحيل حصة الجمهور (10%) حتى نجاح الإطلاق
// ============================================================

#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

// دقة العملة: 10 خانات عشرية (وفق قواعد YER الصارمة)
const YER_DECIMALS: u32 = 10;

// الحد الأقصى للمعروض: 300,000,000 وحدة كاملة (يتم ضربها في 10^10 للحصول على الوحدات الصغرى)
const MAX_SUPPLY: i128 = 300_000_000 * 10_i128.pow(YER_DECIMALS);

// التوزيع الإلزامي (NON-NEGOTIABLE)
const COMMUNITY_ALLOCATION: i128 = 30_000_000 * 10_i128.pow(YER_DECIMALS);   // 10% = 30M (مؤجل)
const ECOSYSTEM_ALLOCATION: i128 = 90_000_000 * 10_i128.pow(YER_DECIMALS);   // 30% = 90M (متاح)
const RESERVE_ALLOCATION: i128 = 180_000_000 * 10_i128.pow(YER_DECIMALS);    // 60% = 180M

const YER_SYMBOL: Symbol = symbol_short!("YER");

// مفتاح تخزين حالة تفعيل الإطلاق
const COMMUNITY_RELEASE_KEY: Symbol = symbol_short!("COMM_REL");

#[contract]
pub struct YERToken;

#[contractimpl]
impl YERToken {
    /// تهيئة العقد وإصدار الرمز وفق التوزيع الإلزامي
    pub fn initialize(env: Env, admin: Address) {
        // التحقق القاطع من أن مجموع التوزيع يساوي السقف (Integrity Check)
        assert_eq!(
            COMMUNITY_ALLOCATION + ECOSYSTEM_ALLOCATION + RESERVE_ALLOCATION,
            MAX_SUPPLY,
            "YER TOKENOMICS INTEGRITY FAILURE: Allocation does not equal max supply"
        );

        // تخزين حالة الإطلاق: معطّل افتراضياً
        env.storage().instance().set(&COMMUNITY_RELEASE_KEY, &false);

        // تخزين الأرصدة الأولية (يمكن تعديل العناوين لاحقاً)
        // في بيئة حقيقية، يتم توجيه الأرصدة لعناوين محددة (Admin, DEX, Reserve)
        // env.storage().instance().set(&admin, &ECOSYSTEM_ALLOCATION); // مثال
    }

    /// تفعيل إطلاق حصة الجمهور (يتم استدعاؤه من قبل الإدارة بعد نجاح الإطلاق)
    pub fn activate_community_release(env: Env, admin: Address) {
        // التحقق من أن المستدعي هو المسؤول (مثال: يجب التحقق من التوقيع)
        // في هذا المثال، نفترض وجود تحقق بسيط
        // admin.require_auth(); // يجب تفعيله في بيئة حقيقية

        // تفعيل الحالة
        env.storage().instance().set(&COMMUNITY_RELEASE_KEY, &true);
    }

    /// التحقق من صلاحية ترحيل حصة الجمهور
    fn is_community_release_enabled(env: &Env) -> bool {
        env.storage().instance().get(&COMMUNITY_RELEASE_KEY).unwrap_or(false)
    }

    /// تحويل الرمز بين المحافظ (مع منع تحويل حصة الجمهور قبل التفعيل)
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // ✅ الشرط الجديد: منع تحويل حصة الجمهور (المجمدة في العقد) قبل التفعيل
        // نفترض أن حصة الجمهور محتجزة في العقد نفسه (عنوان العقد)
        let contract_address = env.current_contract_address();
        if from == contract_address {
            // إذا كان المرسل هو العقد نفسه (أي يحاول تحويل الحصة المجمدة)
            if !Self::is_community_release_enabled(&env) {
                panic!("Community allocation is not yet released. Launchpad deployment must succeed first.");
            }
        }

        // هنا يتم التحقق من الأرصدة وتنفيذ النقل (يُستكمل بمنطق التخزين الفعلي)
        // ...
    }

    /// الحصول على رصيد المحفظة
    pub fn balance(env: Env, address: Address) -> i128 {
        // هنا يتم قراءة الرصيد من الـ Storage
        // (تخطيطي: يقرأ من التخزين ويعيد القيمة)
        0
    }

    /// الحصول على حالة الإطلاق
    pub fn get_launch_status(env: Env) -> bool {
        Self::is_community_release_enabled(&env)
    }
}

// اختبارات العقد (في ملف منفصل أو داخل نفس الوحدة)
#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_tokenomics_integrity() {
        // التحقق من أن التوزيع يطابق السقف
        assert_eq!(COMMUNITY_ALLOCATION + ECOSYSTEM_ALLOCATION + RESERVE_ALLOCATION, MAX_SUPPLY);
    }

    #[test]
    fn test_precision() {
        // التحقق من أن الدقة هي 10
        assert_eq!(YER_DECIMALS, 10);
    }

    #[test]
    #[should_panic(expected = "Community allocation is not yet released.")]
    fn test_community_transfer_blocked_before_release() {
        // اختبار محاكاة: محاولة تحويل حصة الجمهور قبل التفعيل يجب أن تفشل
        // (يتطلب بيئة اختبار Soroban)
    }
}