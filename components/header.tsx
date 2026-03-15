'use client';

import { motion } from 'framer-motion';
import {
  PenSquare,
  Users,
  BookOpen,
  FlaskConical,
  ChevronDown,
  Trophy,
  Menu,
  DollarSign,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

import { CreateStoryDialog } from './create-story-dialog';
import { ModeToggle } from './mode-toggle';
import { UploadStoryTrigger } from './upload-story-trigger';
import { ComiCraftLogo } from './comicraft-logo';

// Type definitions for nav items
type NavSubItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

type NavItem = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'link' | 'dropdown';
  items?: NavSubItem[];
};

export function Header() {
  const pathname = usePathname();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      setSession(res.data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Track scroll position for adding box shadow to header
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define active class for navigation links
  const isActive = (path: string) => {
    if (path === '/community') {
      return pathname === '/community' || pathname === '/community/creators'
        ? 'bg-primary/10 text-primary font-medium'
        : 'hover:bg-accent/20 text-muted-foreground';
    }
    return pathname === path
      ? 'bg-primary/10 text-primary font-medium'
      : 'hover:bg-accent/20 text-muted-foreground';
  };

  const handleCreateClick = () => {
    if (!account && !session) {
      router.push('/sign-in');
      return;
    }
    setShowCreateDialog(true);
  };

  const navItems: NavItem[] = [
    { type: 'link', href: '/', label: 'Home' },
    { type: 'link', href: '/genres', label: 'Genres' },
    { type: 'link', href: '/create', label: 'Create' },
    { type: 'link', href: '/gallery', label: 'Gallery' },
    { type: 'link', href: '/marketplace', label: 'Marketplace' },
    { type: 'link', href: '/buy/CRAFTS', label: 'Buy CRAFTS' },
    { type: 'link', href: '/community', label: 'Community' },
    { type: 'link', href: '/docs', label: 'Docs' },
    ...(account
      ? [
        {
          type: 'link' as const,
          href: '/dashboard/royalties',
          label: 'Earnings',
          icon: <DollarSign className="h-4 w-4 mr-1.5 colorful-icon" />,
        },
      ]
      : []),
  ];

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b-[3px] border-black',
        scrolled && 'shadow-[0_4px_0_0_#000]'
      )}
      style={{ backgroundColor: '#EEDFCA' }}
    >
      {/* Red comic accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#cc3333]" />
      {/* Halftone dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
      />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="Comicraft home"
            className="flex items-center mr-4 sm:mr-8"
          >
            <ComiCraftLogo variant="full" colorScheme="color" size={48} animate />
          </Link>

          <nav role="navigation" aria-label="Primary navigation" className="hidden lg:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={
                  item.type === 'dropdown'
                    ? `dropdown-${item.label}`
                    : item.href || `item-${index}`
                }
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center font-medium"
              >
                {item.type === 'dropdown' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-haspopup="true"
                      className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest border-[2px] border-transparent transition-all flex items-center text-black/70 hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000]"
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      collisionPadding={16}
                      className="
                        z-50
                        w-[160px] sm:w-[180px]
                        bg-black/90
                        backdrop-blur-xl
                        border border-white/10
                        shadow-2xl
                        rounded-xl
                        p-2
                      "
                    >
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            aria-current={pathname === subItem.href ? 'page' : undefined}
                            className="flex items-center w-full text-white/80 hover:text-[#ff4444] hover:bg-white/10 rounded-lg"
                          >
                            {subItem.icon && subItem.icon}
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest border-[2px] transition-all flex items-center gap-1 ${
                      pathname === item.href
                        ? 'border-black bg-[#cc3333] text-white shadow-[2px_2px_0_0_#000]'
                        : 'border-transparent text-black/70 hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000]'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : null}
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 mr-2">
            <UploadStoryTrigger variant="outline" className="hidden lg:flex" buttonText="Upload" />
            <button
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 bg-[#cc3333] hover:bg-black text-white text-[11px] font-black uppercase tracking-widest border-[2.5px] border-black shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none"
              onClick={handleCreateClick}
              aria-label="Create a new story"
            >
              <PenSquare className="h-3.5 w-3.5" />
              Create
            </button>
          </div>
          {/* <ModeToggle /> Temporarily disabled */}
          <UserNav />

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-black hover:bg-black/10 border-[2px] border-black shadow-[2px_2px_0_0_#000]"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-l-[3px] border-black text-black p-0"
                style={{ backgroundColor: '#EEDFCA' }}
              >
                <SheetHeader className="p-6 border-b-[3px] border-black">
                  <SheetTitle className="text-black font-bold text-xl flex items-center gap-2">
                    <ComiCraftLogo variant="full" colorScheme="color" size={28} animate={false} />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 space-y-1">
                  {navItems.map((item, index) => (
                    <div
                      key={
                        item.type === 'dropdown'
                          ? `dropdown-${item.label}`
                          : item.href || `item-${index}`
                      }
                      className="flex flex-col"
                    >
                      {item.type === 'dropdown' ? (
                        <>
                          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black/40 mt-2">
                            {item.label}
                          </div>
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setSheetOpen(false)}
                              className="px-4 py-3 text-sm font-black uppercase tracking-wide border-[2px] border-transparent hover:border-black hover:bg-black/5 transition-colors flex items-center text-black/70 hover:text-black"
                            >
                              {subItem.icon}
                              {subItem.label}
                            </Link>
                          ))}
                        </>
                      ) : (
                        item.href && (
                          <Link
                            href={item.href}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                              'px-4 py-3 text-sm font-black uppercase tracking-widest border-[2px] transition-colors flex items-center',
                              pathname === item.href
                                ? 'border-black bg-[#cc3333] text-white shadow-[2px_2px_0_0_#000]'
                                : 'border-transparent text-black/70 hover:text-black hover:border-black'
                            )}
                          >
                            {item.icon && <span className="mr-3">{item.icon}</span>}
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t-[2px] border-black/20 space-y-3">
                    <UploadStoryTrigger
                      variant="outline"
                      className="w-full justify-start text-sm font-black uppercase tracking-wide text-black border-[2px] border-black shadow-[2px_2px_0_0_#000] hover:bg-black/5"
                      buttonText="Upload Story"
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm bg-[#cc3333] hover:bg-black text-white border-[2.5px] border-black shadow-[3px_3px_0_0_#000] font-black uppercase tracking-wide rounded-none"
                      onClick={() => {
                        setSheetOpen(false);
                        handleCreateClick();
                      }}
                    >
                      <PenSquare className="h-4 w-4 mr-3" />
                      Create Story
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </motion.header>
  );
}
