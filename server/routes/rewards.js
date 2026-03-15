/**
 * Reader Rewards & Collect-to-Earn Routes — /api/v1/rewards
 *
 * Track reader actions, manage rewards, leaderboards, badges, streaks.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { RewardEvent, RewardBadge, UserStreak } = require('../models/ctp-models');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Rewards
 *     description: Reader rewards & collect-to-earn — earn CRAFTS for engagement
 */

// Reward rates per action
const REWARD_RATES = {
  read_story: 5,
  write_review: 15,
  share_story: 10,
  collect_nft: 25,
  daily_login: 3,
  reading_streak: 20,
};

// Badge definitions
const BADGE_DEFS = [
  { id: 'first_read', name: 'First Story', desc: 'Read your first story', category: 'reading', threshold: { actionType: 'read_story', count: 1 } },
  { id: 'bookworm', name: 'Bookworm', desc: 'Read 10 stories', category: 'reading', threshold: { actionType: 'read_story', count: 10 } },
  { id: 'bibliophile', name: 'Bibliophile', desc: 'Read 50 stories', category: 'reading', threshold: { actionType: 'read_story', count: 50 } },
  { id: 'first_review', name: 'Critic', desc: 'Write your first review', category: 'reviewing', threshold: { actionType: 'write_review', count: 1 } },
  { id: 'collector_5', name: 'Collector', desc: 'Collect 5 NFTs', category: 'collecting', threshold: { actionType: 'collect_nft', count: 5 } },
  { id: 'collector_25', name: 'Art Connoisseur', desc: 'Collect 25 NFTs', category: 'collecting', threshold: { actionType: 'collect_nft', count: 25 } },
  { id: 'streak_7', name: 'Weekly Warrior', desc: '7-day reading streak', category: 'streak', threshold: { streak: 7 } },
  { id: 'streak_30', name: 'Monthly Maven', desc: '30-day reading streak', category: 'streak', threshold: { streak: 30 } },
  { id: 'social_5', name: 'Spread the Word', desc: 'Share 5 stories', category: 'social', threshold: { actionType: 'share_story', count: 5 } },
];

// ── POST /track ─────────────────────────────────────────────────────────────
router.post('/track', authRequired, async (req, res) => {
  try {
    const { actionType, referenceId } = req.body;
    if (!actionType || !REWARD_RATES[actionType]) {
      return res.status(400).json({ error: `Invalid actionType. Must be: ${Object.keys(REWARD_RATES).join(', ')}` });
    }

    const amount = REWARD_RATES[actionType];

    const event = await RewardEvent.create({
      userId: req.user.id, actionType, amount, referenceId,
    });

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    let streak = await UserStreak.findOne({ userId: req.user.id });
    if (!streak) {
      streak = await UserStreak.create({ userId: req.user.id, currentStreak: 1, longestStreak: 1, lastActivityDate: today, totalActiveDays: 1 });
    } else if (streak.lastActivityDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (streak.lastActivityDate === yesterday) {
        streak.currentStreak++;
      } else {
        streak.currentStreak = 1;
      }
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.lastActivityDate = today;
      streak.totalActiveDays++;
      await streak.save();
    }

    // Check for new badges
    const newBadges = [];
    for (const badge of BADGE_DEFS) {
      const existingBadge = await RewardBadge.findOne({ userId: req.user.id, badgeId: badge.id });
      if (existingBadge) continue;

      let earned = false;
      if (badge.threshold.actionType) {
        const count = await RewardEvent.countDocuments({ userId: req.user.id, actionType: badge.threshold.actionType });
        earned = count >= badge.threshold.count;
      } else if (badge.threshold.streak) {
        earned = streak.currentStreak >= badge.threshold.streak;
      }

      if (earned) {
        await RewardBadge.create({ userId: req.user.id, badgeId: badge.id, badgeName: badge.name, badgeDescription: badge.desc, category: badge.category });
        newBadges.push(badge);
      }
    }

    return res.json({ success: true, data: { event, rewardAmount: amount, streak: streak.currentStreak, newBadges } });
  } catch (error) {
    logger.error('Reward track error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /balance/:userId ────────────────────────────────────────────────────
router.get('/balance/:userId', async (req, res) => {
  try {
    const unclaimed = await RewardEvent.aggregate([
      { $match: { userId: req.params.userId, claimed: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const claimed = await RewardEvent.aggregate([
      { $match: { userId: req.params.userId, claimed: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.json({
      success: true,
      data: {
        userId: req.params.userId,
        unclaimedBalance: unclaimed[0]?.total || 0,
        totalClaimed: claimed[0]?.total || 0,
        totalEarned: (unclaimed[0]?.total || 0) + (claimed[0]?.total || 0),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /claim ─────────────────────────────────────────────────────────────
router.post('/claim', authRequired, async (req, res) => {
  try {
    const unclaimed = await RewardEvent.find({ userId: req.user.id, claimed: false });
    if (unclaimed.length === 0) return res.status(400).json({ error: 'No unclaimed rewards' });

    const totalAmount = unclaimed.reduce((sum, e) => sum + e.amount, 0);
    const { txHash } = req.body;

    await RewardEvent.updateMany(
      { userId: req.user.id, claimed: false },
      { $set: { claimed: true, claimedAt: new Date(), txHash: txHash || null } }
    );

    return res.json({ success: true, data: { claimedAmount: totalAmount, eventsCount: unclaimed.length, txHash } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /leaderboard ────────────────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 20 } = req.query;
    const match = {};
    if (period === 'weekly') match.createdAt = { $gte: new Date(Date.now() - 7 * 86400000) };
    else if (period === 'monthly') match.createdAt = { $gte: new Date(Date.now() - 30 * 86400000) };

    const leaderboard = await RewardEvent.aggregate([
      { $match: match },
      { $group: { _id: '$userId', totalEarned: { $sum: '$amount' }, actions: { $sum: 1 } } },
      { $sort: { totalEarned: -1 } },
      { $limit: Number(limit) },
    ]);

    return res.json({ success: true, data: { period, leaderboard: leaderboard.map((l, i) => ({ rank: i + 1, userId: l._id, totalEarned: l.totalEarned, actions: l.actions })) } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /badges/:userId ─────────────────────────────────────────────────────
router.get('/badges/:userId', async (req, res) => {
  try {
    const badges = await RewardBadge.find({ userId: req.params.userId }).lean();
    return res.json({ success: true, data: { userId: req.params.userId, badges, availableBadges: BADGE_DEFS } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /streaks/:userId ────────────────────────────────────────────────────
router.get('/streaks/:userId', async (req, res) => {
  try {
    const streak = await UserStreak.findOne({ userId: req.params.userId }).lean();
    return res.json({ success: true, data: streak || { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
