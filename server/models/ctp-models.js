/**
 * CTP (Creativity Tokenization Platform) Models
 * 
 * All new Mongoose models for CTP features:
 * - Distribution, Dynamic NFTs, Licensing, API Keys,
 * - Governance, Fund, Rewards, Subscriptions, FanPay
 */

const mongoose = require('mongoose');

// ══════════════════════════════════════════════════════════════════════════════
// DISTRIBUTION — Cross-Platform NFT Listings
// ══════════════════════════════════════════════════════════════════════════════

const DistributionListingSchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', required: true, index: true },
  tokenId: { type: String, required: true, index: true },
  marketplace: { type: String, enum: ['opensea', 'rarible', 'blur'], required: true },
  externalListingId: { type: String },
  status: { type: String, enum: ['pending', 'listed', 'sold', 'delisted', 'failed'], default: 'pending', index: true },
  listingUrl: { type: String },
  price: { type: Number },
  currency: { type: String, default: 'ETH' },
  views: { type: Number, default: 0 },
  offers: { type: Number, default: 0 },
  errorMessage: { type: String },
}, { timestamps: true });
DistributionListingSchema.index({ nftId: 1, marketplace: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════════════════
// DYNAMIC NFTS — Evolving Content
// ══════════════════════════════════════════════════════════════════════════════

const EvolutionConfigSchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', required: true, unique: true },
  tokenId: { type: String, required: true, index: true },
  creatorId: { type: String, required: true, index: true },
  evolutionType: { type: String, enum: ['timed', 'voted', 'seasonal', 'milestone'], required: true },
  schedule: { type: String }, // cron expression for timed
  maxEvolutions: { type: Number, default: 10 },
  currentEvolution: { type: Number, default: 0 },
  contentType: { type: String, enum: ['story', 'comic', 'poetry'], default: 'story' },
  isActive: { type: Boolean, default: true },
  nextEvolutionAt: { type: Date },
  milestoneThresholds: [{ type: Number }], // collector count thresholds for milestone type
}, { timestamps: true });

const EvolutionHistorySchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', required: true, index: true },
  tokenId: { type: String, required: true },
  evolutionNumber: { type: Number, required: true },
  contentBefore: { type: String },
  contentAfter: { type: String },
  metadataUriBefore: { type: String },
  metadataUriAfter: { type: String },
  triggeredBy: { type: String, enum: ['creator', 'schedule', 'vote', 'milestone'], required: true },
  txHash: { type: String },
  description: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
EvolutionHistorySchema.index({ nftId: 1, evolutionNumber: -1 });

const EvolutionVoteSchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', required: true, index: true },
  tokenId: { type: String, required: true },
  voterId: { type: String, required: true },
  voterWallet: { type: String, required: true, lowercase: true },
  option: { type: String, required: true },
  votingRound: { type: Number, default: 1 },
}, { timestamps: { createdAt: true, updatedAt: false } });
EvolutionVoteSchema.index({ nftId: 1, voterId: 1, votingRound: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════════════════
// IP LICENSING — Marketplace for Creative Licenses
// ══════════════════════════════════════════════════════════════════════════════

const LicenseListingSchema = new mongoose.Schema({
  creatorId: { type: String, required: true, index: true },
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft' },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  title: { type: String, required: true },
  description: { type: String },
  contentType: { type: String, enum: ['story', 'comic', 'poetry', 'character', 'world'], default: 'story' },
  genre: { type: String },
  licenseType: { type: String, enum: ['exclusive', 'non-exclusive', 'time-limited'], required: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['CRAFTS', 'ETH'], default: 'CRAFTS' },
  usageRights: [{ type: String, enum: ['game', 'film', 'book', 'merchandise', 'music', 'other'] }],
  territory: { type: String, default: 'worldwide' },
  duration: { type: Number }, // days, null = perpetual
  status: { type: String, enum: ['active', 'licensed', 'expired', 'withdrawn'], default: 'active', index: true },
  coverImage: { type: String },
}, { timestamps: true });
LicenseListingSchema.index({ status: 1, contentType: 1, licenseType: 1 });

const LicenseOfferSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LicenseListing', required: true, index: true },
  licenseeId: { type: String, required: true, index: true },
  licenseeWallet: { type: String, lowercase: true },
  proposedPrice: { type: Number, required: true },
  proposedTerms: { type: String },
  usageRights: [{ type: String }],
  territory: { type: String },
  duration: { type: Number },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'], default: 'pending', index: true },
  message: { type: String },
}, { timestamps: true });

const LicenseAgreementSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LicenseListing', required: true },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LicenseOffer', required: true },
  licensorId: { type: String, required: true, index: true },
  licenseeId: { type: String, required: true, index: true },
  licensorWallet: { type: String, lowercase: true },
  licenseeWallet: { type: String, lowercase: true },
  termsHash: { type: String }, // IPFS hash of full terms
  txHash: { type: String }, // on-chain transaction
  price: { type: Number, required: true },
  currency: { type: String, default: 'CRAFTS' },
  usageRights: [{ type: String }],
  territory: { type: String },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }, // null = perpetual
  status: { type: String, enum: ['active', 'expired', 'terminated'], default: 'active', index: true },
}, { timestamps: true });

// ══════════════════════════════════════════════════════════════════════════════
// WHITE-LABEL SDK — API Keys & Usage
// ══════════════════════════════════════════════════════════════════════════════

const ApiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  ownerId: { type: String, required: true, index: true },
  ownerEmail: { type: String, required: true },
  tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  rateLimitPerDay: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  allowedDomains: [{ type: String }],
  lastUsedAt: { type: Date },
  totalRequests: { type: Number, default: 0 },
}, { timestamps: true });

const ApiUsageSchema = new mongoose.Schema({
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', required: true, index: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number },
  responseTimeMs: { type: Number },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD for daily aggregation
}, { timestamps: { createdAt: true, updatedAt: false } });
ApiUsageSchema.index({ apiKeyId: 1, date: 1 });

// ══════════════════════════════════════════════════════════════════════════════
// DAO GOVERNANCE — Staking, Proposals, Voting
// ══════════════════════════════════════════════════════════════════════════════

const GovernanceStakeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  walletAddress: { type: String, required: true, lowercase: true, index: true },
  stakedAmount: { type: Number, required: true, min: 0 },
  votingPower: { type: Number, default: 0 },
  stakeDate: { type: Date, default: Date.now },
  unstakeRequestedAt: { type: Date },
  unstakeAvailableAt: { type: Date },
  cooldownDays: { type: Number, default: 7 },
  txHash: { type: String },
  status: { type: String, enum: ['staked', 'unstaking', 'unstaked'], default: 'staked', index: true },
}, { timestamps: true });

const GovernanceProposalSchema = new mongoose.Schema({
  proposalId: { type: String, unique: true, required: true },
  creatorId: { type: String, required: true, index: true },
  creatorWallet: { type: String, lowercase: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: [{ type: String }],
  votingStartsAt: { type: Date, required: true },
  votingEndsAt: { type: Date, required: true },
  quorumRequired: { type: Number, default: 100 },
  totalVotesCast: { type: Number, default: 0 },
  totalVotingPower: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'passed', 'rejected', 'executed', 'expired'], default: 'active', index: true },
  executedAt: { type: Date },
  txHash: { type: String },
}, { timestamps: true });

const GovernanceVoteRecordSchema = new mongoose.Schema({
  proposalId: { type: String, required: true, index: true },
  voterId: { type: String, required: true },
  voterWallet: { type: String, required: true, lowercase: true },
  option: { type: String, required: true },
  votingPower: { type: Number, required: true },
  txHash: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
GovernanceVoteRecordSchema.index({ proposalId: 1, voterId: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════════════════
// CREATOR FUND & GRANTS
// ══════════════════════════════════════════════════════════════════════════════

const FundTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['deposit', 'grant', 'withdrawal', 'fee_contribution'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'CRAFTS' },
  fromWallet: { type: String, lowercase: true },
  toWallet: { type: String, lowercase: true },
  relatedSaleId: { type: String }, // marketplace listing ID that triggered fee
  grantApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrantApplication' },
  txHash: { type: String },
  note: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
FundTransactionSchema.index({ type: 1, createdAt: -1 });

const GrantApplicationSchema = new mongoose.Schema({
  applicantId: { type: String, required: true, index: true },
  applicantWallet: { type: String, lowercase: true },
  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  requestedAmount: { type: Number, required: true, min: 0 },
  portfolioLink: { type: String },
  category: { type: String, enum: ['top_creator', 'emerging_creator', 'community', 'innovation'], default: 'emerging_creator' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'funded'], default: 'pending', index: true },
  reviewerNotes: { type: String },
  approvedAmount: { type: Number },
  approvedAt: { type: Date },
  txHash: { type: String },
}, { timestamps: true });

// ══════════════════════════════════════════════════════════════════════════════
// READER REWARDS & COLLECT-TO-EARN
// ══════════════════════════════════════════════════════════════════════════════

const RewardEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  actionType: {
    type: String,
    enum: ['read_story', 'write_review', 'share_story', 'collect_nft', 'daily_login', 'reading_streak'],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  referenceId: { type: String }, // story ID, NFT ID, etc.
  claimed: { type: Boolean, default: false, index: true },
  claimedAt: { type: Date },
  txHash: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
RewardEventSchema.index({ userId: 1, claimed: 1 });
RewardEventSchema.index({ userId: 1, actionType: 1, createdAt: -1 });

const RewardBadgeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  badgeId: { type: String, required: true },
  badgeName: { type: String, required: true },
  badgeDescription: { type: String },
  category: { type: String, enum: ['reading', 'reviewing', 'collecting', 'streak', 'social'], default: 'reading' },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: false });
RewardBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const UserStreakSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: String }, // YYYY-MM-DD
  totalActiveDays: { type: Number, default: 0 },
}, { timestamps: true });

