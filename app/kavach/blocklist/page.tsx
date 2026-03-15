'use client';
// KAVACH Entity Blocklist Explorer — Searchable, filterable table of 10K+ IP entities
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
          <Link href="/kavach" className="hover:text-white">KAVACH</Link><span>/</span><span>Blocklist</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black">IP Entity Blocklist</h1>
            <p className="text-sm text-zinc-400">{total.toLocaleString()} protected entities across {Object.keys(categoryStats).length} categories</p>
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCategory('')} className={`text-xs px-3 py-1 rounded-full transition ${!category ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>All</button>
            {ENTITY_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`text-xs px-3 py-1 rounded-full transition ${category === cat.key ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                style={{ backgroundColor: category === cat.key ? cat.color : 'rgb(39 39 42)' }}>
                {cat.label} ({categoryStats[cat.key] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entities..."
            className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none" />
          <select value={entityType} onChange={e => setEntityType(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>
            {ENTITY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-zinc-400">Entity</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-400">Type</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-400">IP Owner</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-400">Risk</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-400">Aliases</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">Loading...</td></tr>
              ) : entities.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">No entities found. Try adjusting filters.</td></tr>
              ) : entities.map(entity => (
                <tr key={entity.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="px-4 py-2">
                    <div className="font-semibold">{entity.name}</div>
                    {entity.ip_universe && <div className="text-xs text-zinc-500">{entity.ip_universe}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{entity.entity_type}</span>
                  </td>
                  <td className="px-4 py-2 text-zinc-400">{entity.ip_owner}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{
                      backgroundColor: RISK_LEVELS[entity.risk_level as keyof typeof RISK_LEVELS]?.color + '22',
                      color: RISK_LEVELS[entity.risk_level as keyof typeof RISK_LEVELS]?.color,
                    }}>{entity.risk_level}</span>
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500 max-w-[200px] truncate">
                    {(entity.aliases || []).slice(0, 3).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded bg-zinc-800 text-sm disabled:opacity-30 hover:bg-zinc-700">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 rounded bg-zinc-800 text-sm disabled:opacity-30 hover:bg-zinc-700">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
