import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Creators | Comicraft',
  description:
    'Discover the most talented storytellers on Comicraft - explore their profiles, read their stories, and follow your favorites',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://comicraft.com'),
};
