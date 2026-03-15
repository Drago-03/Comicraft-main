// KAVACH API Route: POST /api/kavach/warranty
// Records creator warranty acceptance per Indian Copyright Act 1957 + DPIIT 2025
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, story_id, originality_declaration, no_infringement_declaration,
      indemnification_accepted, ai_authorship_acknowledged, human_author_name,
      human_author_country, warranty_text } = body;

    if (!originality_declaration || !no_infringement_declaration || !indemnification_accepted || !ai_authorship_acknowledged) {
      return NextResponse.json({ error: 'All four warranty declarations are required' }, { status: 400 });
    }
    if (!human_author_name || !human_author_country) {
      return NextResponse.json({ error: 'Human author name and country are required under Indian copyright law' }, { status: 400 });
    }

    const supabase = createClient();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { data, error } = await supabase.from('creator_warranties').insert({
      user_id, story_id, warranty_version: 'v1.0', warranty_text,
      originality_declaration, no_infringement_declaration,
      indemnification_accepted, ai_authorship_acknowledged,
      ip_address: ip, user_agent: userAgent,
      human_author_name, human_author_country,
    }).select().single();

    if (error) throw error;

    // Update story
    await supabase.from('stories').update({
      warranty_accepted: true, warranty_accepted_at: new Date().toISOString(),
    }).eq('id', story_id);

    return NextResponse.json({ success: true, warranty_id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record warranty' }, { status: 500 });
  }
}
