'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, User } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const POSTS = [
  {
    slug: 'why-comicraft-is-the-only-true-creativity-tokenization-platform',
    number: '01',
    title: 'Why Comicraft Is the Only True Creativity Tokenization Platform',
    excerpt: 'No other platform combines AI creation engines, NFT minting, a native token economy, and a full creator ecosystem under one roof. We break it down against OpenSea, Readl, and IQ AI.',
    readTime: '8 min read',
    date: 'Mar 15, 2026',
    author: 'Comicraft Team',
    tag: 'Platform',
    color: 'from-comic-primary to-red-700',
  },
  {
    slug: 'the-creator-economy-is-broken-heres-how-comicraft-fixes-it',
    number: '02',
    title: 'The Creator Economy Is Broken — Here\'s How Comicraft Fixes It',
    excerpt: 'Creators lose royalties on resales, have no governance power, can\'t license their IP, and aren\'t rewarded. Here\'s how every Comicraft feature attacks a specific pain point.',
    readTime: '10 min read',
    date: 'Mar 15, 2026',
    author: 'Comicraft Team',
    tag: 'Economy',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    slug: 'from-static-jpegs-to-living-art-how-dynamic-nfts-change-everything',
    number: '03',
    title: 'From Static JPEGs to Living Art: How Dynamic NFTs Change Everything',
    excerpt: 'Static NFTs are a dead end. Poems that grow, comics that update via holder votes, stories with seasonal endings — Comicraft\'s dynamic NFTs are the next evolution.',
    readTime: '7 min read',
    date: 'Mar 15, 2026',
    author: 'Comicraft Team',
    tag: 'Technology',
    color: 'from-purple-600 to-violet-700',
  },
];

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-background-light font-display text-ink">

      {/* Hero */}
      <section className="bg-ink text-background-light py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-block bg-comic-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
              Comicraft Blog
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-4">
              The <span className="text-comic-primary">Dispatch</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-background-light/60 max-w-xl">
              Deep dives on creativity, tokenization, dynamic NFTs, and the future of the creator economy.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 px-6 bg-background-light">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {POSTS.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blogs/${post.slug}`} className="block border-4 border-ink bg-white shadow-[6px_6px_0px_#1a100f] group overflow-hidden hover:translate-y-[-3px] transition-all duration-300">
                  <div className={`bg-gradient-to-r ${post.color} p-6 flex items-end justify-between`}>
                    <span className="text-8xl font-black text-white/20">{post.number}</span>
                    <span className="text-xs font-black uppercase bg-white text-ink px-3 py-1">{post.tag}</span>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl md:text-3xl font-black italic leading-tight mb-3 group-hover:text-comic-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-ink/60 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-ink/40">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                        <span>{post.date}</span>
                      </div>
                      <span className="text-sm font-black uppercase group-hover:text-comic-primary transition-colors flex items-center gap-1">
                        Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
