'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Feather, BookOpen, Sparkles, Palette, Mic, ScrollText } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const FORMS = [
  {
    id: 'haiku',
    icon: '🌸',
    name: 'Haiku',
    desc: '5-7-5 syllable structure. Captures a single moment in nature or emotion.',
    example: 'Old silent pond…\nA frog jumps into the pond—\nSplash! Silence again.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'sonnet',
    icon: '🎭',
    name: 'Sonnet',
    desc: '14-line iambic pentameter. Two forms: Shakespearean and Petrarchan.',
    example: 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate...',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'ghazal',
    icon: '🌙',
    name: 'Ghazal',
    desc: 'Ancient Urdu/Persian form. Radif refrain, maqta signature couplet.',
    example: 'Every night I burn, every night I burn for you—\nIn this city of ruins, I turn and turn for you...',
    color: 'from-violet-500 to-purple-700',
  },
  {
    id: 'free-verse',
    icon: '🌊',
    name: 'Free Verse',
    desc: 'No fixed metre or rhyme. Pure voice, image, and rhythm.',
    example: 'I am large, I contain multitudes.\nThe past and the present wilt—I have filled them...',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'spoken-word',
    icon: '🎤',
    name: 'Spoken Word',
    desc: 'Performance poetry. Rhythm, repetition, and raw emotion for the stage.',
    example: 'They say the pen is mightier / but they never saw a fist / rise up through centuries of silence...',
    color: 'from-emerald-500 to-green-700',
  },
  {
    id: 'calligraphy-nft',
    icon: '✒️',
    name: 'Calligraphy NFT',
    desc: 'Calligraphy-style visual rendering. Mint as a display-worthy NFT.',
    example: 'Your poem, typeset in Devanagari or Arabic calligraphy, minted on-chain.',
    color: 'from-yellow-500 to-amber-600',
  },
];

export default function KavyaScriptPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="relative bg-ink text-background-light py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Engine 04 — KavyaScript
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              KavyaScript<br /><span className="text-comic-primary">Poetry</span><br />Engine
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              A dedicated poetry creation engine supporting Haiku, Sonnets, Ghazals, Free Verse, and Spoken Word — with calligraphy-style visual rendering for display-worthy minted collectibles.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href="/create" className="relative group inline-block">
                <div className="absolute inset-0 bg-comic-primary border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] scale-110 rotate-2 group-hover:rotate-0 transition-transform" />
                <span className="relative block bg-comic-primary text-white font-black uppercase px-8 py-4 text-lg tracking-tighter">
                  Compose a Poem <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </span>
              </Link>
              <Link href="/marketplace" className="border-4 border-background-light border-dashed p-1 inline-block">
                <span className="block border-2 border-background-light px-8 py-4 font-black uppercase text-lg text-background-light hover:bg-background-light hover:text-ink transition-all">
                  Browse Poetry NFTs
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Poetry Forms Grid */}
      <section className="py-20 px-6 bg-background-light">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
              <span className="bg-comic-primary h-8 w-8 inline-block" />
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Supported Forms</h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-ink/60 text-lg max-w-xl">
              Choose your form. KavyaScript&apos;s AI understands metre, rhyme scheme, cultural context, and emotional register.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORMS.map((form, i) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-4 border-ink p-6 bg-white group hover:bg-ink hover:text-background-light transition-all duration-300 cursor-pointer shadow-[4px_4px_0px_#1a100f]"
              >
                <div className="text-4xl mb-3">{form.icon}</div>
                <h3 className="text-2xl font-black uppercase mb-2">{form.name}</h3>
                <p className="text-sm opacity-70 mb-4">{form.desc}</p>
                <div className="border-l-4 border-comic-primary pl-3">
                  <p className="text-xs font-mono italic opacity-60 whitespace-pre-line">{form.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-ink text-background-light">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-12">
              How <span className="text-comic-primary">KavyaScript</span> Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: <Feather className="w-8 h-8" />, title: 'Choose Form & Prompt', desc: 'Select your poetry form (Haiku, Sonnet, Ghazal…) and enter your theme, emotion, or subject.' },
                { step: '02', icon: <Sparkles className="w-8 h-8" />, title: 'AI Composition', desc: 'KavyaScript\'s AI generates metre-correct, culturally aware poetry — with revision controls for every line.' },
                { step: '03', icon: <Palette className="w-8 h-8" />, title: 'Calligraphy Render & Mint', desc: 'Export as a calligraphy-style visual in Devanagari, Arabic, or Latin script. Mint as a display NFT on-chain.' },
              ].map((s) => (
                <motion.div key={s.step} variants={fadeUp} className="border-2 border-background-light/20 p-6">
                  <div className="text-6xl font-black opacity-20 mb-4">{s.step}</div>
                  <div className="text-comic-primary mb-3">{s.icon}</div>
                  <h4 className="text-xl font-black uppercase mb-2">{s.title}</h4>
                  <p className="text-background-light/60 text-sm">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calligraphy NFT CTA */}
      <section className="py-20 px-6 bg-white border-t-8 border-ink">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-6xl mb-6">✒️</motion.div>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-4">
              Mint Your Poem as Art
            </motion.h2>
            <motion.p variants={fadeUp} className="text-ink/60 text-lg mb-8 max-w-2xl mx-auto">
              Every poem composed with KavyaScript can be rendered in calligraphy — Devanagari for Sanskrit and Hindi forms, Arabic script for ghazals, and Roman for Western forms — and minted as a display-worthy NFT on the Ethereum blockchain.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Link href="/create" className="bg-ink text-white px-8 py-4 font-black uppercase text-lg border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] hover:translate-y-[-2px] transition-all inline-block">
                Start Composing
              </Link>
              <Link href="/gallery" className="border-4 border-ink p-1 inline-block hover:translate-y-[-2px] transition-all">
                <span className="block border-2 border-ink px-8 py-4 font-black uppercase text-lg hover:bg-ink hover:text-white transition-all">
                  View Poetry NFTs
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
