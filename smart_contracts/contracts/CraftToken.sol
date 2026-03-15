// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title CraftToken (CRAFTS)
 * @notice ComicCraft Tokens — the primary in-app currency for the Comicraft / ComicCrafts
 *         marketplace. Deployed on Ethereum Mainnet (Chain ID 1).
 *
 * @dev    **Decentralization features** (mainnet-ready):
 *         - Hard supply cap of 100 million CRAFTS (prevents infinite inflation)
 *         - Ownership should be transferred to ComiCraftTimelock for DAO governance
 *         - Holders can burn their own tokens (deflationary pressure)
 *         - Standard ERC-20: transfer / approve / transferFrom
 *
 *  Tokenomics:
 *    - Max Supply:        100,000,000 CRAFTS (100M)
 *    - Initial Mint:      1,000,000 CRAFTS to deployer (1% of max)
 *    - Future minting:    Controlled by timelock / DAO votes only
 */
contract CraftToken is ERC20, ERC20Burnable, Ownable {
    /// @notice Hard cap — no more than 100 million CRAFTS can ever exist
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    /// @notice Emitted when the owner mints new tokens
    event TokensMinted(address indexed to, uint256 amount);

    /// @notice Emitted once the supply cap is reached
    event SupplyCapReached(uint256 totalSupply);

    constructor() ERC20('ComicCraft Tokens', 'CRAFTS') Ownable() {
        // Mint initial supply of 1,000,000 CRAFTS to deployer (1% of max)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Mint new CRAFTS tokens.
     * @dev    Only the owner (should be ComiCraftTimelock for decentralization)
     *         can call this. Reverts if minting would exceed MAX_SUPPLY.
     * @param  to     Recipient address.
     * @param  amount Amount in wei (18 decimals).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), 'CraftToken: mint to zero address');
        require(amount > 0, 'CraftToken: amount must be > 0');
        require(totalSupply() + amount <= MAX_SUPPLY, 'CraftToken: would exceed max supply');

        _mint(to, amount);
        emit TokensMinted(to, amount);

        if (totalSupply() == MAX_SUPPLY) {
            emit SupplyCapReached(MAX_SUPPLY);
        }
    }

    /**
     * @notice Returns the number of CRAFTS that can still be minted.
     */
    function mintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
