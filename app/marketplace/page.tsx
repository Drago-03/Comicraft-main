'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, FileText, Upload, Loader2, Heart, Headphones, Eye,
  Pause, ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';

interface StoryWithAudio {
  id: string;
  title: string;
  content?: string;
  genre?: string;
  author_name?: string;
  views?: number;
  likes?: number;
  is_minted?: boolean;
  file_url?: string;
  format_type?: string;
  cover_image?: string;
  created_at?: string;
  hasAudio?: boolean;
  audioUrl?: string | null;
}

// ── Mini audio preview player ──────────────────────────────────────────────────
function MiniAudioPreview({ story }: { story: StoryWithAudio }) {
  const [audioUrl] = useState<string | null>(story.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!audioUrl) return;

    const audio = audioRef.current || new Audio(audioUrl);
    audioRef.current = audio;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  return (
    <button
      onClick={handleToggle}
      title={audioUrl ? (isPlaying ? 'Pause audio' : 'Play audio excerpt') : 'Open story to generate audio'}
      className={`w-8 h-8 flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0_0_#000] transition-all ${
        audioUrl
          ? 'bg-[#cc3333] text-white hover:bg-black active:translate-y-0.5 active:shadow-none'
          : 'bg-black/10 text-black/30 cursor-default border-black/20'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-3 h-3" />
      ) : (
        <Headphones className="w-3 h-3" />
      )}
    </button>
  );
}

export default function MarketplacePage() {
  const [stories, setStories] = useState<StoryWithAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMarketplaceItems() {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, content, genre, author_name, views, likes, is_minted, file_url, format_type, cover_image, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const storyIds = data.map((s: any) => s.id);
        let audioMap: Record<string, string> = {};

        if (storyIds.length > 0) {
          const { data: audioRows } = await supabase
            .from('story_audio')
            .select('story_id, audio_url')
            .in('story_id', storyIds)
            .eq('chapter_index', 0);

          if (audioRows) {
            audioRows.forEach((r: any) => { audioMap[r.story_id] = r.audio_url; });
          }
        }

        setStories(
          data.map((s: any) => ({
            ...s,
            hasAudio: !!audioMap[s.id],
            audioUrl: audioMap[s.id] || null,
          }))
        );
      }
      setLoading(false);
    }
    fetchMarketplaceItems();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#EEDFCA] relative font-sans overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />
      <div className="container mx-auto px-4 pt-0 pb-8 relative z-10 pt-28">

      {/* ── Page Header ── */}
      <div className="flex justify-between items-center mb-10 pt-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black bg-[#cc3333] shadow-[3px_3px_0_0_#000] text-[10px] font-black text-white uppercase tracking-widest mb-3">
            <ShoppingBag className="w-3.5 h-3.5" /> Bazaar
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black" style={{ WebkitTextStroke: '1px black' }}>
            Marketplace
          </h1>
          <p className="text-sm font-bold text-black/60 mt-1 uppercase tracking-wide">Discover, Read &amp; Trade Digital Stories</p>
        </div>
        <Link href="/upload">
          <Button className="bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-0.5 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all flex items-center gap-2 px-5 py-5">
            <Upload className="h-4 w-4" />
            Upload Story
          </Button>
        </Link>
      </div>

      {/* ── Category cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {/* Comic Stories */}
        <div className="bg-[#6c3fc5] border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all p-8 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '6px 6px' }}></div>
          <div className="w-12 h-12 bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center mb-4 relative z-10">
            <BookOpen className="h-6 w-6 text-[#6c3fc5]" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-white mb-2 relative z-10" style={{ WebkitTextStroke: '0.5px black' }}>Comic Stories</h2>
          <p className="text-white/80 font-bold text-sm flex-grow relative z-10">
            Explore visual storytelling through comic NFTs with stunning artwork and engaging narratives.
          </p>
        </div>

        {/* Text Stories */}
        <div className="bg-[#d97706] border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all p-8 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '6px 6px' }}></div>
          <div className="w-12 h-12 bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center mb-4 relative z-10">
            <FileText className="h-6 w-6 text-[#d97706]" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-white mb-2 relative z-10" style={{ WebkitTextStroke: '0.5px black' }}>Text Stories</h2>
          <p className="text-white/80 font-bold text-sm flex-grow relative z-10">
            Discover written treasures from talented authors across genres in our text-based collection.
          </p>
        </div>
      </motion.div>

      {/* ── Story Cards ── */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-[#cc3333]"></div>
          <h2 className="text-2xl font-black uppercase text-black tracking-tight">Latest Community Additions</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-[4px] border-black border-t-[#cc3333] rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center p-12 border-[3px] border-dashed border-black bg-white shadow-[4px_4px_0_0_#000]">
            <p className="font-black uppercase text-black/50">No stories found in the marketplace yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <div className="group overflow-hidden border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 bg-white transition-all duration-300 flex flex-col">
                  {/* Cover image */}
                  <div className="relative h-48 bg-[#EEDFCA] flex flex-col items-center justify-center overflow-hidden border-b-[3px] border-black">
                    {/* NFT badge */}
                    {story.is_minted && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-black text-white text-[10px] px-2 py-0.5 font-black uppercase border-[2px] border-black">
                          NFT
                        </span>
                      </div>
                    )}

                    {/* Audio badge */}
                    {story.hasAudio && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="flex items-center gap-1 bg-[#cc3333] text-white text-[10px] px-2 py-0.5 font-black uppercase border-[2px] border-black">
                          <Headphones className="w-2.5 h-2.5" /> Audio
                        </span>
                      </div>
                    )}

                    {story.cover_image || story.file_url ? (
                      <Image
                        src={story.cover_image || story.file_url || ''}
                        alt={story.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="text-black/20 group-hover:text-[#cc3333]/50 transition-colors">
                        {story.format_type === 'Storybook' ? (
                          <BookOpen className="w-12 h-12" />
                        ) : (
                          <FileText className="w-12 h-12" />
                        )}
                      </div>
                    )}

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <h3 className="font-black text-sm text-white uppercase line-clamp-1">{story.title}</h3>
                      <p className="text-xs text-white/60 font-bold">by {story.author_name || 'Anonymous'}</p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-black/60 gap-3 mb-3 font-bold">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[#cc3333]" /> {story.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {story.views ?? 0}
                      </span>
                      {story.genre && (
                        <span className="bg-[#EEDFCA] text-black px-2 py-0.5 border-[2px] border-black text-[10px] font-black uppercase ml-auto shadow-[1px_1px_0_0_#000]">
                          {story.genre}
                        </span>
                      )}
                    </div>

                    {/* Audio player */}
                    {story.hasAudio && (
                      <div className="flex items-center gap-2 mt-1 mb-3">
                        <MiniAudioPreview story={story} />
                        <span className="text-[11px] font-bold text-black/50 uppercase tracking-wide">Audio available</span>
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all"
                        onClick={() => { window.location.href = `/stories/${story.id}`; }}
                      >
                        Read &amp; Listen <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
