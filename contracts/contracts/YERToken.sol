// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERToken
 * @dev نظام تتبع وتخصيص رموز الخدمة المتوافقة مع النظام البيئي المستقر BIGISH-YER
 * 
 * التوزيع الإلزامي:
 * - Maximum Supply: 300,000,000 YER
 * - Community & Public Utility (10%): 30,000,000 - مؤجل حتى الإطلاق
 * - Ecosystem Launch & Liquidity (30%): 90,000,000 - متاح للتعدين والإدراج
 * - A.E.C Sovereign Fund Reserve (60%): 180,000,000 - احتياطي سيادي
 * 
 * تم التحديث: إضافة منطق تأجيل توزيع حصة الجمهور (10%)
 */

contract YERToken {
    string public constant name = "BIGISH-YER Token";
    string public constant symbol = "YER";
    uint8 public constant decimals = 10;

    uint256 public constant maxSupply = 300000000 * 10**uint256(decimals);
    uint256 public totalSupply;

    address public immutable owner;
    bool public isCommunityReleaseEnabled;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event CommunityReleaseActivated(address indexed activator);

    modifier onlyOwner() {
        require(msg.sender == owner, "ERR_NOT_AUTHORIZED_DEV_NODE");
        _;
    }

    constructor() {
        owner = msg.sender;
        isCommunityReleaseEnabled = false; // يبدأ معطلاً

        uint256 communityPool = (maxSupply * 10) / 100;   // 30M - مؤجل
        uint256 ecosystemPool = (maxSupply * 30) / 100;   // 90M - متاح
        uint256 reservePool = (maxSupply * 60) / 100;     // 180M - احتياطي

        // توزيع الحصص (مع فصل حصة الجمهور)
        balanceOf[address(this)] = ecosystemPool;   // 90M للسيولة والنظام البيئي
        balanceOf[address(this)] += communityPool;  // 30M محجوزة في العقد مؤقتاً
        balanceOf[address(0xdead)] = reservePool;   // 180M للاحتياطي السيادي

        totalSupply = maxSupply;

        emit Transfer(address(0), address(this), ecosystemPool + communityPool);
        emit Transfer(address(0), address(0xdead), reservePool);
    }

    /**
     * @dev تفعيل إطلاق حصة الجمهور (يتم استدعاؤه بعد نجاح الإطلاق)
     */
    function activateCommunityRelease() external onlyOwner {
        require(!isCommunityReleaseEnabled, "Already activated");
        isCommunityReleaseEnabled = true;
        emit CommunityReleaseActivated(msg.sender);
    }

    /**
     * @dev نقل الرموز (مع منع تحويل حصة الجمهور قبل التفعيل)
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "ERR_INVALID_ADDRESS");
        require(balanceOf[msg.sender] >= value, "ERR_BALANCE_EXCEEDED");

        // ✅ التحقق: منع تحويل حصة الجمهور (المجمدة) قبل التفعيل
        if (!isCommunityReleaseEnabled && msg.sender == address(this)) {
            // منع تحويل الأرصدة المجمدة في العقد
            require(value <= balanceOf[address(this)] - getCommunityAllocation(), "ERR_COMMUNITY_RELEASE_NOT_ENABLED");
        }

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev الحصول على مبلغ حصة الجمهور المجمد
     */
    function getCommunityAllocation() public pure returns (uint256) {
        return (maxSupply * 10) / 100; // 30,000,000 YER
    }

    // باقي الدوال (approve, transferFrom, إلخ) بنفس الصيغة ...
}