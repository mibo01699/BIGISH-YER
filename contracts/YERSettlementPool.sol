// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERSettlementPool
 * @dev Aligned with Pi Network v2.0 DEX Protocols & Macroeconomic Papers No. 11046 & 11129
 * Handles secure parallel clearing liquidity and controls anti-double dipping states on-chain.
 */

// واجهة قياسية مبسطة للتعامل مع الرموز الرقمية (ERC20)
interface IERC20 {
    function totalSupply() extern view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract YERSettlementPool {
    // الهياكل والعناوين الأساسية للمشروع
    address public immutable governanceAdmin;
    IERC20 public immutable yerToken;
    
    // تتبع الدفعات الفريدة لمنع التكرار والإنفاق المزدوج الهجين (On-Chain Anti-Double Dipping)
    mapping(string => bool) private processedPiPayments;
    
    // مؤشرات السيولة والاستقرار الكلي الكلي في اليمن
    uint256 public totalLiquidityInPool;
    uint256 public constant INFLATION_CONTROL_LOCK_PERIOD = 30 days;
    
    // الأحداث التشغيلية لتسهيل مراقبة الليدجر وسيرفرات الـ API
    event SettlementCleared(string indexed piPaymentId, address indexed receiver, uint256 amount);
    event LiquidityInjected(address indexed provider, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == governanceAdmin, "Security Rejection: Unauthorized access credentials.");
        _;
    }

    constructor(address _yerTokenAddress) {
        require(_yerTokenAddress != address(0), "Error: Invalid token address routing.");
        governanceAdmin = msg.sender;
        yerToken = IERC20(_yerTokenAddress);
    }

    /**
     * @notice تنفيذ تسوية المقاصة التبادلية على البلوكشين وتأمين التحويل للتاجر (GAV POS)
     * @param _piPaymentId المعرف الفريد القادم من تطبيق الفرونت إند وموثق ثنائياً عبر السيرفر
     * @param _merchantWallet عنوان المحفظة الموثقة للتاجر المستلم لسيولة المقاصة
     * @param _amountYER الكمية المراد ترحيلها وتسويتها برمز YER
     */
    function executeOnChainClearing(
        string calldata _piPaymentId,
        address _merchantWallet,
        uint256 _amountYER
    ) external onlyAdmin {
        require(_merchantWallet != address(0), "Clearing Failed: Invalid receiver address routing.");
        require(_amountYER > 0, "Clearing Failed: Volume must be strictly positive.");
        
        // جدار الحماية ضد التكرار والإنفاق المزدوج لحماية الـ 30% والـ 40% المخصصة للمشروع
        require(!processedPiPayments[_piPaymentId], "Security Alert: Duplicate settlement attempt blocked.");

        // التحقق من توفر السيولة الكافية في مجمع المقاصة قبل النقل
        require(yerToken.balanceOf(address(this)) >= _amountYER, "Liquidity Failure: Insufficient reserve in clearing vault.");

        // وسم المعاملة كمكتملة فوراً في سجل البلوكشين لمنع أي ثغرة إعادة دخول (Reentrancy Protection)
        processedPiPayments[_piPaymentId] = true;

        // تحويل السيولة النقدية لرمز YER إلى محفظة نقطة البيع بنجاح
        bool success = yerToken.transfer(_merchantWallet, _amountYER);
        require(success, "Ledger Error: Critical blockchain token transfer failed.");

        emit SettlementCleared(_piPaymentId, _merchantWallet, _amountYER);
    }

    /**
     * @notice ضخ السيولة وتعميق الاحتياطيات الرقمية لامتصاص التضخم (Pi DEX Support)
     */
    function injectReserveLiquidity(uint256 _amount) external {
        require(_amount > 0, "Error: Volume must be greater than zero.");
        
        bool success = yerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Ledger Error: Liquidity injection transfer failed.");
        
        totalLiquidityInPool += _amount;
        emit LiquidityInjected(msg.sender, _amount);
    }
}
