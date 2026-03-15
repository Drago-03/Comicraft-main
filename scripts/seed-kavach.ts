import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { getAllBlocklistEntities } from '../lib/kavach/seed-data';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedBlocklist() {
  const entities = getAllBlocklistEntities();
  console.log(`Loaded ${entities.length} entities to seed...`);

  // We can insert the entities, but let's clear existing first if needed, or simply insert.
  // To avoid duplicates if ran multiple times, we delete them first.
  await supabase.from('blocked_entities').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  // Insert in batches
  const BATCH_SIZE = 500;
  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(entities.length / BATCH_SIZE)}`);
    const { error } = await supabase
      .from('blocked_entities')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}`);
    }
  }
  console.log('Finished seeding blocklist.');
}

seedBlocklist().catch(console.error);
