// KAVACH API Route: POST /api/kavach/dmca
// Processes DMCA takedown submissions per DMCA §512(c)(3)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimant_name, claimant_email, claimant_role, infringing_content_description,
      original_work_title, jurisdiction, good_faith_declaration, accuracy_declaration,
      authorization_declaration, digital_signature } = body;

    // Validate required legal declarations per DMCA §512(c)(3)
    if (!good_faith_declaration || !accuracy_declaration || !authorization_declaration) {
      return NextResponse.json({ error: 'All three legal declarations are required for a valid DMCA notice per Section 512(c)(3)' }, { status: 400 });
    }
    if (!claimant_name || !claimant_email || !digital_signature) {
      return NextResponse.json({ error: 'Claimant name, email, and digital signature are required' }, { status: 400 });
    }

    const supabase = createClient();
    const responseDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase.from('dmca_takedowns').insert({
      ...body, status: 'received', response_deadline: responseDeadline,
    }).select().single();

    if (error) throw error;

    // Create audit log entry
    if (data) {
      const auditData = JSON.stringify({ dmca_id: data.id, claimant_name, jurisdiction });
      // Simple hash for audit
      const hash = btoa(auditData).slice(0, 64);
      await supabase.from('scan_audit_log').insert({
        scan_id: body.story_id ? (await supabase.from('kavach_scans').select('id').eq('story_id', body.story_id).order('created_at', { ascending: false }).limit(1).single())?.data?.id : null,
        action: 'dmca_notice_received', actor: claimant_email,
        details: { dmca_id: data.id, jurisdiction, original_work: original_work_title },
        legal_reference: jurisdiction === 'US_DMCA' ? 'DMCA §512(c)(3)' : jurisdiction === 'IN_COPYRIGHT_ACT' ? 'Copyright Act 1957 §51' : 'EU DSA Art. 16',
        hash, previous_hash: null,
      }).then(() => {});
    }

    return NextResponse.json({
      success: true, takedown_id: data?.id,
      message: 'DMCA takedown notice received. We will respond within 48 hours.',
      response_deadline: responseDeadline,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process takedown' }, { status: 500 });
  }
}
