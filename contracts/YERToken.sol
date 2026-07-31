// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YER Token: Cryptographic Core for BIGISH-YER Wallet
 * @dev Capped supply of 100M tokens with 6 decimals (1 YER = 1,000,000 Micro-units)
 */
contract YERToken {
    string public name = "Digital Yemeni Rial";
    string public symbol = "YER";
    uint8 public decimals = 6; // 1,000,000 خانة فرعية
    uint256 public totalSupply;
    uint256 public maxSupply = 100000000 * 10**6; // 100 مليون رمز

    address public owner;
    uint256 public communityMiningPool;
    uint256 public constant MINING_CAP = 10000000 * 10**6; // 10% للتعدين المجاني

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MiningClaimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Error: Authorized Owner Only.");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSupply = 90000000 * 10**6; // تخصيص 90% لسلاسل التوريد والسيولة
        balanceOf[owner] = totalSupply;
        communityMiningPool = MINING_CAP; // حجز الـ 10% للتعدين المجاني للجمهور
        emit Transfer(address(0), owner, totalSupply);
    }

    /**
     * @dev نظام تحويلات صارم ومبسط متوافق مع نظام المحفظة والتحقق
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
     * @dev توزيع الـ 10% المخصصة للتعدين المجاني برمجياً وصارماً
     */
    function distributeMiningReward(address _user, uint256 _amount) public onlyOwner returns (bool) {
        require(communityMiningPool >= _amount, "Error: Mining pool exhausted.");
        
        communityMiningPool -= _amount;
        balanceOf[_user] += _amount;
        totalSupply += _amount;
        
        emit MiningClaimed(_user, _amount);
        emit Transfer(address(0), _user, _amount);
        return true;
    }
}
