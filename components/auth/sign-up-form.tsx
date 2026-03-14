'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, PenTool, Library, Sparkles, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';

type Step = 'role' | 'details';
type Role = 'creator' | 'collector' | 'both' | null;

export function SignUpForm({ onToggleMode }: { onToggleMode: () => void }) {
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s += 25;
    if (/[A-Z]/.test(password)) s += 25;
    if (/[a-z]/.test(password)) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    return s;
  };

  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength < 50) return 'bg-[#cc3333]';
    if (strength < 100) return 'bg-[#d97706]';
    return 'bg-green-600';
  };

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) { setErrorMsg('First and last name are required'); return false; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setErrorMsg('Username must be 3-20 chars: letters, numbers, underscores'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMsg('Please enter a valid email address'); return false; }
    if (strength < 100) { setErrorMsg('Password needs: 8+ chars, uppercase, lowercase, number'); return false; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return false; }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, first_name: firstName, last_name: lastName, preferred_role: selectedRole, bio, favorite_genre: favoriteGenre } },
      });
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', session.access_token);
        if (session.refresh_token) localStorage.setItem('refreshToken', session.refresh_token);
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
      }
      setSuccess(true);
      toast({ title: 'Account Created!', description: 'Please check your email to verify your account.' });
      timeoutRef.current = setTimeout(() => { onToggleMode(); }, 1500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to sign up');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      localStorage.setItem('preferred_role', selectedRole || 'both');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'Error communicating with Google authentication');
    }
  };

  const inputClass = (field: string) =>
    `relative flex items-center border-[3px] transition-colors ${
      focusedField === field ? 'border-[#cc3333] bg-white' : 'border-black bg-white'
    }`;

  // Role config
  const roles = [
    { id: 'creator', label: 'Creator', desc: 'Publish stories and mint NFTs', icon: PenTool, activeColor: 'border-[#cc3333] bg-[#cc3333]/5', iconActive: 'bg-[#cc3333]/20 text-[#cc3333]' },
    { id: 'collector', label: 'Collector', desc: 'Discover, read, and collect stories', icon: Library, activeColor: 'border-[#457b9d] bg-[#457b9d]/5', iconActive: 'bg-[#457b9d]/20 text-[#457b9d]' },
    { id: 'both', label: 'Both', desc: 'The full platform experience', icon: Sparkles, activeColor: 'border-[#6c3fc5] bg-[#6c3fc5]/5', iconActive: 'bg-[#6c3fc5]/20 text-[#6c3fc5]' },
  ] as const;

  return (
    <div className="w-full max-w-lg px-6 relative z-10 flex flex-col pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-7 text-center">
        <Link href="/" className="mb-5 block">
          <div className="relative w-14 h-14 border-[3px] border-black shadow-[3px_3px_0_0_#000] bg-white flex items-center justify-center">
            <Image src="/logo.png" alt="Comicraft Logo" fill className="object-contain p-1" priority />
          </div>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black bg-black shadow-[3px_3px_0_0_#cc3333] text-[10px] font-black text-white uppercase tracking-widest mb-3">
          Create Account
        </div>
        <h1 className="text-3xl font-black italic uppercase text-black tracking-tighter" style={{ WebkitTextStroke: '0.5px black' }}>
          Join Comicraft
        </h1>
        <p className="text-black/60 text-sm font-bold mt-1">
          {step === 'role' ? 'Select how you plan to use Comicraft.' : 'Enter your details to get started.'}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-7 w-full">
        {step === 'role' ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 gap-3 mb-7">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id as Role)}
                  className={`p-4 border-[3px] text-left transition-all shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 ${
                    selectedRole === r.id ? r.activeColor : 'border-black bg-[#EEDFCA] hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 border-[2px] border-black ${selectedRole === r.id ? r.iconActive : 'bg-white text-black'}`}>
                      <r.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-black text-sm uppercase tracking-wide">{r.label}</h3>
                      <p className="text-xs text-black/60 font-bold mt-0.5">{r.desc}</p>
                    </div>
                    {selectedRole === r.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#cc3333] ml-auto flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('details')} disabled={!selectedRole}
              className="w-full h-12 bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="my-5 flex items-center">
              <div className="flex-1 h-[2px] bg-black/10" />
              <span className="px-4 text-[10px] font-black uppercase tracking-widest text-black/40">Or continue with</span>
              <div className="flex-1 h-[2px] bg-black/10" />
            </div>
            <div className="w-full relative"><WalletConnect /></div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'firstName', label: 'First Name', value: firstName, onChange: setFirstName, placeholder: 'Jane' },
                  { id: 'lastName', label: 'Last Name', value: lastName, onChange: setLastName, placeholder: 'Doe' },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <Label htmlFor={f.id} className="text-[10px] font-black text-black uppercase tracking-widest">{f.label}</Label>
                    <div className={inputClass(f.id)}>
                      <Input
                        id={f.id} type="text" required value={f.value}
                        disabled={loading || success}
                        onFocus={() => setFocusedField(f.id)} onBlur={() => setFocusedField(null)}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="w-full h-10 px-3 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                        placeholder={f.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[10px] font-black text-black uppercase tracking-widest">Username</Label>
                <div className={inputClass('username')}>
                  <User className={`absolute left-3 w-4 h-4 ${focusedField === 'username' ? 'text-[#cc3333]' : 'text-black/40'}`} />
                  <Input
                    id="username" type="text" required value={username}
                    disabled={loading || success}
                    onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                    placeholder="jdoe_123"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black text-black uppercase tracking-widest">Email Address</Label>
                <div className={inputClass('email')}>
                  <Mail className={`absolute left-3 w-4 h-4 ${focusedField === 'email' ? 'text-[#cc3333]' : 'text-black/40'}`} />
                  <Input
                    id="email" type="email" required value={email}
                    disabled={loading || success}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] font-black text-black uppercase tracking-widest">Password</Label>
                  <div className={inputClass('password')}>
                    <Lock className={`absolute left-3 w-4 h-4 ${focusedField === 'password' ? 'text-[#cc3333]' : 'text-black/40'}`} />
                    <Input
                      id="password" type={showPassword ? 'text' : 'password'} required value={password}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-10 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} className="absolute right-3 text-black/40 hover:text-[#cc3333] focus:outline-none transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="flex gap-1 mt-1">
                      {[25, 50, 75, 100].map((thresh) => (
                        <div key={thresh} className={`h-1.5 flex-1 border border-black ${strength >= thresh ? getStrengthColor() : 'bg-[#EEDFCA]'}`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black text-black uppercase tracking-widest">Confirm</Label>
                  <div className={inputClass('confirmPassword')}>
                    <Lock className={`absolute left-3 w-4 h-4 ${focusedField === 'confirmPassword' ? 'text-[#cc3333]' : 'text-black/40'}`} />
                    <Input
                      id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-10 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-pressed={showConfirmPassword} className="absolute right-3 text-black/40 hover:text-[#cc3333] focus:outline-none transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t-[2px] border-black/10">
                {[
                  { id: 'bio', label: 'Short Bio (Opt)', value: bio, onChange: setBio, placeholder: 'A quick intro' },
                  { id: 'favoriteGenre', label: 'Fav Genre (Opt)', value: favoriteGenre, onChange: setFavoriteGenre, placeholder: 'Sci-Fi' },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <Label htmlFor={f.id} className="text-[10px] font-black text-black uppercase tracking-widest">{f.label}</Label>
                    <div className={inputClass(f.id)}>
                      <Input
                        id={f.id} type="text" value={f.value}
                        disabled={loading || success}
                        onFocus={() => setFocusedField(f.id)} onBlur={() => setFocusedField(null)}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="w-full h-10 px-3 bg-transparent border-none text-black placeholder:text-black/30 focus-visible:ring-0 shadow-none text-sm font-bold"
                        placeholder={f.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-[#cc3333] text-xs font-black bg-[#cc3333]/10 border-[2px] border-[#cc3333] p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-3 flex flex-col gap-3">
                <Button
                  type="submit" disabled={loading || success}
                  className="w-full h-12 bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all flex items-center justify-center gap-2"
                >
                  {success ? (
                    <><CheckCircle2 className="w-5 h-5" /> Registered!</>
                  ) : loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
                <button type="button" onClick={() => setStep('role')} className="text-xs font-black text-black/50 hover:text-[#cc3333] transition-colors py-1 uppercase tracking-wide">
                  ← Back to Role Selection
                </button>
              </div>
            </form>

            <div className="my-5 flex items-center">
              <div className="flex-1 h-[2px] bg-black/10" />
              <span className="px-4 text-[10px] font-black uppercase tracking-widest text-black/40">Or</span>
              <div className="flex-1 h-[2px] bg-black/10" />
            </div>

            <Button
              type="button" variant="outline" onClick={handleGoogleSignUp}
              disabled={loading || success}
              className="w-full h-11 bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white text-black font-black uppercase tracking-wide rounded-none transition-all text-sm"
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <p className="mt-6 text-center text-sm text-black/60 font-bold pb-4">
        Already have an account?{' '}
        <button
          onClick={onToggleMode}
          className="text-[#cc3333] hover:text-black font-black transition-colors ml-1 focus:outline-none underline underline-offset-2"
        >
          Sign In Here →
        </button>
      </p>
    </div>
  );
}
