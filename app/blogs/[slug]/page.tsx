import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogPostContent from './BlogPostContent';

export function generateStaticParams() {
  return [
    { slug: 'why-comicraft-is-the-only-true-creativity-tokenization-platform' },
    { slug: 'the-creator-economy-is-broken-heres-how-comicraft-fixes-it' },
    { slug: 'from-static-jpegs-to-living-art-how-dynamic-nfts-change-everything' },
  ];
}

const POSTS: Record<string, { title: string; date: string; readTime: string }> = {
  'why-comicraft-is-the-only-true-creativity-tokenization-platform': {
    title: 'Why Comicraft Is the Only True Creativity Tokenization Platform',
    date: 'March 15, 2026',
    readTime: '8 min read',
  },
  'the-creator-economy-is-broken-heres-how-comicraft-fixes-it': {
    title: 'The Creator Economy Is Broken — Here\'s How Comicraft Fixes It',
    date: 'March 15, 2026',
    readTime: '10 min read',
  },
  'from-static-jpegs-to-living-art-how-dynamic-nfts-change-everything': {
    title: 'From Static JPEGs to Living Art: How Dynamic NFTs Change Everything',
    date: 'March 15, 2026',
    readTime: '7 min read',
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light font-display">
        <div className="text-center">
          <div className="text-8xl font-black mb-4">404</div>
          <p className="text-ink/60">Post not found.</p>
          <Link href="/blogs" className="mt-4 inline-block text-comic-primary font-black uppercase hover:underline">← Back to Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light font-display text-ink">
      {/* Header */}
      <div className="bg-ink text-background-light py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-background-light/40 hover:text-background-light text-sm font-bold uppercase mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> The Dispatch
          </Link>
          <h1 className="text-3xl md:text-4xl font-black italic leading-tight mb-4">{post.title}</h1>
          <div className="flex gap-4 text-xs text-background-light/40 font-bold uppercase">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
            <span>·</span>
            <span>Comicraft Team</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <style dangerouslySetInnerHTML={{ __html: `
            .prose h2 { font-size: 1.75rem; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: -0.02em; margin-top: 2.5rem; margin-bottom: 0.75rem; border-left: 4px solid #bf3a2b; padding-left: 0.75rem; }
            .prose h3 { font-size: 1.25rem; font-weight: 900; text-transform: uppercase; margin-top: 2rem; margin-bottom: 0.5rem; }
            .prose p { margin-bottom: 1.25rem; line-height: 1.8; color: rgba(26,16,15,0.8); }
            .prose ul { padding-left: 1.25rem; margin-bottom: 1.25rem; }
            .prose ul li { margin-bottom: 0.5rem; line-height: 1.7; color: rgba(26,16,15,0.8); }
            .prose strong { font-weight: 900; color: #1a100f; }
          ` }} />
          <BlogPostContent slug={slug} />
        </div>
      </article>

      {/* CTA */}
      <div className="py-12 px-6 bg-ink text-background-light">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black uppercase italic">Ready to build on Comicraft?</h3>
            <p className="text-background-light/50 text-sm mt-1">Join the creative economy.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/create" className="bg-comic-primary text-white px-6 py-3 font-black uppercase text-sm border-2 border-background-light hover:opacity-90 transition-opacity">
              Start Creating
            </Link>
            <Link href="/blogs" className="border-2 border-background-light/30 text-background-light/60 px-6 py-3 font-black uppercase text-sm hover:border-background-light hover:text-background-light transition-all">
              More Posts
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
