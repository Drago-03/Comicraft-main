'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect((): void | (() => void) => {
    const supabase = createClient();
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // --- Flow 1: PKCE code exchange (server-rendered builds) ---
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }: { data: any; error: any }) => {
          if (error) {
            console.error('Supabase Auth Code Exchange Error:', error);
            setError('Authentication failed. Please try again.');
            setTimeout(() => router.push('/sign-in?error=AuthFailed'), 3000);
          } else {
            persistSession(data.session);
            router.push(next);
            router.refresh();
          }
        })
        .catch((err: any) => {
          console.error(err);
          setError('An unexpected error occurred.');
          setTimeout(() => router.push('/sign-in?error=AuthFailed'), 3000);
        });
      return;
    }

    // --- Flow 2: Implicit / hash-fragment flow (static export / Cloudflare Pages) ---
    // Supabase redirects back with a URL like:
    //   /auth/callback#access_token=...&refresh_token=...&type=...
    // The @supabase/ssr browser client auto-detects the hash and calls
    // `onAuthStateChange` with the SIGNED_IN event. We just need to wait
    // for that event rather than immediately redirecting.
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    if (hash && hash.includes('access_token')) {
      // The Supabase client will automatically pick up the hash fragment
      // and establish the session. Listen for the SIGNED_IN event.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session) {
            persistSession(session);
            subscription.unsubscribe();
            router.push(next);
            router.refresh();
          }
        }
      );

      // Safety timeout — if the event never fires, redirect anyway
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        // Check if we already have a session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
          if (session) {
            persistSession(session);
            router.push(next);
            router.refresh();
          } else {
            setError('Authentication timed out. Please try again.');
            setTimeout(() => router.push('/sign-in?error=AuthTimeout'), 2000);
          }
        });
      }, 5000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }

    // --- Flow 3: No code or hash — check for an existing session ---
    // This handles the case where the user lands on /auth/callback directly
    // or Supabase already set the session via cookies/localStorage before
    // this component mounts (e.g. a quick page refresh).
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (session) {
        persistSession(session);
        router.push(next);
        router.refresh();
      } else {
        // No session at all — send back to sign-in
        router.push('/sign-in');
      }
    });
  }, [router, searchParams]);

  if (error) {
    return <div className="text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
      <p className="text-neutral-400 font-medium">Completing authentication...</p>
    </div>
  );
}

/** Persist tokens to localStorage so other hooks/API calls can use them. */
function persistSession(session: any) {
  if (!session || typeof window === 'undefined') return;
  if (session.access_token) {
    localStorage.setItem('accessToken', session.access_token);
  }
  if (session.refresh_token) {
    localStorage.setItem('refreshToken', session.refresh_token);
  }
  window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
  window.dispatchEvent(new Event('auth-changed'));
}

export default function AuthCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EEDFCA] relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 border-[4px] border-black border-t-[#cc3333] rounded-full animate-spin" />
          <p className="font-black uppercase text-sm text-black/60 tracking-wider">Loading...</p>
        </div>
      }>
        <AuthCallback />
      </Suspense>
    </div>
  );
}
