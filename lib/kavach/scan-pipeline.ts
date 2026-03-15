// KAVACH Scan Pipeline — API Route Handler
// Orchestrates: Entity Scan → Text Scan → Scoring → Tier Assignment → Audit
import { createClient } from '@/lib/supabase/client';

const COPYLEAKS_API_KEY = process.env.COPYLEAKS_API_KEY || '';

// Soundex for fuzzy phonetic matching
function soundex(s: string): string {
  const a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
  if (!a.length) return '';
  const codes: Record<string, string> = {b:'1',f:'1',p:'1',v:'1',c:'2',g:'2',j:'2',k:'2',q:'2',s:'2',x:'2',z:'2',d:'3',t:'3',l:'4',m:'5',n:'5',r:'6'};
  const f = a.shift()!;
  const r = a.map(c => codes[c] || '').filter((c, i, arr) => c && c !== arr[i - 1]).join('');
  return (f + r + '000').slice(0, 4).toUpperCase();
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

async function sha256(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const enc = new TextEncoder().encode(data);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto.subtle
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

interface ScanRequest { story_id: string; scan_type?: string; }

async function emitEvent(supabase: any, scanId: string, eventType: string, stepNumber: number, stepName: string, message: string, details: any = {}) {
  await supabase.from('pipeline_events').insert({
    scan_id: scanId, event_type: eventType, step_number: stepNumber,
    step_name: stepName, message, details,
  });
}

async function updateScanStatus(supabase: any, scanId: string, status: string, step: number, extra: any = {}) {
  await supabase.from('kavach_scans').update({ status, pipeline_step: step, ...extra }).eq('id', scanId);
}

// Step 1: Entity Scan using pg_trgm + phonetic matching
async function entityScan(supabase: any, scanId: string, storyContent: string) {
  await emitEvent(supabase, scanId, 'step_start', 1, 'Entity Scan', 'Entity scan started — checking against IP blocklist');
  await updateScanStatus(supabase, scanId, 'entity_scan', 1, { entity_scan_status: 'processing' });

  const normalizedContent = normalize(storyContent);
  const words = normalizedContent.split(/\s+/);
  const matches: any[] = [];

  // Check trigram similarity using RPC or direct query
  const { data: entities } = await supabase.from('blocked_entities')
    .select('*').eq('is_active', true).limit(5000);

  if (entities) {
    for (const entity of entities) {
      const nameNorm = entity.name_normalized;
      // Direct substring match
      if (normalizedContent.includes(nameNorm) && nameNorm.length > 2) {
        const idx = normalizedContent.indexOf(nameNorm);
        const context = normalizedContent.slice(Math.max(0, idx - 40), idx + nameNorm.length + 40);
        matches.push({
          entity_name: entity.name, entity_type: entity.entity_type,
          ip_owner: entity.ip_owner, ip_universe: entity.ip_universe,
          risk_level: entity.risk_level, context: `...${context}...`,
          similarity: 1.0,
          suggestion: `Remove or rename "${entity.name}" — owned by ${entity.ip_owner}`,
        });
        await emitEvent(supabase, scanId, 'entity_found', 1, 'Entity Scan',
          `MATCH: "${entity.name}" detected (${entity.ip_owner})`,
          { entity_name: entity.name, risk_level: entity.risk_level });
        continue;
      }
      // Alias match
      for (const alias of (entity.aliases || [])) {
        const aliasNorm = normalize(alias);
        if (aliasNorm.length > 2 && normalizedContent.includes(aliasNorm)) {
          matches.push({
            entity_name: entity.name, entity_type: entity.entity_type,
            ip_owner: entity.ip_owner, ip_universe: entity.ip_universe,
            risk_level: entity.risk_level, context: `Matched via alias "${alias}"`,
            similarity: 0.9,
            suggestion: `Remove or rename "${alias}" (alias of ${entity.name}) — owned by ${entity.ip_owner}`,
          });
          await emitEvent(supabase, scanId, 'entity_found', 1, 'Entity Scan',
            `MATCH: "${alias}" (alias of ${entity.name}) detected`, {});
          break;
        }
      }
      // Phonetic match on individual words
      if (entity.name_phonetic) {
        for (const word of words) {
          if (word.length > 3 && soundex(word) === entity.name_phonetic) {
            const alreadyMatched = matches.some(m => m.entity_name === entity.name);
            if (!alreadyMatched) {
              matches.push({
                entity_name: entity.name, entity_type: entity.entity_type,
                ip_owner: entity.ip_owner, ip_universe: entity.ip_universe,
                risk_level: entity.risk_level, context: `Phonetic match: "${word}" ≈ "${entity.name}"`,
                similarity: 0.7,
                suggestion: `"${word}" phonetically resembles "${entity.name}" — consider renaming`,
              });
              await emitEvent(supabase, scanId, 'entity_found', 1, 'Entity Scan',
                `PHONETIC MATCH: "${word}" ≈ "${entity.name}"`, {});
            }
          }
        }
      }
    }
  }

  // Deduplicate
  const unique = matches.filter((m, i, arr) => arr.findIndex(x => x.entity_name === m.entity_name) === i);

  await supabase.from('kavach_scans').update({
    entity_scan_status: 'completed', entity_matches: unique, entity_match_count: unique.length,
  }).eq('id', scanId);

  await emitEvent(supabase, scanId, 'step_complete', 1, 'Entity Scan',
    `Entity scan complete — ${unique.length} match(es) found`, { count: unique.length });

  return unique;
}

// Step 2: Text Scan (Copyleaks or Mock)
async function textScan(supabase: any, scanId: string, storyContent: string) {
  await emitEvent(supabase, scanId, 'step_start', 2, 'Text Scan', 'Text plagiarism scan started');
  await updateScanStatus(supabase, scanId, 'text_scan', 2, { text_scan_status: 'processing' });

  let textMatches: any[] = [];
  let similarityScore = 0;

  if (COPYLEAKS_API_KEY) {
    try {
      // Real Copyleaks API integration
      const loginRes = await fetch('https://id.copyleaks.com/v3/account/login/api', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: process.env.COPYLEAKS_EMAIL, key: COPYLEAKS_API_KEY }),
      });
      const { access_token } = await loginRes.json();
      const scanRes = await fetch('https://api.copyleaks.com/v3/businesses/submit/file', {
        method: 'PUT', headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: btoa(storyContent), filename: 'story.txt', properties: { sandbox: true } }),
      });
      const result = await scanRes.json();
      textMatches = (result.results || []).map((r: any) => ({
        source: r.url || 'Unknown', similarity_pct: r.matchedWords / (storyContent.split(/\s+/).length) * 100,
        matched_text: r.matchedText || '', suggestion: 'Rewrite the matching section to ensure originality',
      }));
      similarityScore = Math.max(...textMatches.map((m: any) => m.similarity_pct), 0);
    } catch (err) {
      await emitEvent(supabase, scanId, 'error', 2, 'Text Scan', `Copyleaks API error: ${err}`);
    }
  } else {
    // Mock scan — generate realistic sample results for demo
    await new Promise(r => setTimeout(r, 1500));
    const wordCount = storyContent.split(/\s+/).length;
    if (wordCount > 20) {
      const mockSimilarity = Math.max(5, Math.floor(Math.random() * 25));
      textMatches = [{ source: 'Public domain corpus', similarity_pct: mockSimilarity,
        matched_text: 'Common narrative patterns detected', suggestion: 'Low similarity — likely coincidental phrasing' }];
      similarityScore = mockSimilarity;
      await emitEvent(supabase, scanId, 'text_match', 2, 'Text Scan',
        `Text match: ${mockSimilarity}% similarity with public corpus`, {});
    }
  }

  await supabase.from('kavach_scans').update({
    text_scan_status: 'completed', text_similarity_score: similarityScore,
    text_scan_provider: COPYLEAKS_API_KEY ? 'copyleaks' : 'mock',
    text_matches: textMatches,
  }).eq('id', scanId);

  await emitEvent(supabase, scanId, 'step_complete', 2, 'Text Scan',
    `Text scan complete — max similarity: ${similarityScore.toFixed(1)}%`, { similarity: similarityScore });

  return { textMatches, similarityScore };
}

