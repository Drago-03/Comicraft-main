'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PenSquare,
  Sparkles,
  BookOpen,
  Layers,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const engines = [
  {
    id: 'vedascript',
    title: 'VedaScript Engine',
    subtitle: 'Deep narrative control for AI-native stories.',
    description:
      'The flagship long-form text engine with 70+ tunable parameters. Build multi-chapter stories with precise control over tone, pacing, characters, and worldbuilding.',
    icon: PenSquare,
    cta: 'Write with VedaScript Engine',
    href: '/create/ai-story',
    color: 'red',
    gradient: 'from-red-500/20 to-red-600/5',
    borderGlow: 'hover:border-red-500/40',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    btnGradient: 'from-red-600 to-red-700',
    btnHover: 'hover:from-red-500 hover:to-red-600',
    available: true,
  },
  {
    id: 'panelra',
    title: 'Panelra Engine',
    subtitle: 'Panel-based visual storytelling and comic layouts.',
    description:
      'Create comics with intelligent panel composition, camera directions, art style presets, and visual tone controls for stunning sequential art.',
    icon: BookOpen,
    cta: 'Create comics with Panelra Engine',
    href: '/create/comic',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/5',
    borderGlow: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    btnGradient: 'from-blue-600 to-blue-700',
    btnHover: 'hover:from-blue-500 hover:to-blue-600',
    available: true,
  },
  {
    id: 'mythloom',
    title: 'Mythloom Engine',
    subtitle: 'Blend prose and panels into serialized experiences.',
    description:
      'Interweave long-form narrative with visual panels for hybrid storytelling — the best of both VedaScript and Panelra in a unified experience.',
    icon: Layers,
    cta: 'Blend story + panels with Mythloom Engine',
    href: '#',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/5',
    borderGlow: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    btnGradient: 'from-purple-600 to-purple-700',
    btnHover: 'hover:from-purple-500 hover:to-purple-600',
    available: false,
  },
  {
    id: 'shakti',
    title: 'Shakti Spark',
    subtitle: 'Instant ideas and short story sparks.',
    description:
      'Generate story seeds, concept prompts, and short fiction in seconds. Perfect for brainstorming or kickstarting a larger project in VedaScript.',
    icon: Sparkles,
    cta: 'Spark an idea',
    href: '/create/spark',
    color: 'amber',
    gradient: 'from-amber-500/20 to-amber-600/5',
    borderGlow: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    btnGradient: 'from-amber-600 to-amber-700',
    btnHover: 'hover:from-amber-500 hover:to-amber-600',
    available: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
};

export default function ForgeCreatePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-10 relative z-10"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border-[2px] border-black bg-white shadow-[3px_3px_0_0_#000] text-xs font-black tracking-wider text-black uppercase mb-4">
                 COMICRAFT FORGE
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic text-black uppercase tracking-tighter mb-2" style={{ WebkitTextStroke: '1.5px black' }}>
                Forge Your Legend
              </h1>
              <p className="text-black/70 font-bold uppercase tracking-[0.05em] text-sm md:text-base">
                Choose your creative engine.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/"
                className="group flex items-center gap-2 px-6 py-2 border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-black font-black uppercase text-sm tracking-wider transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </motion.div>
          </div>

          {/* 2×2 Engine Card Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <motion.div
                  key={engine.id}
                  variants={cardVariants}
                  whileHover={{ scale: engine.available ? 1.02 : 1, y: engine.available ? -4 : 0 }}
                  whileTap={{ scale: engine.available ? 0.98 : 1 }}
                  className={`
                    relative group break-inside-avoid
                    bg-white border-[3px] border-black p-6
                    ${engine.available ? 'shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000]' : 'shadow-none opacity-80'}
                    transition-all duration-300
                    ${engine.available ? 'cursor-pointer' : 'cursor-default grayscale'}
                  `}
                  onClick={() => engine.available && router.push(engine.href)}
                >
                  {/* Subtle noise overlay per block to maintain aesthetic */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '5px 5px' }}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 border-[3px] border-black shadow-[3px_3px_0_0_#000] bg-white flex items-center justify-center flex-shrink-0`}>
                        <Icon strokeWidth={3} className={`w-7 h-7 text-black`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-black italic uppercase leading-tight tracking-tighter text-black group-hover:text-[#cc3333] transition-colors mb-1">
                          {engine.title}
                        </h2>
                        <p className={`text-[10px] text-gray-500 font-bold uppercase tracking-widest`}>
                          {engine.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm font-semibold text-black/70 leading-snug mb-6 flex-grow">
                      {engine.description}
                    </p>

                    {/* CTA Button */}
                    {engine.available ? (
                      <button
                        className={`
                          w-full py-3 px-5 border-[3px] border-black font-black uppercase text-sm tracking-widest
                          bg-[#cc3333] text-white shadow-[4px_4px_0_0_#000]
                          flex items-center justify-center gap-2
                          transition-all duration-300
                          group-hover:bg-black group-hover:text-white group-hover:shadow-[6px_6px_0_0_#000] group-hover:-translate-y-1
                          active:translate-y-1 active:shadow-none
                        `}
                      >
                        {engine.cta}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-full py-3 px-5 border-2 border-dashed border-gray-400 font-bold uppercase text-[10px] tracking-widest text-gray-500 text-center bg-gray-100">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
