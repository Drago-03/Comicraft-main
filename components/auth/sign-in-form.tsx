'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';
import { loginWithUsernameOrEmail } from '@/app/actions/auth';

export function SignInForm({ onToggleMode }: { onToggleMode: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const validateForm = () => {
    if (!identifier.trim()) { setErrorMsg('Email or Username is required'); return false; }
    if (!password) { setErrorMsg('Password is required'); return false; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await loginWithUsernameOrEmail(identifier, password);
      if (result.error) throw new Error(result.error);
      if (result.data?.tokens?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        if (result.data.tokens.refreshToken) localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
      }
      setSuccess(true);
      toast({ title: 'Authentication Successful', description: 'You have securely logged in.' });
      setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 800);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'Error communicating with Google authentication');
    }
  };

  const inputBase = (field: string) =>
    `relative flex items-center border-[3px] transition-colors ${
      focusedField === field ? 'border-[#cc3333] bg-white' : 'border-black bg-white'
    }`;

  return (
    <div className="w-full max-w-md px-6 py-8 relative z-10 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="mb-5 block">
          <div className="relative w-14 h-14 border-[3px] border-black shadow-[3px_3px_0_0_#000] bg-white flex items-center justify-center">
            <Image src="/logo.png" alt="Comicraft Logo" fill className="object-contain p-1" priority />
          </div>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black bg-[#cc3333] shadow-[3px_3px_0_0_#000] text-[10px] font-black text-white uppercase tracking-widest mb-3">
          Sign In
        </div>
        <h1 className="text-3xl font-black italic uppercase text-black tracking-tighter" style={{ WebkitTextStroke: '0.5px black' }}>
          Welcome Back
        </h1>
        <p className="text-black/60 text-sm font-bold mt-1 text-center">Manage your content, libraries &amp; Web3 portfolio</p>
      </div>

      {/* Card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-7 w-full">
        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Email/Username */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-[10px] font-black text-black uppercase tracking-widest">
              Email / Username
            </Label>
            <div className={inputBase('identifier')}>
              <svg className={`absolute left-3 w-4 h-4 ${focusedField === 'identifier' ? 'text-[#cc3333]' : 'text-black/40'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <Input
                id="identifier" type="text" autoComplete="username" required
                value={identifier} disabled={loading || success}
                onFocus={() => setFocusedField('identifier')} onBlur={() => setFocusedField(null)}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                placeholder="name@company.com or username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[10px] font-black text-black uppercase tracking-widest">
              Password
            </Label>
            <div className={inputBase('password')}>
              <Lock className={`absolute left-3 w-4 h-4 ${focusedField === 'password' ? 'text-[#cc3333]' : 'text-black/40'}`} />
              <Input
                id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                value={password} disabled={loading || success}
                onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-12 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                placeholder="••••••••"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-black/40 hover:text-[#cc3333] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-[#cc3333] text-xs font-black bg-[#cc3333]/10 border-[2px] border-[#cc3333] p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit" disabled={loading || success}
            className="w-full h-12 bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all mt-1"
          >
            {success ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Authenticated
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Sign In <LogIn className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center">
          <div className="flex-1 h-[2px] bg-black/10" />
          <span className="mx-4 text-[10px] font-black uppercase tracking-widest text-black/40">Or continue with</span>
          <div className="flex-1 h-[2px] bg-black/10" />
        </div>

        {/* OAuth */}
        <div className="space-y-3">
          <Button
            type="button" variant="outline" onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full h-11 bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white text-black font-black uppercase tracking-wide rounded-none transition-all text-sm"
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <div className="w-full relative">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Toggle */}
      <p className="mt-6 text-center text-sm text-black/60 font-bold">
        Need to create an account?{' '}
        <button
          onClick={onToggleMode}
          className="text-[#cc3333] hover:text-black font-black transition-colors ml-1 focus:outline-none underline underline-offset-2"
        >
          Register Here →
        </button>
      </p>
    </div>
  );
}
