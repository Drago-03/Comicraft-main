// KAVACH API Route: GET /api/kavach/blocklist + POST for seeding
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const entityType = url.searchParams.get('entity_type');
    const riskLevel = url.searchParams.get('risk_level');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase.from('blocked_entities').select('*', { count: 'exact' })
      .eq('is_active', true).order('name').range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (entityType) query = query.eq('entity_type', entityType);
    if (riskLevel) query = query.eq('risk_level', riskLevel);
    if (search) query = query.ilike('name_normalized', `%${search.toLowerCase()}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    // Get counts by category
    const { data: categoryCounts } = await supabase.from('blocked_entities')
      .select('category').eq('is_active', true);
    const stats: Record<string, number> = {};
    (categoryCounts || []).forEach((e: any) => { stats[e.category] = (stats[e.category] || 0) + 1; });

    return NextResponse.json({ entities: data || [], total: count || 0, page, limit, category_stats: stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
