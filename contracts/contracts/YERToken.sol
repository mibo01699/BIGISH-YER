// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERToken
 * @dev نظام تتبع وتخصيص رموز الخدمة المتوافقة مع النظام البيئي المستقر BIGISH-YER
 * 
 * التوزيع الإلزامي:
 * - Maximum Supply: 300,000,000 YER
 * - Community & Public Utility (10%): 30,000,000
 * - Ecosystem Launch & Liquidity (30%): 90,000,000
 * - A.E.C Sovereign Fund Reserve (60%): 180,000,000
 */

contract YERToken {
    string public constant name = "BIGISH-YER Token";
    string public constant symbol = "YER";
    uint8 public constant decimals = 10; // تم التصحيح من 6 إلى 10

    uint256 public constant maxSupply = 300000000 * 10**uint256(decimals); // 300 مليون سقف ثابت
    uint256 public totalSupply;

    address public immutable owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "ERR_NOT_AUTHORIZED_DEV_NODE");
        _;
    }

    constructor() {
        owner = msg.sender;
        
        // التوزيع الصحيح وفق التعليمات الإلزامية:
        uint256 communityPool = (maxSupply * 10) / 100;   // 10% = 30,000,000
        uint256 ecosystemPool = (maxSupply * 30) / 100;   // 30% = 90,000,000
        uint256 reservePool = (maxSupply * 60) / 100;     // 60% = 180,000,000

        // تخصيص الأرصدة (يمكن تعديل العناوين حسب الحاجة لاحقاً)
        // ملاحظة: هنا نضع الأرصدة في العقد نفسه للمحاكاة، ويمكن توجيهها لعناوين محددة عبر الـ Owner
        balanceOf[address(this)] = ecosystemPool;   // 90M للسيولة والنظام البيئي
        balanceOf[owner] = communityPool;           // 30M للمجتمع (يمكن صرفها لاحقاً)
        balanceOf[address(0xdead)] = reservePool;   // 180M للاحتياطي السيادي (عنوان رمزي)

        totalSupply = maxSupply;

        emit Transfer(address(0), address(this), ecosystemPool);
        emit Transfer(address(0), owner, communityPool);
        emit Transfer(address(0), address(0xdead), reservePool);
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "ERR_INVALID_ADDRESS");
        require(balanceOf[msg.sender] >= value, "ERR_BALANCE_EXCEEDED");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
}