// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title YERPayrollAndDistributor
 * @dev Automated batch distribution system for payroll and humanitarian aid.
 * 
 * ملاحظة: هذا العقد مخصص للتوزيع فقط، ويجب أن يتوافق مع سقف الـ 300M YER.
 * الدقة المعتمدة: 10 خانات عشرية (كما في YERTokenomicsCanonical).
 */
contract YERPayrollAndDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    IERC20 public immutable yerToken;
    
    // سقف المعروض الأقصى: 300M * 10^10 (للدقة)
    uint256 public constant MAX_SUPPLY = 300_000_000 * 10**10; // 300,000,000 YER

    // إجمالي ما تم توزيعه حتى الآن (لمنع تجاوز السقف)
    uint256 public totalDistributed;

    // الحد الأقصى للتوزيع لكل فئة (حسب التوزيع الإلزامي)
    uint256 public constant COMMUNITY_CAP = 30_000_000 * 10**10;   // 30M
    uint256 public constant ECOSYSTEM_CAP = 90_000_000 * 10**10;   // 90M
    uint256 public constant RESERVE_CAP = 180_000_000 * 10**10;    // 180M

    event BatchDistributed(address indexed operator, uint256 totalRecipients, uint256 totalAmount);
    event EmergencyWithdrawal(address indexed admin, address indexed token, uint256 amount);

    error ArrayLengthMismatch();
    error EmptyArray();
    error InvalidZeroAddress();
    error InvalidZeroAmount();
    error ExceedsMaxSupply();
    error ExceedsCategoryCap(string category);

    constructor(address _yerToken, address admin) {
        if (_yerToken == address(0) || admin == address(0)) revert InvalidZeroAddress();

        yerToken = IERC20(_yerToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
    }

    /**
     * @notice Distributes YER to multiple recipients in a single atomic transaction.
     * @param category فئة التوزيع: "COMMUNITY", "ECOSYSTEM", "RESERVE"
     */
    function batchDistribute(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata category
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyArray();
        if (length != amounts.length) revert ArrayLengthMismatch();

        // حساب مجموع المبالغ المطلوبة
        uint256 totalSum = 0;
        for (uint256 i = 0; i < length; ) {
            if (recipients[i] == address(0)) revert InvalidZeroAddress();
            if (amounts[i] == 0) revert InvalidZeroAmount();
            totalSum += amounts[i];
            
            unchecked {
                ++i;
            }
        }

        // التحقق من عدم تجاوز السقف الكلي (300M)
        if (totalDistributed + totalSum > MAX_SUPPLY) revert ExceedsMaxSupply();

        // التحقق من عدم تجاوز سقف الفئة
        if (keccak256(bytes(category)) == keccak256(bytes("COMMUNITY"))) {
            if (totalDistributed + totalSum > COMMUNITY_CAP) revert ExceedsCategoryCap("COMMUNITY");
        } else if (keccak256(bytes(category)) == keccak256(bytes("ECOSYSTEM"))) {
            if (totalDistributed + totalSum > ECOSYSTEM_CAP) revert ExceedsCategoryCap("ECOSYSTEM");
        } else if (keccak256(bytes(category)) == keccak256(bytes("RESERVE"))) {
            if (totalDistributed + totalSum > RESERVE_CAP) revert ExceedsCategoryCap("RESERVE");
        } else {
            revert("Invalid category");
        }

        // تنفيذ التوزيع
        for (uint256 i = 0; i < length; ) {
            yerToken.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            unchecked {
                ++i;
            }
        }

        // تحديث الإجمالي الموزع
        totalDistributed += totalSum;

        emit BatchDistributed(msg.sender, length, totalSum);
    }

    /**
     * @notice Emergency withdraw Stuck Tokens in contract.
     */
    function emergencyWithdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (to == address(0) || token == address(0)) revert InvalidZeroAddress();
        if (amount == 0) revert InvalidZeroAmount();

        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdrawal(msg.sender, token, amount);
    }
}