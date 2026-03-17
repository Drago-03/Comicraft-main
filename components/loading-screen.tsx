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

const authorQuotes = [
  '“The world is shaped by the stories we tell.” – Neil Gaiman',
  '“There is no greater agony than bearing an untold story inside you.” – Maya Angelou',
  '“Stories are light. Light is precious in a world so dark.” – Kate DiCamillo',
  '“After nourishment, shelter and companionship, stories are the thing we need most in the world.” – Philip Pullman',
  '“A story is a window, a door, a bridge.” – Salman Rushdie',
  '“We are all made of stories.” – Michael Ende',
  '“To survive, you must tell stories.” – Umberto Eco',
  '“The universe is made of stories, not atoms.” – Muriel Rukeyser',
  '“Stories are the wildest things of all.” – Patrick Ness',
  '“A good story is always more impressive than a sword.” – Tahir Shah',  '"In a world where you can be anything, be a storyteller." – Unknown',
  '"Words are the most powerful tool we have." – J.K. Rowling',
  '"Every story has power." – Rick Riordan',
  '"The art of storytelling is the oldest art." – Mortimer J. Adler',
  '"A reader lives a thousand lives before he dies." – George R.R. Martin',
  '"We are the stories we tell ourselves." – Joan Didion',
  '"Stories have always been used to help us understand the world." – Chimamanda Ngozi Adichie',
  '"The story so far: In the beginning, the Universe was created." – Douglas Adams',
  '"Every person is a story waiting to be told." – Mary Kay Ash',
  '"There is no greater magic than a well-told tale." – Terry Pratchett',
  '"Stories are the creative conversion of life itself into a more powerful, clearer, more meaningful experience." – Robert McKee',
  '"Once upon a time, there was a story to be told." – Anonymous',
  '"In every concealed place and in every human heart, there is a story." – Arundhati Roy',
  '"The power of a story is not in the telling, but in the listening." – Caroline Leavitt',
  '"Every culture speaks in metaphors and stories. That is how our minds work." – Gloria Steinem',
  '"Your story matters. It changes the world." – Unknown',
  '"Stories are the most fundamental way we make sense of experience." – Joan Didion',
  '"The best stories are the ones we tell ourselves." – Anonymous',
  '"A story is the shortest distance between two people." – Unknown',
  '"The story is the transformation of reality into truth." – Eudora Welty',
  '"Everyone has a chapter they don\'t read out loud." – Unknown',
  '"Stories breathe life into reason." – Michael Ende',
  '"The power to imagine is the most divine gift." – Paulo Coelho',
  '"Life is the sum of all the stories we hear and believe." – William Durrell',
  '"A story is something that has been enjoyed by countless readers." – Anonymous',
  '"Stories are contagious. They spread like wildfire." – Tom Peters',
  '"The best part of all is when the story continues in your heart." – Pam Brown',
  '"We are all trapped in the bubble of our own story." – Anaïs Nin',
  '"A well-told story is a magnet for truth." – Cormac McCarthy',
  '"Every story begins in darkness and ends in dawn." – Unknown',];

function getRandomQuote() {
  return authorQuotes[Math.floor(Math.random() * authorQuotes.length)];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ size = 'md' }) => {
  // Make logo much larger for loading
  const logoSize = size === 'lg' ? 220 : sizeMap[size];
  const quote = getRandomQuote();

  return (
    <ClientOnly>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ComiCraftLogo variant="icon" colorScheme="color" size={logoSize} animate={false} />
        </motion.div>
        <div className="mt-10 text-center text-lg font-serif text-white/70 max-w-xl">
          {quote}
        </div>
      </div>
    </ClientOnly>
  );
};

export default LoadingScreen;
