/**
 * SDK API Routes — White-Label Creative Studio
 *
 * Provides API key management, white-label content generation, usage tracking,
 * and billing endpoints for B2B integrations.
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { apiKeyAuth, TIER_LIMITS } = require('../middleware/apiKey');
const { ApiKey, ApiUsage } = require('../models/ctp-models');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: SDK
 *     description: White-label creative studio SDK — API keys, generation, billing
 */

// ── Health & Docs (unchanged) ───────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', sdk_version: process.env.SDK_VERSION || 'v2.0.0', timestamp: new Date().toISOString() });
});

router.get('/docs', (req, res) => {
  res.json({
    name: 'Comicraft SDK',
    version: process.env.SDK_VERSION || 'v2.0.0',
    description: 'White-label creative studio API — AI stories, comics, and poetry generation',
    endpoints: {
      stories: '/sdk/v1/stories',
      ai: '/sdk/v1/ai',
      nft: '/sdk/v1/nft',
      apiKeys: '/sdk/v1/api-keys',
      generate: { story: '/sdk/v1/generate/story', comic: '/sdk/v1/generate/comic', poetry: '/sdk/v1/generate/poetry' },
      usage: '/sdk/v1/usage/:apiKey',
      billing: '/sdk/v1/billing/charge',
    },
    tiers: { free: { rate: '100/day', price: 'Free' }, pro: { rate: '10,000/day', price: '500 CRAFTS/mo' }, enterprise: { rate: 'Unlimited', price: 'Custom' } },
    documentation: 'https://docs.comicraft.com/sdk',
  });
});

// ── Existing SDK routes ─────────────────────────────────────────────────────
router.use('/stories', require('./stories'));
router.use('/ai', require('./ai'));
router.use('/nft', require('./nft'));

// ══════════════════════════════════════════════════════════════════════════════
// WHITE-LABEL ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// ── POST /api-keys — Register for an API key ────────────────────────────────
router.post('/api-keys', authRequired, async (req, res) => {
  try {
    const { name, tier = 'free', allowedDomains } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    // Generate a secure API key
    const key = `cc_${tier}_${crypto.randomBytes(24).toString('hex')}`;

    const apiKey = await ApiKey.create({
      key, name, ownerId: req.user.id, ownerEmail: req.user.email || '',
      tier, rateLimitPerDay: TIER_LIMITS[tier] || 100,
      allowedDomains: allowedDomains || [],
    });

    return res.status(201).json({
      success: true,
      data: {
        key: apiKey.key,
        name: apiKey.name,
        tier: apiKey.tier,
        rateLimitPerDay: apiKey.rateLimitPerDay,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    logger.error('API key creation error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api-keys — List your API keys ──────────────────────────────────────
router.get('/api-keys', authRequired, async (req, res) => {
  try {
    const keys = await ApiKey.find({ ownerId: req.user.id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: keys });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api-keys/:keyId — Deactivate API key ────────────────────────────
router.delete('/api-keys/:keyId', authRequired, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.keyId);
    if (!apiKey || apiKey.ownerId !== req.user.id) return res.status(404).json({ error: 'API key not found' });
    apiKey.isActive = false;
    await apiKey.save();
    return res.json({ success: true, message: 'API key deactivated' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /generate/story — White-label story generation ─────────────────────
router.post('/generate/story', apiKeyAuth, async (req, res) => {
  try {
    const { orchestrateGeneration } = require('../services/ai-orchestrator');
    const { userInput = '', config = {} } = req.body;
    config.mode = config.mode || 'story-only';
    config.primaryGenre = config.primaryGenre || 'fantasy';

    const result = await orchestrateGeneration({
      userInput, config, streaming: false,
      correlationId: `sdk-${Date.now()}`,
    });

    return res.json({ success: true, data: result, tier: req.apiKeyTier });
  } catch (error) {
    logger.error('SDK story generate error', { error: error.message });
    return res.status(500).json({ error: 'Generation failed' });
  }
});

// ── POST /generate/comic — White-label comic generation ─────────────────────
router.post('/generate/comic', apiKeyAuth, async (req, res) => {
  try {
    const { orchestrateGeneration } = require('../services/ai-orchestrator');
    const { userInput = '', config = {} } = req.body;
    config.mode = 'comic-only';

    const result = await orchestrateGeneration({
      userInput, config, streaming: false,
      correlationId: `sdk-comic-${Date.now()}`,
    });

    return res.json({ success: true, data: result, tier: req.apiKeyTier });
  } catch (error) {
    return res.status(500).json({ error: 'Comic generation failed' });
  }
});

// ── POST /generate/poetry — White-label poetry generation ───────────────────
router.post('/generate/poetry', apiKeyAuth, async (req, res) => {
  try {
    const geminiService = require('../services/geminiService');
    const { form = 'free_verse', theme = 'nature', mood = 'contemplative' } = req.body;

    const prompt = `You are KavyaScript. Generate a ${form} poem. Theme: ${theme}. Mood: ${mood}. Return only the poem.`;
    const poem = await geminiService.generateContent({ prompt, config: { temperature: 0.9 } });

    return res.json({ success: true, data: { poem: poem.trim(), form, theme, mood, engine: 'KavyaScript' }, tier: req.apiKeyTier });
  } catch (error) {
    return res.status(500).json({ error: 'Poetry generation failed' });
  }
});

// ── GET /usage/:key — Usage statistics ──────────────────────────────────────
router.get('/usage/:key', authRequired, async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({ key: req.params.key, ownerId: req.user.id });
    if (!apiKey) return res.status(404).json({ error: 'API key not found' });

    const today = new Date().toISOString().slice(0, 10);
    const [todayCount, totalUsage, last7Days] = await Promise.all([
      ApiUsage.countDocuments({ apiKeyId: apiKey._id, date: today }),
      ApiUsage.countDocuments({ apiKeyId: apiKey._id }),
      ApiUsage.aggregate([
        { $match: { apiKeyId: apiKey._id, date: { $gte: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10) } } },
        { $group: { _id: '$date', count: { $sum: 1 }, avgResponseTime: { $avg: '$responseTimeMs' } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        key: apiKey.key, tier: apiKey.tier, rateLimitPerDay: apiKey.rateLimitPerDay,
        todayUsage: todayCount, totalUsage, last7Days,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /billing/charge — Billing (placeholder) ────────────────────────────
router.post('/billing/charge', authRequired, async (req, res) => {
  try {
    const { apiKeyId, tier } = req.body;
    // In production, integrate with Stripe or CRAFTS payment
    return res.json({
      success: true,
      message: 'Billing endpoint ready. Integrate with Stripe or CRAFTS payments.',
      tiers: { free: 'Free', pro: '500 CRAFTS/mo', enterprise: 'Custom pricing' },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
