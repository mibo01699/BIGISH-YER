// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERToken
 * @dev Cryptographic Core for BIGISH-YER Ecosystem
 * 
 * القواعد الإلزامية:
 * - Maximum Supply: 300,000,000 YER
 * - Community & Public Utility (10%): 30,000,000 YER
 * - Ecosystem Launch & Liquidity (30%): 90,000,000 YER
 * - A.E.C Sovereign Fund Reserve (60%): 180,000,000 YER
 * - Precision: 10 decimals (1 YER = 10^10 Sub-units)
 * - No Mining mechanism exists in this contract.
 */
contract YERToken {
    string public name = "BIGISH-YER Token";
    string public symbol = "YER";
    uint8 public decimals = 10; // 10 خانات عشرية (وفق القاعدة)
    uint256 public totalSupply;
    
    // السقف الأقصى: 300 مليون * 10^10
    uint256 public constant maxSupply = 300_000_000 * 10**10;
    
    // التوزيع الثابت
    uint256 public constant COMMUNITY_ALLOCATION = 30_000_000 * 10**10;   // 10%
    uint256 public constant ECOSYSTEM_ALLOCATION = 90_000_000 * 10**10;   // 30%
    uint256 public constant RESERVE_ALLOCATION = 180_000_000 * 10**10;    // 60%

    address public owner;
    
    // تتبع المبالغ الموزعة لكل فئة (لمنع تجاوز الحدود لاحقاً إذا أردت صرفها بشكل تدريجي)
    uint256 public distributedCommunity;
    uint256 public distributedEcosystem;
    uint256 public distributedReserve;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Error: Authorized Owner Only.");
        _;
    }

    constructor() {
        owner = msg.sender;
        
        // تخصيص الأرصدة الأولية (يتم هنا وضع الأرصدة في عناوين رمزية للمحاكاة)
        // يمكن لاحقاً تعديل العناوين حسب الحاجة، لكن الأرقام ثابتة.
        balanceOf[address(0x30)] = COMMUNITY_ALLOCATION;   // عنوان رمزي للمجتمع
        balanceOf[address(0x90)] = ECOSYSTEM_ALLOCATION;   // عنوان رمزي للنظام البيئي
        balanceOf[address(0x180)] = RESERVE_ALLOCATION;    // عنوان رمزي للاحتياطي السيادي

        totalSupply = maxSupply; // تم إنشاء كل الرموز فوراً (بدون تعدين)
        
        emit Transfer(address(0), address(0x30), COMMUNITY_ALLOCATION);
        emit Transfer(address(0), address(0x90), ECOSYSTEM_ALLOCATION);
        emit Transfer(address(0), address(0x180), RESERVE_ALLOCATION);
    }

    /**
     * @dev نظام تحويلات صارم ومبسط
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address.");
        require(balanceOf[msg.sender] >= _value, "Error: Insufficient balance.");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev تفويض (اختياري)
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev نقل من حساب مفوض
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}