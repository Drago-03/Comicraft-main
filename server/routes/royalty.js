/**
 * Royalty Routes — /api/v1/nft/royalty
 * 
 * Configure royalty splits, view royalty config and earnings history.
 * Extends existing NFT royalty functionality with enhanced split configuration.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const RoyaltyConfig = require('../models/RoyaltyConfig');
const RoyaltyTransaction = require('../models/RoyaltyTransaction');
const CreatorEarnings = require('../models/CreatorEarnings');
const Nft = require('../models/Nft');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Royalty
 *     description: Secondary royalty engine — configure splits, view earnings
 */

// ── POST /api/v1/nft/royalty/configure ──────────────────────────────────────
/**
 * @swagger
 * /api/v1/nft/royalty/configure:
 *   post:
 *     tags: [Royalty]
 *     summary: Configure royalty split for an NFT
 *     description: |
 *       Creator sets royalty percentage (5-10%) and split ratios at mint time.
 *       Splits: creator %, platform %, agent treasury %.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nftId, royaltyPercentage, creatorWallet, splits]
 *             properties:
 *               nftId:
 *                 type: string
 *               royaltyPercentage:
 *                 type: number
 *                 minimum: 5
 *                 maximum: 10
 *               creatorWallet:
 *                 type: string
 *               splits:
 *                 type: object
 *                 properties:
 *                   creator:
 *                     type: number
 *                     description: Creator share percentage (e.g. 70)
 *                   platform:
 *                     type: number
 *                     description: Platform share percentage (e.g. 20)
 *                   agent:
 *                     type: number
 *                     description: Agent treasury share percentage (e.g. 10)
 *               platformTreasury:
 *                 type: string
 *               agentTreasury:
 *                 type: string
 *     responses:
 *       201:
 *         description: Royalty configured
 *       400:
 *         description: Invalid input
 */
router.post('/configure', authRequired, async (req, res) => {
  try {
    const {
      nftId,
      royaltyPercentage,
      creatorWallet,
      splits = {},
      platformTreasury,
      agentTreasury,
    } = req.body;

    // Validation
    if (!nftId || !creatorWallet) {
      return res.status(400).json({ error: 'nftId and creatorWallet are required' });
    }

    const pct = Number(royaltyPercentage);
    if (!Number.isFinite(pct) || pct < 5 || pct > 10) {
      return res.status(400).json({ error: 'royaltyPercentage must be between 5 and 10' });
    }

    const creatorSplit = Number(splits.creator) || 70;
    const platformSplit = Number(splits.platform) || 20;
    const agentSplit = Number(splits.agent) || 10;

    if (creatorSplit + platformSplit + agentSplit !== 100) {
      return res.status(400).json({ error: 'Split percentages must total 100' });
    }

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(creatorWallet)) {
      return res.status(400).json({ error: 'Invalid creatorWallet address' });
    }

    // Check NFT exists
    const nft = await Nft.findById(nftId);
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    // Check ownership
    if (nft.mintedBy.toString() !== req.user.id && nft.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the NFT creator or owner can configure royalties' });
    }

    // Create or update royalty config
    const config = await RoyaltyConfig.findOneAndUpdate(
      { nftId: nft._id },
      {
        nftId: nft._id,
        storyId: nft.storyId,
        creatorWallet: creatorWallet.toLowerCase(),
        royaltyPercentage: pct,
        isActive: true,
        platformTreasury: platformTreasury?.toLowerCase() || process.env.PLATFORM_TREASURY_ADDRESS || '',
        agentTreasury: agentTreasury?.toLowerCase() || '',
        creatorSplitPercent: creatorSplit,
        platformSplitPercent: platformSplit,
        agentSplitPercent: agentSplit,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Link config to NFT
    nft.royaltyConfigId = config._id;
    nft.royaltyPercentage = pct;
    nft.royaltyRecipient = creatorWallet.toLowerCase();
    await nft.save();

    logger.info('Royalty configured', {
      component: 'royalty',
      nftId,
      royaltyPercentage: pct,
      splits: { creatorSplit, platformSplit, agentSplit },
    });

    return res.status(201).json({
      success: true,
      message: 'Royalty configuration saved',
      data: config,
    });
  } catch (error) {
    logger.error('Royalty configure error', { component: 'royalty', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/v1/nft/:tokenId/royalty ────────────────────────────────────────
/**
 * @swagger
 * /api/v1/nft/{tokenId}/royalty:
 *   get:
 *     tags: [Royalty]
 *     summary: Get royalty config and earnings history for an NFT
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Royalty info returned
 *       404:
 *         description: NFT not found
 */
router.get('/:tokenId/royalty', async (req, res) => {
  try {
    const nft = await Nft.findOne({ tokenId: req.params.tokenId });
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    const config = await RoyaltyConfig.findOne({ nftId: nft._id, isActive: true });
    const transactions = await RoyaltyTransaction.find({ nftId: nft._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalEarnings = transactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.royaltyAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        tokenId: req.params.tokenId,
        config: config || null,
        totalEarnings,
        transactionCount: transactions.length,
        transactions,
      },
    });
  } catch (error) {
    logger.error('Royalty fetch error', { component: 'royalty', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/v1/nft/royalty/earnings/:userId ────────────────────────────────
/**
 * @swagger
 * /api/v1/nft/royalty/earnings/{userId}:
 *   get:
 *     tags: [Royalty]
 *     summary: Get total royalty earnings for a creator
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Earnings returned
 */
router.get('/earnings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all NFTs minted by this user
    const nfts = await Nft.find({ mintedBy: userId }).select('_id tokenId').lean();
    const nftIds = nfts.map(n => n._id);

    // Get all completed royalty transactions for these NFTs
    const transactions = await RoyaltyTransaction.find({
      nftId: { $in: nftIds },
      status: 'completed',
    }).sort({ createdAt: -1 }).lean();

    const totalEarnings = transactions.reduce((sum, tx) => sum + (tx.royaltyAmount || 0), 0);
    const totalSales = transactions.length;

    // Get per-NFT breakdown
    const perNft = {};
    for (const tx of transactions) {
      const key = tx.nftId.toString();
      if (!perNft[key]) {
        perNft[key] = { nftId: key, earnings: 0, sales: 0 };
      }
      perNft[key].earnings += tx.royaltyAmount || 0;
      perNft[key].sales++;
    }

    return res.json({
      success: true,
      data: {
        userId,
        totalEarnings,
        totalSales,
        nftCount: nfts.length,
        perNft: Object.values(perNft),
        recentTransactions: transactions.slice(0, 20),
      },
    });
  } catch (error) {
    logger.error('Earnings fetch error', { component: 'royalty', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
