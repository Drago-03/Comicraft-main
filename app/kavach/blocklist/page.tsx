'use client';
// KAVACH Entity Blocklist Explorer — Vintage Comic Theme
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ENTITY_CATEGORIES, ENTITY_TYPES, RISK_LEVELS } from '@/lib/kavach/constants';
import type { BlockedEntity } from '@/lib/kavach/types';

export default function BlocklistPage() {
  const [entities, setEntities] = useState<BlockedEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [entityType, setEntityType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (entityType) params.set('entity_type', entityType);
    if (riskLevel) params.set('risk_level', riskLevel);

    const res = await fetch(`/api/kavach/blocklist?${params}`);
    const data = await res.json();
    setEntities(data.entities || []);
    setTotal(data.total || 0);
    setCategoryStats(data.category_stats || {});
    setLoading(false);
  }, [page, search, category, entityType, riskLevel]);

  useEffect(() => { fetchEntities(); }, [fetchEntities]);
  useEffect(() => { setPage(1); }, [search, category, entityType, riskLevel]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background-light text-ink font-display pt-[100px]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-bold text-ink/40 mb-6">
          <Link href="/kavach" className="hover:text-comic-red transition-colors uppercase">KAVACH</Link>
          <span>/</span>
          <span className="text-ink font-black uppercase">Blocklist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic" style={{ color: '#1a1a2e' }}>
              IP Entity Blocklist
            </h1>
            <p className="text-sm font-bold text-ink/50 border-l-4 border-comic-red pl-3 mt-2">
              {total.toLocaleString()} protected entities across {Object.keys(categoryStats).length} categories
            </p>
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`text-xs px-4 py-1.5 font-black uppercase border-2 border-ink transition-all ${
                !category ? 'bg-ink text-background-light shadow-[2px_2px_0px_#1a1a2e]' : 'bg-card text-ink/60 hover:text-ink hover:bg-muted'
              }`}
            >All</button>
            {ENTITY_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`text-xs px-4 py-1.5 font-black uppercase border-2 border-ink transition-all ${
                  category === cat.key ? 'text-white shadow-[2px_2px_0px_#1a1a2e]' : 'text-ink/60 hover:text-ink'
                }`}
                style={{ backgroundColor: category === cat.key ? cat.color : 'var(--card)' }}>
                {cat.label} ({categoryStats[cat.key] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entities..."
            className="flex-1 min-w-[200px] bg-card border-4 border-ink px-4 py-2.5 text-sm font-bold focus:shadow-[4px_4px_0px_#1a1a2e] outline-none transition-shadow placeholder:text-ink/30" />
          <select value={entityType} onChange={e => setEntityType(e.target.value)}
            className="bg-card border-4 border-ink px-4 py-2.5 text-sm font-bold cursor-pointer">
            <option value="">All Types</option>
            {ENTITY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)}
            className="bg-card border-4 border-ink px-4 py-2.5 text-sm font-bold cursor-pointer">
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-4 border-ink shadow-[6px_6px_0px_#1a1a2e]">
          <table className="w-full text-sm">
            <thead className="bg-ink text-background-light">
              <tr>
                <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-xs">Entity</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-xs">Type</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-xs">IP Owner</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-xs">Risk</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-xs">Aliases</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-ink/40 font-black">Loading...</td></tr>
              ) : entities.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-ink/40 font-bold">No entities found. Try adjusting filters.</td></tr>
              ) : entities.map(entity => (
                <tr key={entity.id} className="border-t-2 border-ink/10 hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-black">{entity.name}</div>
                    {entity.ip_universe && <div className="text-xs text-ink/40 font-bold">{entity.ip_universe}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 border-2 border-ink/30 font-bold uppercase bg-muted">{entity.entity_type}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/60 font-bold">{entity.ip_owner}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 border-2 border-ink font-black uppercase" style={{
                      backgroundColor: RISK_LEVELS[entity.risk_level as keyof typeof RISK_LEVELS]?.color + '22',
                      color: RISK_LEVELS[entity.risk_level as keyof typeof RISK_LEVELS]?.color,
                    }}>{entity.risk_level}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/40 font-bold max-w-[200px] truncate">
                    {(entity.aliases || []).slice(0, 3).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs font-black text-ink/40 uppercase">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border-4 border-ink bg-card text-sm font-black uppercase disabled:opacity-30 hover:bg-ink hover:text-background-light transition-all shadow-[3px_3px_0px_#1a1a2e] hover:shadow-[1px_1px_0px_#1a1a2e]">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border-4 border-ink bg-card text-sm font-black uppercase disabled:opacity-30 hover:bg-ink hover:text-background-light transition-all shadow-[3px_3px_0px_#1a1a2e] hover:shadow-[1px_1px_0px_#1a1a2e]">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
