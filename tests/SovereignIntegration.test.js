// ArabEagleLoanCollateralGuard.js
// بروتوكول إدارة القروض والتمويل الاجتماعي بدون فوائد عبر حجز ضمانات Pi لربط مستودع صندوق النسر العربي (A.E.C) بـ BIGISH-YER

const ArabEagleLoanCollateralGuard = {
    loans: new Map(),
    piScale: 10000000n,    // 7 decimals لعملة Pi
    yerScale: 10000000000n, // 10 decimals لعملة YER

    // 1. إنشاء طلب تمويل حسن بحجز مكافئ من الـ Pi كضمان سيادي
    requestInterestFreeLoan: function(loanId, borrowerWallet, loanAmountInYer, piCollateralAmount) {
        const yerAmount = BigInt(loanAmountInYer) * this.yerScale;
        const piCollateral = BigInt(piCollateralAmount) * this.piScale;

        if (yerAmount <= 0n || piCollateral <= 0n) {
            return { success: false, error: "INVALID_MONETARY_VALUES" };
        }

        // هيكل القرض الاجتماعي لـ "صندوق النسر العربي" (خالٍ تماماً من الفوائد الربوية)
        const loanStructure = {
            loanId: loanId,
            borrower: borrowerWallet,
            amountYER: yerAmount,
            collateralPi: piCollateral,
            status: "LOCKED_AND_FUNDED", 
            repaidAmountYER: 0n,
            createdAt: Date.now()
        };

        this.loans.set(loanId, loanStructure);
        return { 
            success: true, 
            message: `تم تفعيل تمويل صندوق النسر العربي بنجاح. حجز ${piCollateralAmount} Pi وإصدار ${loanAmountInYer} YER` 
        };
    },

    // 2. معالجة سداد القرض تدريجياً والإفراج عن ضمان الـ Pi
    processLoanRepayment: function(loanId, paymentAmountInYer) {
        if (!this.loans.has(loanId)) {
            return { success: false, error: "LOAN_NOT_FOUND" };
        }

        const loan = this.loans.get(loanId);
        const paymentYER = BigInt(paymentAmountInYer) * this.yerScale;

        loan.repaidAmountYER += paymentYER;

        // عند اكتمال السداد، يفرج العقد تلقائياً وبشكل لامركزي عن نسر الضمان (Pi) للمواطن
        if (loan.repaidAmountYER >= loan.amountYER) {
            loan.status = "COLLATERAL_RELEASED";
            return { 
                success: true, 
                status: loan.status, 
                message: "تم سداد القرض الحسن بالكامل لصندوق النسر العربي! تم تحرير عملات Pi للعميل بنجاح." 
            };
        }

        return {
            success: true,
            status: loan.status,
            remainingYER: ((loan.amountYER - loan.repaidAmountYER) / this.yerScale).toString()
        };
    }
};

module.exports = ArabEagleLoanCollateralGuard;
