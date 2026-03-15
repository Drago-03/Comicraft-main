'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Lock, Rss, Coins, Heart, Clock, Star } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const SUBS = [
  {
    creator: 'ComiKnight',
    avatar: '🦸',
    title: 'Steel Souls — Weekly Comic Drops',
    genre: 'Sci-Fi Comic',
    price: '250 CRAFTS/month',
    nextDrop: 'Mar 18, 2026',
    subscribers: 841,
    exclusives: ['Weekly panels 24h early', 'Vote on story direction', 'Behind-the-scenes sketches'],
    rating: 4.9,
  },
  {
    creator: 'VerseWeaver_AI',
    avatar: '✍️',
    title: 'Midnight Ghazal Series',
    genre: 'Poetry',
    price: '150 CRAFTS/month',
    nextDrop: 'Mar 15, 2026',
    subscribers: 412,
    exclusives: ['New ghazal every Tuesday', 'Audio readings', 'Subscriber-only anthology NFT'],
    rating: 4.8,
  },
  {
    creator: 'SolanaStoryteller',
    avatar: '🧑‍🎨',
    title: 'The Neon Mahabharata — Chapters',
    genre: 'Historical Fantasy',
    price: '300 CRAFTS/month',
    nextDrop: 'Mar 20, 2026',
    subscribers: 1240,
    exclusives: ['New chapter every 2 weeks', 'Character design polls', 'Signed edition NFTs'],
    rating: 5.0,
  },
];

export default function SubscriptionsPage() {
  const [tipAmount, setTipAmount] = useState('');
  const [tipped, setTipped] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Serialized Subscriptions & FanPay
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              Subscribe.<br /><span className="text-comic-primary">Support.</span><br />Shape Stories.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Subscribe to your favorite creators for exclusive early access, weekly drops, and subscriber-only content. Tip creators directly with CRAFTS via FanPay.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Subscriptions Grid */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Active Series</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SUBS.map((sub, i) => (
              <motion.div
                key={sub.creator}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-4 border-ink bg-white shadow-[4px_4px_0px_#1a100f] overflow-hidden"
              >
                {/* Header */}
                <div className="bg-ink text-background-light p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{sub.avatar}</span>
                    <div>
                      <div className="font-black">{sub.creator}</div>
                      <div className="text-xs text-background-light/50">{sub.genre}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-black italic">{sub.title}</h3>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-black text-comic-primary">{sub.price}</div>
                      <div className="text-xs text-ink/40 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Next drop: {sub.nextDrop}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black">{sub.subscribers.toLocaleString()}</div>
                      <div className="text-xs text-ink/40">subscribers</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {sub.exclusives.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3 text-comic-primary shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1 text-sm mb-4">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-black">{sub.rating}</span>
                    <span className="text-ink/40">/ 5.0</span>
                  </div>

                  <button className="w-full bg-comic-primary text-white font-black uppercase py-3 border-2 border-ink shadow-[2px_2px_0px_#1a100f] hover:translate-y-[-1px] transition-all">
                    Subscribe — {sub.price}
                  </button>

                  {/* FanPay Tip */}
                  <div className="mt-4 border-t-2 border-ink/10 pt-4">
                    <div className="text-xs font-bold uppercase text-ink/40 mb-2 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-comic-primary" /> FanPay — Tip {sub.creator}
                    </div>
                    {tipped === sub.creator ? (
                      <div className="text-center text-emerald-600 font-black text-sm">💚 Tip sent! Thank you!</div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="CRAFTS amount"
                          className="flex-1 border-2 border-ink px-3 py-1.5 text-sm font-mono bg-white"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                        />
                        <button
                          onClick={() => { if (tipAmount) setTipped(sub.creator); }}
                          className="px-4 py-1.5 bg-ink text-white font-black text-sm border-2 border-ink hover:bg-comic-primary transition-colors"
                        >
                          Tip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator CTA */}
      <section className="py-20 px-6 bg-ink text-background-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-4">
              Launch Your Own <span className="text-comic-primary">Series</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg mb-8 max-w-xl mx-auto">
              Set your release schedule, price in CRAFTS, and give subscribers early access and exclusive perks. Enable FanPay so readers can tip you directly.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/create" className="bg-comic-primary text-white px-8 py-4 font-black uppercase text-lg border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                Launch a Series <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
