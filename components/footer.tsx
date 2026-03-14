'use client';

import {
  Github,
  Linkedin,
  ExternalLink,
  PenSquare,
  Zap,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { AdminLoginModal } from './admin-login-modal';
import { UploadStoryTrigger } from './upload-story-trigger';
import { ComiCraftLogo } from './comicraft-logo';

const ACCENT_RED    = '#cc3333';
const ACCENT_PURPLE = '#6c3fc5';
const ACCENT_BLUE   = '#457b9d';

export function Footer({ version }: { version?: string }) {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      const endpoints = [
        '/api/health',
        `${process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com'}/api/health`,
      ];
      for (const url of endpoints) {
        try {
          const ctrl = new AbortController();
          const timeout = setTimeout(() => ctrl.abort(), 6000);
          const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.status === 'string') {
              const s = data.status.toLowerCase();
              setHealthStatus(['ok', 'healthy', 'operational', 'up', 'online'].includes(s) ? 'ok' : ['degraded', 'partial'].includes(s) ? 'degraded' : 'down');
            } else setHealthStatus('down');
            return;
          }
        } catch { /* try next */ }
      }
      setHealthStatus('down');
    };
    checkHealth();
  }, []);

  const socialLinks = [
    { icon: <Github className="h-4 w-4" />, url: 'https://github.com/Drago-03/Comicraft.git', label: 'GitHub', color: '#000' },
    {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: 'https://twitter.com/comicraft',
      label: 'X (Twitter)',
      color: '#000',
    },
    { icon: <Linkedin className="h-4 w-4" />, url: 'https://www.linkedin.com/company/indie-hub-exe/?viewAsMember=true', label: 'LinkedIn', color: ACCENT_BLUE },
  ];

  const navCols = [
    {
      title: 'Explore',
      accentColor: ACCENT_RED,
      links: [
        { href: '/', label: 'Prime' },
        { href: '/genres', label: 'Worlds' },
        { href: '/create', label: 'Forge' },
        { href: '/marketplace', label: 'Bazaar' },
        { href: '/community', label: 'Commons' },
        { href: '/community/creators', label: 'Top Creators' },
        { href: '#', label: 'Upload Story', isUpload: true },
      ],
    },
    {
      title: 'Legal',
      accentColor: ACCENT_BLUE,
      links: [
        { href: '/terms', label: 'Terms' },
        { href: '/privacy', label: 'Privacy' },
        { href: '/cookies', label: 'Cookies' },
        { href: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Resources',
      accentColor: ACCENT_PURPLE,
      links: [
        { href: '/docs', label: 'Atlas' },
        { href: '/docs', label: 'Documentation' },
        { href: '/faq', label: 'FAQ' },
        { href: '/buy/CRAFTS', label: 'Buy CRAFTS' },
        { href: '/feedback', label: 'Feedback' },
      ],
    },
  ];

  return (
    <footer
      role="contentinfo"
      className="relative mt-20 border-t-[3px] border-black overflow-hidden"
      style={{ backgroundColor: '#1a1008' }}
    >
      {/* Halftone overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #EEDFCA 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Top red accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#cc3333]" />

      {/* ── MAIN GRID ────────────────────────────── */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">

          {/* Brand block */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" aria-label="Comicraft home" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 border-[2.5px] border-[#EEDFCA] shadow-[2px_2px_0_0_#EEDFCA] bg-[#1a1008] flex items-center justify-center flex-shrink-0 relative">
                <Image src="/logo.png" alt="Comicraft" fill className="object-contain p-1" priority={false} />
              </div>
              <span className="font-black italic uppercase tracking-tighter text-[#EEDFCA] text-xl">Comicraft</span>
            </Link>

            {/* Tagline */}
            <div
              className="border-l-[3px] pl-4 py-2"
              style={{ borderColor: ACCENT_RED }}
            >
              <p className="text-[#EEDFCA]/60 text-sm font-bold leading-relaxed max-w-xs">
                Creativity Tokenization Platform — empowering creators with AI storytelling and Web3 ownership.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center border-[2px] border-[#EEDFCA]/30 text-[#EEDFCA]/50 hover:border-[#EEDFCA] hover:text-[#EEDFCA] hover:shadow-[2px_2px_0_0_#EEDFCA] transition-all"
                >
                  {s.icon}
                </Link>
              ))}
            </div>

            {/* Indie Hub badge */}
            <div className="relative w-fit group">
              <Image
                src="/indie-hub-comic-batch.png"
                alt="Indie Hub Approved"
                width={140}
                height={140}
                className="object-contain opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                priority={false}
              />
            </div>
          </div>

          {/* Nav link columns */}
          {navCols.map((col) => (
            <nav key={col.title} aria-label={`${col.title} links`} className="text-left">
              {/* Section heading styled as a comic badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-[#EEDFCA]/30 text-[10px] font-black uppercase tracking-widest mb-5"
                style={{ color: col.accentColor }}
              >
                <span className="w-1.5 h-1.5" style={{ backgroundColor: col.accentColor }} />
                {col.title}
              </div>
              <ul className="space-y-3 list-none pl-0">
                {col.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    {(link as any).isUpload ? (
                      <UploadStoryTrigger
                        variant="ghost"
                        className="p-0 h-auto text-[#EEDFCA]/50 hover:text-[#EEDFCA] font-black text-sm uppercase tracking-wide transition-colors"
                        buttonText="Upload Story"
                        icon={false}
                      />
                    ) : (
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#EEDFCA]/50 hover:text-[#EEDFCA] transition-colors"
                      >
                        <span
                          className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ backgroundColor: col.accentColor }}
                        />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[2px] w-full bg-[#EEDFCA]/10 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-black uppercase tracking-widest">

          {/* Copyright */}
          <p className="text-[#EEDFCA]/30">
            © {currentYear} Comicraft · All rights reserved
            {version && <span className="ml-3 opacity-50">v{version}</span>}
          </p>

          {/* Powered by */}
          <div className="flex items-center gap-3 text-[#EEDFCA]/30">
            <span>Powered by</span>
            <span className="text-[#EEDFCA]/60 hover:text-[#EEDFCA] transition-colors">Ethereum</span>
            <span>×</span>
            <span className="text-[#EEDFCA]/60 hover:text-[#EEDFCA] transition-colors">Google AI</span>
            <span>&</span>
            <span className="text-[#EEDFCA]/60 hover:text-[#EEDFCA] transition-colors">IQ AI</span>
          </div>

          {/* System status */}
          <a
            href="https://stats.uptimerobot.com/PUi1I3YaBH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 border-[2px] border-[#EEDFCA]/20 hover:border-[#EEDFCA]/40 transition-colors group"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                healthStatus === 'ok'      ? 'bg-emerald-400 animate-pulse' :
                healthStatus === 'degraded'? 'bg-amber-400 animate-pulse'   :
                healthStatus === 'down'    ? 'bg-[#cc3333]'                 :
                                             'bg-[#EEDFCA]/30'
              }`}
            />
            <span className="text-[#EEDFCA]/40 group-hover:text-[#EEDFCA]/70 transition-colors">
              {healthStatus === 'ok'       ? 'System Operational'    :
               healthStatus === 'degraded' ? 'Degraded Performance'  :
               healthStatus === 'down'     ? 'System Offline'        :
                                             'Checking Status...'}
            </span>
            <ExternalLink className="w-3 h-3 text-[#EEDFCA]/20 group-hover:text-[#EEDFCA]/50 transition-colors" />
          </a>

          {/* Built by */}
          <Link
            href="https://www.indiehub.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#EEDFCA]/30 hover:text-[#EEDFCA] transition-colors group"
          >
            Built by <span className="font-black">INDIE HUB</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </footer>
  );
}
