// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title LicensingEscrow
 * @notice Escrow contract for IP licensing deals on Comicraft.
 *         Buyer deposits CRAFTS, creator accepts to release funds,
 *         license terms hash stored on IPFS and recorded on-chain.
 */
contract LicensingEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum OfferStatus { Pending, Accepted, Rejected, Cancelled, Expired }

    struct LicenseOffer {
        uint256 id;
        address licensee;          // buyer
        address licensor;          // creator
        uint256 amount;            // CRAFTS amount
        bytes32 termsHash;         // IPFS hash of full license terms
        OfferStatus status;
        uint256 createdAt;
        uint256 expiresAt;
    }

    IERC20 public immutable craftsToken;
    uint256 private _offerCounter;

    mapping(uint256 => LicenseOffer) public offers;

    // ── Events ───────────────────────────────────────────────────────────
    event OfferCreated(
        uint256 indexed offerId,
        address indexed licensee,
        address indexed licensor,
        uint256 amount,
        bytes32 termsHash
    );

    event LicenseGranted(
        uint256 indexed offerId,
        address indexed licensor,
        address indexed licensee,
        bytes32 termsHash,
        uint256 amount
    );

    event OfferRejected(uint256 indexed offerId);
    event OfferCancelled(uint256 indexed offerId);

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(address _craftsToken) Ownable() {
        require(_craftsToken != address(0), 'Invalid CRAFTS address');
        craftsToken = IERC20(_craftsToken);
    }

    // ── Create Offer ─────────────────────────────────────────────────────
    /**
     * @notice Licensee creates an offer by depositing CRAFTS into escrow.
     * @param licensor   Creator's wallet address
     * @param amount     CRAFTS amount to offer
     * @param termsHash  IPFS hash of the license terms document
     * @param duration   Offer validity in seconds
     */
    function createOffer(
        address licensor,
        uint256 amount,
        bytes32 termsHash,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(licensor != address(0), 'Invalid licensor');
        require(amount > 0, 'Amount must be > 0');
        require(duration > 0, 'Duration must be > 0');

        _offerCounter++;
        uint256 offerId = _offerCounter;

        // Pull CRAFTS into escrow
        craftsToken.safeTransferFrom(msg.sender, address(this), amount);

        offers[offerId] = LicenseOffer({
            id: offerId,
            licensee: msg.sender,
            licensor: licensor,
            amount: amount,
            termsHash: termsHash,
            status: OfferStatus.Pending,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });

        emit OfferCreated(offerId, msg.sender, licensor, amount, termsHash);
        return offerId;
    }

    // ── Accept Offer ─────────────────────────────────────────────────────
    /**
     * @notice Creator accepts the offer, releasing escrowed CRAFTS to their wallet.
     */
    function acceptOffer(uint256 offerId) external nonReentrant {
        LicenseOffer storage offer = offers[offerId];
        require(offer.id > 0, 'Offer not found');
        require(msg.sender == offer.licensor, 'Only licensor can accept');
        require(offer.status == OfferStatus.Pending, 'Offer not pending');
        require(block.timestamp <= offer.expiresAt, 'Offer expired');

        offer.status = OfferStatus.Accepted;

        // Release funds to licensor
        craftsToken.safeTransfer(offer.licensor, offer.amount);

        emit LicenseGranted(
            offerId, offer.licensor, offer.licensee,
            offer.termsHash, offer.amount
        );
    }

    // ── Reject Offer ─────────────────────────────────────────────────────
    /**
     * @notice Creator rejects the offer, refunding CRAFTS to licensee.
     */
    function rejectOffer(uint256 offerId) external nonReentrant {
        LicenseOffer storage offer = offers[offerId];
        require(offer.id > 0, 'Offer not found');
        require(msg.sender == offer.licensor, 'Only licensor can reject');
        require(offer.status == OfferStatus.Pending, 'Offer not pending');

        offer.status = OfferStatus.Rejected;
        craftsToken.safeTransfer(offer.licensee, offer.amount);

        emit OfferRejected(offerId);
    }

    // ── Cancel Offer ─────────────────────────────────────────────────────
    /**
     * @notice Licensee cancels their pending/expired offer to reclaim CRAFTS.
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        LicenseOffer storage offer = offers[offerId];
        require(offer.id > 0, 'Offer not found');
        require(msg.sender == offer.licensee, 'Only licensee can cancel');
        require(
            offer.status == OfferStatus.Pending ||
            (offer.status == OfferStatus.Pending && block.timestamp > offer.expiresAt),
            'Cannot cancel'
        );

        offer.status = OfferStatus.Cancelled;
        craftsToken.safeTransfer(offer.licensee, offer.amount);

        emit OfferCancelled(offerId);
    }

    // ── Views ────────────────────────────────────────────────────────────
    function getOffer(uint256 offerId) external view returns (LicenseOffer memory) {
        return offers[offerId];
    }

    function totalOffers() external view returns (uint256) {
        return _offerCounter;
    }
}
