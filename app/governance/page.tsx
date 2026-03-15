'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Vote, Shield, TrendingUp, Users, Coins, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const PROPOSALS = [
  {
    id: 'CIP-001',
    title: 'Feature Engines in Equal Order on Homepage',
    category: 'Platform',
    status: 'Active',
    endDate: '2026-03-28',
    yesVotes: 142800,
    noVotes: 31200,
    totalVotes: 174000,
    quorum: 200000,
    description: 'Rotate KavyaScript, Panelra, VedaScript, and Mythloom in a random order each week to give equal homepage visibility to all engines.',
  },
  {
    id: 'CIP-002',
    title: 'Increase Creator Fund Allocation to 8% of Platform Fees',
    category: 'Economics',
    status: 'Active',
    endDate: '2026-03-30',
    yesVotes: 198400,
    noVotes: 22100,
    totalVotes: 220500,
    quorum: 200000,
    description: 'Raise the Creator Fund allocation from 5% to 8% of all platform fee revenue to better support emerging creators.',
  },
  {
    id: 'CIP-003',
    title: 'Add Blur as Official NFT Distribution Partner',
    category: 'Marketplace',
    status: 'Passed',
    endDate: '2026-03-10',
    yesVotes: 261000,
    noVotes: 18000,
    totalVotes: 279000,
    quorum: 200000,
    description: 'Auto-list Comicraft NFTs on Blur marketplace in addition to OpenSea and Rarible.',
  },
  {
    id: 'CIP-004',
    title: 'Launch IP Licensing Marketplace — Phase 1',
    category: 'New Feature',
    status: 'Passed',
    endDate: '2026-03-05',
    yesVotes: 310000,
    noVotes: 9000,
    totalVotes: 319000,
    quorum: 200000,
    description: 'Approve development and launch of the IP Licensing Marketplace for brands, game studios, film producers, and publishers.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Platform: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Economics: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Marketplace: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'New Feature': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function GovernancePage() {
  const [voted, setVoted] = useState<Record<string, 'yes' | 'no'>>({});

  const handleVote = (id: string, side: 'yes' | 'no') => {
    setVoted((prev) => ({ ...prev, [id]: side }));
  };

  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              DAO Governance
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              Comicraft<br /><span className="text-comic-primary">Governance</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              CRAFTS holders govern the platform. Stake CRAFTS to vote on featured stories, engine priorities, marketplace rules, and creator fund allocation.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
              {[
                { label: '2 Active Proposals', icon: <Vote className="w-5 h-5" /> },
                { label: '840K CRAFTS Staked', icon: <Coins className="w-5 h-5" /> },
                { label: '1,420 Voters', icon: <Users className="w-5 h-5" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 bg-background-light/10 border border-background-light/20 px-4 py-2">
                  <span className="text-comic-primary">{stat.icon}</span>
                  <span className="font-black uppercase text-sm">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How Governance Works */}
      <section className="py-16 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Stake CRAFTS', desc: 'Lock your CRAFTS tokens to gain governance voting power. 1 CRAFTS = 1 vote.' },
              { step: '02', title: 'Vote on Proposals', desc: 'Vote YES or NO on active Comicraft Improvement Proposals (CIPs) before the deadline.' },
              { step: '03', title: 'Results Executed', desc: 'Proposals reaching quorum are automatically executed on-chain or by the Comicraft dev team.' },
            ].map((s) => (
              <div key={s.step} className="border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f]">
                <div className="text-5xl font-black opacity-20 mb-3">{s.step}</div>
                <h4 className="text-xl font-black uppercase mb-2">{s.title}</h4>
                <p className="text-ink/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proposals */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">All Proposals</h2>
          <div className="space-y-6">
            {PROPOSALS.map((p, i) => {
              const totalPct = p.totalVotes / p.quorum * 100;
              const yesPct = p.yesVotes / (p.yesVotes + p.noVotes) * 100;
              const isActive = p.status === 'Active';
              const userVote = voted[p.id];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border-4 border-ink bg-white p-6 shadow-[4px_4px_0px_#1a100f]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs font-mono text-ink/40">{p.id}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${CATEGORY_COLORS[p.category]}`}>{p.category}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-zinc-200 text-zinc-500'}`}>
                          {p.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-black">{p.title}</h3>
                      <p className="text-sm text-ink/60 mt-1">{p.description}</p>
                    </div>
                    {!isActive && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
                  </div>

                  {/* Vote Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-600">YES — {p.yesVotes.toLocaleString()}</span>
                      <span className="text-red-500">NO — {p.noVotes.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${yesPct.toFixed(1)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-ink/40 mt-1">
                      <span>{yesPct.toFixed(1)}% Yes</span>
                      <span>Quorum: {Math.round(totalPct)}% ({p.quorum.toLocaleString()} needed)</span>
                    </div>
                  </div>

                  {/* Quorum Progress */}
                  <div className="mb-4">
                    <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(totalPct, 100).toFixed(1)}%` }} />
                    </div>
                    <div className="text-xs text-ink/40 mt-1">
                      {p.totalVotes.toLocaleString()} / {p.quorum.toLocaleString()} CRAFTS voted • Ends {isActive ? p.endDate : 'Closed'}
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex gap-3">
                      {userVote ? (
                        <div className={`px-4 py-2 text-sm font-black uppercase ${userVote === 'yes' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          Voted {userVote.toUpperCase()} ✓
                        </div>
                      ) : (
                        <>
                          <button onClick={() => handleVote(p.id, 'yes')} className="px-6 py-2 bg-emerald-500 text-white font-black uppercase text-sm border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all">
                            Vote YES
                          </button>
                          <button onClick={() => handleVote(p.id, 'no')} className="px-6 py-2 bg-red-500 text-white font-black uppercase text-sm border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all">
                            Vote NO
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
