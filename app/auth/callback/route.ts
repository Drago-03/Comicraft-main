import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The `next` parameter defines where to redirect after successful login
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the authorization code for a session token
    // Using the server client means this automatically sets the secure HTTP-only cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const preferredOrigin = process.env.NEXT_PUBLIC_URL || origin;
      
      // Handle redirects correctly depending on environment
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // Always redirect back to the canonical frontend URL in production
        // to ensure the user stays on the correct domain (e.g. comicraft.xyz)
        // instead of being trapped on the backend's Render URL.
        return NextResponse.redirect(`${preferredOrigin}${next}`);
      }
    }
    
    console.error("Supabase Auth Code Exchange Error:", error);
    return NextResponse.redirect(`${origin}/sign-in?error=AuthFailed`);
  }

  // No code was present in the URL
  return NextResponse.redirect(`${origin}/sign-in`);
}
