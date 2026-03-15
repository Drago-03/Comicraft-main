'use client';
// KAVACH Live Pipeline Dashboard — Main Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useKavachRealtime } from '@/hooks/use-kavach-realtime';
import { PIPELINE_STEPS, ENTITY_CATEGORIES, LICENSE_TIERS, RISK_LEVELS } from '@/lib/kavach/constants';
import type { KavachScan, PipelineEvent } from '@/lib/kavach/types';

// ─── Pipeline Step Indicator ───
function PipelineStep({ step, currentStep, status, events }: {
  step: typeof PIPELINE_STEPS[number]; currentStep: number; status: string; events: PipelineEvent[];
}) {
  const stepEvents = events.filter(e => e.step_number === step.step);
  const isComplete = currentStep > step.step || status === 'completed';
  const isActive = currentStep === step.step && status !== 'completed' && status !== 'failed';
  const isPending = currentStep < step.step;

  return (
    <div className={`pipeline-step ${isComplete ? 'complete' : isActive ? 'active' : 'pending'}`}>
      <div className="step-indicator">
        <div className={`step-dot ${isComplete ? 'bg-green-500' : isActive ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`}>
          {isComplete ? '✓' : isActive ? '⟳' : '○'}
        </div>
        <div className="step-line" />
      </div>
      <div className="step-content">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{`Step ${step.step}: ${step.name}`}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isComplete ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700 text-zinc-400'
          }`}>
            {isComplete ? 'Complete' : isActive ? 'Running' : 'Pending'}
          </span>
        </div>
        {stepEvents.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {stepEvents.map((ev, i) => (
              <div key={i} className={`text-xs ${ev.event_type === 'entity_found' || ev.event_type === 'text_match' ? 'text-amber-400' : 'text-zinc-400'}`}>
                {ev.event_type === 'entity_found' && '⚠ '}{ev.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Pipeline View ───
function LivePipeline({ scanId, storyTitle }: { scanId: string; storyTitle?: string }) {
  const { events, scan, isConnected } = useKavachRealtime(scanId);

  if (!scan) return <div className="text-zinc-400 text-sm">Loading scan...</div>;

  return (
    <div className="kavach-pipeline-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">KAVACH Scan Pipeline</h3>
          {storyTitle && <p className="text-sm text-zinc-400">"{storyTitle}"</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-zinc-400">{isConnected ? 'Live' : 'Disconnected'}</span>
          <span className={`text-xs px-2 py-1 rounded font-mono uppercase tracking-wider ${
            scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            scan.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>{scan.status}</span>
        </div>
      </div>

      {/* Score Display */}
      {scan.originality_score !== null && (
        <div className="text-center mb-4 p-3 rounded-lg bg-zinc-800/50">
          <div className={`text-4xl font-black ${
            scan.originality_score >= 90 ? 'text-green-400' : scan.originality_score >= 70 ? 'text-blue-400' :
            scan.originality_score >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>{scan.originality_score}<span className="text-lg">/100</span></div>
          <div className="text-xs text-zinc-400 mt-1">Originality Score</div>
        </div>
      )}

      {/* Pipeline Steps */}
      <div className="space-y-2">
        {PIPELINE_STEPS.filter(s => s.step > 0).map(step => (
          <PipelineStep key={step.step} step={step} currentStep={scan.pipeline_step} status={scan.status} events={events} />
        ))}
      </div>

      {/* Live Log */}
      <div className="mt-4 p-3 rounded-lg bg-black/40 max-h-48 overflow-y-auto font-mono text-xs">
        <div className="text-zinc-500 mb-1">Live Log:</div>
        {events.map((ev, i) => (
          <div key={i} className={`${
            ev.event_type === 'error' ? 'text-red-400' : ev.event_type === 'entity_found' ? 'text-amber-400' : 'text-zinc-400'
          }`}>
            <span className="text-zinc-600">{new Date(ev.created_at).toLocaleTimeString()}</span>{' '}
            {ev.message}
          </div>
        ))}
        {events.length === 0 && <div className="text-zinc-600">Waiting for events...</div>}
      </div>

      {scan.status === 'completed' && (
        <Link href={`/kavach/scan/${scanId}`} className="mt-3 block text-center text-sm text-blue-400 hover:text-blue-300 underline">
          View Full Report →
        </Link>
      )}
    </div>
  );
}

// ─── Stats Card ───
function StatCard({ label, value, color = 'text-white', icon }: { label: string; value: string | number; color?: string; icon: string }) {
  return (
    <div className="kavach-stat-card">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
    </div>
  );
}

// ─── Main Dashboard ───
export default function KavachDashboard() {
  const [activeScans, setActiveScans] = useState<KavachScan[]>([]);
  const [recentScans, setRecentScans] = useState<KavachScan[]>([]);
  const [blocklistStats, setBlocklistStats] = useState<Record<string, number>>({});
  const [totalEntities, setTotalEntities] = useState(0);
  const [scansToday, setScansToday] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Recent scans
      const { data: scans } = await supabase.from('kavach_scans')
        .select('*, assigned_tier:license_tiers(*), story:stories(id, title)')
        .order('created_at', { ascending: false }).limit(20);
      if (scans) {
        setRecentScans(scans as any);
        const active = scans.filter((s: any) => !['completed', 'failed'].includes(s.status));
        setActiveScans(active as any);
        if (active.length > 0) setActiveScanId(active[0].id);
        const today = scans.filter((s: any) => new Date(s.created_at).toDateString() === new Date().toDateString());
        setScansToday(today.length);
        const scored = scans.filter((s: any) => s.originality_score != null);
        setAvgScore(scored.length ? Math.round(scored.reduce((a: number, s: any) => a + s.originality_score, 0) / scored.length) : 0);
      }

      // Blocklist stats
      const { data: entities, count } = await supabase.from('blocked_entities')
        .select('category', { count: 'exact' }).eq('is_active', true);
      setTotalEntities(count || 0);
      const stats: Record<string, number> = {};
      (entities || []).forEach((e: any) => { stats[e.category] = (stats[e.category] || 0) + 1; });
      setBlocklistStats(stats);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Header */}
      <div className="kavach-hero">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-xl font-black">K</div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">KAVACH</h1>
              <p className="text-xs text-zinc-400">IP Compliance Engine — Phase 1</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Real-time intellectual property scanning powered by Indian law (Copyright Act 1957, IT Act §79, Trademark Act 1999)
            and international law (DMCA §512, Berne Convention, EU DSA).
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="🛡️" label="Blocked Entities" value={totalEntities.toLocaleString()} color="text-amber-400" />
          <StatCard icon="📊" label="Scans Today" value={scansToday} color="text-blue-400" />
          <StatCard icon="✨" label="Avg. Originality" value={avgScore ? `${avgScore}%` : '—'} color="text-green-400" />
          <StatCard icon="⚡" label="Active Scans" value={activeScans.length} color="text-purple-400" />
        </div>

        {/* Active Pipeline */}
        {activeScanId && (
          <LivePipeline scanId={activeScanId} storyTitle={(activeScans[0] as any)?.story?.title} />
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <div className="kavach-card">
            <h2 className="text-lg font-bold mb-3">Recent Scans</h2>
            <div className="space-y-2">
              {recentScans.length === 0 && <p className="text-sm text-zinc-500">No scans yet. Submit a story to begin.</p>}
              {recentScans.slice(0, 10).map(scan => (
                <Link key={scan.id} href={`/kavach/scan/${scan.id}`}
                  className="block p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{(scan as any).story?.title || 'Untitled'}</div>
                      <div className="text-xs text-zinc-400">{new Date(scan.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.originality_score != null && (
                        <span className={`text-sm font-bold ${
                          scan.originality_score >= 90 ? 'text-green-400' : scan.originality_score >= 70 ? 'text-blue-400' :
                          scan.originality_score >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>{scan.originality_score}%</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        scan.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{scan.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Entity Blocklist Stats */}
          <div className="kavach-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">IP Blocklist</h2>
              <Link href="/kavach/blocklist" className="text-xs text-blue-400 hover:text-blue-300">View All →</Link>
            </div>
            <div className="space-y-2">
              {ENTITY_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-2 rounded bg-zinc-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm">{cat.label}</span>
                  </div>
                  <span className="text-sm font-mono text-zinc-400">
                    {(blocklistStats[cat.key] || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="text-amber-400">{totalEntities.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/kavach/submit" className="kavach-action-card group">
            <span className="text-2xl">📝</span>
            <span className="font-semibold">Submit Story</span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Scan & verify originality</span>
          </Link>
          <Link href="/kavach/dmca" className="kavach-action-card group">
            <span className="text-2xl">⚖️</span>
            <span className="font-semibold">File DMCA</span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Submit takedown notice</span>
          </Link>
          <Link href="/kavach/blocklist" className="kavach-action-card group">
            <span className="text-2xl">🔍</span>
            <span className="font-semibold">Explore Blocklist</span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Search 10,000+ IP entities</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
