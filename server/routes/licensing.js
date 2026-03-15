/**
 * IP Licensing Marketplace Routes — /api/v1/licensing
 *
 * Create listings, browse, submit offers, accept/reject, view agreements.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { LicenseListing, LicenseOffer, LicenseAgreement } = require('../models/ctp-models');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Licensing
 *     description: IP licensing marketplace — list, offer, agree
 */

// ── POST /list ──────────────────────────────────────────────────────────────
router.post('/list', authRequired, async (req, res) => {
  try {
    const { title, description, contentType, genre, licenseType, price, currency, usageRights, territory, duration, nftId, storyId, coverImage } = req.body;
    if (!title || !licenseType || price == null) return res.status(400).json({ error: 'title, licenseType, price required' });
    if (!['exclusive', 'non-exclusive', 'time-limited'].includes(licenseType)) return res.status(400).json({ error: 'Invalid licenseType' });

    const listing = await LicenseListing.create({
      creatorId: req.user.id, nftId, storyId, title, description, contentType, genre,
      licenseType, price: Number(price), currency: currency || 'CRAFTS',
      usageRights: usageRights || [], territory: territory || 'worldwide',
      duration, status: 'active', coverImage,
    });
    return res.status(201).json({ success: true, data: listing });
  } catch (error) {
    logger.error('Licensing list error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /browse ─────────────────────────────────────────────────────────────
router.get('/browse', async (req, res) => {
  try {
    const { contentType, licenseType, minPrice, maxPrice, usageRight, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };
    if (contentType) filter.contentType = contentType;
    if (licenseType) filter.licenseType = licenseType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (usageRight) filter.usageRights = usageRight;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      LicenseListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      LicenseListing.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { listings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /offer/:listingId ──────────────────────────────────────────────────
router.post('/offer/:listingId', authRequired, async (req, res) => {
  try {
    const listing = await LicenseListing.findById(req.params.listingId);
    if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Listing not found or inactive' });
    if (listing.creatorId === req.user.id) return res.status(400).json({ error: 'Cannot offer on your own listing' });

    const { proposedPrice, proposedTerms, usageRights, territory, duration, message, licenseeWallet } = req.body;
    if (!proposedPrice) return res.status(400).json({ error: 'proposedPrice required' });

    const offer = await LicenseOffer.create({
      listingId: listing._id, licenseeId: req.user.id, licenseeWallet,
      proposedPrice: Number(proposedPrice), proposedTerms, usageRights, territory, duration, message,
    });
    return res.status(201).json({ success: true, data: offer });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /accept/:offerId ───────────────────────────────────────────────────
router.post('/accept/:offerId', authRequired, async (req, res) => {
  try {
    const offer = await LicenseOffer.findById(req.params.offerId).populate('listingId');
    if (!offer || offer.status !== 'pending') return res.status(404).json({ error: 'Offer not found' });

    const listing = offer.listingId;
    if (listing.creatorId !== req.user.id) return res.status(403).json({ error: 'Only listing creator can accept' });

    offer.status = 'accepted';
    await offer.save();

    const agreement = await LicenseAgreement.create({
      listingId: listing._id, offerId: offer._id,
      licensorId: listing.creatorId, licenseeId: offer.licenseeId,
      licenseeWallet: offer.licenseeWallet, price: offer.proposedPrice,
      currency: listing.currency, usageRights: offer.usageRights || listing.usageRights,
      territory: offer.territory || listing.territory,
      endDate: offer.duration ? new Date(Date.now() + offer.duration * 86400000) : null,
    });

    if (listing.licenseType === 'exclusive') {
      listing.status = 'licensed';
      await listing.save();
    }

    return res.json({ success: true, data: agreement });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /reject/:offerId ───────────────────────────────────────────────────
router.post('/reject/:offerId', authRequired, async (req, res) => {
  try {
    const offer = await LicenseOffer.findById(req.params.offerId).populate('listingId');
    if (!offer || offer.status !== 'pending') return res.status(404).json({ error: 'Offer not found' });
    if (offer.listingId.creatorId !== req.user.id) return res.status(403).json({ error: 'Only creator can reject' });

    offer.status = 'rejected';
    await offer.save();
    return res.json({ success: true, message: 'Offer rejected' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /agreements/:userId ─────────────────────────────────────────────────
router.get('/agreements/:userId', async (req, res) => {
  try {
    const agreements = await LicenseAgreement.find({
      $or: [{ licensorId: req.params.userId }, { licenseeId: req.params.userId }],
    }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: agreements });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
