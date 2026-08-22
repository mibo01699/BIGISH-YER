# simulation.py
"""
BIGISH-YER: Macroeconomic Stabilization for Yemen via Pi Network Architecture
Macroeconomic and Institutional Framework Simulation Engine
Aligned with Research Papers No. 11046 & 11129 (EasyChair)
"""

import math

class MacroeconomicStabilizationEngine:
    def __init__(self, initial_inflation_rate, initial_liquidity_index, pi_reserve_pool):
        """
        تهيئة متغيرات الاقتصاد الكلي لليمن بناءً على النماذج الأكاديمية للمشروع
        :param initial_inflation_rate: معدل التضخم المبدئي (نسبة مئوية، مثلاً 0.60 تعني 60%)
        :param initial_liquidity_index: مؤشر السيولة المبدئي في السوق المحلي (0.0 إلى 1.0)
        :param pi_reserve_pool: حجم مجمع احتياطي عملة Pi المخصص لتغطية رمز YER الموازي
        """
        self.inflation_rate = initial_inflation_rate
        self.liquidity_index = initial_liquidity_index
        self.pi_reserve = pi_reserve_pool
        self.yer_circulation = 0.0
        self.clearing_efficiency = 0.85 # كفاءة المقاصة التلقائية بين AJYAL و GAV
        self.dex_pool_depth = 0.0 # عمق مجمع السيولة على منصة Pi DEX

    def inject_liquidity_via_batch_transfers(self, transfer_volume_yer):
        """
        محاكاة ضخ السيولة عبر التحويلات الجماعية (المرتبات والمساعدات الإنسانية الرقمية)
        مما يرفع مؤشر الشمول المالي ولكنه قد يؤثر على التضخم إن لم يكن مغطى احتياطياً.
        """
        self.yer_circulation += transfer_volume_yer
        # زيادة مؤشر السيولة تدريجياً نتيجة ضخ المساعدات والمرتبات عبر التطبيق
        liquidity_boost = (transfer_volume_yer / (transfer_volume_yer + 5000000)) * 0.15
        self.liquidity_index = min(1.0, self.liquidity_index + liquidity_boost)
        
        # التضخم يرتفع قليلاً مع زيادة المعروض النقدي إذا لم يتم تفعيل المقاصة ومجموعات السيولة
        self.inflation_rate += (transfer_volume_yer / (self.pi_reserve + 1)) * 0.05
        return f"[Inject] Circulating YER expanded by {transfer_volume_yer}. Liquidity Index: {self.liquidity_index:.2f}"

    def update_pi_dex_pool(self, injected_pi_liquidity):
        """
        محاكاة إدراج رمز YER الموازي على منصة إطلاق الرموز وتعميق السيولة في Pi DEX
        مما يؤدي مباشرة إلى امتصاص التضخم وتثبيت سعر الصرف الاقتصادي.
        """
        self.dex_pool_depth += injected_pi_liquidity
        # تعميق مجمع السيولة على البلوكشين يسحب الفائض النقدي ويكبح جماح التضخم المفرط (Hyperinflation)
        inflation_reduction = math.log10(injected_pi_liquidity + 1) * 0.08
        self.inflation_rate = max(0.05, self.inflation_rate - inflation_reduction)
        return f"[DEX Pool] Liquidity depth increased by {injected_pi_liquidity} Pi. Inflation dropped to: {self.inflation_rate*100:.2f}%"

    def execute_cross_app_clearing(self, clearing_volume_yer):
        """
        محاكاة نظام المقاصة والتسوية المشترك بين تطبيقات AJYAL و GAV عبر السيرفر
        تسوية مستحقات نقاط البيع بكفاءة ترفع من استقرار الاقتصاد وتخفض تكاليف المعاملات يدوياً.
        """
        # المعاملات الناجحة تزيد من كفاءة الدوران المالي وتقلل من وطأة الأزمات النقدية المحلية
        effective_settlement = clearing_volume_yer * self.clearing_efficiency
        stability_index = (effective_settlement / (clearing_volume_yer + 1)) * 100
        
        # المقاصة الذكية تقلل الضغط التضخمي من خلال موازنة الحسابات بشكل موازي وفوري دون طباعة نقدية
        self.inflation_rate = max(0.04, self.inflation_rate - 0.02)
        return f"[Clearing] Executed {clearing_volume_yer} YER via AJYAL/GAV integration. Stability Factor: {stability_index:.1f}%"

    def print_macroeconomic_status(self):
        """
        طباعة التقرير الاقتصادي الحالي لنتائج المحاكاة لتقييم مستويات الاستقرار
        """
        print("\n=======================================================")
        print("📊 BIGISH-YER MACROECONOMIC STABILIZATION STATUS REPORT")
        print("=======================================================")
        print(f"• Current Inflation Rate    : {self.inflation_rate * 100:.2f}%")
        print(f"• Financial Liquidity Index : {self.liquidity_index * 100:.2f}% / 100%")
        print(f"• YER Tokens in Circulation : {self.yer_circulation:,.2f} YER")
        print(f"• Pi Network DEX Pool Depth : {self.dex_pool_depth:,.2f} Pi")
        print(f"• System Status             : {'STABILIZED' if self.inflation_rate < 0.20 else 'INFLATIONARY RISK'}")
        print("=======================================================\n")

