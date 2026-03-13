'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Comicraft Logo System — Uses the official /logo.png brand asset
//
// variant="full"   → Logo image at full size (navbar, hero, footer)
// variant="icon"   → Logo image at compact size (favicon / badge)
// variant="mark"   → Logo image at medium size (minimal contexts)
//
// The logo is always rendered from /logo.png to ensure the full COMICRAFT
// wordmark is visible and never clipped at any viewport size.
// ---------------------------------------------------------------------------

export type LogoVariant = 'full' | 'icon' | 'mark';
export type LogoColorScheme = 'color' | 'mono-light' | 'mono-dark';

interface ComiCraftLogoProps {
  variant?: LogoVariant;
  colorScheme?: LogoColorScheme;
  /** Height in px (width auto-calculated). Default 40 for full, 36 for icon. */
  size?: number;
  /** When true, wraps the logo in a Link to "/" */
  asLink?: boolean;
  className?: string;
  animate?: boolean;
}

// ---------------------------------------------------------------------------
// PUBLIC COMPONENT
// ---------------------------------------------------------------------------
export function ComiCraftLogo({
  variant = 'full',
  colorScheme = 'color',
  size,
  asLink = false,
  className = '',
  animate = true,
}: ComiCraftLogoProps) {
  const iconSize = size ?? (variant === 'full' ? 40 : variant === 'mark' ? 32 : 36);

  // Use the logo.png as a stylized icon for all variants
  const iconWidth = iconSize;
  const iconHeight = iconSize;

  // Apply filter for mono schemes
  const filterStyle: React.CSSProperties =
    colorScheme === 'mono-light'
      ? { filter: 'brightness(0) invert(1)' }
      : colorScheme === 'mono-dark'
      ? { filter: 'brightness(0)' }
      : {};

  const logoIcon = (
    <div className="relative flex-shrink-0">
      <Image
        src="/logo.png"
        alt=""
        width={iconWidth}
        height={iconHeight}
        className="object-contain"
        style={{
          width: `${iconWidth}px`,
          height: `${iconHeight}px`,
          ...filterStyle,
        }}
        priority
        unoptimized
      />
      {/* Decorative glow behind the icon for colored schemes */}
      {colorScheme === 'color' && (
        <div className="absolute inset-0 bg-primary/20 blur-lg -z-10 rounded-full" />
      )}
    </div>
  );

  const logoText = (variant === 'full' || variant === 'mark') && (
    <span
      className={cn(
        'ml-2 font-bold tracking-tight select-none',
        variant === 'full' ? 'text-xl' : 'text-lg',
        'font-comic' // Using the variable defined in layout.tsx
      )}
      style={{
        fontFamily: 'var(--font-comic), system-ui, sans-serif',
        background: colorScheme === 'color'
          ? 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)'
          : 'currentColor',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: colorScheme === 'color' ? 'transparent' : 'currentColor',
      }}
    >
      COMICRAFT
    </span>
  );

  const inner = (
    <span
      className={cn(
        'inline-flex items-center select-none flex-shrink-0',
        className
      )}
      aria-label="Comicraft"
    >
      {animate ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center flex-shrink-0"
        >
          {logoIcon}
          {logoText}
        </motion.div>
      ) : (
        <div className="flex items-center flex-shrink-0">
          {logoIcon}
          {logoText}
        </div>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="Comicraft home"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-lg"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
