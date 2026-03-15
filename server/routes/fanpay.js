/**
 * FanPay Tipping Routes — /api/v1/fanpay
 *
 * Tip creators, view tip history, top supporters leaderboard.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { Tip } = require('../models/ctp-models');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: FanPay
 *     description: FanPay tipping — readers tip creators in CRAFTS
 */

// ── POST /tip ───────────────────────────────────────────────────────────────
router.post('/tip', authRequired, async (req, res) => {
  try {
    const { recipientId, recipientWallet, amount, message, storyId, txHash } = req.body;
    if (!recipientId || !amount) return res.status(400).json({ error: 'recipientId and amount required' });
    if (recipientId === req.user.id) return res.status(400).json({ error: 'Cannot tip yourself' });

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) return res.status(400).json({ error: 'Minimum tip is 1 CRAFTS' });

    const tip = await Tip.create({
      senderId: req.user.id, senderWallet: req.user.walletAddress,
      recipientId, recipientWallet, amount: amt,
      message: message ? message.slice(0, 280) : null,
      txHash, storyId,
    });

    return res.status(201).json({ success: true, data: tip });
  } catch (error) {
    logger.error('Tip error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /tips/received/:userId ──────────────────────────────────────────────
router.get('/tips/received/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [tips, total] = await Promise.all([
      Tip.find({ recipientId: req.params.userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Tip.countDocuments({ recipientId: req.params.userId }),
    ]);
    const totalAmount = await Tip.aggregate([
      { $match: { recipientId: req.params.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.json({
      success: true,
      data: { tips, total, totalReceived: totalAmount[0]?.total || 0, page: Number(page) },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /tips/sent/:userId ──────────────────────────────────────────────────
router.get('/tips/sent/:userId', async (req, res) => {
  try {
    const tips = await Tip.find({ senderId: req.params.userId }).sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, data: tips });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /top-supporters/:creatorId ──────────────────────────────────────────
router.get('/top-supporters/:creatorId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const supporters = await Tip.aggregate([
      { $match: { recipientId: req.params.creatorId } },
      { $group: { _id: '$senderId', totalTipped: { $sum: '$amount' }, tipCount: { $sum: 1 } } },
      { $sort: { totalTipped: -1 } },
      { $limit: Number(limit) },
    ]);

    return res.json({
      success: true,
      data: supporters.map((s, i) => ({ rank: i + 1, userId: s._id, totalTipped: s.totalTipped, tipCount: s.tipCount })),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
