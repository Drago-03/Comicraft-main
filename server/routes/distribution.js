/**
 * Cross-Platform NFT Distribution Routes — /api/v1/distribution
 *
 * List NFTs on OpenSea, Rarible, and Blur marketplaces.
 * Tracks listing status and aggregates analytics.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { DistributionListing } = require('../models/ctp-models');
const Nft = require('../models/Nft');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * @swagger
 * tags:
 *   - name: Distribution
 *     description: Cross-platform NFT distribution to OpenSea, Rarible, Blur
 */

// ── Marketplace clients ─────────────────────────────────────────────────────

const MARKETPLACE_CLIENTS = {
  opensea: {
    name: 'OpenSea',
    async createListing(tokenId, nftContractAddress, price, currency) {
      const apiKey = process.env.OPENSEA_API_KEY;
      if (!apiKey) throw new Error('OPENSEA_API_KEY not configured');

      // OpenSea API v2 via Seaport protocol
      const response = await axios.post(
        'https://api.opensea.io/v2/orders/ethereum/seaport/listings',
        {
          parameters: {
            offerer: nftContractAddress,
            offer: [{
              token: nftContractAddress,
              identifierOrCriteria: tokenId,
              itemType: 2, // ERC721
            }],
            consideration: [{
              amount: String(Math.floor(price * 1e18)),
              token: '0x0000000000000000000000000000000000000000', // ETH
            }],
          },
        },
        {
          headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      return { externalListingId: response.data?.order?.order_hash, listingUrl: `https://opensea.io/assets/ethereum/${nftContractAddress}/${tokenId}` };
    },
    async cancelListing(externalListingId) {
      const apiKey = process.env.OPENSEA_API_KEY;
      if (!apiKey) throw new Error('OPENSEA_API_KEY not configured');
      await axios.delete(`https://api.opensea.io/v2/orders/ethereum/seaport/${externalListingId}`, {
        headers: { 'X-API-KEY': apiKey },
        timeout: 15000,
      });
    },
  },

  rarible: {
    name: 'Rarible',
    async createListing(tokenId, nftContractAddress, price) {
      const apiKey = process.env.RARIBLE_API_KEY;
      if (!apiKey) throw new Error('RARIBLE_API_KEY not configured');

      const response = await axios.post(
        'https://api.rarible.org/v0.1/orders/sell',
        {
          type: 'RARIBLE_V2',
          make: { assetType: { assetClass: 'ERC721', contract: nftContractAddress, tokenId }, value: '1' },
          take: { assetType: { assetClass: 'ETH' }, value: String(Math.floor(price * 1e18)) },
        },
        {
          headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      return { externalListingId: response.data?.id, listingUrl: `https://rarible.com/token/${nftContractAddress}:${tokenId}` };
    },
    async cancelListing(externalListingId) {
      const apiKey = process.env.RARIBLE_API_KEY;
      if (!apiKey) throw new Error('RARIBLE_API_KEY not configured');
      await axios.post(`https://api.rarible.org/v0.1/orders/${externalListingId}/cancel`, {}, {
        headers: { 'X-API-KEY': apiKey },
        timeout: 15000,
      });
    },
  },

  blur: {
    name: 'Blur',
    async createListing(tokenId, nftContractAddress, price) {
      const apiKey = process.env.BLUR_API_KEY;
      if (!apiKey) throw new Error('BLUR_API_KEY not configured');

      const response = await axios.post(
        'https://api.blur.io/v1/listings',
        { contractAddress: nftContractAddress, tokenId, price: String(price), marketplace: 'blur' },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      return { externalListingId: response.data?.listingId, listingUrl: `https://blur.io/asset/${nftContractAddress}/${tokenId}` };
    },
    async cancelListing(externalListingId) {
      const apiKey = process.env.BLUR_API_KEY;
      if (!apiKey) throw new Error('BLUR_API_KEY not configured');
      await axios.delete(`https://api.blur.io/v1/listings/${externalListingId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 15000,
      });
    },
  },
};

// ── POST /api/v1/distribution/list ──────────────────────────────────────────
/**
 * @swagger
 * /api/v1/distribution/list:
 *   post:
 *     tags: [Distribution]
 *     summary: List NFT on external marketplaces
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nftId, price]
 *             properties:
 *               nftId:
 *                 type: string
 *               price:
 *                 type: number
 *                 description: Price in ETH
 *               marketplaces:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [opensea, rarible, blur]
 *                 default: [opensea, rarible, blur]
 *     responses:
 *       200:
 *         description: Distribution results
 *       400:
 *         description: Invalid input
 */
router.post('/list', authRequired, async (req, res) => {
  try {
    const { nftId, price, marketplaces = ['opensea', 'rarible', 'blur'] } = req.body;

    if (!nftId || !price) {
      return res.status(400).json({ error: 'nftId and price are required' });
    }

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const nft = await Nft.findById(nftId);
    if (!nft) return res.status(404).json({ error: 'NFT not found' });
    if (nft.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not the owner of this NFT' });
    }

    const nftContractAddress = process.env.STORY_NFT_CONTRACT_ADDRESS || process.env.ETH_MAINNET_NFT_CONTRACT_ADDRESS;
    const results = [];

    for (const mp of marketplaces) {
      const client = MARKETPLACE_CLIENTS[mp];
      if (!client) {
        results.push({ marketplace: mp, status: 'failed', error: `Unknown marketplace: ${mp}` });
        continue;
      }

      try {
        const { externalListingId, listingUrl } = await client.createListing(
          nft.tokenId, nftContractAddress, priceNum
        );

        const listing = await DistributionListing.findOneAndUpdate(
          { nftId: nft._id, marketplace: mp },
          {
            nftId: nft._id,
            tokenId: nft.tokenId,
            marketplace: mp,
            externalListingId,
            status: 'listed',
            listingUrl,
            price: priceNum,
            currency: 'ETH',
          },
          { upsert: true, new: true }
        );

        results.push({ marketplace: mp, status: 'listed', listingUrl, listingId: listing._id });
      } catch (err) {
        logger.error(`Distribution listing failed on ${mp}`, { component: 'distribution', error: err.message });

        await DistributionListing.findOneAndUpdate(
          { nftId: nft._id, marketplace: mp },
          { status: 'failed', errorMessage: err.message },
          { upsert: true, new: true }
        );

        results.push({ marketplace: mp, status: 'failed', error: err.message });
      }
    }

    return res.json({ success: true, data: { nftId, tokenId: nft.tokenId, results } });
  } catch (error) {
    logger.error('Distribution list error', { component: 'distribution', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/v1/distribution/:tokenId/status ────────────────────────────────
/**
 * @swagger
 * /api/v1/distribution/{tokenId}/status:
 *   get:
 *     tags: [Distribution]
 *     summary: Get listing status across all marketplaces
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status returned
 */
router.get('/:tokenId/status', async (req, res) => {
  try {
    const listings = await DistributionListing.find({ tokenId: req.params.tokenId }).lean();
    return res.json({
      success: true,
      data: {
        tokenId: req.params.tokenId,
        listings: listings.map(l => ({
          marketplace: l.marketplace,
          status: l.status,
          listingUrl: l.listingUrl,
          price: l.price,
          updatedAt: l.updatedAt,
        })),
      },
    });
  } catch (error) {
    logger.error('Distribution status error', { component: 'distribution', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/v1/distribution/:tokenId ────────────────────────────────────
/**
 * @swagger
 * /api/v1/distribution/{tokenId}:
 *   delete:
 *     tags: [Distribution]
 *     summary: Delist from all external marketplaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delisted
 */
router.delete('/:tokenId', authRequired, async (req, res) => {
  try {
    const listings = await DistributionListing.find({
      tokenId: req.params.tokenId,
      status: 'listed',
    });

    const results = [];
    for (const listing of listings) {
      const client = MARKETPLACE_CLIENTS[listing.marketplace];
      if (!client) continue;

      try {
        await client.cancelListing(listing.externalListingId);
        listing.status = 'delisted';
        await listing.save();
        results.push({ marketplace: listing.marketplace, status: 'delisted' });
      } catch (err) {
        results.push({ marketplace: listing.marketplace, status: 'failed', error: err.message });
      }
    }

    return res.json({ success: true, data: { tokenId: req.params.tokenId, results } });
  } catch (error) {
    logger.error('Distribution delist error', { component: 'distribution', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/v1/distribution/:tokenId/analytics ────────────────────────────
/**
 * @swagger
 * /api/v1/distribution/{tokenId}/analytics:
 *   get:
 *     tags: [Distribution]
 *     summary: Aggregated analytics from all marketplaces
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/:tokenId/analytics', async (req, res) => {
  try {
    const listings = await DistributionListing.find({ tokenId: req.params.tokenId }).lean();

    const analytics = {
      tokenId: req.params.tokenId,
      totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
      totalOffers: listings.reduce((sum, l) => sum + (l.offers || 0), 0),
      marketplaces: listings.map(l => ({
        marketplace: l.marketplace,
        status: l.status,
        views: l.views || 0,
        offers: l.offers || 0,
        listingUrl: l.listingUrl,
      })),
    };

    return res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Distribution analytics error', { component: 'distribution', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
