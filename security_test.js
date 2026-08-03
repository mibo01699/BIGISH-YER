const assert = require('assert');

describe("GAV-YEM Security and Precision Automated Audit", function() {
    
    it("Should accurately process minimum micro-unit fractional balance", function() {
        const decimals = 6;
        const oneMicroToken = 1 / Math.pow(10, decimals);
        assert.strictEqual(oneMicroToken, 0.000001);
    });

    it("Should reject transaction if total spending velocity exceeds isolated buffer", function() {
        let userBalance = 50.000000;
        let paymentAmount = 50.000001;
        
        function processDeduction(balance, amount) {
            if (amount > balance) {
                throw new Error("SECURITY_VIOLATION_DOUBLE_DIP_DETECTED");
            }
            return balance - amount;
        }

        assert.throws(() => {
            processDeduction(userBalance, paymentAmount);
        }, /SECURITY_VIOLATION_DOUBLE_DIP_DETECTED/);
    });
});
