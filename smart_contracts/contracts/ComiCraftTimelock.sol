// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/governance/TimelockController.sol';

/**
 * @title ComiCraftTimelock
 * @notice Timelock controller for decentralized governance of Comicraft contracts.
 *         All privileged operations (minting, fee changes, parameter updates) must
 *         go through this contract with a minimum delay, ensuring transparency
 *         and community oversight.
 *
 *         Ethereum Mainnet — Chain ID 1
 *
 * @dev Uses OpenZeppelin's battle-tested TimelockController:
 *      - Proposers: addresses that can schedule operations (DAO multisig / governor)
 *      - Executors: addresses that can execute after delay (can be zero for anyone)
 *      - Admin: initially deployer, then renounced to make it fully autonomous
 *
 *      Default delay: 48 hours (172800 seconds)
 *      This prevents rug-pulls and gives the community time to react to changes.
 */
contract ComiCraftTimelock is TimelockController {
    /**
     * @param minDelay        Minimum seconds that must pass between scheduling and execution.
     * @param proposers       Addresses allowed to schedule (propose) operations.
     * @param executors       Addresses allowed to execute ready operations (address(0) = anyone).
     * @param admin           Initial admin who can grant/revoke roles. Should be renounced post-setup.
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
