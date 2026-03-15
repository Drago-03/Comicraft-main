/**
 * Creator Fund & Grants Routes — /api/v1/fund
 *
 * Configure fund, view balance, apply for grants, approve/reject.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { FundTransaction, GrantApplication } = require('../models/ctp-models');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Fund
 *     description: Creator fund & grants — fund management, grant lifecycle
 */

// In-memory fund config (would be in DB/config in production)
let fundConfig = {
  feeContributionPercent: 5,
  topCreatorGrant: { min: 8000, max: 15000 },
  emergingCreatorGrant: { min: 4000, max: 9000 },
};

// ── POST /configure ─────────────────────────────────────────────────────────
router.post('/configure', authRequired, async (req, res) => {
  try {
    // Admin-only
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { feeContributionPercent, topCreatorGrant, emergingCreatorGrant } = req.body;
    if (feeContributionPercent != null) fundConfig.feeContributionPercent = Number(feeContributionPercent);
    if (topCreatorGrant) fundConfig.topCreatorGrant = topCreatorGrant;
    if (emergingCreatorGrant) fundConfig.emergingCreatorGrant = emergingCreatorGrant;
    return res.json({ success: true, data: fundConfig });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /balance ────────────────────────────────────────────────────────────
router.get('/balance', async (req, res) => {
  try {
    const deposits = await FundTransaction.aggregate([
      { $match: { type: { $in: ['deposit', 'fee_contribution'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const disbursed = await FundTransaction.aggregate([
      { $match: { type: 'grant' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIn = deposits[0]?.total || 0;
    const totalOut = disbursed[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        currentBalance: totalIn - totalOut,
        totalDeposited: totalIn,
        totalDisbursed: totalOut,
        config: fundConfig,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /grants ─────────────────────────────────────────────────────────────
router.get('/grants', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [grants, total] = await Promise.all([
      GrantApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      GrantApplication.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { grants, total, page: Number(page) } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /grants/apply ──────────────────────────────────────────────────────
router.post('/grants/apply', authRequired, async (req, res) => {
  try {
    const { projectTitle, projectDescription, requestedAmount, portfolioLink, category } = req.body;
    if (!projectTitle || !projectDescription || !requestedAmount) {
      return res.status(400).json({ error: 'projectTitle, projectDescription, requestedAmount required' });
    }
    const application = await GrantApplication.create({
      applicantId: req.user.id,
      applicantWallet: req.user.walletAddress,
      projectTitle, projectDescription,
      requestedAmount: Number(requestedAmount),
      portfolioLink, category: category || 'emerging_creator',
    });
    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /grants/approve/:applicationId ─────────────────────────────────────
router.post('/grants/approve/:applicationId', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const app = await GrantApplication.findById(req.params.applicationId);
    if (!app || app.status !== 'pending') return res.status(404).json({ error: 'Application not found or not pending' });

    const { approvedAmount, reviewerNotes, txHash } = req.body;
    app.status = 'approved';
    app.approvedAmount = Number(approvedAmount) || app.requestedAmount;
    app.reviewerNotes = reviewerNotes;
    app.approvedAt = new Date();
    app.txHash = txHash;
    await app.save();

    // Record fund transaction
    await FundTransaction.create({
      type: 'grant', amount: app.approvedAmount, currency: 'CRAFTS',
      toWallet: app.applicantWallet, grantApplicationId: app._id,
      txHash, note: `Grant approved: ${app.projectTitle}`,
    });

    return res.json({ success: true, data: app });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /grants/reject/:applicationId ──────────────────────────────────────
router.post('/grants/reject/:applicationId', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const app = await GrantApplication.findById(req.params.applicationId);
    if (!app || app.status !== 'pending') return res.status(404).json({ error: 'Not found' });
    app.status = 'rejected';
    app.reviewerNotes = req.body.reviewerNotes;
    await app.save();
    return res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