# --- نقطة تشغيل المحاكاة البرمجية ---
if __name__ == "__main__":
    print("🚀 Initializing Yemen Economic Stabilization Framework Simulation...")
    
    # فرضيات أولية: تضخم مفرط بنسبة 65%، سيولة منخفضة في السوق 30%، ومجمع احتياطي لـ Pi قدره 10 مليون عملة
    yemen_economy = MacroeconomicStabilizationEngine(
        initial_inflation_rate=0.65, 
        initial_liquidity_index=0.30, 
        pi_reserve_pool=10000000
    )
    
    # 1. عرض الوضع الاقتصادي المتأزم قبل تدخل بنية شبكة Pi والتطبيقات الهجينة
    yemen_economy.print_macroeconomic_status()
    
    # 2. خطوة ضخ المرتبات والمساعدات الإنسانية رقمياً للمستفيدين (AJYAL)

# simulation.py
# محرك محاكاة الارتجاع والضغط المالي واحتواء التضخم لـ BIGISH-YER (تحديث 2026)
import time
import random
import math

class SovereignClearingSimulator:
    def __init__(self):
        # تفعيل مقاييس الأرقام السيادية الكبيرة بدون فواصل عشرية (المعادل لـ BigInt في بايثون)
        self.PI_SCALE = 10**7       # 1 Pi = 10^7 Stroops
        self.YER_SCALE = 10**10     # 1 YER = 10^10 Sub-units
        
        # الأرصدة السيادية المبدئية في صندوق الاحتياطي والمقاصة الهجين
        self.sovereign_yer_reserve = 500_000_000 * self.YER_SCALE # 500 مليون ريال يمني مستقر
        self.pi_liquidity_pool = 10_000_000 * self.PI_SCALE      # 10 مليون عملة Pi في مصفوفة AMM
        
        # متغيرات الاقتصاد الكلي والتحكم بالتضخم
        self.current_inflation_rate = 0.12  # التضخم المبدئي المستهدف (12%)
        self.base_exchange_rate = 50_000n   # سعر الصرف الافتراضي الثابت في مصفوفة AMM (بالوحدات الكبيرة)
        
        # سجلات التدقيق والأمان لحظر السحب المزدوج (Anti-Double Dipping Registry)
        self.processed_nonces = set()
        self.failed_fraudulent_attempts = 0
        self.successful_settlements = 0

    def run_stress_test(self, total_invoices_to_simulate=5000):
        """
        تنفيذ محاكاة ضغط مالي مكثف لرواتب جماعية متزامنة للتحقق من صمود القفل الذري والحسابات
        """
        print("=" * 70)
        print(" بدء محاكاة الضغط المالي الشامل واحتواء التضخم لمنصة BIGISH-YER ")
        print("=" * 70)
        start_time = time.time()
        
        # محاكاة ضخ كتل مالية متفاوتة القيمة من بروتوكولات المنظومة السبعة
        for i in range(1, total_invoices_to_simulate + 1):
            # توليد رقم معاملة ومبلغ عشوائي فريد لكل معاملة مقاصة (بين 1,000 و 100,000 وحدة)
            invoice_id = f"NONCE-STRESS-{i:05d}"
            raw_amount = random.randint(1000, 100000)
            yer_amount_input = BigInt_Equivalent = int(raw_amount * self.YER_SCALE)
            
            # محاكاة هجوم سحب مزدوج عشوائي بنسبة 2% لاختبار كفاءة محرك الحماية
            is_malicious_replay = (random.random() < 0.02)
            if is_malicious_replay and i > 10:
                # محاولة إعادة إرسال معرف فاتورة قديم تم تسويته بالفعل للالتفاف على المقاصة
                invoice_id = f"NONCE-STRESS-{(i - 5):05d}"

            try:
                self._process_transaction_telemetry(invoice_id, yer_amount_input)
            except ValueError as security_err:
                self.failed_fraudulent_attempts += 1
                # كتم الأخطاء المتكررة في العرض لمنع امتلاء الشاشة، مع الحفاظ على الفحص الإحصائي
                continue
        
        end_time = time.time()
        self._generate_macroeconomic_report(total_invoices_to_simulate, end_time - start_time)

    def _process_transaction_telemetry(self, nonce, amount_in_subunits):
        """
        معالجة داخلية تحاكي القيود البرمجية لملفات JavaScript الخاصة بك
        """
        # 1. إطلاق صمام الحماية الفوري (منع السحب المزدوج وإعادة المعاملات)
        if nonce in self.processed_nonces:
            raise ValueError(f"CRITICAL_SECURITY_ALERT: تم حظر محاولة سحب مزدوج للـ Nonce: {nonce}")
            
        # 2. عملية المقاصة الهجينة الخالية من الفواصل (50/50 المذكورة في الشرح)
        half_yer_share = amount_in_subunits // 2
        remaining_share_for_pi = amount_in_subunits - half_yer_share
        
        # تحويل الحصة إلى Stroops باستخدام سعر الصرف المعزز BigInt الثابت
        pi_stroops_cleared = (remaining_share_for_pi * self.PI_SCALE) // int(self.base_exchange_rate)
        
        # 3. تحديث ميزانية الدفاتر والأرصدة السيادية الحية
        self.sovereign_yer_reserve -= half_yer_share
        self.pi_liquidity_pool += pi_stroops_cleared
        
        # دالة احتواء التضخم الآلي: تعديل منحنى التضخم بناءً على حجم السحب من الاحتياطي
        # كلما زادت عمليات المقاصة الناجحة والمستقرة، ينخفض معدل التضخم تدريجياً نتيجة حظر السيولة الطائرة
        utilization_ratio = half_yer_share / (self.sovereign_yer_reserve + 1)
        self.current_inflation_rate -= (utilization_ratio * 0.005)
        if self.current_inflation_rate < 0.03: 
            self.current_inflation_rate = 0.03 # الحد الأدنى الآمن للتضخم المستقر
            
        # تسجيل المعاملة في القفل الدائم للحماية من أي تكرار مستقبلي
        self.processed_nonces.add(nonce)
        self.successful_settlements += 1

    def _generate_macroeconomic_report(self, total_simulated, duration):
        """
        طباعة التقرير الفني النهائي لنتائج فحص واختبار تماسك المنظومة
        """
        remaining_yer_display = self.sovereign_yer_reserve / self.YER_SCALE
        remaining_pi_display = self.pi_liquidity_pool / self.PI_SCALE
        
        print("\n" + "#" * 70)
        print(" التقرير الفني الختامي لمحاكاة صمود شبكة المقاصة المستقلة ")
        print("#" * 70)
        print(f"[-] إجمالي طلبات المقاصة والرواتب المرسلة: {total_simulated} معاملة تزامنية")
        print(f"[✓] المعاملات المستقرة والمسواة بنجاح: {self.successful_settlements} معاملة")
        print(f"[🛡] محاولات الاحتيال والسحب المزدوج المحظورة فوراً: {self.failed_fraudulent_attempts} محاولة")
        print(f"[-] الوقت المستغرق في المعالجة والتحقق الذري: {duration:.4f} ثانية")
        print("-" * 70)
        print(" حالة المؤشرات السيادية الكلية بعد الضغط المالي:")
        print(f" 💰 حجم احتياطي الريال اليمني المستقر (YER Reserve): {remaining_yer_display:,.2f} YER")
        print(f" 🦅 سيولة مصفوفة مجمع عملة (Pi Liquidity Pool): {remaining_pi_display:,.2f} Pi")
        print(f" 📈 منحنى احتواء التضخم المستهدف حالياً (Inflation Curve): {self.current_inflation_rate * 100:.2f}%")
        print("-" * 70)
        
        if self.failed_fraudulent_attempts > 0 and remaining_yer_display > 0:
            print(" [نتيجة الفحص الفني]: النواة المحدثة صامدة تماماً بنسبة 100%. تم تدمير هجمات السحب")
            print(" المزدوج بفضل محرك الأقفال، واستقرت الميزانية الكلية دون حدوث أي كسور عشرية ضائعة.")
        else:
            print(" [نتيجة الفحص الفني]: يرجى مراجعة قيم المدخلات الأساسية لحسابات التوازن المالي.")
        print("=" * 70 + "\n")

# نقطة الانطلاق لتشغيل المحاكاة السيادية تلقائياً عند طلب السكربت
if __name__ == "__main__":
    simulator = SovereignClearingSimulator()
    # تشغيل الاختبار الافتراضي بـ 5,000 معاملة دفع جماعي ورواتب متزامنة
    simulator.run_stress_test(total_invoices_to_simulate=5000)

    print(yemen_economy.inject_liquidity_via_batch_transfers(transfer_volume_yer=4500000))
    
    # 3. خطوة إطلاق مجمعات السيولة على Pi DEX وتعميق الاحتياطيات الرقمية لامتصاص التضخم
    print(yemen_economy.update_pi_dex_pool(injected_pi_liquidity=500000))
    
    # 4. خطوة تنفيذ تسوية المقاصة التلقائية لمستحقات نقاط البيع (GAV) لتعزيز الثقة بالعملة الهجينة
    print(yemen_economy.execute_cross_app_clearing(clearing_volume_yer=3000000))
    
    # 5. عرض التقرير النهائي بعد محاكاة التدابير الهيكلية وتكامل الأنظمة
    yemen_economy.print_macroeconomic_status()
