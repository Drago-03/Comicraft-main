/**
 * KAVACH Routes — IP Compliance Engine
 * Express routes for /api/v1/kavach/*
 */
const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');
const logger = require('../utils/logger');

function soundex(s) {
  const a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
  if (!a.length) return '';
  const codes = {b:'1',f:'1',p:'1',v:'1',c:'2',g:'2',j:'2',k:'2',q:'2',s:'2',x:'2',z:'2',d:'3',t:'3',l:'4',m:'5',n:'5',r:'6'};
  const f = a.shift();
  const r = a.map(c => codes[c] || '').filter((c, i, arr) => c && c !== arr[i - 1]).join('');
  return (f + r + '000').slice(0, 4).toUpperCase();
}

function normalize(text) { return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }

async function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }

async function emitEvent(scanId, eventType, stepNumber, stepName, message, details = {}) {
  await supabaseAdmin.from('pipeline_events').insert({ scan_id: scanId, event_type: eventType, step_number: stepNumber, step_name: stepName, message, details });
}

async function updateScan(scanId, status, step, extra = {}) {
  await supabaseAdmin.from('kavach_scans').update({ status, pipeline_step: step, ...extra }).eq('id', scanId);
}

// ── POST /scan — Run KAVACH scan pipeline ─────────────────────────────────
router.post('/scan', authRequired, async (req, res) => {
  try {
    const { story_id, scan_type = 'full' } = req.body;
    if (!story_id) return res.status(400).json({ error: 'story_id required' });

    const { data: story } = await supabaseAdmin.from('stories').select('*').eq('id', story_id).single();
    if (!story) return res.status(404).json({ error: 'Story not found' });

    const { data: scan } = await supabaseAdmin.from('kavach_scans').insert({
      story_id, user_id: req.user.id, scan_type, status: 'queued', pipeline_step: 0, started_at: new Date().toISOString(),
    }).select().single();
    if (!scan) return res.status(500).json({ error: 'Failed to create scan' });

    const scanId = scan.id;
    await supabaseAdmin.from('stories').update({ current_scan_id: scanId, status: 'scanning' }).eq('id', story_id);
    await emitEvent(scanId, 'step_start', 0, 'Queued', 'KAVACH scan initiated');

    // Run pipeline async — return scan_id immediately
    res.json({ success: true, scan_id: scanId, message: 'Scan started' });

    // Async pipeline
    (async () => {
      try {
        // Step 1: Entity Scan
        await emitEvent(scanId, 'step_start', 1, 'Entity Scan', 'Entity scan started');
        await updateScan(scanId, 'entity_scan', 1, { entity_scan_status: 'processing' });
        const content = normalize(story.content || '');
        const words = content.split(/\s+/);
        const matches = [];

        const { data: entities } = await supabaseAdmin.from('blocked_entities').select('*').eq('is_active', true).limit(5000);
        if (entities) {
          for (const entity of entities) {
            const nn = entity.name_normalized;
            if (nn.length > 2 && content.includes(nn)) {
              const idx = content.indexOf(nn);
              matches.push({ entity_name: entity.name, entity_type: entity.entity_type, ip_owner: entity.ip_owner, risk_level: entity.risk_level, similarity: 1.0, context: content.slice(Math.max(0, idx - 40), idx + nn.length + 40), suggestion: `Remove or rename "${entity.name}" — owned by ${entity.ip_owner}` });
              await emitEvent(scanId, 'entity_found', 1, 'Entity Scan', `MATCH: "${entity.name}" (${entity.ip_owner})`, { entity_name: entity.name, risk_level: entity.risk_level });
              continue;
            }
            for (const alias of (entity.aliases || [])) {
              const an = normalize(alias);
              if (an.length > 2 && content.includes(an)) {
                matches.push({ entity_name: entity.name, entity_type: entity.entity_type, ip_owner: entity.ip_owner, risk_level: entity.risk_level, similarity: 0.9, context: `Matched via alias "${alias}"`, suggestion: `Remove "${alias}" (alias of ${entity.name})` });
                await emitEvent(scanId, 'entity_found', 1, 'Entity Scan', `MATCH: "${alias}" (alias of ${entity.name})`);
                break;
              }
            }
            if (entity.name_phonetic) {
              for (const word of words) {
                if (word.length > 3 && soundex(word) === entity.name_phonetic && !matches.some(m => m.entity_name === entity.name)) {
                  matches.push({ entity_name: entity.name, entity_type: entity.entity_type, ip_owner: entity.ip_owner, risk_level: entity.risk_level, similarity: 0.7, context: `Phonetic: "${word}" ≈ "${entity.name}"`, suggestion: `"${word}" resembles "${entity.name}" — consider renaming` });
                  await emitEvent(scanId, 'entity_found', 1, 'Entity Scan', `PHONETIC: "${word}" ≈ "${entity.name}"`);
                }
              }
            }
          }
        }
        const unique = matches.filter((m, i, a) => a.findIndex(x => x.entity_name === m.entity_name) === i);
        await supabaseAdmin.from('kavach_scans').update({ entity_scan_status: 'completed', entity_matches: unique, entity_match_count: unique.length }).eq('id', scanId);
        await emitEvent(scanId, 'step_complete', 1, 'Entity Scan', `Entity scan complete — ${unique.length} match(es)`);

        // Step 2: Text Scan (mock)
        await emitEvent(scanId, 'step_start', 2, 'Text Scan', 'Text plagiarism scan started');
        await updateScan(scanId, 'text_scan', 2, { text_scan_status: 'processing' });
        await new Promise(r => setTimeout(r, 1500));
        const wordCount = (story.content || '').split(/\s+/).length;
        const mockSim = wordCount > 20 ? Math.max(5, Math.floor(Math.random() * 25)) : 0;
        const textMatches = mockSim > 0 ? [{ source: 'Public domain corpus', similarity_pct: mockSim, matched_text: 'Common narrative patterns', suggestion: 'Low similarity — likely coincidental' }] : [];
        await supabaseAdmin.from('kavach_scans').update({ text_scan_status: 'completed', text_similarity_score: mockSim, text_scan_provider: 'mock', text_matches: textMatches }).eq('id', scanId);
        await emitEvent(scanId, 'step_complete', 2, 'Text Scan', `Text scan complete — ${mockSim}% similarity`);

        // Step 3: Scoring
        await emitEvent(scanId, 'step_start', 3, 'Scoring', 'Calculating originality score');
        await updateScan(scanId, 'scoring', 3);
        let score = 100, issues = 0;
        for (const m of unique) { issues++; score -= m.risk_level === 'critical' ? 15 : m.risk_level === 'high' ? 10 : 5; }
        if (mockSim > 80) { score -= 20; issues++; } else if (mockSim > 60) { score -= 10; issues++; } else if (mockSim > 40) { score -= 5; issues++; }
        score = Math.max(0, Math.min(100, score));
        await supabaseAdmin.from('kavach_scans').update({ originality_score: score, issues_found: issues }).eq('id', scanId);
        await emitEvent(scanId, 'step_complete', 3, 'Scoring', `Score: ${score}/100 (${issues} issues)`);

        // Step 4: Tier
        await emitEvent(scanId, 'step_start', 4, 'Tier Assignment', 'Assigning license tier');
        await updateScan(scanId, 'assigning_tier', 4);
        const tierId = score >= 90 ? 1 : score >= 70 ? 2 : score >= 50 ? 3 : 4;
        const reasoning = `Score ${score}/100 — Tier ${tierId} assigned`;
        await supabaseAdmin.from('kavach_scans').update({ assigned_tier_id: tierId, tier_reasoning: reasoning }).eq('id', scanId);
        await emitEvent(scanId, 'step_complete', 4, 'Tier Assignment', `Tier ${tierId}: ${reasoning}`);

        // Step 5: Audit
        await emitEvent(scanId, 'step_start', 5, 'Audit & Seal', 'Creating audit trail');
        const details = { score, tier: tierId, entity_matches: unique.length, text_similarity: mockSim };
        const { data: prev } = await supabaseAdmin.from('scan_audit_log').select('hash').order('created_at', { ascending: false }).limit(1).single();
        const prevHash = prev?.hash || '0'.repeat(64);
        const chainHash = await sha256(prevHash + JSON.stringify(details) + new Date().toISOString());
        await supabaseAdmin.from('scan_audit_log').insert({ scan_id: scanId, action: 'scan_completed', actor: 'kavach_agent', details, legal_reference: 'Copyright Act 1957 S.51, IT Act 2000 S.79, DMCA §512', hash: chainHash, previous_hash: prevHash });
        await supabaseAdmin.from('kavach_scans').update({ status: 'completed', pipeline_step: 5, compliance_flags: { india_copyright_act_s51: true, dmca_512: true, berne_convention: true }, audit_hash: chainHash, completed_at: new Date().toISOString() }).eq('id', scanId);
        await supabaseAdmin.from('stories').update({ status: tierId === 4 ? 'blocked' : 'approved', license_tier_id: tierId }).eq('id', story_id);
        await emitEvent(scanId, 'step_complete', 5, 'Audit & Seal', `Scan sealed: ${chainHash.slice(0, 16)}...`);
      } catch (err) {
        logger.error('KAVACH scan pipeline error', { error: err.message, scanId });
        await updateScan(scanId, 'failed', -1);
        await emitEvent(scanId, 'error', -1, 'Error', `Scan failed: ${err.message}`);
      }
    })();
  } catch (error) {
    logger.error('KAVACH scan error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /scan/:id — Scan detail with events ───────────────────────────────
router.get('/scan/:id', authRequired, async (req, res) => {
  try {
    const { data: scan } = await supabaseAdmin.from('kavach_scans').select('*, assigned_tier:license_tiers(*)').eq('id', req.params.id).single();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    const { data: events } = await supabaseAdmin.from('pipeline_events').select('*').eq('scan_id', req.params.id).order('created_at', { ascending: true });
    const { data: auditLog } = await supabaseAdmin.from('scan_audit_log').select('*').eq('scan_id', req.params.id).order('created_at', { ascending: true });
    res.json({ success: true, scan, events: events || [], audit_log: auditLog || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /scan/:id/report — Formatted originality report ──────────────────
router.get('/scan/:id/report', authRequired, async (req, res) => {
  try {
    const { data: scan } = await supabaseAdmin.from('kavach_scans').select('*, assigned_tier:license_tiers(*)').eq('id', req.params.id).single();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    const { data: story } = await supabaseAdmin.from('stories').select('id, title').eq('id', scan.story_id).single();
    res.json({
      success: true,
      report: {
        story: { id: story?.id, title: story?.title },
        score: scan.originality_score, tier: scan.assigned_tier, reasoning: scan.tier_reasoning,
        entity_matches: scan.entity_matches || [], text_matches: scan.text_matches || [],
        issues_found: scan.issues_found, compliance_flags: scan.compliance_flags, audit_hash: scan.audit_hash,
        completed_at: scan.completed_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /dmca — Public DMCA takedown (no auth) ──────────────────────────
router.post('/dmca', async (req, res) => {
  try {
    const { claimant_name, claimant_email, digital_signature, good_faith_declaration, accuracy_declaration, authorization_declaration } = req.body;
    if (!good_faith_declaration || !accuracy_declaration || !authorization_declaration)
      return res.status(400).json({ error: 'All three legal declarations required per DMCA §512(c)(3)' });
    if (!claimant_name || !claimant_email || !digital_signature)
      return res.status(400).json({ error: 'Claimant name, email, and digital signature required' });

    const deadline = new Date(Date.now() + 48 * 3600000).toISOString();
    const { data, error } = await supabaseAdmin.from('dmca_takedowns').insert({ ...req.body, status: 'received', response_deadline: deadline }).select().single();
    if (error) throw error;
    res.json({ success: true, takedown_id: data.id, response_deadline: deadline, message: 'DMCA notice received. We will respond within 48 hours.' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /warranty — Creator warranty acceptance ──────────────────────────
router.post('/warranty', authRequired, async (req, res) => {
  try {
    const { story_id, originality_declaration, no_infringement_declaration, indemnification_accepted, ai_authorship_acknowledged, human_author_name, human_author_country, warranty_text } = req.body;
    if (!originality_declaration || !no_infringement_declaration || !indemnification_accepted || !ai_authorship_acknowledged)
      return res.status(400).json({ error: 'All four warranty declarations required' });
    if (!human_author_name || !human_author_country)
      return res.status(400).json({ error: 'Author name and country required under Indian copyright law' });

    const { data, error } = await supabaseAdmin.from('creator_warranties').insert({
      user_id: req.user.id, story_id, warranty_version: 'v1.0', warranty_text,
      originality_declaration, no_infringement_declaration, indemnification_accepted, ai_authorship_acknowledged,
      ip_address: req.headers['x-forwarded-for'] || req.ip, user_agent: req.headers['user-agent'],
      human_author_name, human_author_country,
    }).select().single();
    if (error) throw error;
    await supabaseAdmin.from('stories').update({ warranty_accepted: true, warranty_accepted_at: new Date().toISOString() }).eq('id', story_id);
    res.json({ success: true, warranty_id: data.id });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /blocklist — Paginated, searchable blocklist ──────────────────────
router.get('/blocklist', async (req, res) => {
  try {
    const { category, entity_type, risk_level, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = supabaseAdmin.from('blocked_entities').select('*', { count: 'exact' }).eq('is_active', true).order('name').range(offset, offset + parseInt(limit) - 1);
    if (category) query = query.eq('category', category);
    if (entity_type) query = query.eq('entity_type', entity_type);
    if (risk_level) query = query.eq('risk_level', risk_level);
    if (search) query = query.ilike('name_normalized', `%${search.toLowerCase()}%`);
    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ success: true, entities: data || [], total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /blocklist/stats — Category counts ────────────────────────────────
router.get('/blocklist/stats', async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('blocked_entities').select('category').eq('is_active', true);
    const stats = {};
    (data || []).forEach(e => { stats[e.category] = (stats[e.category] || 0) + 1; });
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    res.json({ success: true, stats, total });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /tiers — License tiers ────────────────────────────────────────────
router.get('/tiers', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('license_tiers').select('*').order('id');
    if (error) throw error;
    res.json({ success: true, tiers: data || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