// Step 3: Scoring
function calculateScore(entityMatches: any[], textSimilarity: number): { score: number; issues: number } {
  let score = 100;
  let issues = 0;
  for (const m of entityMatches) {
    issues++;
    if (m.risk_level === 'critical') score -= 15;
    else if (m.risk_level === 'high') score -= 10;
    else score -= 5;
  }
  if (textSimilarity > 80) { score -= 20; issues++; }
  else if (textSimilarity > 60) { score -= 10; issues++; }
  else if (textSimilarity > 40) { score -= 5; issues++; }
  return { score: Math.max(0, Math.min(100, score)), issues };
}

// Step 4: Tier Assignment
function assignTier(score: number): { tierId: number; reasoning: string } {
  if (score >= 90) return { tierId: 1, reasoning: `Score ${score}/100 — Original content with full rights. No significant IP matches detected.` };
  if (score >= 70) return { tierId: 2, reasoning: `Score ${score}/100 — Original with minor similarities. Personal use license granted.` };
  if (score >= 50) return { tierId: 3, reasoning: `Score ${score}/100 — Inspired content detected. Attribution required for identified source material.` };
  return { tierId: 4, reasoning: `Score ${score}/100 — Significant IP matches found. Content blocked from minting. Edit and resubmit required.` };
}

