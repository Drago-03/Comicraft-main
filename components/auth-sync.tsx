'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

import { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Automatically synchronizes Supabase session tokens to localStorage.
 * The Express backend expects an 'Authorization: Bearer <token>' header from
 * localStorage, so we must keep it updated globally even when authentication
 * happens server-side (like Google OAuth PKCE).
 */
export function AuthSync() {
  useEffect(() => {
    const supabase = createClient();
    
    // Check initial session first in case the user just arrived from OAuth redirect
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      if (session?.access_token) {
        localStorage.setItem('accessToken', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        // Notify other components that auth state has changed
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
      }
    });

    // Listen to changes globally (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session?.access_token) {
        localStorage.setItem('accessToken', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        // Notify other components that auth state has changed
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken', newValue: null }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
