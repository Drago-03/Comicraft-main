// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

/**
 * @title CRAFTSGovernor
 * @notice Governor-style contract for Comicraft DAO governance.
 *         Uses staked CRAFTS (sCRAFTS) for voting power via the CRAFTSStaking contract.
 *         Supports proposal creation, weighted voting, quorum enforcement,
 *         and on-chain vote recording.
 */
contract CRAFTSGovernor is Ownable, ReentrancyGuard {
    // ── External contract interface for staking voting power ─────────────
    interface IStaking {
        function getVotingPower(address account) external view returns (uint256);
    }

    IStaking public immutable stakingContract;
    uint256 public constant MIN_STAKE_TO_PROPOSE = 100e18; // 100 sCRAFTS minimum

    enum ProposalStatus { Active, Passed, Rejected, Executed, Expired }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        bytes32 descriptionHash;     // IPFS hash of full description
        uint256 votingStartsAt;
        uint256 votingEndsAt;
        uint256 quorumRequired;      // minimum total voting power needed
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        bool executed;
    }

    uint256 private _proposalCounter;
    mapping(uint256 => Proposal) public proposals;
    // proposalId → voter → hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ── Events ───────────────────────────────────────────────────────────
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 votingStartsAt,
        uint256 votingEndsAt,
        uint256 quorumRequired
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,       // 0=against, 1=for, 2=abstain
        uint256 weight
    );

    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalStatusChanged(uint256 indexed proposalId, ProposalStatus newStatus);

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(address _stakingContract) Ownable() {
        require(_stakingContract != address(0), 'Invalid staking contract');
        stakingContract = IStaking(_stakingContract);
    }

    // ── Create Proposal ──────────────────────────────────────────────────
    /**
     * @notice Create a governance proposal. Requires minimum stake.
     * @param title          Short title
     * @param descriptionHash IPFS hash of full description
     * @param votingPeriod   Duration in seconds
     * @param quorumRequired Minimum voting power for validity
     */
    function createProposal(
        string memory title,
        bytes32 descriptionHash,
        uint256 votingPeriod,
        uint256 quorumRequired
    ) external returns (uint256) {
        require(bytes(title).length > 0, 'Title required');
        require(votingPeriod >= 1 days, 'Min 1 day voting');
        require(votingPeriod <= 30 days, 'Max 30 day voting');

        uint256 proposerPower = stakingContract.getVotingPower(msg.sender);
        require(proposerPower >= MIN_STAKE_TO_PROPOSE, 'Insufficient stake to propose');

        _proposalCounter++;
        uint256 proposalId = _proposalCounter;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            descriptionHash: descriptionHash,
            votingStartsAt: block.timestamp,
            votingEndsAt: block.timestamp + votingPeriod,
            quorumRequired: quorumRequired,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.Active,
            executed: false
        });

        emit ProposalCreated(
            proposalId, msg.sender, title,
            block.timestamp, block.timestamp + votingPeriod,
            quorumRequired
        );

        return proposalId;
    }

    // ── Cast Vote ────────────────────────────────────────────────────────
    /**
     * @notice Cast a vote on an active proposal.
     * @param proposalId Proposal to vote on
     * @param support    0=against, 1=for, 2=abstain
     */
    function castVote(uint256 proposalId, uint8 support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, 'Proposal not found');
        require(proposal.status == ProposalStatus.Active, 'Not active');
        require(block.timestamp >= proposal.votingStartsAt, 'Voting not started');
        require(block.timestamp <= proposal.votingEndsAt, 'Voting ended');
        require(!hasVoted[proposalId][msg.sender], 'Already voted');
        require(support <= 2, 'Invalid support value');

        uint256 weight = stakingContract.getVotingPower(msg.sender);
        require(weight > 0, 'No voting power');

        hasVoted[proposalId][msg.sender] = true;

        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    // ── Finalize Proposal ────────────────────────────────────────────────
    /**
     * @notice Finalize a proposal after voting period ends.
     *         Anyone can call this to update state.
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, 'Proposal not found');
        require(proposal.status == ProposalStatus.Active, 'Not active');
        require(block.timestamp > proposal.votingEndsAt, 'Voting not ended');

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        bool quorumMet = totalVotes >= proposal.quorumRequired;

        if (quorumMet && proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalStatusChanged(proposalId, proposal.status);
    }

    // ── Execute Proposal ─────────────────────────────────────────────────
    /**
     * @notice Execute a passed proposal. Only owner or proposer can execute.
     */
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, 'Proposal not found');
        require(proposal.status == ProposalStatus.Passed, 'Not passed');
        require(!proposal.executed, 'Already executed');

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        emit ProposalExecuted(proposalId);
        emit ProposalStatusChanged(proposalId, ProposalStatus.Executed);
    }

    // ── Views ────────────────────────────────────────────────────────────
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function totalProposals() external view returns (uint256) {
        return _proposalCounter;
    }

    function getVoteStatus(uint256 proposalId, address voter) external view returns (bool) {
        return hasVoted[proposalId][voter];
    }
}
