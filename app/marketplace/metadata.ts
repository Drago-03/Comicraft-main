import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Marketplace | Comicraft',
  description:
    'Comicraft NFT Marketplace - Buy, sell, and trade unique story NFTs created by our community of storytellers.',
  keywords: [
    'NFT marketplace',
    'story NFTs',
    'Comicraft',
    'digital collectibles',
    'blockchain stories',
    'Web3 stories',
    'buy NFT',
    'sell NFT',
    'unique stories',
    'digital ownership',
  ],
  openGraph: {
    title: 'NFT Marketplace | Comicraft',
    description:
      'Comicraft NFT Marketplace - Buy, sell, and trade unique story NFTs.',
    url: 'https://comicraft.com/nft-marketplace',
    type: 'website',
    images: [
      {
        url: '/images/og-nft-marketplace.jpg',
        width: 1200,
        height: 630,
        alt: 'Comicraft NFT Marketplace',
      },
    ],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://comicraft.com'),
};
