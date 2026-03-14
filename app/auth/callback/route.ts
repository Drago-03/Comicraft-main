import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      // Handle redirects correctly depending on environment and load balancers
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    
    console.error("Supabase Auth Code Exchange Error:", error);
    return NextResponse.redirect(`${origin}/sign-in?error=AuthFailed`);
  }

  // No code was present in the URL
  return NextResponse.redirect(`${origin}/sign-in`);
}
