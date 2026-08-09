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
    print(yemen_economy.inject_liquidity_via_batch_transfers(transfer_volume_yer=4500000))
    
    # 3. خطوة إطلاق مجمعات السيولة على Pi DEX وتعميق الاحتياطيات الرقمية لامتصاص التضخم
    print(yemen_economy.update_pi_dex_pool(injected_pi_liquidity=500000))
    
    # 4. خطوة تنفيذ تسوية المقاصة التلقائية لمستحقات نقاط البيع (GAV) لتعزيز الثقة بالعملة الهجينة
    print(yemen_economy.execute_cross_app_clearing(clearing_volume_yer=3000000))
    
    # 5. عرض التقرير النهائي بعد محاكاة التدابير الهيكلية وتكامل الأنظمة
    yemen_economy.print_macroeconomic_status()
