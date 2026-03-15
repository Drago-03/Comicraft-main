'use client';
// KAVACH Live Pipeline Dashboard — Main Page (Vintage Comic Theme)
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

  return (
    <div className={`pipeline-step ${isComplete ? 'complete' : isActive ? 'active' : 'pending'}`}>
      <div className="step-indicator">
        <div className={`step-dot ${isComplete ? 'bg-comic-green' : isActive ? 'bg-comic-yellow animate-pulse' : 'bg-muted'}`}>
          {isComplete ? '✓' : isActive ? '⟳' : '○'}
        </div>
        <div className="step-line" />
      </div>
      <div className="step-content">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm uppercase tracking-wider">{`Step ${step.step}: ${step.name}`}</span>
          <span className={`text-xs px-2 py-0.5 border-2 border-ink font-bold uppercase ${
            isComplete ? 'bg-comic-green text-white' : isActive ? 'bg-comic-yellow text-ink' : 'bg-muted text-muted-foreground'
          }`}>
            {isComplete ? 'Complete' : isActive ? 'Running' : 'Pending'}
          </span>
        </div>
        {stepEvents.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {stepEvents.map((ev, i) => (
              <div key={i} className={`text-xs font-bold ${ev.event_type === 'entity_found' || ev.event_type === 'text_match' ? 'text-comic-red' : 'text-ink/60'}`}>
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

  if (!scan) return <div className="text-ink/50 text-sm font-bold">Loading scan...</div>;

  return (
    <div className="kavach-pipeline-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">KAVACH Scan Pipeline</h3>
          {storyTitle && <p className="text-sm text-ink/50 font-bold italic">&quot;{storyTitle}&quot;</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 border-2 border-ink ${isConnected ? 'bg-comic-green animate-pulse' : 'bg-comic-red'}`} />
          <span className="text-xs font-black uppercase">{isConnected ? 'Live' : 'Disconnected'}</span>
          <span className={`text-xs px-2 py-1 border-2 border-ink font-black uppercase tracking-wider ${
            scan.status === 'completed' ? 'bg-comic-green text-white' :
            scan.status === 'failed' ? 'bg-comic-red text-white' :
            'bg-comic-yellow text-ink'
          }`}>{scan.status}</span>
        </div>
      </div>

      {/* Score Display */}
      {scan.originality_score !== null && (
        <div className="text-center mb-4 p-4 border-4 border-ink bg-card">
          <div className={`text-5xl font-black ${
            scan.originality_score >= 90 ? 'text-comic-green' : scan.originality_score >= 70 ? 'text-comic-blue' :
            scan.originality_score >= 50 ? 'text-comic-yellow' : 'text-comic-red'
          }`}>{scan.originality_score}<span className="text-xl">/100</span></div>
          <div className="text-xs font-black uppercase text-ink/50 mt-1 tracking-wider">Originality Score</div>
        </div>
      )}

      {/* Pipeline Steps */}
      <div className="space-y-2">
        {PIPELINE_STEPS.filter(s => s.step > 0).map(step => (
          <PipelineStep key={step.step} step={step} currentStep={scan.pipeline_step} status={scan.status} events={events} />
        ))}
      </div>

      {/* Live Log */}
      <div className="mt-4 p-3 border-4 border-ink bg-ink text-background-light max-h-48 overflow-y-auto font-mono text-xs">
        <div className="text-background-light/50 mb-1 font-black uppercase text-[10px] tracking-wider">Live Log:</div>
        {events.map((ev, i) => (
          <div key={i} className={`${
            ev.event_type === 'error' ? 'text-comic-red' : ev.event_type === 'entity_found' ? 'text-comic-yellow' : 'text-background-light/60'
          }`}>
            <span className="text-background-light/30">{new Date(ev.created_at).toLocaleTimeString()}</span>{' '}
            {ev.message}
          </div>
        ))}
        {events.length === 0 && <div className="text-background-light/30">Waiting for events...</div>}
      </div>

      {scan.status === 'completed' && (
        <Link href={`/kavach/scan/${scanId}`} className="mt-3 block text-center text-sm text-comic-blue font-black uppercase hover:text-comic-red underline">
          View Full Report →
        </Link>
      )}
    </div>
  );
}

// ─── Stats Card ───
function StatCard({ label, value, color = 'text-ink', icon }: { label: string; value: string | number; color?: string; icon: string }) {
  return (
    <div className="kavach-stat-card">
      <div className="text-2xl mb-1 relative z-10">{icon}</div>
      <div className={`text-3xl font-black relative z-10 ${color}`}>{value}</div>
      <div className="text-xs font-black uppercase text-ink/50 mt-0.5 tracking-wider relative z-10">{label}</div>
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
    <div className="min-h-screen bg-background-light text-ink font-display">
      {/* Hero Header */}
      <div className="kavach-hero">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 border-4 border-ink bg-comic-red flex items-center justify-center text-2xl font-black text-white shadow-[4px_4px_0px_#1a1a2e]">K</div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ color: '#1a1a2e' }}>KAVACH</h1>
              <p className="text-xs font-bold uppercase text-ink/50 tracking-widest">IP Compliance Engine — Phase 1</p>
            </div>
          </div>
          <p className="text-sm font-bold text-ink/60 mt-2 max-w-xl border-l-4 border-comic-red pl-4">
            Real-time intellectual property scanning powered by Indian law (Copyright Act 1957, IT Act §79, Trademark Act 1999)
            and international law (DMCA §512, Berne Convention, EU DSA).
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="🛡️" label="Blocked Entities" value={totalEntities.toLocaleString()} color="text-comic-red" />
          <StatCard icon="📊" label="Scans Today" value={scansToday} color="text-comic-blue" />
          <StatCard icon="✨" label="Avg. Originality" value={avgScore ? `${avgScore}%` : '—'} color="text-comic-green" />
          <StatCard icon="⚡" label="Active Scans" value={activeScans.length} color="text-comic-purple" />
        </div>

        {/* Active Pipeline */}
        {activeScanId && (
          <LivePipeline scanId={activeScanId} storyTitle={(activeScans[0] as any)?.story?.title} />
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <div className="kavach-card">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: '#1a1a2e' }}>Recent Scans</h2>
            <div className="space-y-2">
              {recentScans.length === 0 && <p className="text-sm font-bold text-ink/40">No scans yet. Submit a story to begin.</p>}
              {recentScans.slice(0, 10).map(scan => (
                <Link key={scan.id} href={`/kavach/scan/${scan.id}`}
                  className="block p-3 border-2 border-ink/20 hover:border-ink hover:bg-muted transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black">{(scan as any).story?.title || 'Untitled'}</div>
                      <div className="text-xs text-ink/40 font-bold">{new Date(scan.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.originality_score != null && (
                        <span className={`text-sm font-black ${
                          scan.originality_score >= 90 ? 'text-comic-green' : scan.originality_score >= 70 ? 'text-comic-blue' :
                          scan.originality_score >= 50 ? 'text-comic-yellow' : 'text-comic-red'
                        }`}>{scan.originality_score}%</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 border-2 border-ink font-bold uppercase ${
                        scan.status === 'completed' ? 'bg-comic-green text-white' :
                        scan.status === 'failed' ? 'bg-comic-red text-white' : 'bg-comic-yellow text-ink'
                      }`}>{scan.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Entity Blocklist Stats */}
          <div className="kavach-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: '#1a1a2e' }}>IP Blocklist</h2>
              <Link href="/kavach/blocklist" className="text-xs text-comic-blue font-black uppercase hover:text-comic-red transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {ENTITY_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-2 border-2 border-ink/10 hover:border-ink/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-ink" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-bold">{cat.label}</span>
                  </div>
                  <span className="text-sm font-black font-mono text-ink/60">
                    {(blocklistStats[cat.key] || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t-4 border-ink flex justify-between text-sm font-black uppercase">
                <span>Total</span>
                <span className="text-comic-red">{totalEntities.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/kavach/submit" className="kavach-action-card group">
            <span className="text-3xl">📝</span>
            <span className="font-black text-lg tracking-tight">Submit Story</span>
            <span className="text-xs text-ink/50 font-bold group-hover:text-white/80">Scan & verify originality</span>
          </Link>
          <Link href="/kavach/dmca" className="kavach-action-card group">
            <span className="text-3xl">⚖️</span>
            <span className="font-black text-lg tracking-tight">File DMCA</span>
            <span className="text-xs text-ink/50 font-bold group-hover:text-white/80">Submit takedown notice</span>
          </Link>
          <Link href="/kavach/blocklist" className="kavach-action-card group">
            <span className="text-3xl">🔍</span>
            <span className="font-black text-lg tracking-tight">Explore Blocklist</span>
            <span className="text-xs text-ink/50 font-bold group-hover:text-white/80">Search 10,000+ IP entities</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
