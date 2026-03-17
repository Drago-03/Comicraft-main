'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  PenSquare,
  Wallet,
  Zap,
  Users,
  Shield,
  TrendingUp,
  Share2,
  Sparkles,
  BookOpen,
  Compass,
  Filter,
  Check,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import React, { useState, useEffect, useRef } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { TrendingStories } from '@/components/trending-stories';
import { Button } from '@/components/ui/button';
import { UploadStoryTrigger } from '@/components/upload-story-trigger';
import { cn } from '@/lib/utils';

// --- Typewriter Hook ---
function useTypewriter(
  texts: string[],
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseAfterType = 1800,
  pauseAfterDelete = 400,
) {
  const [displayText, setDisplayText] = useState('');
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const isDeletingRef = useRef(false);
  const pausingRef = useRef(false);

  useEffect(() => {
    if (!texts.length) return;

    const tick = () => {
      const phrase = texts[indexRef.current % texts.length];
      if (!phrase) return;

      if (pausingRef.current) return;

      if (!isDeletingRef.current) {
        charRef.current = Math.min(charRef.current + 1, phrase.length);
        setDisplayText(phrase.slice(0, charRef.current));

        if (charRef.current === phrase.length) {
          pausingRef.current = true;
          setTimeout(() => { isDeletingRef.current = true; pausingRef.current = false; }, pauseAfterType);
        }
      } else {
        charRef.current = Math.max(charRef.current - 1, 0);
        setDisplayText(phrase.slice(0, charRef.current));

        if (charRef.current === 0) {
          isDeletingRef.current = false;
          indexRef.current += 1;
          pausingRef.current = true;
          setTimeout(() => { pausingRef.current = false; }, pauseAfterDelete);
        }
      }
    };

    let timeoutId: NodeJS.Timeout;
    const runTick = () => {
      tick();
      timeoutId = setTimeout(runTick, isDeletingRef.current ? deletingSpeed : typingSpeed);
    };
    timeoutId = setTimeout(runTick, isDeletingRef.current ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  return displayText;
}

// Hero Typewriter texts
const heroStories = [
  "Draft with VedaScript Engine...",
  "Visualize with Panelra Engine...",
  "Blend with Mythloom Engine...",
  "Compose poetry with KavyaScript...",
];

export default function Home() {
  const { account, connectWallet, connecting } = useWeb3();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLElement>(null);

  const [activeFilter, setActiveFilter] = useState('All');
  const typedString = useTypewriter(heroStories, 40, 20, 3000);

  // Animation variants
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  // Top 12 Genres for Worlds carousel
  const marqueeGenres = [
    { name: 'Science Fiction', image: 'https://ik.imagekit.io/panmac/tr:f-auto,w-740,pr-true//bcd02f72-b50c-0179-8b4b-5e44f5340bd4/175e79ee-ed99-45d5-846f-5af0be2ab75b/sub%20genre%20guide.webp', color: 'from-cyan-500 to-blue-600' },
    { name: 'Fantasy', image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhv_45322WkBmu9o8IvYfcxEXDTbGzORCAgwdP0OF1Zq4izhDr6PT-bkqYj0BJJ_HP02Op2Y0vrNOQlN6tuf0cnu4GwWqprIJrcn89pYY6uiu89gXLr5UXIZ3h6-2HWvO-SjaqzeMRoiXk/s1600/latest.jpg', color: 'from-purple-500 to-indigo-600' },
    { name: 'Mystery', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/what-is-a-mystery.jpg', color: 'from-slate-700 to-slate-900' },
    { name: 'Romance', image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&q=80', color: 'from-pink-500 to-rose-600' },
    { name: 'Horror', image: 'https://www.nyfa.edu/wp-content/uploads/2022/11/nosferatu.jpg', color: 'from-red-700 to-red-950' },
    { name: 'Adventure', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80', color: 'from-amber-500 to-orange-600' },
    { name: 'Historical Fiction', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/Historical-Fiction-scaled.jpg', color: 'from-yellow-700 to-yellow-900' },
    { name: 'Young Adult', image: 'https://advicewonders.wordpress.com/wp-content/uploads/2014/09/ya.jpg', color: 'from-pink-400 to-pink-600' },
    { name: 'Comedy', image: 'https://motivatevalmorgan.com/wp-content/uploads/2021/01/Why-Comedy-is-a-Genre-for-All.png', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Dystopian', image: 'https://storage.googleapis.com/lr-assets/shared/1655140535-shutterstock_1936124599.jpg', color: 'from-purple-800 to-black' },
    { name: 'Historical Fantasy', image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/The_violet_fairy_book_%281906%29_%2814566722029%29.jpg', color: 'from-amber-600 to-amber-800' },
    { name: 'Paranormal', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop', color: 'from-violet-600 to-violet-900' },
  ];

  return (
    <main className="-mt-8 flex min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0 flex-col overflow-x-hidden bg-background-light font-display text-ink">

      {/* Load Spline Viewer */}
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.12.69/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />

      {/* ═══════════════════════════════════════
          HERO SECTION — Centered with Spline 3D BG
          ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-background-light">
        {/* Spline 3D Background */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
          {/* @ts-ignore — custom element from Spline viewer script */}
          <spline-viewer
            url="https://prod.spline.design/8icR7qHkgbU0oGaM/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: 'scale(1.5)' } as React.CSSProperties}
          />
        </div>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-background-light/60 z-[1]" />

        {/* Blend into dark Engines section to avoid a hard color seam */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-[#1a100f]/35 to-[#1a100f] z-[2]" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-6 py-16">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">

            {/* Tagline Badge */}
            <motion.div variants={fadeUp} className="relative bg-white border-2 border-ink px-6 py-3 mb-10 inline-block" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%231a100f' fill-opacity='0.06'/%3E%3C/svg%3E")` }}>
              <span className="text-ink font-bold uppercase text-xs tracking-[0.2em] relative z-10">"Comicraft" - Creativity Tokenization PLatform (CTP) : The Future of Creative world</span>
              {/* Speech bubble tail */}
              <span className="absolute -bottom-[10px] left-8 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-ink" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-[1.05] uppercase tracking-tighter italic mb-8 max-w-4xl">
              AI-native comics, <br className="hidden md:block" />
              <span className="bg-comic-primary text-white px-3 py-1 not-italic inline-block my-1" style={{ color: '#fff' }}>stories</span>, and <br className="hidden md:block" />
              collectibles on Blockchain.
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl font-medium max-w-2xl border-l-4 border-comic-primary pl-4 text-ink/80 mb-6 text-left">
              The cinematic platform where creators, collectors, and communities build immersive universes together.
            </motion.p>

            {/* KavyaScript Typewriter */}
            <motion.div variants={fadeUp} className="mb-10 font-mono text-sm text-ink/60 tracking-wide">
              {'>'} {typedString}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 bg-comic-primary ml-1 h-4 align-middle"
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 items-center justify-center">
              {/* Primary — layered comic border with rotate */}
              <Link href="/create" className="relative group inline-block">
                <div className="absolute inset-0 bg-comic-primary border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] scale-110 rotate-2 group-hover:rotate-0 transition-transform" />
                <span className="relative block bg-comic-primary text-white font-black uppercase px-8 py-4 text-xl tracking-tighter" style={{ color: '#fff' }}>
                  Enter Comicraft Forge <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </span>
              </Link>
              {/* Secondary — dashed border */}
              <Link href="/genres" className="border-4 border-ink border-dashed p-1 inline-block group">
                <span className="block border-2 border-ink px-8 py-4 font-black uppercase text-xl hover:bg-ink hover:text-background-light transition-all">
                  Discover Worlds
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE ENGINES — Heavy Inked Grid
          ═══════════════════════════════════════ */}
      <section className="relative -mt-px bg-ink text-background-light py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">
              <div>
                <motion.h3 variants={fadeUp} className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4 mb-4">
                  <span className="bg-comic-primary h-8 w-8 inline-block" />
                  The Engines
                </motion.h3>
                <motion.p variants={fadeUp} className="text-background-light/60 text-lg max-w-xl">
                  Choose your engine and bring your stories to life. From intelligent prose to rich comic panels, Comicraft Forge gives you the exact tools you need.
                </motion.p>
              </div>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <Link href="/create" className="bg-background-light text-ink px-6 py-2 font-black uppercase text-sm border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                  Begin Formatting
                </Link>
                <Link href="/upload" className="bg-comic-primary text-white px-6 py-2 font-black uppercase text-sm border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] hover:translate-y-[-2px] transition-all inline-block">
                  Upload to Library
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Engine Card 1: VedaScript */}
            <Link href="/create/ai-story" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-4 border-background-light p-6 aspect-square flex flex-col justify-end group hover:bg-comic-primary transition-colors cursor-pointer overflow-hidden relative"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/vedascript-engine.png"
                  alt="VedaScript Engine"
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />
              <div className="relative z-20">
                <span className="text-6xl font-black mb-4 opacity-30 group-hover:opacity-100 transition-opacity">01</span>
                <h4 className="text-2xl font-black uppercase" style={{ color: 'inherit' }}>VedaScript Engine</h4>
                <p className="text-sm font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>
                  AI story studio with deep narrative control and long-form storytelling.
                </p>
              </div>
            </motion.div>
            </Link>

            {/* Engine Card 2: Panelra */}
            <Link href="/create/comic" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-4 border-background-light p-6 aspect-square flex flex-col justify-end group hover:bg-comic-primary transition-colors cursor-pointer overflow-hidden relative"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/panelra-comic-engine-logo.png"
                  alt="Panelra Engine Logo"
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />
              <div className="relative z-20">
                <span className="text-6xl font-black mb-4 opacity-30 group-hover:opacity-100 transition-opacity">02</span>
                <h4 className="text-2xl font-black uppercase" style={{ color: 'inherit' }}>Panelra Engine</h4>
                <p className="text-sm font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>
                  Panel-based visual storytelling and cinematic image generation.
                </p>
              </div>
            </motion.div>
            </Link>

            {/* Engine Card 3: Mythloom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-4 border-background-light p-6 aspect-square flex flex-col justify-end group transition-colors cursor-not-allowed overflow-hidden relative"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80"
                  alt="Mythloom Engine"
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />
              <div className="absolute top-3 right-3 z-20">
                <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2 py-1 border-2 border-black">
                  Coming Soon
                </span>
              </div>
              <div className="relative z-20">
                <span className="text-6xl font-black mb-4 opacity-30 group-hover:opacity-100 transition-opacity">03</span>
                <h4 className="text-2xl font-black uppercase" style={{ color: 'inherit' }}>Mythloom Engine</h4>
                <p className="text-sm font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>
                  Seamlessly blend prose and comic panels into multimedia experiences.
                </p>
              </div>
            </motion.div>

            {/* Engine Card 4: KavyaScript */}
            <Link href="/kavyascript" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border-4 border-background-light p-6 aspect-square flex flex-col justify-end group hover:bg-comic-primary transition-colors cursor-pointer overflow-hidden relative"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/kavyascript-engine-logo.png"
                  alt="KavyaScript Engine Logo"
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />
              <div className="relative z-20">
                <span className="text-6xl font-black mb-4 opacity-30 group-hover:opacity-100 transition-opacity">04</span>
                <h4 className="text-2xl font-black uppercase" style={{ color: 'inherit' }}>KavyaScript Engine</h4>
                <p className="text-sm font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'inherit' }}>
                  AI poetry engine - haiku, sonnets, ghazals, free verse and calligraphy NFTs.
                </p>
              </div>
            </motion.div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/create" className="text-comic-primary font-black uppercase text-sm tracking-wider hover:underline inline-flex items-center gap-2 group">
              Go to Forge <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROVENANCE GAZETTE — Newspaper Layout
          ═══════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-10 border-y-8 border-ink bg-white/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-5xl mx-auto border-4 border-ink p-8 md:p-12 bg-white relative"
        >
          {/* Halftone overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%231a100f'/%3E%3C/svg%3E")` }} />

          {/* Gazette Header */}
          <div className="text-center border-b-4 border-ink pb-6 mb-8 relative z-10">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2" style={{ color: '#1a100f' }}>
              PROVENANCE GAZETTE
            </h2>
            <div className="flex justify-between font-black uppercase text-sm tracking-widest border-t-2 border-ink pt-2">
              <span>Vol. 102 — No. 1</span>
              <span>Blockchain Edition</span>
              <span>Est. 2024</span>
            </div>
          </div>

          {/* Gazette Body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Main Column (2/3) */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black uppercase italic mb-4" style={{ color: '#1a100f' }}>
                Ownership Redefined on the Blockchain
              </h3>

              <div className="mb-4">
                <p className="font-medium text-lg mb-4 first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                  Built on Blockchain, Comicraft transforms your creative output into verifiable digital assets. Invisible infrastructure, undeniable ownership. The bridge between digital art and tangible value has finally been forged.
                </p>
              </div>

              {/* Ownership Cards */}
              <div className="space-y-6 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-comic-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-comic-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase mb-1" style={{ color: '#1a100f' }}>Storymint Gateway</h4>
                    <p className="text-ink/70 text-sm">Turn your stories and comics into immortal collectibles. We handle the blockchain complexity so you can focus on creation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-comic-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-comic-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase mb-1" style={{ color: '#1a100f' }}>Comicraft Bazaar</h4>
                    <p className="text-ink/70 text-sm">Trade, collect, and monetize your digital assets. A vibrant marketplace empowering creators and rewarding true fans.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-comic-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-comic-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase mb-1" style={{ color: '#1a100f' }}>Reputation & Quests</h4>
                    <p className="text-ink/70 text-sm">Build long-term reputation via Creator Rank and level up through Craft Quests, unlocking new perks and visibility.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar (1/3) */}
            <div className="border-l-0 md:border-l-2 md:border-ink md:pl-8 space-y-6">
              <div className="border-b-2 border-ink pb-4">
                <h4 className="font-black uppercase text-sm mb-2 text-comic-primary">Breaking News</h4>
                <p className="text-sm font-bold italic">Comicraft Forge now supports multi-chapter stories with blockchain-backed provenance for each chapter.</p>
              </div>
              <div className="border-b-2 border-ink pb-4">
                <h4 className="font-black uppercase text-sm mb-2 text-comic-primary">Market Cap</h4>
                <p className="text-3xl font-black" style={{ color: '#1a100f' }}>$42.8M</p>
                <p className="text-xs font-bold uppercase opacity-60 italic">Total value locked in Comic Assets</p>
              </div>
              <div>
                <h4 className="font-black uppercase text-sm mb-2 text-comic-primary">Classifieds</h4>
                <ul className="text-xs font-bold uppercase space-y-2">
                  <li>- LF Artist: Neon-Tokyo Saga</li>
                  <li>- Sale: Golden Age Script #001</li>
                  <li>- Event: Meta-Convention 2026</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          THE BAZAAR — Marketplace Section
          ═══════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-10 bg-background-light">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col md:flex-row justify-between items-end mb-12"
          >
            <div>
              <motion.h3 variants={fadeUp} className="text-comic-primary text-xl font-black italic uppercase tracking-widest">
                Collectors&apos; Hub
              </motion.h3>
              <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase tracking-tighter italic" style={{ color: '#1a100f' }}>
                The Bazaar
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/marketplace" className="bg-ink text-white px-6 py-2 font-black uppercase text-sm border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] hover:translate-y-[-2px] transition-all inline-block" style={{ color: '#fff' }}>
                View All Listings
              </Link>
            </motion.div>
          </motion.div>

          {/* TrendingStories component (existing data fetching) */}
          <TrendingStories />

          <div className="mt-10 text-center">
            <Link href="/create/ai-story" className="inline-flex items-center gap-2 bg-comic-primary text-white border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] px-8 py-3 font-black uppercase tracking-wider hover:translate-y-[-2px] transition-all" style={{ color: '#fff' }}>
              <PenSquare className="w-4 h-4" /> Create a Story
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMPARISON — How Comicraft Stacks Up
          ═══════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-10 bg-ink text-background-light border-t-8 border-background-light">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
              <Image src="/comicraft-logo.png" alt="Comicraft Logo" width={48} height={48} className="object-contain" />
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">How Comicraft Stacks Up</h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg max-w-2xl">
              The only platform that combines every layer of the creative economy under one roof.
            </motion.p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-4 border-background-light text-sm">
              <thead>
                <tr className="border-b-4 border-background-light">
                  <th className="text-left p-4 font-black uppercase text-background-light/40">Feature</th>
                  <th className="p-4 font-black uppercase text-center bg-comic-primary">Comicraft</th>
                  <th className="p-4 font-black uppercase text-center text-background-light/40">OpenSea</th>
                  <th className="p-4 font-black uppercase text-center text-background-light/40">Readl</th>
                  <th className="p-4 font-black uppercase text-center text-background-light/40">IQ AI ATP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Story Engine', true, false, false, false],
                  ['AI Comic Engine', true, false, false, false],
                  ['AI Poetry Engine', true, false, false, false],
                  ['NFT Minting', true, true, true, false],
                  ['Platform Token Economy', '✓ (CRAFTS)', false, false, '✓ (IQ)'],
                  ['Secondary Royalties (enforced)', true, '⚠ Optional', false, false],
                  ['Cross-Platform Distribution', true, true, false, false],
                  ['Dynamic / Evolving NFTs', true, false, false, false],
                  ['IP Licensing Marketplace', true, false, false, false],
                  ['DAO Governance', true, false, false, false],
                  ['Creator Fund & Grants', true, false, false, false],
                  ['Reader Rewards', true, false, false, false],
                  ['Serialized Subscriptions', true, false, true, false],
                  ['White-Label API', true, false, false, false],
                  ['DEX Trading (Serum)', true, false, false, false],
                ].map(([feature, cc, os, rl, iq], idx) => {
                  const renderCell = (val: any, isPositiveColor: boolean = false) => {
                    if (val === true) return <Check className={`w-5 h-5 mx-auto ${isPositiveColor ? 'text-emerald-400' : 'text-emerald-500/60'}`} />;
                    if (val === false) return <X className="w-5 h-5 mx-auto text-red-500/40" />;
                    return val;
                  };
                  return (
                    <tr key={idx} className={`border-b-2 border-background-light/20 ${idx % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="p-4 font-bold text-background-light/80">{feature}</td>
                      <td className="p-4 text-center font-black text-emerald-400 bg-comic-primary/10">{renderCell(cc, true)}</td>
                      <td className="p-4 text-center text-background-light/40">{renderCell(os)}</td>
                      <td className="p-4 text-center text-background-light/40">{renderCell(rl)}</td>
                      <td className="p-4 text-center text-background-light/40">{renderCell(iq)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMICRAFT WORLDS — Carousel
          ═══════════════════════════════════════ */}
      <section className="py-20 bg-background-light border-t-4 border-ink overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter italic" style={{ color: '#1a100f' }}>Comicraft Worlds</h2>
              <p className="text-ink/60 text-lg max-w-xl mt-2">Step through the portal to experiences and genres unknown. Journey through the Commons to discuss theories.</p>
            </div>
            <Link href="/genres" className="bg-ink text-white px-6 py-2 font-black uppercase text-sm border-[3px] border-ink shadow-[4px_4px_0px_#1a100f] hover:translate-y-[-2px] transition-all inline-block w-fit" style={{ color: '#fff' }}>
              Explore Worlds <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Horizontal scrolling carousel */}
        <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black 5%, black 95%, transparent)' }}>
          <div className="flex gap-8 px-10 animate-scroll-marquee-home hover:[animation-play-state:paused]">
            {[...marqueeGenres, ...marqueeGenres].map((genre, i) => (
              <Link key={i} href={`/genres?genre=${genre.name.toLowerCase()}`} className="flex-none w-72 h-[450px] bg-ink border-4 border-ink shadow-[4px_4px_0px_#1a100f] relative group overflow-hidden block">
                <Image
                  src={genre.image}
                  alt={genre.name}
                  fill
                  sizes="288px"
                  className="object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-white text-3xl font-black italic uppercase leading-none" style={{ color: '#fff' }}>{genre.name}</h4>
                  <p className="text-comic-primary font-bold text-sm mt-2">EXPLORE →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA — Begin Your Journey
          ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-[200px] -mb-[150px] bg-ink overflow-hidden">
        {/* Halftone BG */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23F5E6C8'/%3E%3C/svg%3E")` }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-tight text-background-light" style={{ color: '#F5E6C8' }}>
              Begin your <span className="text-comic-primary">journey.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background-light/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
              Join visionary creators crafting on the world&apos;s fastest decentralized network.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/create" className="relative group inline-block">
                <div className="absolute inset-0 bg-comic-primary border-[3px] border-background-light shadow-[4px_4px_0px_rgba(245,230,200,0.3)] scale-110 rotate-2 group-hover:rotate-0 transition-transform" />
                <span className="relative block bg-comic-primary text-white font-black uppercase px-8 py-4 text-xl tracking-tighter" style={{ color: '#fff' }}>
                  Enter Forge <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </span>
              </Link>
              <Link href="/community" className="border-4 border-background-light border-dashed p-1 inline-block">
                <span className="block border-2 border-background-light px-8 py-4 font-black uppercase text-xl text-background-light hover:bg-background-light hover:text-ink transition-all" style={{ color: '#F5E6C8' }}>
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
