// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/interfaces/IERC2981.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

/**
 * @title RoyaltySplitter
 * @notice ERC-2981 compliant royalty contract that stores per-token royalty
 *         percentages and split addresses, then distributes resale proceeds
 *         between creator, platform CRAFTS treasury, and optional agent treasury.
 */
contract RoyaltySplitter is IERC2981, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct RoyaltyConfig {
        uint96 royaltyBps;        // basis points (500 = 5%, 1000 = 10%)
        address creatorWallet;
        uint96 creatorSplitBps;   // e.g. 7000 = 70% of royalty to creator
        address platformTreasury;
        uint96 platformSplitBps;  // e.g. 2000 = 20% of royalty to platform
        address agentTreasury;
        uint96 agentSplitBps;     // e.g. 1000 = 10% of royalty to agent
    }

    // tokenId → RoyaltyConfig
    mapping(uint256 => RoyaltyConfig) private s_royalties;
    // tokenId → configured flag
    mapping(uint256 => bool) public isConfigured;

    IERC20 public immutable craftsToken;

    // ── Events ───────────────────────────────────────────────────────────
    event RoyaltyConfigured(
        uint256 indexed tokenId,
        uint96 royaltyBps,
        address creatorWallet,
        address platformTreasury,
        address agentTreasury
    );

    event RoyaltyDistributed(
        uint256 indexed tokenId,
        uint256 salePrice,
        uint256 totalRoyalty,
        uint256 creatorAmount,
        uint256 platformAmount,
        uint256 agentAmount
    );

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(address _craftsToken) Ownable() {
        require(_craftsToken != address(0), 'Invalid CRAFTS address');
        craftsToken = IERC20(_craftsToken);
    }

    // ── Configure ────────────────────────────────────────────────────────
    /**
     * @notice Set royalty config for a token. Can only be set once per token.
     * @param tokenId        The NFT token ID
     * @param royaltyBps     Royalty percentage in basis points (500-1000 = 5-10%)
     * @param creatorWallet  Creator wallet address
     * @param creatorSplitBps Creator's share of royalty in bps (out of 10000)
     * @param platformTreasury Platform treasury address
     * @param platformSplitBps Platform's share of royalty in bps
     * @param agentTreasury  Agent treasury address (address(0) if none)
     * @param agentSplitBps  Agent's share of royalty in bps
     */
    function configureRoyalty(
        uint256 tokenId,
        uint96 royaltyBps,
        address creatorWallet,
        uint96 creatorSplitBps,
        address platformTreasury,
        uint96 platformSplitBps,
        address agentTreasury,
        uint96 agentSplitBps
    ) external onlyOwner {
        require(!isConfigured[tokenId], 'Already configured');
        require(royaltyBps >= 500 && royaltyBps <= 1000, 'Royalty must be 5-10%');
        require(creatorWallet != address(0), 'Invalid creator');
        require(platformTreasury != address(0), 'Invalid platform treasury');
        require(
            creatorSplitBps + platformSplitBps + agentSplitBps == 10000,
            'Splits must total 10000'
        );

        s_royalties[tokenId] = RoyaltyConfig({
            royaltyBps: royaltyBps,
            creatorWallet: creatorWallet,
            creatorSplitBps: creatorSplitBps,
            platformTreasury: platformTreasury,
            platformSplitBps: platformSplitBps,
            agentTreasury: agentTreasury,
            agentSplitBps: agentSplitBps
        });
        isConfigured[tokenId] = true;

        emit RoyaltyConfigured(
            tokenId, royaltyBps, creatorWallet, platformTreasury, agentTreasury
        );
    }

    // ── ERC-2981 ─────────────────────────────────────────────────────────
    /**
     * @inheritdoc IERC2981
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        if (!isConfigured[tokenId]) {
            return (address(0), 0);
        }
        RoyaltyConfig memory cfg = s_royalties[tokenId];
        royaltyAmount = (salePrice * cfg.royaltyBps) / 10000;
        // ERC-2981 only returns a single receiver — use this contract as receiver
        // so distributeRoyalty() can split it
        receiver = address(this);
    }

    // ── Distribute ───────────────────────────────────────────────────────
    /**
     * @notice Distribute royalty for a resale. Caller must have approved this
     *         contract to spend `salePrice * royaltyBps / 10000` CRAFTS.
     * @param tokenId   The NFT token ID
     * @param salePrice The full resale price in CRAFTS
     */
    function distributeRoyalty(
        uint256 tokenId,
        uint256 salePrice
    ) external nonReentrant {
        require(isConfigured[tokenId], 'Not configured');

        RoyaltyConfig memory cfg = s_royalties[tokenId];
        uint256 totalRoyalty = (salePrice * cfg.royaltyBps) / 10000;
        require(totalRoyalty > 0, 'No royalty');

        uint256 creatorAmount = (totalRoyalty * cfg.creatorSplitBps) / 10000;
        uint256 platformAmount = (totalRoyalty * cfg.platformSplitBps) / 10000;
        uint256 agentAmount = totalRoyalty - creatorAmount - platformAmount;

        // Pull CRAFTS from caller
        craftsToken.safeTransferFrom(msg.sender, address(this), totalRoyalty);

        // Distribute
        if (creatorAmount > 0) {
            craftsToken.safeTransfer(cfg.creatorWallet, creatorAmount);
        }
        if (platformAmount > 0) {
            craftsToken.safeTransfer(cfg.platformTreasury, platformAmount);
        }
        if (agentAmount > 0 && cfg.agentTreasury != address(0)) {
            craftsToken.safeTransfer(cfg.agentTreasury, agentAmount);
        } else if (agentAmount > 0) {
            // No agent treasury — send to platform
            craftsToken.safeTransfer(cfg.platformTreasury, agentAmount);
        }

        emit RoyaltyDistributed(
            tokenId, salePrice, totalRoyalty,
            creatorAmount, platformAmount, agentAmount
        );
    }

    // ── Views ────────────────────────────────────────────────────────────
    function getRoyaltyConfig(uint256 tokenId) external view returns (RoyaltyConfig memory) {
        return s_royalties[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC2981).interfaceId;
    }
}
