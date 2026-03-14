'use client';

import { motion } from 'framer-motion';
import {
  PenSquare,
  ChevronDown,
  Menu,
  DollarSign,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

import { CreateStoryDialog } from './create-story-dialog';
import { ComiCraftLogo } from './comicraft-logo';
import { GlobalSearch } from './global-search';

type NavSubItem = { href: string; label: string; icon?: React.ReactNode };
type NavItem = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'link' | 'dropdown';
  items?: NavSubItem[];
};

/* ─────────────────────────────────────
   Comic-panel accent dot colours that
   cycle through nav items for visual pop
───────────────────────────────────────*/
const ACCENT_COLORS = ['#cc3333', '#6c3fc5', '#457b9d', '#cc3333', '#2d9c68', '#f97316', '#cc3333'];

export function Header() {
  const pathname = usePathname();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: string, s: any) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCreateClick = () => {
    if (!account && !session) { router.push('/sign-in'); return; }
    setShowCreateDialog(true);
  };

  const navItems: NavItem[] = [
    { type: 'link', href: '/',          label: 'Prime'     },
    { type: 'link', href: '/genres',    label: 'Worlds'    },
    { type: 'link', href: '/create',    label: 'Forge'     },
    { type: 'link', href: '/gallery',   label: 'Gallery'   },
    { type: 'link', href: '/marketplace', label: 'Bazaar'  },
    { type: 'link', href: '/buy/CRAFTS', label: 'Get CRAFTS'},
    { type: 'link', href: '/community', label: 'Commons'   },
    ...(account ? [{ type: 'link' as const, href: '/dashboard/royalties', label: 'Earnings', icon: <DollarSign className="h-3 w-3 mr-1" /> }] : []),
  ];

  const isActive = (path?: string) => path && (pathname === path || (path !== '/' && pathname.startsWith(path)));

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          COMIC-PANEL HEADER BAR
          Cream background · thick ink border · no blur chrome
      ══════════════════════════════════════════════════════ */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
          'border-b-[3px] border-black',
          scrolled
            ? 'shadow-[0_4px_0_0_#000]'
            : 'shadow-none',
        )}
        style={{ backgroundColor: '#EEDFCA' }}
      >
        {/* Halftone dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
            backgroundSize: '8px 8px',
          }}
        />

        {/* Red accent stripe at very top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#cc3333]" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* ── LOGO ── */}
          <Link href="/" aria-label="Comicraft home" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-9 h-9 border-[2.5px] border-black shadow-[2px_2px_0_0_#000] bg-white flex items-center justify-center">
              <Image src="/logo.png" alt="Comicraft" fill className="object-contain p-0.5" priority />
            </div>
            <span className="hidden sm:block font-black uppercase tracking-tighter text-black text-sm italic">
              Comicraft
            </span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav role="navigation" aria-label="Primary navigation" className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item, i) =>
              item.type === 'dropdown' ? (
                <DropdownMenu key={`dd-${i}`}>
                  <DropdownMenuTrigger
                    className={cn(
                      'px-3 py-1.5 text-[11px] font-black uppercase tracking-widest border-[2px] border-transparent transition-all flex items-center gap-1',
                      'hover:border-black hover:shadow-[2px_2px_0_0_#000]',
                      'text-black/70 hover:text-black',
                    )}
                  >
                    {item.icon}{item.label}<ChevronDown className="w-3 h-3 ml-0.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-[#EEDFCA] border-[3px] border-black shadow-[4px_4px_0_0_#000] rounded-none p-1 min-w-[140px]"
                    sideOffset={6}
                  >
                    {item.items?.map((sub) => (
                      <DropdownMenuItem key={sub.href} asChild>
                        <Link href={sub.href} className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-black hover:bg-black hover:text-[#EEDFCA] transition-colors rounded-none">
                          {sub.icon}{sub.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : item.href ? (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 text-[11px] font-black uppercase tracking-widest border-[2px] transition-all flex items-center gap-1',
                    isActive(item.href)
                      ? 'border-black bg-[#cc3333] text-white shadow-[2px_2px_0_0_#000]'
                      : 'border-transparent text-black/70 hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000]',
                  )}
                  style={isActive(item.href) ? {} : { ['--accent' as string]: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                >
                  {item.icon}{item.label}
                </Link>
              ) : null
            )}
          </nav>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <GlobalSearch />
            </div>

            {/* Create button */}
            <button
              onClick={handleCreateClick}
              aria-label="Create a new story"
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 bg-[#cc3333] hover:bg-black text-white text-[11px] font-black uppercase tracking-widest border-[2.5px] border-black shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <PenSquare className="w-3.5 h-3.5" /> Create
            </button>

            <UserNav />

            {/* ── MOBILE HAMBURGER ── */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center border-[2.5px] border-black shadow-[2px_2px_0_0_#000] bg-white hover:bg-[#cc3333] hover:text-white transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 border-t-[3px] border-b-[3px] border-black z-40"
            style={{ backgroundColor: '#EEDFCA' }}
          >
            {/* Halftone inside mobile menu */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
                backgroundSize: '8px 8px',
              }}
            />
            <div className="relative z-10 flex flex-col divide-y-[2px] divide-black/20">
              {navItems.map((item, i) =>
                item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest transition-colors',
                      isActive(item.href)
                        ? 'bg-[#cc3333] text-white'
                        : 'text-black hover:bg-black/5',
                    )}
                  >
                    {/* Accent dot */}
                    <span
                      className="w-2 h-2 border border-black flex-shrink-0"
                      style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                    />
                    {item.icon}{item.label}
                  </Link>
                ) : null
              )}
              <div className="px-6 py-4 flex flex-col gap-3">
                <GlobalSearch />
                <button
                  onClick={() => { setMobileOpen(false); handleCreateClick(); }}
                  className="w-full py-3 bg-[#cc3333] hover:bg-black text-white text-sm font-black uppercase tracking-widest border-[2.5px] border-black shadow-[3px_3px_0_0_#000] transition-all flex items-center justify-center gap-2"
                >
                  <PenSquare className="w-4 h-4" /> Create Story
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content doesn't hide under fixed header */}
      <div className="h-16" />

      <CreateStoryDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
    </>
  );
}
