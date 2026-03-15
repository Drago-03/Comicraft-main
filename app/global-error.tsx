'use client';

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  // Log critical application-level errors
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Application Error</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#EEDFCA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.04em', marginBottom: '8px', WebkitTextStroke: '1px black', textShadow: '4px 4px 0 #cc3333', color: 'black' }}>
            Critical Error
          </h1>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.6)', marginBottom: '32px', maxWidth: '400px' }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '12px 32px', background: '#cc3333', color: 'white', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', border: '3px solid black', boxShadow: '4px 4px 0 0 black', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}