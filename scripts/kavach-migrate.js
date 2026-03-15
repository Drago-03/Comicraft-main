#!/usr/bin/env node
// KAVACH Schema Migration — run from project root: node scripts/kavach-migrate.js
const path = require('path');
const dotenvPath = path.join(__dirname, '..', 'server', 'node_modules', 'dotenv');
require(dotenvPath).config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const supabase = createClient(url, key);

async function migrate() {
  console.log('Connected to:', url);
  
  // Check if tables already exist
  const { error: beErr } = await supabase.from('blocked_entities').select('id').limit(1);
  if (!beErr) { console.log('KAVACH tables already exist!'); return checkData(); }
  
  console.log('Tables missing — please run supabase/kavach-schema.sql in Supabase SQL Editor');
  console.log('Then run this script again to seed data.');
}

async function checkData() {
  const { count: beCount } = await supabase.from('blocked_entities').select('*', { count: 'exact', head: true });
  const { data: tiers } = await supabase.from('license_tiers').select('*');
  const { data: tos } = await supabase.from('tos_versions').select('version');
  console.log(`blocked_entities: ${beCount || 0} rows`);
  console.log(`license_tiers: ${tiers?.length || 0} rows`);
  console.log(`tos_versions: ${tos?.length || 0} rows`);
  
  if (!tiers?.length) await seedTiers();
  if (!tos?.length) await seedTos();
  if ((beCount || 0) < 10000) await seedBlocklist();
}

async function seedTiers() {
  console.log('Seeding license tiers...');
  const { error } = await supabase.from('license_tiers').upsert([
    { id: 1, name: 'Original Full Rights', code: 'ORIGINAL_FULL', min_originality_score: 90, max_originality_score: 100,
      rights_granted: { mint: true, sell: true, license: true, derivative: true, commercial: true },
      restrictions: {}, legal_basis: { india: 'Copyright Act 1957 Section 14', international: 'Berne Convention Article 6bis' },
      description: 'Full creative rights — original content verified by KAVACH' },
    { id: 2, name: 'Original Personal Use', code: 'ORIGINAL_PERSONAL', min_originality_score: 70, max_originality_score: 89,
      rights_granted: { mint: true, sell: true, license: false, derivative: false, commercial: false },
      restrictions: { no_commercial: true }, legal_basis: { india: 'Copyright Act 1957 Section 52', international: 'Berne Convention Article 2(3)' },
      description: 'Personal use license — minor similarities detected' },
    { id: 3, name: 'Inspired Attribution Required', code: 'INSPIRED_ATTRIBUTION', min_originality_score: 50, max_originality_score: 69,
      rights_granted: { mint: true, sell: false, license: false, derivative: false, commercial: false },
      restrictions: { attribution_required: true, no_sale: true }, legal_basis: { india: 'Copyright Act 1957 Section 52', international: 'Berne Convention Article 2(3)' },
      description: 'Attribution required — inspired content detected' },
    { id: 4, name: 'Blocked Cannot Mint', code: 'BLOCKED', min_originality_score: 0, max_originality_score: 49,
      rights_granted: { mint: false, sell: false, license: false, derivative: false, commercial: false },
      restrictions: { blocked: true }, legal_basis: { india: 'Copyright Act 1957 Section 51, Trademark Act 1999 Section 29', us: 'DMCA Section 512', international: 'Berne Convention' },
      description: 'Blocked — significant IP matches found' },
  ]);
  console.log(error ? `Tier seed error: ${error.message}` : 'Tiers seeded OK');
}

async function seedTos() {
  console.log('Seeding ToS v1.0...');
  const { error } = await supabase.from('tos_versions').insert({
    version: 'v1.0', effective_date: '2026-03-15',
    content: 'Comicraft Terms of Service v1.0 — Creativity Tokenization Platform',
    ip_warranty_clause: 'By submitting content, you warrant under the Copyright Act 1957 and Trademark Act 1999 that you are the original creator or have obtained all necessary rights.',
    indemnification_clause: 'You agree to indemnify Comicraft against any IP claims. This obligation survives termination of your account.',
    ai_disclosure_clause: 'Per DPIIT 2025 guidelines, all AI-assisted content must disclose AI involvement. KAVACH scan results are permanently recorded.',
    dmca_policy: 'Comicraft complies with DMCA Section 512. Takedown notices are processed within 48 hours.',
    indian_law_provisions: 'Governed by Copyright Act 1957, IT Act 2000 Section 79, Trademark Act 1999, and DPIIT 2025 AI guidelines.',
    international_law_provisions: 'Compliant with DMCA (US), Berne Convention (international), and EU Digital Services Act.',
  });
  console.log(error ? `ToS seed error: ${error.message}` : 'ToS seeded OK');
}

async function seedBlocklist() {
  console.log('Seeding blocklist — this will take a moment...');
  const { SEED_DATA } = require('../lib/kavach/seed-data');
  if (!SEED_DATA) { console.log('No seed data found at lib/kavach/seed-data'); return; }
  let total = 0;
  for (const [category, entities] of Object.entries(SEED_DATA)) {
    const batch = entities.map(e => ({ ...e, category }));
    for (let i = 0; i < batch.length; i += 500) {
      const chunk = batch.slice(i, i + 500);
      const { error } = await supabase.from('blocked_entities').insert(chunk);
      if (error) console.error(`Error seeding ${category} batch ${i}:`, error.message);
      else total += chunk.length;
    }
    console.log(`  ${category}: ${entities.length} entities`);
  }
  console.log(`Total seeded: ${total}`);
}

migrate().catch(e => console.error(e));
