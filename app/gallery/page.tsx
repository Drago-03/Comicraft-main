'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Book, Layers, ShieldCheck, Hexagon, ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface GalleryPost {
  id: string; 
  author: { id: string; name: string; avatar: string; verified?: boolean; level: number; };
  content: string; 
  title: string; 
  genre: string[]; 
  timestamp: Date;
  likes: number; 
  userVote?: 'up' | 'down' | null;
  file_url?: string;
  is_verified: boolean;
  format_type: string;
  cover_image?: string;
}

function GalleryCard({ post, onVote }: { post: GalleryPost; onVote: (id: string, v: 'up' | 'down' | null) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative break-inside-avoid mb-6">
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] hover:-translate-y-1 transition-all h-full flex flex-col relative p-4">
        
        {/* Cover Image */}
        <Link href={`/stories/${post.id}`} className="w-full aspect-[4/3] bg-gray-200 border-[3px] border-black relative overflow-hidden group-hover:opacity-90 transition-opacity block mb-4">
           {post.cover_image ? (
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500" />
           ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-6 text-center">
                <div className="border border-dashed border-gray-400 w-full h-full flex flex-col items-center justify-center p-4">
                  <Hexagon className="w-8 h-8 mb-2" />
                  <span className="font-bold uppercase text-[10px] tracking-widest text-gray-400">No Image</span>
                </div>
              </div>
           )}
           {/* halftone noise overlay on images */}
           <div className="absolute inset-0 opacity-[0.2] mix-blend-multiply pointer-events-none z-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '5px 5px' }}></div>
           
           <div className="absolute top-2 left-2 z-20">
               {post.is_verified && (
                 <Badge className="bg-[#cc3333] text-white border-[2px] border-black rounded-none capitalize font-black tracking-widest text-[9px] px-2 py-0.5 shadow-[2px_2px_0_0_#000] inline-flex items-center gap-1">
                   <ShieldCheck className="w-3 h-3" /> AI Verified
                 </Badge>
               )}
           </div>
        </Link>

        <Link href={`/stories/${post.id}`} className="block flex-grow px-1">
          <h3 className="text-xl md:text-2xl font-black italic uppercase leading-[1.05] tracking-tighter mb-4 text-black group-hover:text-[#cc3333] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3 items-center">
              <Avatar className="h-10 w-10 border-2 border-black rounded-none shadow-[2px_2px_0_0_#000]">
                <AvatarImage src={post.author.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${post.author.name}`} />
                <AvatarFallback className="bg-gray-200 text-black font-black">{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-black italic text-black text-sm uppercase leading-tight line-clamp-1">{post.author.name}</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{Math.floor((Date.now() - post.timestamp.getTime()) / 3600000)}h ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
             {post.format_type === 'Comic Book' ? (
                <Badge className="bg-white text-black border-2 border-black rounded-none flex items-center gap-1 shadow-[2px_2px_0_0_#000] font-bold text-[10px] uppercase tracking-wider"><Layers className="w-3 h-3"/> Comic</Badge>
             ) : (
                <Badge className="bg-[#cc3333] text-white border-2 border-black rounded-none flex items-center gap-1 shadow-[2px_2px_0_0_#000] font-bold text-[10px] uppercase tracking-wider"><Book className="w-3 h-3"/> Storybook</Badge>
             )}
             {post.genre?.map(g => <Badge key={g} className="bg-white text-gray-600 border border-black rounded-none font-bold text-[9px] uppercase tracking-wider hover:bg-gray-100">{g}</Badge>)}
          </div>

          <p className="text-black/70 font-semibold leading-snug text-sm mb-4 line-clamp-3">
            "{post.content}"
          </p>
        </Link>

        <div className="flex items-center justify-between px-1 pt-2 border-t-[3px] border-black mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(post.id, post.userVote === 'up' ? null : 'up'); }}
              className={`p-1.5 border-[2px] transition-all ${post.userVote === 'up' ? 'border-black bg-[#cc3333] text-white shadow-[2px_2px_0_0_#000]' : 'border-transparent text-gray-400 hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-[0px_0px_0_0_#000]'}`}
            >
              <ChevronUp className="w-4 h-4 font-black" />
            </button>
            <span className={`text-sm font-black italic min-w-[2ch] text-center ${post.userVote === 'up' ? 'text-[#cc3333]' : post.userVote === 'down' ? 'text-blue-600' : 'text-black'}`}>{post.likes}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(post.id, post.userVote === 'down' ? null : 'down'); }}
              className={`p-1.5 border-[2px] transition-all ${post.userVote === 'down' ? 'border-black bg-blue-600 text-white shadow-[2px_2px_0_0_#000]' : 'border-transparent text-gray-400 hover:text-black hover:border-black hover:shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-[0px_0px_0_0_#000]'}`}
            >
              <ChevronDown className="w-4 h-4 font-black" />
            </button>
          </div>
          {post.file_url ? (
             <Button
               variant="outline"
               size="sm"
               className="rounded-none border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-wider shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none"
               onClick={() => {
                 const w = window.open(post.file_url, '_blank', 'noopener,noreferrer');
                 if (w) w.opener = null;
               }}
             >
                Read <ChevronRight className="w-3 h-3 ml-1" />
             </Button>
          ) : (
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[100px]">Text Only</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Storybook' | 'Comic Book'>('all');
  const { toast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com'}/api/v1/stories?limit=40`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(json => {
        const data = json.data || [];
        // Show all stories including minted ones
        const galleryItems = data;
        
        const mapped = galleryItems.map((story: any, i: number) => ({
          id: story.id || story._id || `feed-item-${i}`,
          author: {
            id: story.author_id || story.author?.id || `user-${i}`,
            name: story.author_name || story.authorName || story.author?.name || 'Community Member',
            avatar: story.author_avatar || '',
            level: 1,
            verified: false,
          },
          content: story.description || story.content || `Check out this latest community addition: ${story.title || 'Untitled'}`,
          title: story.title || 'Unknown Narrative',
          genre: Array.isArray(story.genre) ? story.genre : (story.genre ? [story.genre] : ['General']),
          timestamp: new Date(story.created_at || story.createdAt || Date.now()),
          likes: story.likes || story.likesCount || 0,
          is_verified: story.is_verified || false,
          format_type: story.format_type || 'Storybook',
          cover_image: story.cover_image || story.coverImageUrl || null,
          file_url: story.file_url || null,
        }));
        setPosts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gallery:', err);
        setLoading(false);
        toast({ title: 'Error loading gallery', description: err.message, variant: 'destructive' });
      });
  }, []);

  const handleVote = (id: string, vote: 'up' | 'down' | null) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        let nL = p.likes;
        if (p.userVote === 'up' && vote !== 'up') nL--;
        if (p.userVote !== 'up' && vote === 'up') nL++;
        return { ...p, userVote: vote, likes: nL };
      }
      return p;
    }));
  };

  const filtered = posts.filter(p => filter === 'all' || p.format_type === filter);

  return (
    <div className="w-screen min-h-screen relative left-1/2 -ml-[50vw] text-black font-sans z-0 pb-16">
      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border-[2px] border-black bg-white shadow-[3px_3px_0_0_#000] text-xs font-black tracking-wider text-black uppercase mb-4">
            <Hexagon className="w-3 h-3 text-[#cc3333]" /> NEURAL GALLERY
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase mb-4 text-black" style={{ WebkitTextStroke: '1.5px black' }}>
            Creative Archive
          </h1>
          <p className="text-black/70 font-bold uppercase tracking-[0.05em] text-sm md:text-base max-w-2xl">
            Explore masterpieces minted and uploaded by the community. Validated and synthesized by our Synoptic AI framework.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-fit mb-8 mx-auto md:mx-0">
          {(['all', 'Storybook', 'Comic Book'] as const).map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 border-[2px] border-black text-sm font-black uppercase tracking-wider transition-all shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-1 active:shadow-none ${filter === f ? 'bg-[#cc3333] text-white' : 'bg-white text-black'}`}
            >
              {f === 'all' ? 'Everything' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
             <div className="flex flex-col items-center gap-6">
                <div className="w-14 h-14 border-[5px] border-black border-t-[#cc3333] rounded-full animate-spin" />
                <p className="text-black font-black italic text-lg uppercase tracking-widest">Synchronizing Network...</p>
             </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] flex flex-col items-center max-w-2xl mx-auto">
            <Layers className="w-16 h-16 text-black/20 mb-4" />
            <h3 className="text-3xl font-black italic uppercase mb-2 text-black">The Archive is Empty</h3>
            <p className="text-black/60 font-bold uppercase tracking-wider text-sm">No verified pieces found matching your criteria. Be the first to upload.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            <AnimatePresence>
              {filtered.map(p => <GalleryCard key={p.id} post={p} onVote={handleVote} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
