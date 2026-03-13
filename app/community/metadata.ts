import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | Comicraft',
  description:
    'Join the Comicraft community - share stories, connect with other writers and readers, and explore AI-powered storytelling',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://comicraft.com'),
};
