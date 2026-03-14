'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    
    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }: { data: any, error: any }) => {
          if (error) {
            console.error("Supabase Auth Code Exchange Error:", error);
            setError('Authentication failed. Please try again.');
            setTimeout(() => router.push('/sign-in?error=AuthFailed'), 3000);
          } else {
            if (data.session) {
              localStorage.setItem('accessToken', data.session.access_token);
              if (data.session.refresh_token) {
                localStorage.setItem('refreshToken', data.session.refresh_token);
              }
              window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
            }
            router.push(next);
            router.refresh();
          }
        })
        .catch((err: any) => {
          console.error(err);
          setError('An unexpected error occurred.');
          setTimeout(() => router.push('/sign-in?error=AuthFailed'), 3000);
        });
    } else {
      router.push('/sign-in');
    }
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

export default function AuthCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c]">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-neutral-400 font-medium">Loading...</p>
        </div>
      }>
        <AuthCallback />
      </Suspense>
    </div>
  );
}
