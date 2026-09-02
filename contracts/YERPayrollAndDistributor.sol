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
 * 
 * تم التحديث: منع توزيع حصة الجمهور (COMMUNITY) قبل تفعيل الإطلاق.
 */
contract YERPayrollAndDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    IERC20 public immutable yerToken;
    
    // سقف المعروض الأقصى: 300M * 10^10 (للدقة)
    uint256 public constant MAX_SUPPLY = 300_000_000 * 10**10;
    uint256 public totalDistributed;

    // حدود الفئات (حسب التوزيع الإلزامي)
    uint256 public constant COMMUNITY_CAP = 30_000_000 * 10**10;   // 10% - مؤجل
    uint256 public constant ECOSYSTEM_CAP = 90_000_000 * 10**10;   // 30% - متاح دائماً
    uint256 public constant RESERVE_CAP = 180_000_000 * 10**10;    // 60%

    // ✅ متغير جديد: التحكم في تفعيل توزيع الجمهور
    bool public isCommunityReleaseEnabled;

    event BatchDistributed(address indexed operator, uint256 totalRecipients, uint256 totalAmount);
    event EmergencyWithdrawal(address indexed admin, address indexed token, uint256 amount);
    event LaunchpadActivated(address indexed admin);

    error ArrayLengthMismatch();
    error EmptyArray();
    error InvalidZeroAddress();
    error InvalidZeroAmount();
    error ExceedsMaxSupply();
    error ExceedsCategoryCap(string category);
    error CommunityReleaseNotEnabled();

    constructor(address _yerToken, address admin) {
        if (_yerToken == address(0) || admin == address(0)) revert InvalidZeroAddress();

        yerToken = IERC20(_yerToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        isCommunityReleaseEnabled = false; // يبدأ معطلاً
    }

    /**
     * @notice تفعيل الإطلاق (يتم استدعاؤه من قبل الإدارة بعد نجاح الإطلاق)
     */
    function activateLaunchpad() external onlyRole(DEFAULT_ADMIN_ROLE) {
        isCommunityReleaseEnabled = true;
        emit LaunchpadActivated(msg.sender);
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

        uint256 totalSum = 0;
        for (uint256 i = 0; i < length; ) {
            if (recipients[i] == address(0)) revert InvalidZeroAddress();
            if (amounts[i] == 0) revert InvalidZeroAmount();
            totalSum += amounts[i];
            unchecked { ++i; }
        }

        if (totalDistributed + totalSum > MAX_SUPPLY) revert ExceedsMaxSupply();

        // ✅ التحقق من الفئة مع مراعاة حالة الإطلاق
        bytes32 categoryHash = keccak256(bytes(category));
        
        if (categoryHash == keccak256(bytes("COMMUNITY"))) {
            // ⛔ منع توزيع الجمهور إذا لم يتم تفعيل الإطلاق
            if (!isCommunityReleaseEnabled) revert CommunityReleaseNotEnabled();
            if (totalDistributed + totalSum > COMMUNITY_CAP) revert ExceedsCategoryCap("COMMUNITY");
        } else if (categoryHash == keccak256(bytes("ECOSYSTEM"))) {
            // ✅ حصة الإطلاق (30%) متاحة دائماً
            if (totalDistributed + totalSum > ECOSYSTEM_CAP) revert ExceedsCategoryCap("ECOSYSTEM");
        } else if (categoryHash == keccak256(bytes("RESERVE"))) {
            if (totalDistributed + totalSum > RESERVE_CAP) revert ExceedsCategoryCap("RESERVE");
        } else {
            revert("Invalid category");
        }

        for (uint256 i = 0; i < length; ) {
            yerToken.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        totalDistributed += totalSum;
        emit BatchDistributed(msg.sender, length, totalSum);
    }

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