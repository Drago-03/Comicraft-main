'use client';

import React, { useState } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';
import { Zap, Sparkles } from 'lucide-react';

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
    <div className="relative w-full min-h-screen bg-[#EEDFCA] font-sans overflow-hidden
                    flex flex-col lg:flex lg:flex-row lg:min-h-screen lg:overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

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

      {/* Desktop Login Panel */}
      <div
        className="hidden lg:flex absolute top-0 left-0 w-1/2 h-full flex-col items-center justify-center p-12 overflow-y-auto transition-all duration-700"
        style={{
          zIndex: isRegister ? 5 : 10,
          opacity: isRegister ? 0 : 1,
          transform: isRegister ? 'scale(0.95)' : 'scale(1)',
          pointerEvents: isRegister ? 'none' : 'auto',
          transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        }}
      >
        <div className="w-full max-w-md mx-auto relative z-10">
          <SignInForm onToggleMode={openRegister} />
        </div>
      </div>

      {/* Desktop Register Panel */}
      <div
        className="hidden lg:flex absolute top-0 right-0 w-1/2 h-full flex-col items-center justify-center p-12 overflow-y-auto transition-all duration-700"
        style={{
          zIndex: isRegister ? 10 : 5,
          opacity: isRegister ? 1 : 0,
          transform: isRegister ? 'scale(1)' : 'scale(0.95)',
          pointerEvents: isRegister ? 'auto' : 'none',
          transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        }}
      >
        <div className="w-full max-w-md mx-auto relative z-10">
          <SignUpForm onToggleMode={openLogin} />
        </div>
      </div>

      {/* Red Curtain Panel */}
      <div
        className="hidden lg:flex absolute top-0 left-1/2 w-1/2 h-full shadow-[0_0_20px_rgba(0,0,0,0.8)] border-l-[3px] border-r-[3px] border-black flex-col items-center justify-center z-20 overflow-hidden"
        style={{
          transform: isRegister ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 700ms cubic-bezier(0.645, 0.045, 0.355, 1)',
          willChange: 'transform',
          backgroundColor: '#b91c1c',
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(255,255,255,0.08) 7%, rgba(0,0,0,0.18) 14%, rgba(255,255,255,0.06) 21%, rgba(0,0,0,0.22) 28%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.16) 42%, rgba(255,255,255,0.06) 49%, rgba(0,0,0,0.2) 56%, rgba(255,255,255,0.08) 63%, rgba(0,0,0,0.18) 70%, rgba(255,255,255,0.06) 77%, rgba(0,0,0,0.2) 84%, rgba(255,255,255,0.06) 91%, rgba(0,0,0,0.24) 100%)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-3 bg-[#2b0d0d] border-b-[3px] border-black pointer-events-none" />
        <div className="absolute top-3 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        <div className="relative z-10 px-12 text-center text-white flex flex-col items-center w-full max-w-lg">
          <div
            className="absolute inset-x-0 transition-all duration-[700ms] flex flex-col items-center"
            style={{
              opacity: isRegister ? 1 : 0,
              pointerEvents: isRegister ? 'auto' : 'none',
              top: '50%',
              transform: isRegister ? 'translateY(-50%)' : 'translateY(-40%)',
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

          <div
            className="absolute inset-x-0 transition-all duration-[700ms] flex flex-col items-center"
            style={{
              opacity: isRegister ? 0 : 1,
              pointerEvents: isRegister ? 'none' : 'auto',
              top: '50%',
              transform: isRegister ? 'translateY(-60%)' : 'translateY(-50%)',
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
