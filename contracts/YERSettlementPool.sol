// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERSettlementPool
 * @dev Handles secure parallel clearing liquidity and controls anti-double dipping states on-chain.
 * NOTE: This contract operates in a Sandbox/Testnet environment. It is NOT officially affiliated with Pi Network.
 */

// واجهة قياسية مبسطة للتعامل مع الرموز الرقمية (ERC20)
interface IERC20 {
    function totalSupply() external view returns (uint256);
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
    
    // مؤشرات السيولة والاستقرار الاقتصادي
    uint256 public totalLiquidityInPool;
    uint256 public constant INFLATION_CONTROL_LOCK_PERIOD = 30 days;
    
    // الحد الأقصى للسيولة المخصصة للنظام البيئي (30% من 300M = 90M YER)
    uint256 public constant MAX_ECOSYSTEM_LIQUIDITY = 90_000_000 * 10**10; // 90,000,000 YER (10 decimals)
    
    // الأحداث التشغيلية
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
     * @param _piPaymentId المعرف الفريد القادم من التطبيق
     * @param _merchantWallet عنوان المحفظة الموثقة للتاجر
     * @param _amountYER الكمية المراد تسويتها برمز YER
     */
    function executeOnChainClearing(
        string calldata _piPaymentId,
        address _merchantWallet,
        uint256 _amountYER
    ) external onlyAdmin {
        require(_merchantWallet != address(0), "Clearing Failed: Invalid receiver address routing.");
        require(_amountYER > 0, "Clearing Failed: Volume must be strictly positive.");
        
        // حماية من التكرار
        require(!processedPiPayments[_piPaymentId], "Security Alert: Duplicate settlement attempt blocked.");

        // التحقق من توفر السيولة الكافية
        require(yerToken.balanceOf(address(this)) >= _amountYER, "Liquidity Failure: Insufficient reserve in clearing vault.");

        // وسم المعاملة كمكتملة فوراً
        processedPiPayments[_piPaymentId] = true;

        // تحويل السيولة
        bool success = yerToken.transfer(_merchantWallet, _amountYER);
        require(success, "Ledger Error: Critical blockchain token transfer failed.");

        emit SettlementCleared(_piPaymentId, _merchantWallet, _amountYER);
    }

    /**
     * @notice ضخ السيولة وتعميق الاحتياطيات الرقمية (ضمن حدود 90M المخصصة)
     */
    function injectReserveLiquidity(uint256 _amount) external {
        require(_amount > 0, "Error: Volume must be greater than zero.");
        
        // التحقق من عدم تجاوز الحد الأقصى للسيولة (90M)
        require(totalLiquidityInPool + _amount <= MAX_ECOSYSTEM_LIQUIDITY, "Liquidity Cap Exceeded: Cannot exceed 90M YER ecosystem allocation.");
        
        bool success = yerToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Ledger Error: Liquidity injection transfer failed.");
        
        totalLiquidityInPool += _amount;
        emit LiquidityInjected(msg.sender, _amount);
    }
}