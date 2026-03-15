'use client';

import {
  Github,
  Linkedin,
  ExternalLink,
  PenSquare,
  Frame,
  FileText,
  HelpCircle,
  Wallet,
  FileCheck,
  Shield,
  Cookie,
  Mail,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { AdminLoginModal } from './admin-login-modal';
import { UploadStoryTrigger } from './upload-story-trigger';
import { ComiCraftLogo } from './comicraft-logo';

export function Footer({ version }: { version?: string }) {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHealthStatus(
            (data.status === 'ok' || data.status === 'healthy' || data.status === 'operational') ? 'ok'
            : (data.status === 'degraded' || data.status === 'partial') ? 'degraded'
            : 'down'
          );
        } else {
          setHealthStatus('down');
        }
      } catch {
        setHealthStatus('down');
      }
    };
    checkHealth();
  }, []);

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com/Drago-03/Comicraft.git',
      label: 'GitHub',
    },
    {
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: 'https://twitter.com/comicraft',
      label: 'X (Twitter)',
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://www.linkedin.com/company/indie-hub-exe/?viewAsMember=true',
      label: 'LinkedIn',
    },
  ];

  return (
    <footer role="contentinfo" className="relative mt-20 border-t-[3px] border-background-light/20 bg-ink text-background-light overflow-hidden font-sans">
      {/* Comic Halftone overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #F5E6C8 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6 flex flex-col items-start lg:col-span-2">
              <Link href="/" className="group inline-block mb-2" aria-label="Comicraft home">
                <ComiCraftLogo variant="full" colorScheme="color" size={32} animate={false} />
              </Link>
              <div className="text-left font-sans">
                <p className="text-sm font-bold text-background-light/70 leading-relaxed max-w-sm">
                  Comicraft: Creativity Tokenization Platform (CTP) - Empowering creators with AI-driven storytelling and Web3 ownership.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex gap-4" role="group" aria-label="Social media links">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white text-black transition-all group"
                      aria-label={link.label}
                    >
                      <span className="block group-hover:scale-110 active:scale-95 transition-transform">
                        {link.icon}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Indie Hub Comic Batch Approval Stamp */}
                <div className="relative group ml-auto lg:ml-0">
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/indie-hub-comic-batch.png"
                    alt="Indie Hub Approved"
                    width={180}
                    height={180}
                    className="relative object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 transform hover:scale-105"
                    priority={false}
                  />
                </div>
              </div>
            </div>

            {/* Explore Section */}
            <nav aria-label="Explore links" className="text-left">
              <h3 className="font-black text-sm tracking-widest uppercase mb-5 text-background-light">
                Explore
              </h3>
              <ul className="space-y-4 pl-0 list-none">
                {[
                  { href: '/aboutus', label: 'About Us' },
                  { href: '/genres', label: 'Worlds' },
                  { href: '/create', label: 'Forge' },
                  { href: '/marketplace', label: 'Bazaar' },
                  { href: '/community', label: 'Commons' },
                  { href: '/kavach', label: 'KAVACH' },
                  { href: '/blogs', label: 'Blogs' },
                  { href: '/governance', label: 'Governance' },
                  { href: '/trading', label: 'Trading Space' },
                  { href: '#', label: 'Upload Story', isUpload: true },
                ].map((link) => (
                  <li key={link.label}>
                    {link.isUpload ? (
                      <span className="relative group inline-block">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cc3333] opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3 top-[50%] -translate-y-[50%] pointer-events-none" />
                        <UploadStoryTrigger variant="ghost" className="p-0 h-auto font-bold text-background-light/60 group-hover:text-background-light transition-colors" buttonText="Upload Story" icon={false} />
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="group relative inline-flex items-center text-sm font-bold text-background-light/60 hover:text-white transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cc3333] opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal Section */}
            <nav aria-label="Legal links" className="text-left">
              <h3 className="font-black text-sm tracking-widest uppercase mb-5 text-background-light">
                Legal
              </h3>
              <ul className="space-y-4 pl-0 list-none">
                {[
                  { href: '/terms', label: 'Terms' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/cookies', label: 'Cookies' },
                  { href: '/contact', label: 'Contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-bold text-background-light/60 hover:text-white transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Resources Section */}
            <nav aria-label="Resources links" className="text-left">
              <h3 className="font-black text-sm tracking-widest uppercase mb-5 text-background-light">
                Resources
              </h3>
              <ul className="space-y-4 pl-0 list-none">
                {[
                  { href: '/docs', label: 'Documentation' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/buy/CRAFTS', label: 'Buy CRAFTS' },
                  { href: '/ip-licensing', label: 'IP Licensing' },
                  { href: '/whitelabel', label: 'White Label API' },
                  { href: '/creator-fund', label: 'Creator Fund' },
                  { href: '/reader-rewards', label: 'Reader Rewards' },
                  { href: '/feedback', label: 'Feedback' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-bold text-background-light/60 hover:text-white transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="h-[3px] w-full bg-background-light/10 my-10" />

          {/* Glitch & Copyright Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold">
            <div className="flex items-center gap-3">
              <p className="text-background-light/60">
                &copy; {currentYear} Comicraft. All rights reserved.
              </p>
              {version && (
                <>
                  <span className="w-1 h-1 rounded-full bg-background-light/20" />
                  <span className="px-2 py-0.5 border-[2px] border-black bg-white text-xs font-black text-black tracking-widest uppercase">
                    v{version}
                  </span>
                </>
              )}
            </div>

            {/* Data-streaming/glitch effect for "Powered by" */}
            <div className="group relative flex items-center justify-center p-2 border-[3px] border-black shadow-[4px_4px_0_0_#000] bg-white transition-all cursor-default">
              <span className="text-black/60 mr-2 font-black uppercase tracking-widest text-[10px]">Powered by</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-black uppercase tracking-wide text-indigo-600 relative z-10 group-hover:animate-glitch-1">Ethereum</span>
                <span className="font-black uppercase tracking-wide text-blue-500 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">Ethereum</span>
                <span className="font-black uppercase tracking-wide text-indigo-800 absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">Ethereum</span>
              </div>
              <span className="text-black/30 mx-2 font-black">&</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-black uppercase tracking-wide text-orange-500 relative z-10 group-hover:animate-glitch-1">Alchemy</span>
                <span className="font-black uppercase tracking-wide text-amber-500 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">Alchemy</span>
                <span className="font-black uppercase tracking-wide text-orange-600 absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">Alchemy</span>
              </div>
              <span className="text-black/30 mx-2 font-black">×</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-black uppercase tracking-wide text-blue-600 relative z-10 group-hover:animate-glitch-1">Google AI</span>
                <span className="font-black uppercase tracking-wide text-cyan-500 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">Google AI</span>
                <span className="font-black uppercase tracking-wide text-[#cc3333] absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">Google AI</span>
              </div>
              <span className="text-black/30 mx-2 font-black">&</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-black uppercase tracking-wide text-pink-600 relative z-10 group-hover:animate-glitch-1">IQ AI</span>
                <span className="font-black uppercase tracking-wide text-purple-600 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">IQ AI</span>
                <span className="font-black uppercase tracking-wide text-pink-700 absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">IQ AI</span>
              </div>
            </div>

            <a
              href="https://stats.uptimerobot.com/PUi1I3YaBH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white px-3 py-1.5 border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white transition-all cursor-pointer group rounded-sm"
            >
              <span
                className={`w-2 h-2 rounded-full border border-black ${healthStatus === 'ok'
                  ? 'bg-emerald-500'
                  : healthStatus === 'degraded'
                    ? 'bg-amber-500'
                    : healthStatus === 'down'
                      ? 'bg-[#cc3333]'
                      : 'bg-black/30'
                  }`}
              />
              <span className="text-[10px] font-black tracking-widest uppercase text-black group-hover:text-background-light transition-colors">
                {healthStatus === 'ok' ? 'System Operational' : healthStatus === 'degraded' ? 'Degraded Performance' : healthStatus === 'down' ? 'System Offline' : 'Checking Status...'}
              </span>
              <ExternalLink className="w-3 h-3 text-black group-hover:text-background-light transition-colors" />
            </a>

            <div className="text-right">
              <Link
                href="https://www.indiehub.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-background-light/60 hover:text-white transition-colors"
              >
                <span className="text-[10px] uppercase tracking-widest font-black">Built by</span>
                <span className="font-black italic">INDIE HUB</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
          20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(20% 0 50% 0); transform: translate(-1px, 1px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); }
          100% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, 1px); }
        }
        @keyframes glitch-3 {
          0% { clip-path: inset(50% 0 30% 0); transform: translate(-1px, 2px); }
          20% { clip-path: inset(10% 0 50% 0); transform: translate(1px, -2px); }
          40% { clip-path: inset(80% 0 10% 0); transform: translate(-2px, 1px); }
          60% { clip-path: inset(30% 0 40% 0); transform: translate(2px, -1px); }
          80% { clip-path: inset(5% 0 70% 0); transform: translate(-1px, -2px); }
          100% { clip-path: inset(60% 0 20% 0); transform: translate(1px, 2px); }
        }
        .animate-glitch-1 { animation: glitch-1 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
        .animate-glitch-2 { animation: glitch-2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
        .animate-glitch-3 { animation: glitch-3 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
      `}} />

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </footer>
  );
}
