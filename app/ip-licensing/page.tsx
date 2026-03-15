'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, FileText, DollarSign, Layers, Globe, Film, Gamepad2, BookOpen, Briefcase } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const LISTINGS = [
  {
    title: 'The Neon Mahabharata',
    creator: 'SolanaStoryteller',
    type: 'Story Universe',
    category: 'Film / Streaming',
    status: 'Available',
    royalty: '8%',
    minBid: '50,000 CRAFTS',
    negotiation: 'On-chain',
    avatar: '🧑‍🎨',
  },
  {
    title: 'Steel Souls — Character IP',
    creator: 'ComiKnight',
    type: 'Comic Universe',
    category: 'Game Studio',
    status: 'Available',
    royalty: '6%',
    minBid: '75,000 CRAFTS',
    negotiation: 'On-chain',
    avatar: '🦸',
  },
  {
    title: 'Midnight Ghazal Collection',
    creator: 'VerseWeaver_AI',
    type: 'Poetry Collection',
    category: 'Publishing / Print',
    status: 'In Negotiation',
    royalty: '10%',
    minBid: '20,000 CRAFTS',
    negotiation: 'On-chain',
    avatar: '✍️',
  },
  {
    title: 'Dystopia Blues World',
    creator: 'PixelBard',
    type: 'Story Universe',
    category: 'Brand Licensing',
    status: 'Available',
    royalty: '7%',
    minBid: '30,000 CRAFTS',
    negotiation: 'On-chain',
    avatar: '🎭',
  },
];

const CATEGORIES = [
  { icon: <Film className="w-6 h-6" />, label: 'Film & Streaming' },
  { icon: <Gamepad2 className="w-6 h-6" />, label: 'Game Studios' },
  { icon: <BookOpen className="w-6 h-6" />, label: 'Publishing' },
  { icon: <Briefcase className="w-6 h-6" />, label: 'Brand Licensing' },
  { icon: <Globe className="w-6 h-6" />, label: 'Education' },
  { icon: <Layers className="w-6 h-6" />, label: 'Marketing & Ads' },
];

export default function IPLicensingPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              IP Licensing Marketplace
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              License<br /><span className="text-comic-primary">Creative IP</span><br />On-Chain
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Brands, game studios, film producers, and publishers can license creative works directly from the platform. On-chain negotiation with automatic royalty distribution.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black uppercase mb-6">Browse by Use Case</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <button key={c.label} className="border-4 border-ink p-4 flex flex-col items-center gap-2 bg-white hover:bg-ink hover:text-background-light transition-all shadow-[2px_2px_0px_#1a100f] group text-center">
                <span className="text-comic-primary group-hover:text-comic-primary">{c.icon}</span>
                <span className="font-black uppercase text-xs">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Available IP</h2>
          <div className="space-y-5">
            {LISTINGS.map((l, i) => (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="border-4 border-ink bg-white p-6 shadow-[4px_4px_0px_#1a100f] flex flex-col md:flex-row gap-4 items-start md:items-center"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-4xl">{l.avatar}</span>
                  <div>
                    <div className="text-xs font-bold uppercase text-ink/40 mb-1">{l.type} — {l.category}</div>
                    <h3 className="text-xl font-black">{l.title}</h3>
                    <div className="text-sm text-ink/60">by {l.creator}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-center">
                    <div className="font-black text-lg text-comic-primary">{l.royalty}</div>
                    <div className="text-xs text-ink/40">Royalty Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black">{l.minBid}</div>
                    <div className="text-xs text-ink/40">Min. Bid</div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 border-2 ${l.status === 'Available' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-amber-500 text-amber-600 bg-amber-50'}`}>
                    {l.status}
                  </span>
                  <button className={`px-4 py-2 font-black uppercase text-sm border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all ${l.status === 'Available' ? 'bg-comic-primary text-white' : 'bg-zinc-100 text-ink/40 cursor-not-allowed'}`} disabled={l.status !== 'Available'}>
                    {l.status === 'Available' ? 'Negotiate' : 'In Progress'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6 bg-ink text-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">On-Chain Licensing Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Browse & Select', desc: 'Find the IP that fits your project — story universe, character, or poetry collection.' },
              { step: '02', title: 'Negotiate On-Chain', desc: 'Submit terms via smart contract. Creator accepts, counters, or rejects. All recorded on-chain.' },
              { step: '03', title: 'Sign License Agreement', desc: 'Digital signature from both parties locks the license terms permanently on-chain.' },
              { step: '04', title: 'Royalties Auto-Distributed', desc: 'Royalties per the agreed rate flow automatically to the creator on every use event.' },
            ].map((s) => (
              <div key={s.step} className="border-2 border-background-light/20 p-5">
                <div className="text-5xl font-black opacity-20 mb-3">{s.step}</div>
                <h4 className="font-black uppercase text-sm mb-2">{s.title}</h4>
                <p className="text-background-light/50 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
