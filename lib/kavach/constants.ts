// ============================================================================
// KAVACH Phase 1 — Constants & Legal References
// ============================================================================

export const PIPELINE_STEPS = [
  { step: 0, name: 'Queued', key: 'queued', icon: '○' },
  { step: 1, name: 'Entity Scan', key: 'entity_scan', icon: '◉' },
  { step: 2, name: 'Text Scan', key: 'text_scan', icon: '◉' },
  { step: 3, name: 'Scoring', key: 'scoring', icon: '◉' },
  { step: 4, name: 'Tier Assignment', key: 'assigning_tier', icon: '◉' },
  { step: 5, name: 'Audit & Seal', key: 'completed', icon: '◉' },
] as const;

export const RISK_LEVELS = {
  critical: { label: 'Critical', color: '#dc2626', deduction: 15 },
  high: { label: 'High', color: '#ea580c', deduction: 10 },
  medium: { label: 'Medium', color: '#ca8a04', deduction: 5 },
} as const;

export const TEXT_MATCH_DEDUCTIONS = {
  80: 20,  // >80% similarity
  60: 10,  // >60% similarity
  40: 5,   // >40% similarity
} as const;

export const LICENSE_TIERS = {
  1: { code: 'original_full', name: 'Original — Full Rights', color: '#22c55e', minScore: 90, maxScore: 100 },
  2: { code: 'original_personal', name: 'Original — Personal Use', color: '#3b82f6', minScore: 70, maxScore: 89 },
  3: { code: 'inspired_attribution', name: 'Inspired — Attribution Required', color: '#f59e0b', minScore: 50, maxScore: 69 },
  4: { code: 'blocked', name: 'Blocked — Cannot Mint', color: '#ef4444', minScore: 0, maxScore: 49 },
} as const;

export const ENTITY_CATEGORIES = [
  { key: 'marvel', label: 'Marvel', count: 2000, color: '#e23636' },
  { key: 'dc', label: 'DC Comics', count: 1500, color: '#0476F2' },
  { key: 'disney', label: 'Disney / Pixar', count: 1500, color: '#006e99' },
  { key: 'anime', label: 'Anime / Manga', count: 2000, color: '#ff6b9d' },
  { key: 'tolkien', label: 'Tolkien Estate', count: 1000, color: '#8b6914' },
  { key: 'indian_ip', label: 'Indian IP', count: 1500, color: '#ff9933' },
  { key: 'other', label: 'Other Major IP', count: 500, color: '#6b7280' },
] as const;

export const ENTITY_TYPES = [
  { key: 'character', label: 'Character' },
  { key: 'place', label: 'Place / Location' },
  { key: 'object', label: 'Object / Item' },
  { key: 'catchphrase', label: 'Catchphrase' },
  { key: 'franchise', label: 'Franchise' },
  { key: 'visual_signature', label: 'Visual Signature' },
] as const;

export const LEGAL_REFERENCES = {
  india: {
    copyright_act_s14: { title: 'Copyright Act 1957, §14', desc: "Author's exclusive rights" },
    copyright_act_s51: { title: 'Copyright Act 1957, §51', desc: 'Infringement provisions' },
    copyright_act_s52: { title: 'Copyright Act 1957, §52', desc: 'Fair dealing exceptions' },
    it_act_s79: { title: 'IT Act 2000, §79', desc: 'Safe harbour for intermediaries' },
    trademark_act_s29: { title: 'Trademark Act 1999, §29', desc: 'Trademark infringement' },
    dpiit_2025: { title: 'DPIIT 2025 Guidelines', desc: 'AI/Copyright & human authorship' },
  },
  international: {
    dmca_512: { title: 'DMCA §512', desc: 'Safe harbour & takedown procedures' },
    dmca_512_c3: { title: 'DMCA §512(c)(3)', desc: 'Valid notice requirements' },
    berne_article_2: { title: 'Berne Convention, Art. 2(3)', desc: 'Derivative works' },
    berne_article_6bis: { title: 'Berne Convention, Art. 6bis', desc: 'Moral rights' },
    eu_dsa: { title: 'EU Digital Services Act', desc: 'Platform content obligations' },
  },
} as const;

export const COMPLIANCE_BADGES = [
  { key: 'india_copyright', label: 'India Copyright Act', icon: '🇮🇳', flag: 'india_copyright_act_s51' },
  { key: 'india_it_act', label: 'IT Act §79 Safe Harbor', icon: '🛡️', flag: 'india_it_act_s79' },
  { key: 'dmca', label: 'DMCA §512', icon: '🇺🇸', flag: 'dmca_512_safe_harbor' },
  { key: 'berne', label: 'Berne Convention', icon: '🌍', flag: 'berne_convention' },
  { key: 'eu_dsa', label: 'EU DSA', icon: '🇪🇺', flag: 'eu_dsa' },
  { key: 'dpiit', label: 'DPIIT 2025', icon: '🤖', flag: 'india_dpiit_2025' },
] as const;

export const WARRANTY_TEXT = `I, the creator, warrant and represent that: (a) the content submitted is my original work or properly licensed; (b) it does not infringe any copyright, trademark, or other intellectual property right of any third party under the laws of India (Copyright Act 1957, Trademark Act 1999) or any other jurisdiction; (c) I am the identifiable human author as required under Indian copyright law (DPIIT 2025 guidelines); (d) any AI-assisted generation was directed by me and I accept authorship responsibility.`;

export const INDEMNIFICATION_TEXT = `I agree to indemnify, defend, and hold harmless Comicraft, its officers, directors, and affiliates from any claims, damages, losses, or expenses (including reasonable legal fees) arising from any breach of the above warranties or any third-party IP infringement claim related to my content. This indemnification survives termination of my account.`;

export const AI_DISCLOSURE_TEXT = `I acknowledge that content on this platform may be AI-assisted. I confirm that as the human creator, I have exercised creative direction and editorial control over the final output, establishing my authorship under the Copyright Act 1957.`;

export const SIMILARITY_THRESHOLD = 0.6;
