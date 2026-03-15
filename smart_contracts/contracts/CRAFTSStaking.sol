// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title CRAFTSStaking
 * @notice Stake CRAFTS tokens to receive governance voting power (sCRAFTS).
 *         Staking locks tokens, unstaking requires a 7-day cooldown.
 *         Voting power = staked amount (1 CRAFTS = 1 sCRAFTS = 1 vote).
 *
 *         Ethereum Mainnet — Chain ID 1
 *
 * @dev    **Decentralization features**:
 *         - Pausable: Owner (ideally ComiCraftTimelock) can pause staking/unstaking
 *           in emergencies (e.g. exploit found)
 *         - Ownership should be transferred to ComiCraftTimelock after deployment
 *         - ReentrancyGuard on all token-transferring functions
 */
contract CRAFTSStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable craftsToken;
    uint256 public constant COOLDOWN_PERIOD = 7 days;
    uint256 public constant MIN_STAKE = 1e18; // 1 CRAFTS minimum

    struct StakeInfo {
        uint256 stakedAmount;
        uint256 unstakeRequestedAt;  // 0 if not unstaking
        uint256 unstakeAmount;       // amount requested to unstake
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    // ── Events ───────────────────────────────────────────────────────────
    event Staked(address indexed user, uint256 amount, uint256 newTotal);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 availableAt);
    event Unstaked(address indexed user, uint256 amount, uint256 remaining);

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(address _craftsToken) Ownable() {
        require(_craftsToken != address(0), 'Invalid CRAFTS address');
        craftsToken = IERC20(_craftsToken);
    }

    // ── Stake ────────────────────────────────────────────────────────────
    /**
     * @notice Stake CRAFTS to receive governance power.
     * @param amount Amount of CRAFTS to stake (18 decimals)
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, 'Below minimum stake');

        craftsToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].stakedAmount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount, stakes[msg.sender].stakedAmount);
    }

    // ── Request Unstake ──────────────────────────────────────────────────
    /**
     * @notice Request to unstake. Starts a 7-day cooldown period.
     * @param amount Amount to unstake
     */
    function requestUnstake(uint256 amount) external whenNotPaused {
        StakeInfo storage info = stakes[msg.sender];
        require(info.stakedAmount >= amount, 'Insufficient stake');
        require(amount > 0, 'Amount must be > 0');
        require(info.unstakeRequestedAt == 0, 'Unstake already pending');

        info.unstakeRequestedAt = block.timestamp;
        info.unstakeAmount = amount;

        emit UnstakeRequested(
            msg.sender, amount,
            block.timestamp + COOLDOWN_PERIOD
        );
    }

    // ── Complete Unstake ─────────────────────────────────────────────────
    /**
     * @notice Complete unstake after cooldown period has passed.
     * @dev    Not paused — users should always be able to withdraw after cooldown
     */
    function completeUnstake() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.unstakeRequestedAt > 0, 'No unstake requested');
        require(
            block.timestamp >= info.unstakeRequestedAt + COOLDOWN_PERIOD,
            'Cooldown not complete'
        );

        uint256 amount = info.unstakeAmount;
        info.stakedAmount -= amount;
        info.unstakeRequestedAt = 0;
        info.unstakeAmount = 0;
        totalStaked -= amount;

        craftsToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount, info.stakedAmount);
    }

    // ── Cancel Unstake ───────────────────────────────────────────────────
    /**
     * @notice Cancel a pending unstake request.
     */
    function cancelUnstake() external {
        StakeInfo storage info = stakes[msg.sender];
        require(info.unstakeRequestedAt > 0, 'No unstake pending');

        info.unstakeRequestedAt = 0;
        info.unstakeAmount = 0;
    }

    // ── Emergency Controls ──────────────────────────────────────────────
    /**
     * @notice Pause staking and new unstake requests (owner/timelock only).
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause staking and new unstake requests (owner/timelock only).
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ── Views ────────────────────────────────────────────────────────────
    /**
     * @notice Returns the voting power for an account.
     *         Voting power = staked amount (minus any amount pending unstake).
     */
    function getVotingPower(address account) external view returns (uint256) {
        StakeInfo memory info = stakes[account];
        // If unstaking, reduce voting power by unstake amount
        if (info.unstakeRequestedAt > 0) {
            return info.stakedAmount - info.unstakeAmount;
        }
        return info.stakedAmount;
    }

    function getStakeInfo(address account) external view returns (
        uint256 stakedAmount,
        uint256 unstakeRequestedAt,
        uint256 unstakeAmount,
        uint256 votingPower
    ) {
        StakeInfo memory info = stakes[account];
        uint256 vp = info.stakedAmount;
        if (info.unstakeRequestedAt > 0) {
            vp = info.stakedAmount - info.unstakeAmount;
        }
        return (info.stakedAmount, info.unstakeRequestedAt, info.unstakeAmount, vp);
    }
}
