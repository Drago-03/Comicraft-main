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
    <div
      className="min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 -mb-6 flex overflow-hidden"
      style={{ backgroundColor: '#EEDFCA' }}
    >
      {/* ── HALFTONE BACKGROUND ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* ────────────────────────────────────────────────────────────────────
          LEFT PANEL — Login form
          Stationary. Always visible behind the curtain.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: '50%',
          flexShrink: 0,
          overflowY: 'auto',
          zIndex: 1, /* lower than the curtain */
        }}
      >
        <SignInForm onToggleMode={openRegister} />
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          RIGHT PANEL — container for the register form (beneath) and curtain (on top)
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1"
        style={{ width: '50%', zIndex: 20 /* higher than left panel so curtain overlaps it */ }}
      >
        {/* ── REGISTER FORM — always rendered, revealed when curtain slides away ── */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-y-auto py-4"
          style={{
            zIndex: 0,
            opacity: isRegister ? 1 : 0,
            /* Delay opacity so the curtain visually leads the reveal */
            transition: 'opacity 180ms ease-in-out 200ms',
            pointerEvents: isRegister ? 'auto' : 'none',
          }}
        >
          <SignUpForm onToggleMode={openLogin} />
        </div>

        {/* ╔══════════════════════════════════════════════════════════════╗
            ║  CURTAIN PANEL                                               ║
            ║  Default: sits over the right half (translateX: 0).         ║
            ║  Register: slides left off-screen (translateX: -100%).      ║
            ║  The left border acts as the visible dividing line.         ║
            ╚══════════════════════════════════════════════════════════════╝ */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 10,
            backgroundColor: '#EEDFCA',
            borderLeft: '3px solid #000',
            /* Curtain leading-edge shadow for depth */
            boxShadow: '-6px 0 20px rgba(0,0,0,0.18)',
            transform: isRegister ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 350ms ease-in-out',
            willChange: 'transform',
          }}
        >
          {/* Halftone inside the curtain matches page texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* ── CURTAIN FACE — intro / "Join the Verse" content ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-12 py-10"
            style={{
              opacity: isRegister ? 0 : 1,
              transition: 'opacity 150ms ease-in-out',
              pointerEvents: isRegister ? 'none' : 'auto',
            }}
          >
            {/* Accent stripe */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#cc3333]" />

            {/* Corner dots */}
            <div className="absolute top-6 left-6 w-3 h-3 bg-[#cc3333] border-2 border-black" />
            <div className="absolute top-6 right-6 w-3 h-3 bg-black" />
            <div className="absolute bottom-6 left-6 w-3 h-3 bg-black" />
            <div className="absolute bottom-6 right-6 w-3 h-3 bg-[#cc3333] border-2 border-black" />

            <div className="max-w-sm text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black bg-black shadow-[3px_3px_0_0_#cc3333] text-[10px] font-black text-white uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" /> New here?
              </div>

              <h2
                className="text-4xl md:text-5xl font-black italic uppercase text-black tracking-tighter mb-4"
                style={{ WebkitTextStroke: '1px black' }}
              >
                Join the <span className="text-[#cc3333]">Verse</span>
              </h2>
              <p className="text-sm font-bold text-black/70 leading-relaxed mb-8">
                Create stories, mint NFTs, trade on the Bazaar, and build multiverses with creators worldwide.
              </p>

              {/* Feature list */}
              <div className="space-y-3 mb-10 text-left">
                {[
                  { icon: BookOpen, label: 'AI-powered story generation', color: '#cc3333' },
                  { icon: Zap,      label: 'Mint stories as blockchain NFTs', color: '#6c3fc5' },
                  { icon: Shield,   label: 'Own your creative IP forever',    color: '#457b9d' },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 bg-white border-[2px] border-black px-4 py-2.5 shadow-[2px_2px_0_0_#000]"
                  >
                    <div
                      className="w-7 h-7 flex items-center justify-center border-[2px] border-black flex-shrink-0"
                      style={{ backgroundColor: f.color }}
                    >
                      <f.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[11px] font-black text-black uppercase tracking-wide">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA — clicking this triggers the curtain to slide */}
              <button
                onClick={openRegister}
                className="w-full py-4 px-6 bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[5px_5px_0_0_#000] hover:shadow-[7px_7px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </button>

              <p className="mt-4 text-[11px] font-bold text-black/40 uppercase tracking-widest">
                Free forever · No credit card required
              </p>
            </div>
          </div>
        </div>{/* end curtain */}
      </div>{/* end right panel */}
    </div>
  );
}
