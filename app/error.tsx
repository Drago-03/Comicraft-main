'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EEDFCA] text-black px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />
      <div className="relative z-10">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2" style={{ WebkitTextStroke: '1px black', textShadow: '4px 4px 0 #cc3333' }}>Oops!</h2>
        <p className="text-xl font-black uppercase mb-2">Something went wrong.</p>
        <p className="font-bold text-black/60 mb-8 max-w-md text-sm uppercase tracking-wide">
          An unexpected error occurred while loading this page.
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-[#cc3333] text-white font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
