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
import { GlobalSearch } from './global-search';
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
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
    { type: 'link', href: '/genres', label: 'Worlds' },
    { type: 'link', href: '/create', label: 'Forge' },
    { type: 'link', href: '/gallery', label: 'Gallery' },
    { type: 'link', href: '/marketplace', label: 'Bazaar' },
    { type: 'link', href: '/community', label: 'Commons' },
  ];

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border-[3px] border-black sticky top-[calc(0.5rem+env(safe-area-inset-top))] z-50 w-[calc(100vw-1rem)] sm:w-[min(90vw,980px)] mx-auto rounded-xl transition-all duration-300 bg-[#EEDFCA]/95 backdrop-blur-xl',
        scrolled && 'shadow-[0_10px_30px_rgba(0,0,0,0.35)] bg-[#fef9ef]/95'
      )}
    >
      <div className="px-2 sm:px-3 lg:px-4 h-14 sm:h-12 grid grid-cols-[auto,1fr,auto] items-center gap-2">
        <div className="flex items-center justify-self-center">
          <Link
            href="/"
            aria-label="Comicraft home"
            className="flex items-center"
          >
            <ComiCraftLogo variant="full" colorScheme="color" size={48} animate />
          </Link>
        </div>

        <nav role="navigation" aria-label="Primary navigation" className="hidden lg:flex items-center justify-center gap-1 place-self-center">
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
                    className="px-3 py-1.5 text-[13px] rounded-full transition-all duration-200 flex items-center text-black/70 hover:text-[#cc3333] hover:bg-[#cc3333]/10"
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
                      bg-[#fef9ef]
                      backdrop-blur-xl
                      border-[2px] border-black
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
                          className="flex items-center w-full text-black/80 hover:text-[#cc3333] hover:bg-black/5 rounded-lg"
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
                  className={`px-3 py-1.5 text-[13px] rounded-full transition-all duration-200 flex items-center text-black/70 hover:text-[#cc3333] hover:bg-[#cc3333]/10 ${pathname === item.href ? 'text-[#cc3333] bg-[#cc3333]/10' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : null}
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center justify-self-center space-x-2">
          <div className="flex items-center gap-2 mr-2">
            <div className="hidden lg:block">
              <GlobalSearch />
            </div>
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
                  className="text-black hover:bg-black/5 h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#EEDFCA] backdrop-blur-xl border-l-[3px] border-black text-black p-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              >
                <SheetHeader className="p-6 border-b border-black/10">
                  <SheetTitle className="text-black font-bold text-xl flex items-center gap-2">
                    <ComiCraftLogo variant="full" colorScheme="color" size={28} animate={false} />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 space-y-2">
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
                          <div className="px-4 py-2 text-sm font-bold uppercase text-black/60 mt-2">
                            {item.label}
                          </div>
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setSheetOpen(false)}
                              className="px-6 py-3 text-lg hover:bg-black/5 rounded-md transition-colors flex items-center text-black/80 hover:text-black"
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
                              'px-4 py-3 text-lg hover:bg-black/5 rounded-md transition-colors flex items-center',
                              pathname === item.href
                                ? 'bg-primary/20 text-primary font-bold'
                                : 'text-black/80 hover:text-black'
                            )}
                          >
                            {item.icon && <span className="mr-3">{item.icon}</span>}
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t-2 border-black/10 space-y-3">
                    <div className="w-full">
                      <GlobalSearch />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-lg bg-[#cc3333] hover:bg-[#e63946] text-white border-[3px] border-black rounded-none font-black uppercase tracking-wide"
                      onClick={() => {
                        setSheetOpen(false);
                        handleCreateClick();
                      }}
                    >
                      <PenSquare className="h-5 w-5 mr-3" />
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
