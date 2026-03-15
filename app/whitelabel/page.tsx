'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code2, Cpu, BookOpen, Gamepad2, GraduationCap, Megaphone, CheckCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const TIERS = [
  {
    name: 'Starter',
    price: '$99/mo or 8,000 CRAFTS/mo',
    desc: 'For indie developers and small teams.',
    features: ['VedaScript API — 500 calls/mo', 'KavyaScript API — 500 calls/mo', 'Basic analytics', 'Email support'],
    highlight: false,
  },
  {
    name: 'Studio',
    price: '$499/mo or 40,000 CRAFTS/mo',
    desc: 'For scale-ups and creative platforms.',
    features: ['All engines — 10,000 calls/mo', 'Panelra image API — 2,000/mo', 'NFT minting API', 'Priority support', 'Custom branding'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For publishers, studios, and large platforms.',
    features: ['Unlimited API calls', 'Dedicated infrastructure', 'SLA 99.9%', 'On-chain royalty SDK', 'White-label UI kit', 'Dedicated account manager'],
    highlight: false,
  },
];

const ENDPOINTS = [
  { method: 'POST', path: '/v1/vedascript/generate', desc: 'Generate a story chapter with 71 tunable parameters.' },
  { method: 'POST', path: '/v1/panelra/panels', desc: 'Generate comic panels from a script with Imagen AI.' },
  { method: 'POST', path: '/v1/kavyascript/compose', desc: 'Compose a poem (haiku, sonnet, ghazal, free verse).' },
  { method: 'POST', path: '/v1/mint/nft', desc: 'Mint a created work as an NFT on Ethereum.' },
  { method: 'GET', path: '/v1/royalties/{tokenId}', desc: 'Get royalty distribution for an NFT.' },
];

export default function WhiteLabelPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              White-Label Creative Studio
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              Power Your<br />Platform with<br /><span className="text-comic-primary">Comicraft</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Access VedaScript, Panelra, and KavyaScript as a white-label API. Build your own creative platform — education, marketing, gaming, publishing — powered by Comicraft&apos;s engines.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Use Cases</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <GraduationCap className="w-7 h-7" />, label: 'Education Platforms', desc: 'AI-powered story writing tools for students' },
              { icon: <Megaphone className="w-7 h-7" />, label: 'Marketing Agencies', desc: 'Brand storytelling and content generation' },
              { icon: <Gamepad2 className="w-7 h-7" />, label: 'Game Studios', desc: 'In-game lore, quest text, and comic cutscenes' },
              { icon: <BookOpen className="w-7 h-7" />, label: 'Publishers', desc: 'AI-assisted authoring and illustration' },
            ].map((uc) => (
              <div key={uc.label} className="border-4 border-ink p-5 bg-white shadow-[3px_3px_0px_#1a100f] text-center group hover:bg-ink hover:text-background-light transition-all duration-300">
                <div className="text-comic-primary mb-3 flex justify-center">{uc.icon}</div>
                <div className="font-black uppercase text-sm mb-1">{uc.label}</div>
                <div className="text-xs opacity-60">{uc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">API Reference</h2>
          <div className="border-4 border-ink bg-zinc-950 p-6 shadow-[4px_4px_0px_#1a100f] font-mono">
            <div className="text-zinc-400 text-xs mb-4">Base URL: <span className="text-emerald-400">https://api.comicraft.xyz</span></div>
            <div className="space-y-4">
              {ENDPOINTS.map((ep) => (
                <div key={ep.path} className="flex flex-col md:flex-row md:items-center gap-2 border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                  <span className={`text-xs font-black px-2 py-0.5 rounded shrink-0 ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{ep.method}</span>
                  <span className="text-amber-300 text-sm">{ep.path}</span>
                  <span className="text-zinc-400 text-xs md:ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-6 bg-white border-t-4 border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Pricing Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f] ${t.highlight ? 'bg-comic-primary text-white' : 'bg-white'}`}
              >
                {t.highlight && <div className="text-xs font-black uppercase bg-white text-comic-primary px-3 py-1 inline-block mb-3">Most Popular</div>}
                <h3 className="text-2xl font-black uppercase mb-1">{t.name}</h3>
                <div className="font-black text-sm mb-1 opacity-80">{t.price}</div>
                <p className={`text-sm mb-4 ${t.highlight ? 'text-white/70' : 'text-ink/60'}`}>{t.desc}</p>
                <ul className="space-y-2 mb-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full font-black uppercase py-3 text-sm border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all ${t.highlight ? 'bg-white text-comic-primary' : 'bg-ink text-white'}`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
