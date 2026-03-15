'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Coins, Users, Trophy, TrendingUp, BookOpen, Star } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const GRANTS = [
  { name: 'SolanaStoryteller', amount: '12,000 CRAFTS', type: 'Top Creator Grant', avatar: '🧑‍🎨', date: 'Feb 2026', story: 'The Neon Mahabharata' },
  { name: 'VerseWeaver_AI', amount: '8,500 CRAFTS', type: 'Emerging Creator Grant', avatar: '✍️', date: 'Feb 2026', story: 'Midnight Ghazal Series' },
  { name: 'ComiKnight', amount: '10,000 CRAFTS', type: 'Top Creator Grant', avatar: '🦸', date: 'Jan 2026', story: 'Steel Souls — Issue 7' },
  { name: 'PixelBard', amount: '6,000 CRAFTS', type: 'Emerging Creator Grant', avatar: '🎭', date: 'Jan 2026', story: 'Dystopia Blues' },
];

export default function CreatorFundPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Creator Fund & Grants
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              Creator<br /><span className="text-comic-primary">Fund</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              A percentage of all Comicraft platform fees flows into the Creator Fund. Top-performing and emerging creators receive grants in CRAFTS to fuel their next masterpiece.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Fund Stats */}
      <section className="py-16 px-6 bg-white border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Fund Balance', value: '2,480,000', unit: 'CRAFTS', icon: <Coins className="w-8 h-8 text-amber-500" />, note: '5% of all platform fees' },
              { label: 'Total Granted', value: '840,000', unit: 'CRAFTS', icon: <Trophy className="w-8 h-8 text-comic-primary" />, note: 'To 47 creators this quarter' },
              { label: 'Applicants', value: '312', unit: 'Creators', icon: <Users className="w-8 h-8 text-blue-500" />, note: 'Cycle 3 closes Apr 1' },
            ].map((stat) => (
              <div key={stat.label} className="border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f] text-center">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold uppercase text-ink/40 mb-2">{stat.unit}</div>
                <div className="text-xl font-black uppercase tracking-tight">{stat.label}</div>
                <div className="text-xs text-ink/50 mt-1">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the Fund Works */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">How the Fund Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f] bg-white">
              <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-comic-primary" /> Top Creator Grants
              </h3>
              <p className="text-ink/70 text-sm mb-4">Automatically awarded each month to the top 10 creators by platform earnings, engagement score, and community votes.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-comic-primary rounded-full" />Minimum 3 published works</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-comic-primary rounded-full" />Active for 30+ days</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-comic-primary rounded-full" />Grant: 8,000 – 15,000 CRAFTS</li>
              </ul>
            </div>
            <div className="border-4 border-ink p-6 shadow-[4px_4px_0px_#1a100f] bg-white">
              <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Emerging Creator Grants
              </h3>
              <p className="text-ink/70 text-sm mb-4">Application-based grants for new creators. Judged on creative quality, concept originality, and growth trajectory.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" />Joined within last 6 months</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" />1+ published work</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" />Grant: 4,000 – 9,000 CRAFTS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Grant History */}
      <section className="py-16 px-6 bg-white border-t-4 border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Recent Grants</h2>
          <div className="divide-y-4 divide-ink border-4 border-ink">
            {GRANTS.map((g) => (
              <div key={g.name} className="p-5 flex items-center justify-between gap-4 bg-white hover:bg-background-light transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{g.avatar}</span>
                  <div>
                    <div className="font-black">{g.name}</div>
                    <div className="text-sm text-ink/50 italic">"{g.story}"</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-comic-primary">{g.amount}</div>
                  <div className="text-xs text-ink/40">{g.type} — {g.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-20 px-6 bg-ink text-background-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-4">
              Apply for a <span className="text-comic-primary">Grant</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg mb-8 max-w-xl mx-auto">
              Cycle 3 applications close April 1, 2026. Publish your best work, build your reputation, and apply.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <Link href="/create" className="bg-comic-primary text-white px-8 py-4 font-black uppercase text-lg border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                Start Creating <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link href="/governance" className="border-4 border-background-light border-dashed p-1 inline-block">
                <span className="block border-2 border-background-light px-8 py-4 font-black uppercase text-lg text-background-light hover:bg-background-light hover:text-ink transition-all">
                  Vote on Fund Allocation
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
