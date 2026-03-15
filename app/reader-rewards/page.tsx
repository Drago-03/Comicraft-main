'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Heart, Share2, Star, Gift, Flame, Trophy } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const REWARDS = [
  { icon: <BookOpen className="w-6 h-6" />, action: 'Read a Story (5+ min)', crafts: '+2 CRAFTS', desc: 'Verified reading session' },
  { icon: <Star className="w-6 h-6" />, action: 'Leave a Review', crafts: '+5 CRAFTS', desc: 'Substantive reviews only (50+ words)' },
  { icon: <Share2 className="w-6 h-6" />, action: 'Share to Social', crafts: '+3 CRAFTS', desc: 'Per unique external share' },
  { icon: <Gift className="w-6 h-6" />, action: 'Collect an NFT', crafts: '+10 CRAFTS', desc: 'First-time collection bonus' },
  { icon: <Flame className="w-6 h-6" />, action: '7-Day Reading Streak', crafts: '+25 CRAFTS', desc: 'Bonus for consistent reading' },
  { icon: <Heart className="w-6 h-6" />, action: 'Upvote a Rising Story', crafts: '+1 CRAFTS', desc: 'Up to 10/day' },
];

const LEADERBOARD = [
  { rank: 1, name: 'ReadCraft_xyz', crafts: '48,200', streak: 42, badge: '🏆' },
  { rank: 2, name: 'NeonReaderNXT', crafts: '31,800', streak: 28, badge: '🥈' },
  { rank: 3, name: 'PageTurner9000', crafts: '24,600', streak: 19, badge: '🥉' },
  { rank: 4, name: 'StorySurfer', crafts: '18,400', streak: 14, badge: '⭐' },
  { rank: 5, name: 'GhazalGuru', crafts: '12,100', streak: 9, badge: '⭐' },
];

const MILESTONES = [
  { milestone: 'First Story Read', reward: '5 CRAFTS', achieved: true },
  { milestone: '10 Stories Read', reward: '20 CRAFTS', achieved: true },
  { milestone: '50 Stories Read', reward: '75 CRAFTS', achieved: false },
  { milestone: '1 NFT Collected', reward: '15 CRAFTS', achieved: true },
  { milestone: '5 NFTs Collected', reward: '60 CRAFTS', achieved: false },
  { milestone: '30-Day Streak', reward: '100 CRAFTS', achieved: false },
];

export default function ReaderRewardsPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Reader Rewards & Collect-to-Earn
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">
              Read. <span className="text-comic-primary">Earn.</span><br />Collect.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl text-background-light/70 mb-8 border-l-4 border-comic-primary pl-4">
              Comicraft rewards readers with CRAFTS tokens for reading, reviewing, sharing, and collecting stories. The more you engage, the more you earn.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* How to Earn */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">How to Earn CRAFTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARDS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-4 border-ink p-5 bg-white shadow-[4px_4px_0px_#1a100f] group hover:bg-ink hover:text-background-light transition-all duration-300"
              >
                <div className="text-comic-primary mb-3 group-hover:text-comic-primary">{r.icon}</div>
                <div className="text-2xl font-black text-comic-primary mb-1">{r.crafts}</div>
                <h4 className="font-black uppercase">{r.action}</h4>
                <p className="text-xs opacity-60 mt-1">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reading Milestones */}
      <section className="py-16 px-6 bg-white border-t-4 border-b-4 border-ink">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Collection Milestones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MILESTONES.map((m, i) => (
              <div key={i} className={`border-4 border-ink p-4 flex items-center justify-between shadow-[2px_2px_0px_#1a100f] ${m.achieved ? 'bg-emerald-50' : 'bg-white opacity-70'}`}>
                <div>
                  <div className={`font-black uppercase text-sm ${m.achieved ? 'text-emerald-600' : 'text-ink'}`}>
                    {m.achieved ? '✓ ' : ''}{m.milestone}
                  </div>
                  <div className="text-comic-primary font-black">{m.reward}</div>
                </div>
                <div className={`text-2xl ${m.achieved ? '' : 'grayscale opacity-30'}`}>{m.achieved ? '🏅' : '🔒'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Top Collectors This Month</h2>
          <div className="border-4 border-ink divide-y-4 divide-ink bg-white shadow-[4px_4px_0px_#1a100f]">
            {LEADERBOARD.map((l) => (
              <div key={l.rank} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8">{l.badge}</span>
                  <div>
                    <div className="font-black">{l.name}</div>
                    <div className="text-xs text-ink/40 font-bold uppercase flex items-center gap-2">
                      <Flame className="w-3 h-3 text-orange-500" /> {l.streak}-day streak
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-comic-primary">{l.crafts}</div>
                  <div className="text-xs text-ink/40">CRAFTS earned</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-ink text-background-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase italic tracking-tighter mb-4">
              Start <span className="text-comic-primary">Earning</span> Today
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg mb-8 max-w-xl mx-auto">
              Sign in, read your first story, and earn your first CRAFTS tokens in under 5 minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/genres" className="bg-comic-primary text-white px-8 py-4 font-black uppercase text-lg border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                Browse Stories <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
