/**
 * API Key Middleware — White-Label SDK Authentication
 *
 * Validates API keys, enforces tier-based rate limits, tracks usage.
 */

const { ApiKey, ApiUsage } = require('../models/ctp-models');

const TIER_LIMITS = {
  free: 100,       // requests per day
  pro: 10000,
  enterprise: Infinity,
};

async function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;

  if (!key) {
    return res.status(401).json({ error: 'API key required. Pass via X-API-KEY header or api_key query param.' });
  }

  try {
    const apiKey = await ApiKey.findOne({ key, isActive: true });
    if (!apiKey) {
      return res.status(403).json({ error: 'Invalid or deactivated API key' });
    }

    // Check rate limit
    const today = new Date().toISOString().slice(0, 10);
    const todayUsage = await ApiUsage.countDocuments({ apiKeyId: apiKey._id, date: today });
    const limit = TIER_LIMITS[apiKey.tier] || TIER_LIMITS.free;

    if (todayUsage >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        tier: apiKey.tier,
        resetAt: `${today}T23:59:59Z`,
      });
    }

    // Attach apiKey to request
    req.apiKey = apiKey;
    req.apiKeyTier = apiKey.tier;

    // Track usage asynchronously (don't block response)
    const startTime = Date.now();
    res.on('finish', () => {
      ApiUsage.create({
        apiKeyId: apiKey._id,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs: Date.now() - startTime,
        date: today,
      }).catch(() => {}); // swallow errors in usage tracking

      // Update last used
      ApiKey.findByIdAndUpdate(apiKey._id, {
        lastUsedAt: new Date(),
        $inc: { totalRequests: 1 },
      }).catch(() => {});
    });

    next();
  } catch (error) {
    return res.status(500).json({ error: 'API key validation failed' });
  }
}

module.exports = { apiKeyAuth, TIER_LIMITS };
