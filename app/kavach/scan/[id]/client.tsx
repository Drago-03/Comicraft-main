'use client';
// KAVACH Scan Detail & Originality Report
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useKavachRealtime } from '@/hooks/use-kavach-realtime';
import { PIPELINE_STEPS, LICENSE_TIERS, RISK_LEVELS, COMPLIANCE_BADGES } from '@/lib/kavach/constants';
import type { KavachScan, ScanAuditEntry } from '@/lib/kavach/types';

export default function ScanDetailClient({ id: initialId }: { id: string }) {
  const params = useParams<{ id: string }>();
  const id = initialId || params.id;
  
  const { scan: liveScan } = useKavachRealtime(id);
  const [scan, setScan] = useState<KavachScan | null>(null);
  const [auditLog, setAuditLog] = useState<ScanAuditEntry[]>([]);
  const [story, setStory] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`/api/kavach/scan/${id}`);
      const data = await res.json();
      if (data.scan) setScan(data.scan);
      if (data.audit_log) setAuditLog(data.audit_log);
      if (data.story) setStory(data.story);
    };
    load();
  }, [id]);

  const displayScan = liveScan || scan;
  if (!displayScan) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="animate-pulse text-zinc-400">Loading scan report...</div>
    </div>
  );

  const tierConfig = displayScan.assigned_tier_id ? LICENSE_TIERS[displayScan.assigned_tier_id as keyof typeof LICENSE_TIERS] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
          <Link href="/kavach" className="hover:text-white">KAVACH</Link>
          <span>/</span>
          <span>Scan Report</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Score Circle */}
          <div className="flex-shrink-0 text-center">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${
              (displayScan.originality_score ?? 0) >= 90 ? 'border-green-500 text-green-400' :
              (displayScan.originality_score ?? 0) >= 70 ? 'border-blue-500 text-blue-400' :
              (displayScan.originality_score ?? 0) >= 50 ? 'border-amber-500 text-amber-400' :
              'border-red-500 text-red-400'
            }`}>
              <span className="text-4xl font-black">{displayScan.originality_score ?? '—'}</span>
              <span className="text-xs opacity-70">/ 100</span>
            </div>
            <div className="text-xs text-zinc-400 mt-2">Originality Score</div>
          </div>

          {/* Story & Tier Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-black mb-1">{story?.title || 'Untitled Story'}</h1>
            {tierConfig && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-2" style={{ backgroundColor: tierConfig.color + '22', color: tierConfig.color }}>
                <span className="font-bold text-sm">{tierConfig.name}</span>
              </div>
            )}
            {displayScan.tier_reasoning && (
              <p className="text-sm text-zinc-400 mt-2">{displayScan.tier_reasoning}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Issues: {displayScan.issues_found}</span>
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Entities: {displayScan.entity_match_count}</span>
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Text: {displayScan.text_similarity_score ?? 0}%</span>
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded">{displayScan.scan_type} scan</span>
            </div>
          </div>
        </div>

        {/* Tier Rights Breakdown */}
        {tierConfig && displayScan.assigned_tier && (
          <div className="kavach-card mb-6">
            <h2 className="font-bold mb-3">License Rights — {tierConfig.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries((displayScan.assigned_tier as any).rights_granted || {}).map(([key, val]) => (
                <div key={key} className={`p-2 rounded text-center text-xs ${val ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  <div className="text-lg mb-1">{val ? '✓' : '✗'}</div>
                  {key.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List */}
        <div className="kavach-card mb-6">
          <h2 className="font-bold mb-3">Issues Found</h2>
          {(displayScan.entity_matches || []).length === 0 && (displayScan.text_matches || []).length === 0 ? (
            <p className="text-sm text-green-400">✓ No IP issues detected</p>
          ) : (
            <div className="space-y-2">
              {(displayScan.entity_matches || []).map((m: any, i: number) => (
                <div key={`e${i}`} className="p-3 rounded-lg bg-zinc-800/50 border-l-2" style={{ borderColor: RISK_LEVELS[m.risk_level as keyof typeof RISK_LEVELS]?.color }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: RISK_LEVELS[m.risk_level as keyof typeof RISK_LEVELS]?.color + '33', color: RISK_LEVELS[m.risk_level as keyof typeof RISK_LEVELS]?.color }}>
                      {m.risk_level.toUpperCase()}
                    </span>
                    <span className="font-semibold text-sm">{m.entity_name}</span>
                    <span className="text-xs text-zinc-500">({m.entity_type})</span>
                  </div>
                  <div className="text-xs text-zinc-400">Owner: {m.ip_owner}{m.ip_universe ? ` • ${m.ip_universe}` : ''}</div>
                  <div className="text-xs text-zinc-500 mt-1">{m.context}</div>
                  <div className="text-xs text-amber-400 mt-1">💡 {m.suggestion}</div>
                </div>
              ))}
              {(displayScan.text_matches || []).map((m: any, i: number) => (
                <div key={`t${i}`} className="p-3 rounded-lg bg-zinc-800/50 border-l-2 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">TEXT MATCH</span>
                    <span className="font-semibold text-sm">{m.similarity_pct.toFixed(1)}% similar</span>
                  </div>
                  <div className="text-xs text-zinc-400">Source: {m.source}</div>
                  <div className="text-xs text-amber-400 mt-1">💡 {m.suggestion}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Badges */}
        <div className="kavach-card mb-6">
          <h2 className="font-bold mb-3">Legal Compliance</h2>
          <div className="flex flex-wrap gap-2">
            {COMPLIANCE_BADGES.map(badge => {
              const isActive = (displayScan.compliance_flags as any)?.[badge.flag];
              return (
                <div key={badge.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                  isActive ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                  <span>{isActive ? '✓' : '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="kavach-card">
          <h2 className="font-bold mb-3">Audit Trail</h2>
          <div className="space-y-2">
            {auditLog.map((entry, i) => (
              <div key={i} className="p-2 rounded bg-zinc-800/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-zinc-300">{entry.action}</span>
                  <span className="text-zinc-500">{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                {entry.legal_reference && <div className="text-zinc-500 mt-0.5">📜 {entry.legal_reference}</div>}
                <div className="font-mono text-zinc-600 text-[10px] mt-1 truncate">Hash: {entry.hash}</div>
              </div>
            ))}
            {auditLog.length === 0 && <p className="text-xs text-zinc-500">Audit log will populate after scan completion.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
