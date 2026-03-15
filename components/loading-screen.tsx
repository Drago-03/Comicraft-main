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

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-32 h-32',
      icon: 'w-6 h-6',
      text: 'text-sm',
      dot: 'w-2 h-2',
    },
    md: {
      container: 'w-48 h-48',
      icon: 'w-8 h-8',
      text: 'text-base',
      dot: 'w-3 h-3',
    },
    lg: {
      container: 'w-64 h-64',
      icon: 'w-12 h-12',
      text: 'text-lg',
      dot: 'w-4 h-4',
    },
  };

  const currentSize = sizeClasses[size];

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-[#EEDFCA] z-50 flex items-center justify-center overflow-hidden'
    : 'flex items-center justify-center p-8 bg-[#EEDFCA] relative overflow-hidden';

  return (
    <ClientOnly>
      <div className={containerClasses}>
        {/* Halftone dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
        />
        <div className={`relative ${currentSize.container} z-10`}>
          {/* Central loading icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            
            {/* Outer spinning borders */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-15%] rounded-full border-[3px] border-dashed border-black opacity-30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-5%] rounded-full border-[2px] border-dotted border-black opacity-30"
            />

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative rounded-full p-6 flex items-center justify-center bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000]"
            >
              <ComiCraftLogo variant="icon" colorScheme="color" size={80} animate={false} />
            </motion.div>
          </div>

          {/* Loading message */}
          <motion.div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center bg-white border-[2px] border-black shadow-[4px_4px_0_0_#000] px-4 py-1 flex items-center"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <p
              className={`${currentSize.text} font-black italic uppercase tracking-widest text-black whitespace-nowrap`}
            >
              {message}
            </p>
          </motion.div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default LoadingScreen;
