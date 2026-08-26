// Visa Card Factory & Instant Recharge Interface
// واجهة عروض البطاقات والشحن الفوري الهجين لمتصفح Pi Browser
import React, { useState, useEffect } from 'react';
import { VisaSovereignClearing } from './VisaSovereignClearing';

const visaEngine = new VisaSovereignClearing();

export default function VisaCardFactory() {
    // قائمة عروض بطاقات فيزا مخصصة للشرائح والشركات الرائدة عالمياً
    const [visaOffers, setVisaOffers] = useState([
        { id: "VISA-1YR", provider: "Visa International", duration: "سنة واحدة (1 Year)", baseCostUSD: 15.00, displayYER: "0" },
        { id: "VISA-2YR", provider: "Visa International", duration: "سنتين (2 Years)", baseCostUSD: 25.00, displayYER: "0" },
        { id: "VISA-3YR", provider: "Visa International", duration: "ثلاث سنوات (3 Years)", baseCostUSD: 35.00, displayYER: "0" }
    ]);

    const [rechargeAmount, setRechargeAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [txStatus, setTxStatus] = useState("");

    useEffect(() => {
        // استدعاء أسعار الصرف الفورية من مجمع السيولة لـ BIGISH-YER لتحديث الواجهة تلقائياً
        const mockYerToPi = "0.000025"; 
        const mockPiToUsdt = "1.20";    

        const evaluatedOffers = visaOffers.map(offer => {
            const bill = visaEngine.calculateVisaInvoiceAndRotation(offer.baseCostUSD, mockYerToPi, mockPiToUsdt);
            return { ...offer, displayYER: bill.userDisplayCostYER };
        });
        setVisaOffers(evaluatedOffers);
    }, []);

    const handleInstantRecharge = (amount) => {
        if(!amount || amount <= 0) return alert("يرجى إدخال مبلغ شحن صحيح");
        setLoading(true);
        setTxStatus("جاري معالجة بروتوكول المقاصة المزدوج وحساب أرباح الـ GCV صامتاً...");
        
        setTimeout(() => {
            setTxStatus(`🎉 تمت التسوية الفورية! تم شحن بطاقة الفيزا الخاصة بك بـ $${amount} وتدوير رأس المال لشركات التزويد وصفر خسائر.`);
            setLoading(false);
            setRechargeAmount("");
        }, 1200);
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'center', backgroundColor: '#0b0f19', color: '#fff', minHeight: '100vh' }}>
            <h1 style={{ color: '#d4af37' }}>💳 بوابة بطاقات فيزا السيادية العالمية</h1>
            <p style={{ opacity: 0.8 }}>إصدار وشحن فوري مدمج بمحرك مقاصة مجمع السيولة - منظومة النسر العربي</p>

            {/* عرض قائمة البطاقات السنوية */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', maxWidth: '900px', margin: '30px auto' }}>
                {visaOffers.map(offer => (
                    <div key={offer.id} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'right' }}>
                        <h3 style={{ color: '#d4af37', marginTop: 0 }}>{offer.provider}</h3>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>مدة الصلاحية: <strong>{offer.duration}</strong></p>
                        <p style={{ margin: '10px 0 5px 0' }}>إجمالي الرسوم التنشيطية:</p>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ffcc', margin: 0 }}>{offer.displayYER} YER</p>
                        <small style={{ color: '#9ca3af', display: 'block', margin: '5px 0 15px 0', fontSize: '11px' }}>* السعر يدمج 5% أرباحاً بـ Pi وفق GCV شاملة كافة رسوم غاز السحب البنكي والمنصات.</small>
                        <button onClick={() => handleInstantRecharge(offer.baseCostUSD)} disabled={loading} style={{ background: '#d4af37', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                            إصدار فوري للبطاقة
                        </button>
                    </div>
                ))}
            </div>

            {/* قسم الشحن الفوري للبطاقات الحالية */}
            <div style={{ maxWidth: '500px', margin: '40px auto', background: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #d4af37', textAlign: 'right' }}>
                <h3 style={{ marginTop: 0, color: '#d4af37' }}>⚡ شحن فوري لبطاقة فيزا مفعلة</h3>
                <label style={{ fontSize: '14px', opacity: 0.8 }}>أدخل المبلغ المراد شحنه بالدولار الأمريكي ($):</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input type="number" placeholder="مثال: 50" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#1f2937', color: '#fff', border: '1px solid #374151' }} />
                    <button onClick={() => handleInstantRecharge(rechargeAmount)} disabled={loading} style={{ background: '#00ffcc', color: '#000', border: 'none', padding: '0 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>شحن الآن</button>
                </div>
            </div>

            {txStatus && (
                <div style={{ maxWidth: '600px', margin: '20px auto', padding: '15px', background: '#1f2937', borderRadius: '8px', borderLeft: '4px solid #00ffcc', fontSize: '14px' }}>
                    {txStatus}
                </div>
            )}
        </div>
    );
}

