// ============================================================================
// KAVACH Phase 1 — TypeScript Types
// All entity types for the IP Compliance Engine
// ============================================================================

// --- Blocked Entities ---
export type EntityType = 'character' | 'place' | 'object' | 'catchphrase' | 'franchise' | 'visual_signature';
export type RiskLevel = 'critical' | 'high' | 'medium';
export type EntityCategory = 'marvel' | 'dc' | 'disney' | 'anime' | 'tolkien' | 'indian_ip' | 'other';

export interface BlockedEntity {
  id: string;
  name: string;
  name_normalized: string;
  name_phonetic: string | null;
  aliases: string[];
  entity_type: EntityType;
  ip_owner: string;
  ip_universe: string | null;
  source_registry: string | null;
  jurisdiction: string[];
  risk_level: RiskLevel;
  category: EntityCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Seed Batches ---
export type SeedBatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EntitySeedBatch {
  id: string;
  category: string;
  batch_number: number;
  entities_count: number;
  status: SeedBatchStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// --- License Tiers ---
export type LicenseTierCode = 'original_full' | 'original_personal' | 'inspired_attribution' | 'blocked';

export interface LicenseTier {
  id: number;
  name: string;
  code: LicenseTierCode;
  min_originality_score: number;
  max_originality_score: number | null;
  rights_granted: Record<string, boolean>;
  restrictions: Record<string, any>;
  legal_basis: Record<string, string>;
  description: string;
  created_at: string;
}

// --- KAVACH Scans ---
export type ScanType = 'full' | 'rescan' | 'layer1_only';
export type ScanStatus = 'queued' | 'entity_scan' | 'text_scan' | 'scoring' | 'assigning_tier' | 'completed' | 'failed';

export interface EntityMatch {
  entity_name: string;
  entity_type: EntityType;
  ip_owner: string;
  ip_universe?: string;
  risk_level: RiskLevel;
  context: string;
  similarity: number;
  suggestion: string;
}

export interface TextMatch {
  source: string;
  similarity_pct: number;
  matched_text: string;
  suggestion: string;
}

export interface PipelineLogEntry {
  step: number;
  status: string;
  message: string;
  timestamp: string;
}

export interface ComplianceFlags {
  india_copyright_act_s51?: boolean;
  india_copyright_act_s14?: boolean;
  india_it_act_s79?: boolean;
  india_trademark_act_s29?: boolean;
  india_dpiit_2025?: boolean;
  dmca_512_safe_harbor?: boolean;
  berne_convention?: boolean;
  eu_dsa?: boolean;
}

export interface KavachScan {
  id: string;
  story_id: string;
  user_id: string;
  scan_type: ScanType;
  status: ScanStatus;
  pipeline_step: number;
  pipeline_log: PipelineLogEntry[];

  text_scan_status: string;
  text_similarity_score: number | null;
  text_scan_provider: string;
  text_scan_response: any;
  text_matches: TextMatch[];

  entity_scan_status: string;
  entity_matches: EntityMatch[];
  entity_match_count: number;

  originality_score: number | null;
  issues_found: number;
  assigned_tier_id: number | null;
  tier_reasoning: string | null;

  scan_jurisdiction: string[];
  compliance_flags: ComplianceFlags;
  audit_hash: string | null;

  started_at: string | null;
  completed_at: string | null;
  created_at: string;

  // Joined
  assigned_tier?: LicenseTier;
  story?: { id: string; title: string; content: string };
}

// --- DMCA Takedowns ---
export type DMCAStatus = 'received' | 'under_review' | 'action_taken' | 'counter_notice' | 'resolved' | 'rejected';
export type DMCAJurisdiction = 'US_DMCA' | 'IN_COPYRIGHT_ACT' | 'EU_DSA' | 'OTHER';

export interface DMCATakedown {
  id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_organization: string | null;
  claimant_role: string;
  story_id: string | null;
  story_url: string | null;
  infringing_content_description: string;
  original_work_title: string;
  original_work_url: string | null;
  ip_registration_number: string | null;
  jurisdiction: DMCAJurisdiction;
  good_faith_declaration: boolean;
  accuracy_declaration: boolean;
  authorization_declaration: boolean;
  digital_signature: string;
  status: DMCAStatus;
  reviewer_notes: string | null;
  action_taken: string | null;
  response_deadline: string | null;
  created_at: string;
  updated_at: string;
}

// --- Creator Warranties ---
export interface CreatorWarranty {
  id: string;
  user_id: string;
  story_id: string;
  warranty_version: string;
  warranty_text: string;
  originality_declaration: boolean;
  no_infringement_declaration: boolean;
  indemnification_accepted: boolean;
  ai_authorship_acknowledged: boolean;
  ip_address: string | null;
  user_agent: string | null;
  accepted_at: string;
  human_author_name: string;
  human_author_country: string;
}

// --- Pipeline Events ---
export type PipelineEventType = 'step_start' | 'step_complete' | 'entity_found' | 'text_match' | 'score_update' | 'tier_assigned' | 'error';

export interface PipelineEvent {
  id: string;
  scan_id: string;
  event_type: PipelineEventType;
  step_number: number | null;
  step_name: string | null;
  message: string;
  details: Record<string, any>;
  created_at: string;
}

// --- Scan Audit Log ---
export interface ScanAuditEntry {
  id: string;
  scan_id: string;
  action: string;
  actor: string;
  details: Record<string, any>;
  legal_reference: string | null;
  hash: string;
  previous_hash: string | null;
  created_at: string;
}

// --- ToS Versions ---
export interface ToSVersion {
  id: string;
  version: string;
  content: string;
  ip_warranty_clause: string;
  indemnification_clause: string;
  ai_disclosure_clause: string;
  dmca_policy: string;
  indian_law_provisions: string;
  international_law_provisions: string;
  effective_date: string;
  created_at: string;
}
