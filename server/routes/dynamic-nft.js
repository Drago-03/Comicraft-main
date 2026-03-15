/**
 * Dynamic NFT Routes — /api/v1/nft/dynamic
 *
 * Configure evolution rules, trigger evolutions, manage votes, view history.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { EvolutionConfig, EvolutionHistory, EvolutionVote } = require('../models/ctp-models');
const Nft = require('../models/Nft');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Dynamic NFT
 *     description: Evolving NFTs — timed, voted, seasonal, milestone
 */

// ── POST /configure ─────────────────────────────────────────────────────────
router.post('/configure', authRequired, async (req, res) => {
  try {
    const { nftId, evolutionType, schedule, maxEvolutions = 10, contentType = 'story', milestoneThresholds } = req.body;
    if (!nftId || !evolutionType) return res.status(400).json({ error: 'nftId and evolutionType required' });
    if (!['timed', 'voted', 'seasonal', 'milestone'].includes(evolutionType)) return res.status(400).json({ error: 'Invalid evolutionType' });
    if (evolutionType === 'timed' && !schedule) return res.status(400).json({ error: 'schedule required for timed' });

    const nft = await Nft.findById(nftId);
    if (!nft) return res.status(404).json({ error: 'NFT not found' });
    if (nft.mintedBy.toString() !== req.user.id) return res.status(403).json({ error: 'Only creator can configure' });

    const config = await EvolutionConfig.findOneAndUpdate(
      { nftId: nft._id },
      { nftId: nft._id, tokenId: nft.tokenId, creatorId: req.user.id, evolutionType, schedule: schedule || null, maxEvolutions, contentType, isActive: true, milestoneThresholds: milestoneThresholds || [] },
      { upsert: true, new: true }
    );
    return res.status(201).json({ success: true, data: config });
  } catch (error) {
    logger.error('Evolution config error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /:tokenId/evolve ──────────────────────────────────────────────────
router.post('/:tokenId/evolve', authRequired, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { newContent, newMetadataUri, description } = req.body;
    if (!newContent || !newMetadataUri) return res.status(400).json({ error: 'newContent and newMetadataUri required' });

    const config = await EvolutionConfig.findOne({ tokenId, isActive: true });
    if (!config) return res.status(404).json({ error: 'No evolution config found' });
    if (config.creatorId !== req.user.id) return res.status(403).json({ error: 'Only creator can evolve' });
    if (config.currentEvolution >= config.maxEvolutions) return res.status(400).json({ error: 'Max evolutions reached' });

    const nft = await Nft.findOne({ tokenId });
    if (!nft) return res.status(404).json({ error: 'NFT not found' });

    config.currentEvolution++;
    await config.save();

    const history = await EvolutionHistory.create({
      nftId: nft._id, tokenId, evolutionNumber: config.currentEvolution,
      contentAfter: newContent, metadataUriAfter: newMetadataUri, triggeredBy: 'creator', description,
    });

    if (!nft.metadata) nft.metadata = {};
    nft.metadata.content = newContent;
    nft.metadata.evolutionCount = config.currentEvolution;
    await nft.save();

    return res.json({ success: true, data: { tokenId, evolutionNumber: config.currentEvolution, history } });
  } catch (error) {
    logger.error('Evolution trigger error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /:tokenId/history ───────────────────────────────────────────────────
router.get('/:tokenId/history', async (req, res) => {
  try {
    const config = await EvolutionConfig.findOne({ tokenId: req.params.tokenId }).lean();
    const history = await EvolutionHistory.find({ tokenId: req.params.tokenId }).sort({ evolutionNumber: 1 }).lean();
    return res.json({ success: true, data: { tokenId: req.params.tokenId, config, history } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /:tokenId/vote ─────────────────────────────────────────────────────
router.post('/:tokenId/vote', authRequired, async (req, res) => {
  try {
    const { option, walletAddress } = req.body;
    if (!option || !walletAddress) return res.status(400).json({ error: 'option and walletAddress required' });

    const config = await EvolutionConfig.findOne({ tokenId: req.params.tokenId, isActive: true });
    if (!config) return res.status(404).json({ error: 'No evolution config found' });
    if (config.evolutionType !== 'voted') return res.status(400).json({ error: 'Not a voted evolution' });

    const votingRound = config.currentEvolution + 1;
    const existing = await EvolutionVote.findOne({ tokenId: req.params.tokenId, voterId: req.user.id, votingRound });
    if (existing) return res.status(400).json({ error: 'Already voted in this round' });

    const vote = await EvolutionVote.create({
      nftId: config.nftId, tokenId: req.params.tokenId, voterId: req.user.id,
      voterWallet: walletAddress.toLowerCase(), option, votingRound,
    });
    return res.json({ success: true, data: vote });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /:tokenId/vote/results ──────────────────────────────────────────────
router.get('/:tokenId/vote/results', async (req, res) => {
  try {
    const config = await EvolutionConfig.findOne({ tokenId: req.params.tokenId }).lean();
    const votingRound = config ? config.currentEvolution + 1 : 1;
    const votes = await EvolutionVote.find({ tokenId: req.params.tokenId, votingRound }).lean();

    const tally = {};
    for (const v of votes) { tally[v.option] = (tally[v.option] || 0) + 1; }

    return res.json({
      success: true,
      data: {
        tokenId: req.params.tokenId, votingRound, totalVotes: votes.length,
        results: Object.entries(tally).map(([option, count]) => ({ option, count })).sort((a, b) => b.count - a.count),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
