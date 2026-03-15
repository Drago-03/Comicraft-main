'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Wallet, User, Settings, LogOut, BookOpen, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { fetchNotifications } from '@/lib/feeds-client';

// Simple deterministic hash to avoid sending raw PII or identifiers to third parties
const generateSeed = (input?: string) => {
  if (!input) return "default";
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useUserRole } from '@/hooks/use-user-role';
import { roleBadgeStyles } from '@/lib/rbac';

export function UserNav() {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const { role, isAdmin, isModerator, isModOrAdmin, isOverridden, toggleViewMode } = useUserRole();

  useEffect(() => {
    // Check Supabase session
    const refreshSession = () => {
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
        setSession(session);
        if (session?.user) {
          setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url, id: session.user.id });
        }
      });
    };

    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url, id: session.user.id });
      } else if (!account) {
        setDbUser(null);
      }
    });

    // Listen for token changes from OAuth callback (localStorage persistence)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        refreshSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [supabase.auth, account]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (account || session) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
          let fetchUrl = `${baseUrl}/api/v1/users/profile/${account}`;
          const headers: Record<string, string> = {};

          if (session) {
            const token = session.access_token;
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            fetchUrl = `${baseUrl}/api/v1/users/profile`;
          }

          const res = await fetch(fetchUrl, { headers });
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.data?.user || data.data || data.user || data);
          }
        } catch (err) {
          console.error("Failed to fetch nav user data", err);
        }
      }
    };
    if (account || session) fetchUserData();

    // Listen for global profile updates (e.g. from settings page)
    const handleProfileUpdate = () => fetchUserData();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [account, session]);

  // Notification badge count — poll every 20s
  const [unreadCount, setUnreadCount] = useState(0);
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const notifs = await fetchNotifications(true, 50);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (account || session) {
      loadUnreadCount();
      notifIntervalRef.current = setInterval(loadUnreadCount, 20_000);
    }
    return () => {
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [account, session, loadUnreadCount]);

  const handleLogout = async () => {
    if (account) await disconnectWallet();
    if (session) await supabase.auth.signOut();
  };

  if (!account && !session) {
    return (
      <Button
        variant="default"
        size="sm"
        asChild
        aria-label="Login or create account"
        className="flex items-center gap-1.5 px-6 py-2 rounded-none border-[3px] border-black bg-[#cc3333] text-white font-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] transition-all uppercase tracking-widest text-[11px]"
      >
        <Link href="/sign-in">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="User menu" className="relative h-9 w-9 rounded-none border-[2px] border-black shadow-[3px_3px_0_0_#000] p-0 hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] transition-all overflow-hidden bg-white">
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage src={dbUser?.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(generateSeed(dbUser?.id || account || session?.user?.id))}`} alt="User Avatar" />
            <AvatarFallback className="rounded-none bg-[#EEDFCA] text-black font-black uppercase">{dbUser?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-0 overflow-hidden border-[4px] border-black shadow-[8px_8px_0_0_#000] bg-[#EEDFCA] rounded-none z-[100]"
        align="end"
      >
        <DropdownMenuLabel className="bg-[#cc3333] text-white border-b-[4px] border-black py-3 font-black uppercase tracking-widest text-[11px] flex items-center justify-between">
          <span>User Controls</span>
          {role && role !== 'user' && roleBadgeStyles[role] && (
            <span className={`text-[9px] px-1.5 py-0.5 border-[2px] border-black shadow-[2px_2px_0_0_#000] bg-white text-black font-bold uppercase`}>
              {roleBadgeStyles[role].label}
            </span>
          )}
        </DropdownMenuLabel>

        <div className="bg-transparent p-1">
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white focus:text-black text-black font-bold hover:translate-x-1 rounded-none transition-all"
            >
              <Link
                href={`/profile/${dbUser?.username || 'me'}`}
                className="flex items-center w-full uppercase py-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white focus:text-black text-black font-bold hover:translate-x-1 rounded-none transition-all"
            >
              <Link
                href={`/profile/${dbUser?.username || 'me'}`}
                className="flex items-center w-full uppercase py-2"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>My Stories</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white focus:text-black text-black font-bold hover:translate-x-1 rounded-none transition-all"
            >
              <Link
                href="/nft-gallery"
                className="flex items-center w-full uppercase py-2"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>My NFTs</span>
              </Link>
            </DropdownMenuItem>

            {/* Additional Wallet Link for Supabase Users lacking Web3 */}
            {!account && (
              <DropdownMenuItem
                onClick={() => connectWallet()}
                className="cursor-pointer focus:bg-[#38bdf8] focus:text-black focus:border-[2px] focus:border-black text-[#38bdf8] hover:text-black rounded-none transition-all uppercase py-2 font-black tracking-wider"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>Connect Web3 Wallet</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="h-[4px] bg-black mx-1 my-2" />

          {/* Role-based items */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white focus:text-black text-black font-bold hover:translate-x-1 rounded-none transition-all uppercase py-2"
            >
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-white focus:text-black text-black font-bold hover:translate-x-1 rounded-none transition-all uppercase py-2"
            >
              <Link href="/notifications" className="flex items-center w-full">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-black tracking-wider border-[2px] border-black shadow-[2px_2px_0_0_#000] rounded-none bg-[#cc3333] text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer focus:bg-black focus:text-white rounded-none transition-all uppercase py-2 text-black font-black bg-[var(--comic-yellow)] border-[2px] border-black mt-2"
              >
                <Link href="/admin" className="flex items-center w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}

            {isModOrAdmin && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer focus:bg-black focus:text-white rounded-none transition-all uppercase py-2 text-black font-black bg-[var(--comic-yellow)] border-[2px] border-black mt-2"
              >
                <Link href="/admin/moderation" className="flex items-center w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Moderation</span>
                </Link>
              </DropdownMenuItem>
            )}

            {isModOrAdmin && (
              <DropdownMenuItem
                onClick={toggleViewMode}
                className="cursor-pointer focus:bg-black focus:text-white rounded-none transition-all uppercase py-2 text-black font-bold hover:translate-x-1"
              >
                {isOverridden ? (
                  <><Eye className="mr-2 h-4 w-4" /><span>Switch to Admin View</span></>
                ) : (
                  <><EyeOff className="mr-2 h-4 w-4" /><span>Switch to User View</span></>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-white bg-black hover:bg-[#cc3333] hover:text-white border-[2px] border-transparent hover:border-black rounded-none transition-all uppercase py-2 font-black mt-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </div>

        <div className="px-4 py-3 bg-white border-t-[4px] border-black space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase text-black/60 tracking-wider mb-1">
              Active Identity
            </p>
            <div className="text-xs font-mono uppercase tracking-widest bg-black text-white border-[2px] border-black rounded-none px-3 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap shadow-[3px_3px_0_0_#cc3333]">
              {account ? truncateAddress(account) : session?.user?.email}
            </div>
          </div>

          {(session?.user?.last_sign_in_at || account) && (
            <div className="flex flex-col gap-1 border-t-[2px] border-black pt-2 border-dashed">
              <p className="text-[10px] font-black uppercase text-black/60 tracking-wider">
                Security Info
              </p>
              <div className="text-[10px] text-black font-bold leading-snug">
                Last Login: <span className="text-[#cc3333]">{session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString() : 'Active Wallet Session'}</span> <br />
                Access: <span className="text-[#cc3333]">{account ? 'On-Chain Web3' : 'Off-Chain Auth'}</span>
              </div>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
