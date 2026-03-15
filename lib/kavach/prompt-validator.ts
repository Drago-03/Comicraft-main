/**
 * KAVACH Prompt Validator — IP Compliance Check
 *
 * Validates user prompts against the blocked_entities table in Supabase.
 * Uses case-insensitive matching with common variation handling.
 */

import { createClient } from '@/lib/supabase/client';

export interface ValidationResult {
  isBlocked: boolean;
  blockedEntities: {
    name: string;
    ipOwner: string;
    category: string;
    riskLevel: string;
  }[];
  message: string;
}

/**
 * Normalize text for fuzzy matching:
 * - lowercase
 * - remove special chars/punctuation
 * - collapse whitespace
 * - handle common leet-speak substitutions
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a prompt contains any blocked IP entities.
 * Queries the Supabase `blocked_entities` table.
 * Returns structured validation result.
 */
export async function validatePrompt(prompt: string): Promise<ValidationResult> {
  const supabase = createClient();
  const normalizedPrompt = normalize(prompt);
  const words = normalizedPrompt.split(' ').filter(w => w.length > 2);

  // Build search terms — individual words, and bigrams
  const searchTerms = new Set<string>(words);
  for (let i = 0; i < words.length - 1; i++) {
    searchTerms.add(`${words[i]} ${words[i + 1]}`);
  }
  // Trigrams for three-word character names
  for (let i = 0; i < words.length - 2; i++) {
    searchTerms.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  // Query for active blocked entities — use ilike for case-insensitive
  // We fetch a reasonable subset and do client-side matching
  const { data: entities, error } = await supabase
    .from('blocked_entities')
    .select('name, ip_owner, category, risk_level, aliases')
    .eq('is_active', true)
    .limit(5000);

  if (error || !entities) {
    console.error('[KAVACH] Failed to fetch blocklist:', error);
    return { isBlocked: false, blockedEntities: [], message: '' };
  }

  const matches: ValidationResult['blockedEntities'] = [];

  for (const entity of entities) {
    const normalizedName = normalize(entity.name);
    const normalizedAliases = (entity.aliases || []).map((a: string) => normalize(a));
    const allNames = [normalizedName, ...normalizedAliases];

    for (const name of allNames) {
      if (name.length < 3) continue; // Skip very short names to avoid false positives

      if (normalizedPrompt.includes(name) || searchTerms.has(name)) {
        matches.push({
          name: entity.name,
          ipOwner: entity.ip_owner,
          category: entity.category,
          riskLevel: entity.risk_level,
        });
        break; // One match per entity is enough
      }
    }
  }

  if (matches.length === 0) {
    return { isBlocked: false, blockedEntities: [], message: '' };
  }

  // Build compliance message
  const uniqueOwners = [...new Set(matches.map(m => m.ipOwner))];
  const criticalMatches = matches.filter(m => m.riskLevel === 'critical');
  const entityNames = matches.map(m => m.name).slice(0, 5);

  let message = `⚠️ IP Compliance Notice: Your prompt contains references to protected intellectual property`;

  if (entityNames.length <= 3) {
    message += ` (${entityNames.join(', ')})`;
  } else {
    message += ` (${entityNames.slice(0, 3).join(', ')} and ${matches.length - 3} more)`;
  }

  message += ` owned by ${uniqueOwners.slice(0, 3).join(', ')}.`;

  if (criticalMatches.length > 0) {
    message += ` These are marked as CRITICAL risk and cannot be used. Please modify your prompt to use original characters and settings.`;
  } else {
    message += ` Please modify your prompt to use original characters and settings to avoid potential IP conflicts.`;
  }

  return {
    isBlocked: true,
    blockedEntities: matches,
    message,
  };
}
