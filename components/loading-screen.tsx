'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { ClientOnly } from '@/components/client-only';
import { ComiCraftLogo } from '@/components/comicraft-logo';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<'sm' | 'md' | 'lg', number> = { sm: 48, md: 80, lg: 110 };

const LoadingScreen: React.FC<LoadingScreenProps> = ({ size = 'md' }) => {
  const logoSize = sizeMap[size];

  return (
    <ClientOnly>
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ComiCraftLogo variant="icon" colorScheme="color" size={logoSize} animate={false} />
        </motion.div>
      </div>
    </ClientOnly>
  );
};

export default LoadingScreen;
