/**
 * Serialized Subscriptions Routes — /api/v1/subscriptions
 *
 * Create series, publish episodes, subscribe/unsubscribe.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { Series, Subscription, Episode } = require('../models/ctp-models');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Subscriptions
 *     description: Serialized content subscriptions
 */

// ── POST /series/create ─────────────────────────────────────────────────────
router.post('/series/create', authRequired, async (req, res) => {
  try {
    const { title, description, coverImage, genre, contentType, releaseSchedule, pricePerEpisode, bundlePrice, freePreviewCount } = req.body;
    if (!title || pricePerEpisode == null) return res.status(400).json({ error: 'title and pricePerEpisode required' });

    const series = await Series.create({
      creatorId: req.user.id, title, description, coverImage, genre,
      contentType: contentType || 'story', releaseSchedule: releaseSchedule || 'weekly',
      pricePerEpisode: Number(pricePerEpisode), bundlePrice: bundlePrice ? Number(bundlePrice) : null,
      freePreviewCount: freePreviewCount != null ? Number(freePreviewCount) : 1,
    });
    return res.status(201).json({ success: true, data: series });
  } catch (error) {
    logger.error('Series create error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /series/:seriesId ───────────────────────────────────────────────────
router.get('/series/:seriesId', async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId).lean();
    if (!series) return res.status(404).json({ error: 'Series not found' });
    const episodes = await Episode.find({ seriesId: series._id }).sort({ episodeNumber: 1 }).lean();
    return res.json({ success: true, data: { series, episodes } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /series ─────────────────────────────────────────────────────────────
router.get('/series', async (req, res) => {
  try {
    const { genre, contentType, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };
    if (genre) filter.genre = genre;
    if (contentType) filter.contentType = contentType;
    const skip = (Number(page) - 1) * Number(limit);
    const [seriesList, total] = await Promise.all([
      Series.find(filter).sort({ subscriberCount: -1 }).skip(skip).limit(Number(limit)).lean(),
      Series.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { series: seriesList, total, page: Number(page) } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /subscribe/:seriesId ───────────────────────────────────────────────
router.post('/subscribe/:seriesId', authRequired, async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId);
    if (!series || series.status !== 'active') return res.status(404).json({ error: 'Series not found or inactive' });
    if (series.creatorId === req.user.id) return res.status(400).json({ error: 'Cannot subscribe to your own series' });

    const existing = await Subscription.findOne({ seriesId: series._id, subscriberId: req.user.id });
    if (existing && existing.status === 'active') return res.status(400).json({ error: 'Already subscribed' });

    const sub = existing
      ? await Subscription.findByIdAndUpdate(existing._id, { status: 'active', subscribedAt: new Date(), cancelledAt: null }, { new: true })
      : await Subscription.create({ seriesId: series._id, subscriberId: req.user.id, subscriberWallet: req.body.walletAddress });

    series.subscriberCount++;
    await series.save();

    return res.json({ success: true, data: sub });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /unsubscribe/:seriesId ─────────────────────────────────────────────
router.post('/unsubscribe/:seriesId', authRequired, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ seriesId: req.params.seriesId, subscriberId: req.user.id, status: 'active' });
    if (!sub) return res.status(404).json({ error: 'No active subscription found' });
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();

    await Series.findByIdAndUpdate(req.params.seriesId, { $inc: { subscriberCount: -1 } });

    return res.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /my ─────────────────────────────────────────────────────────────────
router.get('/my', authRequired, async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriberId: req.user.id, status: 'active' }).populate('seriesId').lean();
    return res.json({ success: true, data: subs });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /series/:seriesId/release ──────────────────────────────────────────
router.post('/series/:seriesId/release', authRequired, async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId);
    if (!series) return res.status(404).json({ error: 'Series not found' });
    if (series.creatorId !== req.user.id) return res.status(403).json({ error: 'Only creator can release episodes' });

    const { title, content, storyId } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    series.totalEpisodes++;
    const isFree = series.totalEpisodes <= series.freePreviewCount;

    const episode = await Episode.create({
      seriesId: series._id, episodeNumber: series.totalEpisodes,
      title, content, storyId, isFreePreview: isFree,
    });
    await series.save();

    return res.status(201).json({ success: true, data: episode });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
