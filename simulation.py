#!/usr/bin/env python3
"""
Arabian Eagle Ecosystem (A.E.C) - Macroeconomic & Tokenomics Simulation Engine
Validates the Distribution and Liquidity Stability on Sandbox DEX.
NOTE: Sandbox/Testnet simulation only. No claims of Pi Network or UNICEF alignment.
"""

import time

class AecMacroeconomicSimulation:
    def __init__(self):
        # --- المقاييس الصارمة لخريطة التوزيع المعتمدة (Tokenomics Constants) ---
        self.MAX_GLOBAL_SUPPLY = 300_000_000
        self.CAP_COMMUNITY = 30_000_000      # 10% للمنفعة المجتمعية
        self.CAP_ECOSYSTEM = 90_000_000      # 30% للإدراج والسيولة
        self.CAP_SOVEREIGN = 180_000_000     # 60% للصندوق السيادي

        # عدادات العمليات الحية داخل السلسلة (أعداد صحيحة)
        self.current_total_supply = 0
        self.community_distributed = 0
        self.ecosystem_allocated = 0
        self.sovereign_allocated = 0
        
        # مقاييس مجمع السيولة المبدئية داخل Sandbox DEX (Pi / YER Pool)
        self.pool_pi_reserve = 1_000_000       # سيولة البداية بـ Pi
        self.pool_yer_reserve = 20_000_000     # سيولة البداية بـ YER

    def get_dex_amm_price(self):
        """ حساب السعر الحركي العادل بناءً على خوارزمية المنتج الثابت (X * Y = K) """
        if self.pool_pi_reserve == 0:
            return 0
        # استخدام قسمة صحيحة للحصول على سعر تقريبي (وحدة YER لكل Pi)
        return self.pool_yer_reserve // self.pool_pi_reserve

    def run_phase_1_simulation(self):
        """ المرحلة 1: توزيع المنفعة المجتمعية (10%) """
        print("\n🏁 [المرحلة 1] توزيع المنفعة المجتمعية (10%)...")
        simulated_mint = 15_250_000
        if self.community_distributed + simulated_mint <= self.CAP_COMMUNITY:
            self.community_distributed += simulated_mint
            self.current_total_supply += simulated_mint
            
        print(f"✅ تم توزيع مكافآت المجتمع: {self.community_distributed:,} YER")
        print(f"📊 السقف المتبقي: {(self.CAP_COMMUNITY - self.community_distributed):,} YER")

    def run_phase_2_simulation(self):
        """ المرحلة 2: تخصيص السيولة البيئية (30%) """
        print("\n🚀 [المرحلة 2] تفعيل تخصيص السيولة البيئية (30%)...")
        self.ecosystem_allocated = self.CAP_ECOSYSTEM
        self.current_total_supply += self.ecosystem_allocated
        
        # حقن جزء من السيولة لدعم عمق مجمع السيولة
        self.pool_yer_reserve += 80_000_000
        
        print(f"✅ تم تخصيص سيولة النظام البيئي: {self.ecosystem_allocated:,} YER")
        print(f"📈 السعر الحركي الحالي في مجمع DEX: 1 Pi = {self.get_dex_amm_price():,} YER")

    def run_phase_3_simulation(self):
        """ المرحلة 3: تخصيص احتياطي الصندوق السيادي (60%) """
        print("\n🏛️ [المرحلة 3] تفعيل تخصيص احتياطي الصندوق السيادي (60%)...")
        simulated_block = 45_000_000
        if self.sovereign_allocated + simulated_block <= self.CAP_SOVEREIGN:
            self.sovereign_allocated += simulated_block
            self.current_total_supply += simulated_block
            
        print(f"✅ تم تخصيص رأس مال الصندوق: {self.sovereign_allocated:,} YER")
        print(f"🔒 المتبقي للصندوق: {(self.CAP_SOVEREIGN - self.sovereign_allocated):,} YER")

    def display_final_telemetry_report(self):
        """ تصيير وإخراج التقرير القياسي الشامل لسلامة واقتصاديات المنظومة """
        print("\n" + "="*65)
        print("📊 التقرير الختامي لمحاكاة القياس الاقتصادي الكلي (A.E.C)")
        print("="*65)
        print(f"▪️ المعروض الإجمالي الحالي          : {self.current_total_supply:,} / {self.MAX_GLOBAL_SUPPLY:,} YER")
        print(f"▪️ النسبة المئوية المكتملة           : {self.current_total_supply / self.MAX_GLOBAL_SUPPLY * 100:.2f}%")
        print(f"▪️ السعر النهائي في مجمع DEX         : 1 Pi = {self.get_dex_amm_price():,} YER")
        
        # مؤشر استقرار التضخم
        if self.current_total_supply <= self.MAX_GLOBAL_SUPPLY:
            inflation_risk = "آمن ومستقر (🟢 LOW RISK)"
        else:
            inflation_risk = "خطر تضخم (🔴 HIGH RISK)"
        print(f"▪️ مؤشر أمان التضخم وحماية المساعدات : {inflation_risk}")
        print("="*65 + "\n")

if __name__ == "__main__":
    simulator = AecMacroeconomicSimulation()
    simulator.run_phase_1_simulation()
    time.sleep(0.5)
    simulator.run_phase_2_simulation()
    time.sleep(0.5)
    simulator.run_phase_3_simulation()
    time.sleep(0.5)
    simulator.display_final_telemetry_report()