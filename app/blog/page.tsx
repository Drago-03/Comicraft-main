'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';

const blogs = [
  {
    slug: 'blog-1',
    title: 'Comicraft: Building an AI‑Native Storytelling Engine on Blockchain',
    excerpt: 'Most NFT projects treated lore as marketing copy. What if the story was the first-class asset? And what if AI + on-chain rails made it fast to create, fair to share, and transparent to curate?',
    author: 'Mantej Singh',
    date: 'March 2, 2026',
    readTime: '6 min',
    tags: ['AI', 'Web3', 'OpenSource'],
    coverImage: '/blogs/blog-data/Blog 1/blog-logo.png',
  }
];

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-[#EEDFCA] relative font-sans pb-24">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />
      <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        
        <header className="mb-16 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-[0.3em] text-[#cc3333] border-2 border-[#cc3333] bg-white" style={{ boxShadow: '3px 3px 0px 0px #000' }}>
            Developer Blog
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black mb-4" style={{ WebkitTextStroke: '1.5px black', textShadow: '5px 5px 0 #cc3333' }}>
            The Dev Blog
          </h1>
          <p className="text-base font-bold text-black/60 max-w-2xl mx-auto uppercase tracking-wide">
            Deep dives into the engineering, vision, and ecosystem behind Comicraft.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`} className="block h-full group">
                <div className="flex flex-col h-full bg-white border-[3px] border-black overflow-hidden shadow-[6px_6px_0_0_#000] group-hover:shadow-[10px_10px_0_0_#000] group-hover:-translate-y-1 transition-all duration-300">
                  
                  {/* Card Image Area */}
                  <div className="relative h-48 w-full bg-black overflow-hidden flex items-center justify-center border-b-[3px] border-black">
                    {blog.coverImage ? (
                      <Image 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-black" />
                        <BookOpen className="w-16 h-16 text-white/30 z-10 group-hover:scale-110 transition-transform duration-500" />
                      </>
                    )}
                    
                    {/* Tags overlay */}
                    <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                      {blog.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-[#cc3333] border-2 border-black text-[10px] font-black text-white uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6 flex flex-col flex-grow bg-white">
                    <div className="flex items-center gap-2 text-[10px] text-black/50 font-black mb-3 uppercase tracking-widest">
                      <span>{blog.date}</span>
                      <span className="w-1 h-1 bg-black/30 rounded-full" />
                      <span>{blog.readTime} read</span>
                    </div>
                    
                    <h2 className="text-xl font-black uppercase italic text-black group-hover:text-[#cc3333] transition-colors mb-3 line-clamp-2 leading-tight tracking-tight">
                      {blog.title}
                    </h2>
                    
                    <p className="text-black/60 font-bold text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t-[3px] border-black">
                      <div className="text-xs font-black text-black uppercase tracking-wider">
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1 text-[#cc3333] text-xs font-black group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                        Read <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