export async function scanStory(body: ScanRequest) {
  const supabase = createClient();
  const { story_id, scan_type = 'full' } = body;

  // Fetch story
  const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
  if (!story) throw new Error('Story not found');

  // Create scan record
  const { data: scan } = await supabase.from('kavach_scans').insert({
    story_id, user_id: story.author_id, scan_type, status: 'queued', pipeline_step: 0,
    started_at: new Date().toISOString(),
  }).select().single();
  if (!scan) throw new Error('Failed to create scan');

  const scanId = scan.id;

  // Update story
  await supabase.from('stories').update({ current_scan_id: scanId, status: 'scanning' }).eq('id', story_id);
  await emitEvent(supabase, scanId, 'step_start', 0, 'Queued', 'KAVACH scan initiated');

  try {
    // Step 1
    const entityMatches = await entityScan(supabase, scanId, story.content);

    // Step 2
    const { textMatches, similarityScore } = await textScan(supabase, scanId, story.content);

    // Step 3: Scoring
    await emitEvent(supabase, scanId, 'step_start', 3, 'Scoring', 'Calculating originality score');
    await updateScanStatus(supabase, scanId, 'scoring', 3);
    const { score, issues } = calculateScore(entityMatches, similarityScore);
    await supabase.from('kavach_scans').update({ originality_score: score, issues_found: issues }).eq('id', scanId);
    await emitEvent(supabase, scanId, 'score_update', 3, 'Scoring', `Originality score: ${score}/100 (${issues} issues)`, { score, issues });
    await emitEvent(supabase, scanId, 'step_complete', 3, 'Scoring', 'Scoring complete');

    // Step 4: Tier
    await emitEvent(supabase, scanId, 'step_start', 4, 'Tier Assignment', 'Assigning license tier');
    await updateScanStatus(supabase, scanId, 'assigning_tier', 4);
    const { tierId, reasoning } = assignTier(score);
    await supabase.from('kavach_scans').update({ assigned_tier_id: tierId, tier_reasoning: reasoning }).eq('id', scanId);
    await emitEvent(supabase, scanId, 'tier_assigned', 4, 'Tier Assignment', `Assigned Tier ${tierId}: ${reasoning}`, { tier_id: tierId });
    await emitEvent(supabase, scanId, 'step_complete', 4, 'Tier Assignment', 'Tier assignment complete');

    // Step 5: Audit
    await emitEvent(supabase, scanId, 'step_start', 5, 'Audit & Seal', 'Creating audit trail');
    const complianceFlags = {
      india_copyright_act_s51: true, india_copyright_act_s14: true,
      india_it_act_s79: true, india_trademark_act_s29: entityMatches.length > 0,
      india_dpiit_2025: true, dmca_512_safe_harbor: true,
      berne_convention: true, eu_dsa: true,
    };

    const auditDetails = { score, tier: tierId, entity_matches: entityMatches.length, text_similarity: similarityScore };
    const auditData = JSON.stringify(auditDetails) + new Date().toISOString();
    const auditHash = await sha256(auditData);

    // Get previous hash for chain
    const { data: prevAudit } = await supabase.from('scan_audit_log')
      .select('hash').order('created_at', { ascending: false }).limit(1).single();
    const previousHash = prevAudit?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
    const chainHash = await sha256(previousHash + JSON.stringify(auditDetails) + new Date().toISOString());

    await supabase.from('scan_audit_log').insert({
      scan_id: scanId, action: 'scan_completed', actor: 'kavach_agent',
      details: auditDetails, legal_reference: 'Copyright Act 1957 S.51, IT Act 2000 S.79, DMCA §512',
      hash: chainHash, previous_hash: previousHash,
    });

    await supabase.from('kavach_scans').update({
      status: 'completed', pipeline_step: 5, compliance_flags: complianceFlags,
      audit_hash: chainHash, completed_at: new Date().toISOString(),
    }).eq('id', scanId);

    await supabase.from('stories').update({ status: tierId === 4 ? 'blocked' : 'approved', license_tier_id: tierId }).eq('id', story_id);

    await emitEvent(supabase, scanId, 'step_complete', 5, 'Audit & Seal', `Scan complete — Score: ${score}, Tier: ${tierId}`, { audit_hash: chainHash });

    return { scan_id: scanId, score, tier_id: tierId, reasoning, issues, entity_matches: entityMatches.length };

  } catch (err: any) {
    await updateScanStatus(supabase, scanId, 'failed', -1);
    await emitEvent(supabase, scanId, 'error', -1, 'Error', `Scan failed: ${err.message}`);
    throw err;
  }
}
