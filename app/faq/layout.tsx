import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'FAQ | Comicraft',
  description:
    'Frequently asked questions about Comicraft - Learn about story creation, NFTs, wallet setup, and more',
  openGraph: {
    title: 'FAQ | Comicraft',
    description:
      'Find answers to common questions about Comicraft, from getting started to advanced features',
    type: 'website',
    images: [
      {
        url: '/og-faq.jpg', // You can add your own Open Graph image
        width: 1200,
        height: 630,
        alt: 'Comicraft FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Comicraft',
    description:
      'Find answers to common questions about Comicraft, from getting started to advanced features',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://comicraft.com'),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
