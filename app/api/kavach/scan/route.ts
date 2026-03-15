// KAVACH API Route: POST /api/kavach/scan
// Triggers the full KAVACH scan pipeline for a story
import { NextRequest, NextResponse } from 'next/server';
import { scanStory } from '@/lib/kavach/scan-pipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.story_id) {
      return NextResponse.json({ error: 'story_id is required' }, { status: 400 });
    }
    const result = await scanStory(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scan failed' }, { status: 500 });
  }
}
