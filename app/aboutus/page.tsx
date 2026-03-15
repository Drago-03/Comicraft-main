'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Feather, Cpu, Globe, Coins, Shield, Zap, Users, TrendingUp, Star, Vote } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const EXISTING_FEATURES = [
  { icon: <Cpu className="w-6 h-6" />, name: 'VedaScript Engine', desc: 'AI story studio with 71 tunable parameters.' },
  { icon: <BookOpen className="w-6 h-6" />, name: 'Panelra Engine', desc: 'Panel-based comic creation with Imagen AI.' },
  { icon: <Zap className="w-6 h-6" />, name: 'Mythloom Engine', desc: 'Hybrid prose + comic multimedia stories.' },
  { icon: <Globe className="w-6 h-6" />, name: '12 Genre Worlds', desc: 'Sci-Fi, Fantasy, Horror, Romance, and more.' },
  { icon: <Coins className="w-6 h-6" />, name: 'CRAFTS Token Economy', desc: 'ERC-20 token powering platform transactions.' },
  { icon: <Shield className="w-6 h-6" />, name: 'KAVACH IP Compliance', desc: 'Entity scanning, DMCA, and originality scoring.' },
  { icon: <Star className="w-6 h-6" />, name: 'Bazaar Marketplace', desc: 'Trade and collect AI-minted NFTs on-chain.' },
  { icon: <Users className="w-6 h-6" />, name: 'Commons Community', desc: 'Stories, feeds, comments, and creator profiles.' },
  { icon: <TrendingUp className="w-6 h-6" />, name: 'Reputation & Quests', desc: 'Creator rank system and gamified craft quests.' },
  { icon: <BookOpen className="w-6 h-6" />, name: 'Storymint Gateway', desc: 'One-click NFT minting with Pinata IPFS.' },
  { icon: <Cpu className="w-6 h-6" />, name: 'MADHAVA Help Bot', desc: 'AI-powered platform assistant on Gemini.' },
  { icon: <Globe className="w-6 h-6" />, name: 'Neural Gallery', desc: 'Community gallery of un-minted AI works.' },
];

const NEW_FEATURES = [
  { icon: <Feather className="w-6 h-6" />, name: 'KavyaScript Poetry Engine', desc: 'Haiku, sonnets, ghazals, free verse, spoken word — with calligraphy NFTs.' },
  { icon: <Coins className="w-6 h-6" />, name: 'Secondary Royalty Engine', desc: '5–10% smart contract royalties on every NFT resale.' },
  { icon: <Globe className="w-6 h-6" />, name: 'Cross-Platform NFT Distribution', desc: 'Auto-list on OpenSea, Rarible, and Blur.' },
  { icon: <Zap className="w-6 h-6" />, name: 'Dynamic & Evolving NFTs', desc: 'NFTs that grow over time with holder-voted updates.' },
  { icon: <Shield className="w-6 h-6" />, name: 'IP Licensing Marketplace', desc: 'On-chain licensing for brands, studios, and publishers.' },
  { icon: <Cpu className="w-6 h-6" />, name: 'White-Label Creative Studio', desc: 'Comicraft engines as API for any platform.' },
  { icon: <Vote className="w-6 h-6" />, name: 'DAO Governance Layer', desc: 'Staked CRAFTS voting on all platform decisions.' },
  { icon: <Star className="w-6 h-6" />, name: 'Creator Fund & Grants', desc: 'Platform fee allocation rewarding top & emerging creators.' },
  { icon: <TrendingUp className="w-6 h-6" />, name: 'Reader Rewards & Collect-to-Earn', desc: 'CRAFTS for reading, reviewing, sharing, and collecting.' },
  { icon: <BookOpen className="w-6 h-6" />, name: 'Serialized Subscriptions & FanPay', desc: 'Weekly creator drops with CRAFTS tipping.' },
  { icon: <Coins className="w-6 h-6" />, name: 'Serum DEX Trading Space', desc: 'Decentralized CRAFTS trading on Solana via Serum.' },
];

const TIMELINE = [
  { year: '2024', label: 'Founded', desc: 'Comicraft launched as an AI-powered creative tool for stories and comics.' },
  { year: '2025', label: 'Expansion', desc: 'NFT minting, CRAFTS token, KAVACH IP compliance, and full marketplace launched.' },
  { year: '2026', label: 'Full Economy', desc: 'DAO governance, dynamic NFTs, IP licensing, creator fund, reader rewards, Serum DEX — Comicraft becomes a complete creative economy.' },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="relative bg-ink text-background-light py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              About Comicraft
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              The Full Creative<br /><span className="text-comic-primary">Economy</span><br />Is Here.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Comicraft started as an AI-powered creative tool and evolved into the world&apos;s first full-scale creative economy — combining AI creation engines, NFT ownership, a native token economy, and a complete governance and reward ecosystem under one roof.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-[3px] bg-ink/20" />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <motion.div
                  key={t.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-8 items-start pl-0"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 bg-comic-primary text-white flex items-center justify-center font-black text-sm border-4 border-ink shrink-0 z-10">{t.year}</div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-black uppercase">{t.label}</h3>
                    <p className="text-ink/60 text-sm mt-1">{t.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Built */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-3">What We Built</h2>
          <p className="text-ink/60 text-lg mb-8">The foundation — every feature that launched Comicraft as a creative platform.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXISTING_FEATURES.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-4 border-ink p-4 bg-white shadow-[3px_3px_0px_#1a100f] group hover:bg-ink hover:text-background-light transition-all duration-300"
              >
                <div className="text-comic-primary mb-2">{f.icon}</div>
                <h4 className="font-black uppercase text-sm">{f.name}</h4>
                <p className="text-xs opacity-60 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's New */}
      <section className="py-16 px-6 bg-ink text-background-light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-3">What&apos;s New in 2026</h2>
          <p className="text-background-light/60 text-lg mb-8">The evolution — from creative tool to full creative economy.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEW_FEATURES.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-2 border-background-light/20 p-4 bg-white/5 group hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-comic-primary mb-2">{f.icon}</div>
                <h4 className="font-black uppercase text-sm">{f.name}</h4>
                <p className="text-xs text-background-light/50 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6 bg-white border-t-8 border-ink">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="border-4 border-ink p-10 bg-white relative shadow-[8px_8px_0px_#1a100f]">
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%231a100f'/%3E%3C/svg%3E")` }} />
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-6 relative z-10">
              Our Mission
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl font-medium leading-relaxed text-ink/80 relative z-10 first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-comic-primary">
              Comicraft exists to give every creator — writer, poet, comic artist, storyteller — the tools, ownership, and economic infrastructure to build a sustainable creative life. We believe the future of creativity is owned by creators, governed by communities, and powered by technology that amplifies human imagination rather than replacing it.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4 relative z-10">
              <Link href="/create" className="bg-ink text-white px-8 py-3 font-black uppercase border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] hover:translate-y-[-2px] transition-all inline-block">
                Start Creating
              </Link>
              <Link href="/community" className="border-4 border-ink p-0.5 inline-block hover:translate-y-[-2px] transition-all">
                <span className="block border-2 border-ink px-8 py-3 font-black uppercase hover:bg-ink hover:text-white transition-all">
                  Join Commons
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
