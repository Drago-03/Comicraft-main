// KAVACH API Route: GET /api/kavach/scan/[id]
// Returns scan status with all pipeline events for realtime display
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const scanId = params.id;

    const { data: scan, error } = await supabase.from('kavach_scans')
      .select('*, assigned_tier:license_tiers(*)')
      .eq('id', scanId).single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const { data: events } = await supabase.from('pipeline_events')
      .select('*').eq('scan_id', scanId).order('created_at', { ascending: true });

    const { data: auditLog } = await supabase.from('scan_audit_log')
      .select('*').eq('scan_id', scanId).order('created_at', { ascending: true });

    const { data: story } = await supabase.from('stories')
      .select('id, title, content').eq('id', scan.story_id).single();

    return NextResponse.json({ scan, events: events || [], audit_log: auditLog || [], story });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
