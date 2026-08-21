// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title YERPayrollAndDistributor
 * @dev Automated batch distribution system for payroll and humanitarian aid.
 * Protected against Reentrancy, Denial of Service, and Array Mismatches.
 */
contract YERPayrollAndDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    IERC20 public immutable yerToken;

    event BatchDistributed(address indexed operator, uint256 totalRecipients, uint256 totalAmount);
    event EmergencyWithdrawal(address indexed admin, address indexed token, uint256 amount);

    error ArrayLengthMismatch();
    error EmptyArray();
    error InvalidZeroAddress();
    error InvalidZeroAmount();

    constructor(address _yerToken, address admin) {
        if (_yerToken == address(0) || admin == address(0)) revert InvalidZeroAddress();

        yerToken = IERC20(_yerToken);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
    }

    /**
     * @notice Distributes YER to multiple recipients in a single atomic transaction.
     */
    function batchDistribute(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyArray();
        if (length != amounts.length) revert ArrayLengthMismatch();

        uint256 totalSum = 0;
        for (uint256 i = 0; i < length; ) {
            if (recipients[i] == address(0)) revert InvalidZeroAddress();
            if (amounts[i] == 0) revert InvalidZeroAmount();
            totalSum += amounts[i];
            
            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < length; ) {
            yerToken.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            unchecked {
                ++i;
            }
        }

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
