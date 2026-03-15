'use client';

import React, { useState } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { ArrowRight, BookOpen, Zap, Shield, Sparkles } from 'lucide-react';

interface AnimatedAuthContainerProps {
  initialMode: 'login' | 'register';
}

export function AnimatedAuthContainer({ initialMode }: AnimatedAuthContainerProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Pure state toggle — no router.replace() so the component never remounts,
  // which is what allows the CSS curtain transition to actually play.
  const openRegister = () => setMode('register');
  const openLogin = () => setMode('login');

  const isRegister = mode === 'register';

  return (
    // Mobile: vertical stack, no fixed height, panels show/hide via display
    // Desktop (lg): fixed-height absolute layout with sliding curtain
    <div className="relative w-full max-w-6xl mx-auto bg-[#EEDFCA] border-[3px] border-black shadow-[8px_8px_0_0_#000] my-8 font-sans rounded-none
                    flex flex-col lg:flex lg:flex-row lg:min-h-[720px] lg:overflow-hidden">
      {/* ── COMIC HALFTONE BACKGROUND LAYER ── */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* ────────────────────────────────────────────────────────────────────
          MOBILE: Simple show/hide — no absolute positioning
      ──────────────────────────────────────────────────────────────────── */}
      {/* Mobile Login Panel */}
      <div className={`lg:hidden w-full flex flex-col items-center justify-center p-6 relative z-10 transition-all duration-500 ${isRegister ? 'hidden' : 'block'}`}>
        <div className="w-full max-w-md mx-auto">
          <SignInForm onToggleMode={openRegister} />
        </div>
      </div>

      {/* Mobile Register Panel */}
      <div className={`lg:hidden w-full flex flex-col items-center justify-center p-6 relative z-10 transition-all duration-500 ${isRegister ? 'block' : 'hidden'}`}>
        <div className="w-full max-w-md mx-auto">
          <SignUpForm onToggleMode={openLogin} />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          DESKTOP: Absolute-positioned panels + sliding curtain
      ──────────────────────────────────────────────────────────────────── */}
      {/* Desktop Login Panel — left half */}
      <div
        className="hidden lg:flex absolute top-0 left-0 w-1/2 h-full flex-col items-center justify-center p-12 overflow-y-auto transition-all duration-[700ms] ease-[cubic-bezier(0.645,0.045,0.355,1)]"
        style={{
          zIndex: isRegister ? 5 : 10,
          opacity: isRegister ? 0 : 1,
          transform: isRegister ? 'scale(0.95)' : 'scale(1)',
          pointerEvents: isRegister ? 'none' : 'auto',
        }}
      >
        <div className="w-full max-w-md mx-auto relative z-10">
          <SignInForm onToggleMode={openRegister} />
        </div>
      </div>

      {/* Desktop Register Panel — right half */}
      <div
        className="hidden lg:flex absolute top-0 right-0 w-1/2 h-full flex-col items-center justify-center p-12 overflow-y-auto transition-all duration-[700ms] ease-[cubic-bezier(0.645,0.045,0.355,1)]"
        style={{
          zIndex: isRegister ? 10 : 5,
          opacity: isRegister ? 1 : 0,
          transform: isRegister ? 'scale(1)' : 'scale(0.95)',
          pointerEvents: isRegister ? 'auto' : 'none',
        }}
      >
        <div className="w-full max-w-md mx-auto relative z-10">
           <SignUpForm onToggleMode={openLogin} />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          CURTAIN PANEL — Desktop only
          Moves between Right (Login state) and Left (Register state).
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-br from-[#cc3333] via-[#ff4a4a] to-[#ffbaba] shadow-[0_0_20px_rgba(0,0,0,0.8)] border-l-[3px] border-r-[3px] border-black flex-col items-center justify-center z-20 overflow-hidden"
        style={{
          transform: isRegister ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 700ms cubic-bezier(0.645, 0.045, 0.355, 1)',
          willChange: 'transform',
        }}
      >
          {/* Subtle curtain atmospheric vignette overlay */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          {/* Comic Dots over curtain */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
          
          <div className="relative z-10 px-12 text-center text-white flex flex-col items-center w-full max-w-lg">
            
            {/* REGISTER STATE CONTENT -> Left Panel -> START YOUR JOURNEY */}
            <div 
              className="absolute inset-x-0 transition-all duration-[700ms] flex flex-col items-center"
              style={{ 
                opacity: isRegister ? 1 : 0, 
                pointerEvents: isRegister ? 'auto' : 'none',
                top: '50%',
                transform: isRegister ? 'translateY(-50%)' : 'translateY(-40%)'
              }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border-[3px] border-black bg-black shadow-[4px_4px_0_0_#fff] text-xs font-black text-white uppercase tracking-widest mb-6">
                <Sparkles className="w-4 h-4 text-white" /> Discover the Universe
              </div>
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-4 text-[#EEDFCA]" style={{ WebkitTextStroke: '2px black' }}>
                START YOUR <br /> JOURNEY
              </h2>
              <p className="text-sm font-bold text-white leading-relaxed mb-10 max-w-sm drop-shadow-md">
                Join a dynamic community of creators. Forge new narratives, establish your identity, and build multiverses on the blockchain.
              </p>
            </div>

            {/* LOGIN STATE CONTENT -> Right Panel -> RETURN TO BASE */}
            <div 
              className="absolute inset-x-0 transition-all duration-[700ms] flex flex-col items-center"
              style={{ 
                opacity: isRegister ? 0 : 1, 
                pointerEvents: isRegister ? 'none' : 'auto',
                top: '50%',
                transform: isRegister ? 'translateY(-60%)' : 'translateY(-50%)'
              }}
            >
               <div className="inline-flex items-center gap-2 px-4 py-1.5 border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000] text-xs font-black text-black uppercase tracking-widest mb-6">
                <Zap className="w-4 h-4 text-[#cc3333]" /> Welcome Back Commander
              </div>
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-4 text-[#EEDFCA]" style={{ WebkitTextStroke: '2px black' }}>
                RETURN TO <br /> BASE
              </h2>
              <p className="text-sm font-bold text-white leading-relaxed mb-10 max-w-sm drop-shadow-md">
                Resume your creative workflow, check your marketplace assets, and reconnect with your collector community.
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
