/**
 * DAO Governance Routes — /api/v1/governance
 *
 * Stake CRAFTS, create proposals, vote, execute.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { GovernanceStake, GovernanceProposal, GovernanceVoteRecord } = require('../models/ctp-models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Governance
 *     description: DAO governance — staking, proposals, voting
 */

// ── POST /stake ─────────────────────────────────────────────────────────────
router.post('/stake', authRequired, async (req, res) => {
  try {
    const { amount, walletAddress, txHash } = req.body;
    if (!amount || !walletAddress) return res.status(400).json({ error: 'amount and walletAddress required' });
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });

    let stake = await GovernanceStake.findOne({ userId: req.user.id, status: 'staked' });
    if (stake) {
      stake.stakedAmount += amt;
      stake.votingPower = stake.stakedAmount;
      stake.txHash = txHash;
      await stake.save();
    } else {
      stake = await GovernanceStake.create({
        userId: req.user.id, walletAddress: walletAddress.toLowerCase(),
        stakedAmount: amt, votingPower: amt, txHash, status: 'staked',
      });
    }
    return res.json({ success: true, data: stake });
  } catch (error) {
    logger.error('Stake error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /unstake ───────────────────────────────────────────────────────────
router.post('/unstake', authRequired, async (req, res) => {
  try {
    const { amount } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const stake = await GovernanceStake.findOne({ userId: req.user.id, status: 'staked' });
    if (!stake) return res.status(404).json({ error: 'No active stake found' });
    if (stake.stakedAmount < amt) return res.status(400).json({ error: 'Insufficient staked amount' });
    if (stake.unstakeRequestedAt) return res.status(400).json({ error: 'Unstake already pending' });

    stake.unstakeRequestedAt = new Date();
    const cooldown = stake.cooldownDays || 7;
    stake.unstakeAvailableAt = new Date(Date.now() + cooldown * 86400000);
    stake.stakedAmount -= amt;
    stake.votingPower = stake.stakedAmount;
    if (stake.stakedAmount === 0) stake.status = 'unstaking';
    await stake.save();

    return res.json({ success: true, data: stake });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /stake/:userId ──────────────────────────────────────────────────────
router.get('/stake/:userId', async (req, res) => {
  try {
    const stake = await GovernanceStake.findOne({ userId: req.params.userId }).lean();
    return res.json({ success: true, data: stake || { stakedAmount: 0, votingPower: 0 } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /proposals/create ──────────────────────────────────────────────────
router.post('/proposals/create', authRequired, async (req, res) => {
  try {
    const { title, description, options, votingPeriodDays = 7, quorumRequired = 100 } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title and description required' });

    const stake = await GovernanceStake.findOne({ userId: req.user.id, status: 'staked' });
    if (!stake || stake.votingPower < 100) {
      return res.status(403).json({ error: 'Minimum 100 staked CRAFTS required to create proposals' });
    }

    const proposal = await GovernanceProposal.create({
      proposalId: `CCP-${uuidv4().slice(0, 8).toUpperCase()}`,
      creatorId: req.user.id,
      title, description,
      options: options || ['For', 'Against', 'Abstain'],
      votingStartsAt: new Date(),
      votingEndsAt: new Date(Date.now() + votingPeriodDays * 86400000),
      quorumRequired: Number(quorumRequired),
    });
    return res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    logger.error('Proposal create error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /proposals ──────────────────────────────────────────────────────────
router.get('/proposals', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [proposals, total] = await Promise.all([
      GovernanceProposal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      GovernanceProposal.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { proposals, total, page: Number(page) } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /proposals/:id/vote ────────────────────────────────────────────────
router.post('/proposals/:id/vote', authRequired, async (req, res) => {
  try {
    const proposal = await GovernanceProposal.findOne({ proposalId: req.params.id });
    if (!proposal || proposal.status !== 'active') return res.status(404).json({ error: 'Active proposal not found' });
    if (new Date() > proposal.votingEndsAt) return res.status(400).json({ error: 'Voting period ended' });

    const existing = await GovernanceVoteRecord.findOne({ proposalId: req.params.id, voterId: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already voted' });

    const stake = await GovernanceStake.findOne({ userId: req.user.id, status: 'staked' });
    if (!stake || stake.votingPower <= 0) return res.status(403).json({ error: 'No voting power' });

    const { option, walletAddress } = req.body;
    if (!option) return res.status(400).json({ error: 'option required' });

    const vote = await GovernanceVoteRecord.create({
      proposalId: req.params.id, voterId: req.user.id,
      voterWallet: (walletAddress || '').toLowerCase(),
      option, votingPower: stake.votingPower,
    });

    proposal.totalVotesCast++;
    proposal.totalVotingPower += stake.votingPower;
    await proposal.save();

    return res.json({ success: true, data: vote });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /proposals/:id/results ──────────────────────────────────────────────
router.get('/proposals/:id/results', async (req, res) => {
  try {
    const proposal = await GovernanceProposal.findOne({ proposalId: req.params.id }).lean();
    if (!proposal) return res.status(404).json({ error: 'Not found' });

    const votes = await GovernanceVoteRecord.find({ proposalId: req.params.id }).lean();
    const tally = {};
    for (const v of votes) {
      tally[v.option] = (tally[v.option] || 0) + v.votingPower;
    }

    return res.json({
      success: true,
      data: {
        proposal, totalVotes: votes.length,
        results: Object.entries(tally).map(([option, power]) => ({ option, power })).sort((a, b) => b.power - a.power),
        quorumMet: proposal.totalVotingPower >= proposal.quorumRequired,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /proposals/:id/execute ─────────────────────────────────────────────
router.post('/proposals/:id/execute', authRequired, async (req, res) => {
  try {
    const proposal = await GovernanceProposal.findOne({ proposalId: req.params.id });
    if (!proposal) return res.status(404).json({ error: 'Not found' });
    if (proposal.status !== 'active' && proposal.status !== 'passed') return res.status(400).json({ error: 'Cannot execute' });
    if (new Date() <= proposal.votingEndsAt) return res.status(400).json({ error: 'Voting still active' });

    if (proposal.totalVotingPower < proposal.quorumRequired) {
      proposal.status = 'expired';
      await proposal.save();
      return res.json({ success: true, data: { status: 'expired', reason: 'Quorum not met' } });
    }

    // Check majority
    const votes = await GovernanceVoteRecord.find({ proposalId: req.params.id }).lean();
    const forPower = votes.filter(v => v.option === 'For').reduce((s, v) => s + v.votingPower, 0);
    const againstPower = votes.filter(v => v.option === 'Against').reduce((s, v) => s + v.votingPower, 0);

    if (forPower > againstPower) {
      proposal.status = 'executed';
      proposal.executedAt = new Date();
    } else {
      proposal.status = 'rejected';
    }
    await proposal.save();

    return res.json({ success: true, data: { status: proposal.status, forPower, againstPower } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
