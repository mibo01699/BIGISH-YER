// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YERToken
 * @dev نظام تتبع وتخصيص رموز الخدمة المتوافقة مع النظام البيئي المستقر BY-GAV-YEM-2026-STABLE
 */
contract YERToken {
    string public constant name = "GAV-YEM Ecosystem Token";
    string public constant symbol = "YER";
    uint8 public constant decimals = 6;

    uint256 public constant maxSupply = 100000000 * 10**uint256(decimals); // 100 مليون سقف ثابت
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
        
        uint256 supplyChainPool = (maxSupply * 60) / 100; // 60% خدمات لوجستية
        uint256 dexPool = (maxSupply * 20) / 100;         // 20% سيولة داخلية
        uint256 airdropPool = (maxSupply * 10) / 100;     // 10% تفاعل مجتمعي
        uint256 devNodePool = (maxSupply * 10) / 100;     // 10% صيانة خادم صنعاء

        balanceOf[msg.sender] = supplyChainPool + dexPool + devNodePool;
        balanceOf[address(this)] = airdropPool;

        totalSupply = maxSupply;

        emit Transfer(address(0), msg.sender, balanceOf[msg.sender]);
        emit Transfer(address(0), address(this), airdropPool);
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
