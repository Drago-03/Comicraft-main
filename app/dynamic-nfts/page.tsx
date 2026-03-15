'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, RefreshCw, GitBranch, Vote, Clock, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const EVOLUTIONS = [
  {
    title: 'Midnight Ghazal #001',
    type: 'Poem',
    creator: 'VerseWeaver_AI',
    avatar: '✍️',
    currentState: 'Stanza 7 of 12',
    nextUpdate: 'Apr 1, 2026 — Stanza 8 unlocks',
    historyCount: 6,
    voteOpen: true,
    voteQuestion: 'Should stanza 8 address loss or longing?',
    history: [
      { date: 'Mar 1', label: 'Stanzas 1–3 minted' },
      { date: 'Mar 8', label: 'Stanza 4 added — Raindrop Motif' },
      { date: 'Mar 15', label: 'Stanza 5 added — The River Returns' },
    ],
  },
  {
    title: 'Steel Souls — Issue 7',
    type: 'Comic',
    creator: 'ComiKnight',
    avatar: '🦸',
    currentState: 'Panel 18 of 24',
    nextUpdate: 'Mar 22, 2026 — Panel 19–21',
    historyCount: 5,
    voteOpen: true,
    voteQuestion: 'Should Arc-9 betray Orion or join him?',
    history: [
      { date: 'Feb 20', label: 'Panels 1–6 minted' },
      { date: 'Mar 1', label: 'Panels 7–12 — City Burns arc' },
      { date: 'Mar 12', label: 'Panels 13–18 — Reckoning' },
    ],
  },
  {
    title: 'The Neon Mahabharata — Vol. 1',
    type: 'Story',
    creator: 'SolanaStoryteller',
    avatar: '🧑‍🎨',
    currentState: 'Winter Ending Active',
    nextUpdate: 'Jun 21, 2026 — Summer Solstice Ending',
    historyCount: 3,
    voteOpen: false,
    voteQuestion: null,
    history: [
      { date: 'Dec 21', label: 'Winter Solstice Ending released' },
      { date: 'Mar 20', label: 'Spring Equinox Ending unlocked' },
    ],
  },
];

export default function DynamicNFTsPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Dynamic & Evolving NFTs
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              NFTs That<br /><span className="text-comic-primary">Grow</span> With<br />Your Story
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Poems that add stanzas monthly. Comics that release new panels based on holder votes. Stories with seasonal endings. Comicraft NFTs are living art — not static JPEGs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Types of Evolution */}
      <section className="py-16 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">How NFTs Evolve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-7 h-7 text-comic-primary" />, type: 'Poems', title: 'Monthly Stanza Unlocks', desc: 'A new stanza is added to your poem NFT every month. The on-chain metadata updates. Holders watch the poem grow.' },
              { icon: <Vote className="w-7 h-7 text-blue-500" />, type: 'Comics', title: 'Holder-Voted Panels', desc: 'NFT holders vote on story direction. Winning vote dictates which panels are drawn next and released to the NFT.' },
              { icon: <RefreshCw className="w-7 h-7 text-purple-500" />, type: 'Stories', title: 'Seasonal Endings', desc: 'Stories rotate endings on solstices and equinoxes. Your NFT\'s metadata changes with the season — 4 unique states per year.' },
            ].map((item) => (
              <div key={item.type} className="border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f] bg-white">
                <div className="text-xs font-black uppercase bg-ink text-white inline-block px-2 py-0.5 mb-3">{item.type}</div>
                <div className="mb-3">{item.icon}</div>
                <h4 className="text-xl font-black uppercase mb-2">{item.title}</h4>
                <p className="text-ink/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Evolutions */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Live Evolving NFTs</h2>
          <div className="space-y-8">
            {EVOLUTIONS.map((ev, i) => (
              <motion.div
                key={ev.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-4 border-ink bg-white shadow-[4px_4px_0px_#1a100f] overflow-hidden"
              >
                {/* Header */}
                <div className="bg-ink text-background-light p-4 flex items-center gap-3">
                  <span className="text-3xl">{ev.avatar}</span>
                  <div>
                    <div className="text-xs text-background-light/40 uppercase font-bold">{ev.type} — {ev.creator}</div>
                    <h3 className="text-xl font-black">{ev.title}</h3>
                  </div>
                  <span className="ml-auto text-xs bg-comic-primary text-white px-3 py-1 font-black uppercase">{ev.currentState}</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Evolution History */}
                  <div>
                    <h4 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-comic-primary" /> Evolution History
                    </h4>
                    <div className="space-y-2">
                      {ev.history.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="w-16 text-ink/40 font-mono text-xs shrink-0">{h.date}</span>
                          <div className="w-2 h-2 bg-comic-primary rounded-full shrink-0" />
                          <span>{h.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-ink/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Next: {ev.nextUpdate}
                    </div>
                  </div>

                  {/* Holder Vote */}
                  <div>
                    {ev.voteOpen ? (
                      <div className="border-4 border-ink p-4 bg-amber-50">
                        <h4 className="font-black uppercase text-sm mb-2 flex items-center gap-2">
                          <Vote className="w-4 h-4 text-amber-600" /> Active Holder Vote
                        </h4>
                        <p className="text-sm font-bold italic mb-4">"{ev.voteQuestion}"</p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-ink text-white font-black uppercase text-xs border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all">
                            Option A
                          </button>
                          <button className="flex-1 py-2 border-2 border-ink font-black uppercase text-xs shadow-[2px_2px_0px_#1a100f] hover:bg-ink hover:text-white transition-all">
                            Option B
                          </button>
                        </div>
                        <p className="text-xs text-ink/40 mt-2">Holders only — requires ≥1 NFT from this collection.</p>
                      </div>
                    ) : (
                      <div className="border-2 border-ink/20 p-4 bg-zinc-50 text-ink/40 text-sm italic">
                        No active vote — next community vote opens with the next evolution.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-ink text-background-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-4">
              Create a <span className="text-comic-primary">Living NFT</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg mb-8 max-w-xl mx-auto">
              Turn on Dynamic Mint when publishing your next story, poem, or comic to let it evolve over time.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/create" className="bg-comic-primary text-white px-8 py-4 font-black uppercase text-lg border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                Start Creating <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