// ══════════════════════════════════════════════════════════════════════════════
// SERIALIZED SUBSCRIPTIONS & FANPAY
// ══════════════════════════════════════════════════════════════════════════════

const SeriesSchema = new mongoose.Schema({
  creatorId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  genre: { type: String },
  contentType: { type: String, enum: ['story', 'comic', 'poetry'], default: 'story' },
  releaseSchedule: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly'], default: 'weekly' },
  pricePerEpisode: { type: Number, required: true, min: 0 },
  bundlePrice: { type: Number }, // optional discounted price for full subscription
  freePreviewCount: { type: Number, default: 1, min: 0 },
  totalEpisodes: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active', index: true },
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true, index: true },
  subscriberId: { type: String, required: true, index: true },
  subscriberWallet: { type: String, lowercase: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active', index: true },
  subscribedAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date },
  lastChargedAt: { type: Date },
  totalPaid: { type: Number, default: 0 },
}, { timestamps: true });
SubscriptionSchema.index({ seriesId: 1, subscriberId: 1 }, { unique: true });

const EpisodeSchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true, index: true },
  episodeNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  isFreePreview: { type: Boolean, default: false },
  releasedAt: { type: Date, default: Date.now },
}, { timestamps: true });
EpisodeSchema.index({ seriesId: 1, episodeNumber: 1 }, { unique: true });

const TipSchema = new mongoose.Schema({
  senderId: { type: String, required: true, index: true },
  senderWallet: { type: String, lowercase: true },
  recipientId: { type: String, required: true, index: true },
  recipientWallet: { type: String, lowercase: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'CRAFTS' },
  message: { type: String, maxlength: 280 },
  txHash: { type: String },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
}, { timestamps: { createdAt: true, updatedAt: false } });
TipSchema.index({ recipientId: 1, createdAt: -1 });
TipSchema.index({ senderId: 1, createdAt: -1 });

// ══════════════════════════════════════════════════════════════════════════════
// MODEL REGISTRATION — idempotent (safe to re-require)
// ══════════════════════════════════════════════════════════════════════════════

const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

module.exports = {
  DistributionListing: model('DistributionListing', DistributionListingSchema),
  EvolutionConfig: model('EvolutionConfig', EvolutionConfigSchema),
  EvolutionHistory: model('EvolutionHistory', EvolutionHistorySchema),
  EvolutionVote: model('EvolutionVote', EvolutionVoteSchema),
  LicenseListing: model('LicenseListing', LicenseListingSchema),
  LicenseOffer: model('LicenseOffer', LicenseOfferSchema),
  LicenseAgreement: model('LicenseAgreement', LicenseAgreementSchema),
  ApiKey: model('ApiKey', ApiKeySchema),
  ApiUsage: model('ApiUsage', ApiUsageSchema),
  GovernanceStake: model('GovernanceStake', GovernanceStakeSchema),
  GovernanceProposal: model('GovernanceProposal', GovernanceProposalSchema),
  GovernanceVoteRecord: model('GovernanceVoteRecord', GovernanceVoteRecordSchema),
  FundTransaction: model('FundTransaction', FundTransactionSchema),
  GrantApplication: model('GrantApplication', GrantApplicationSchema),
  RewardEvent: model('RewardEvent', RewardEventSchema),
  RewardBadge: model('RewardBadge', RewardBadgeSchema),
  UserStreak: model('UserStreak', UserStreakSchema),
  Series: model('Series', SeriesSchema),
  Subscription: model('Subscription', SubscriptionSchema),
  Episode: model('Episode', EpisodeSchema),
  Tip: model('Tip', TipSchema),
};
