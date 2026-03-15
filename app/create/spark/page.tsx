'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, ArrowRight, BookOpen, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const genres = [
  'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller',
  'Horror', 'Adventure', 'Comedy', 'Drama', 'Historical',
];

const moods = [
  { id: 'epic', label: '⚔️ Epic', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'dark', label: '🌑 Dark', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { id: 'whimsical', label: '✨ Whimsical', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300' },
  { id: 'tense', label: '🔥 Tense', color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  { id: 'hopeful', label: '🌅 Hopeful', color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  { id: 'mysterious', label: '🔮 Mysterious', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
];

export default function ShaktiSparkPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Fantasy');
  const [selectedMood, setSelectedMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSpark = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt', description: 'Give Shakti Spark an idea to work with.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const response = await fetch(`${apiUrl}/api/groq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt: prompt.trim(),
          genre: selectedGenre.toLowerCase(),
          mood: selectedMood || undefined,
          format: 'short',
          maxTokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed (${response.status})`);
      }

      const data = await response.json();
      setGeneratedContent(data.story || data.content || data.result || 'Story generated successfully.');
      toast({ title: '⚡ Sparked!', description: 'Your idea seed is ready.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      toast({ title: 'Spark failed', description: message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedGenre, selectedMood, toast]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!', description: 'Idea copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }, [generatedContent, toast]);

  const handleSaveDraft = useCallback(() => {
    try {
      const draft = {
        title: `Spark — ${selectedGenre}`,
        content: generatedContent,
        genre: selectedGenre,
        mood: selectedMood,
        prompt,
        source: 'shakti-spark',
        savedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('sparkDrafts') || '[]');
      existing.unshift(draft);
      localStorage.setItem('sparkDrafts', JSON.stringify(existing.slice(0, 20)));
      toast({ title: 'Saved!', description: 'Draft saved locally.' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  }, [generatedContent, selectedGenre, selectedMood, prompt, toast]);

  const handleOpenInVedaScript = useCallback(() => {
    localStorage.setItem('vedascript_import', JSON.stringify({
      content: generatedContent,
      genre: selectedGenre,
      prompt,
    }));
    router.push('/create/ai-story');
  }, [generatedContent, selectedGenre, prompt, router]);

  return (
    <div className="min-h-screen bg-[#EEDFCA] relative text-black font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-10 relative z-10"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <h1 className="text-3xl font-black text-black uppercase tracking-tight">
                  Shakti Spark
                </h1>
              </div>
              <p className="text-black/70 font-bold">Instant ideas and short story sparks.</p>
            </motion.div>
            <Link href="/create">
              <button className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-black opacity-20 backdrop-blur-sm text-black/80 font-bold hover:text-black hover:bg-white/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Forge
              </button>
            </Link>
          </div>

          {/* Main Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-0 p-6 mb-5"
          >
            {/* Prompt */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-black/90 font-bold mb-2">
                Your idea seed
              </label>
              <Textarea
                placeholder="A young alchemist discovers that the city's water supply is turning people into glass sculptures..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-white/5 border-black opacity-20 text-black placeholder:text-black/25 rounded-xl resize-none focus:border-amber-500/40 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Genre Pills */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-black/90 font-bold mb-2">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`
                      px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                      border
                      ${selectedGenre === genre
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                        : 'bg-white/5 border-black opacity-20 text-black/70 font-bold hover:text-black/90 font-bold hover:bg-white/10'
                      }
                    `}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black/90 font-bold mb-2">
                Mood <span className="text-black/30 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(selectedMood === mood.id ? '' : mood.id)}
                    className={`
                      px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                      border
                      ${selectedMood === mood.id ? mood.color : 'bg-white/5 border-black opacity-20 text-black/70 font-bold hover:text-black/90 font-bold hover:bg-white/10'}
                    `}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spark Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSpark}
              disabled={isGenerating || !prompt.trim()}
              className={`
                w-full py-3.5 rounded-xl font-bold text-base
                bg-gradient-to-r from-amber-500 to-orange-600
                hover:from-amber-400 hover:to-orange-500
                text-black shadow-lg shadow-amber-500/20
                border border-amber-400/20
                flex items-center justify-center gap-2
                transition-all duration-300
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                active:shadow-inner
              `}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Sparking your idea…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Spark it
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Generated Output */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-0 overflow-hidden"
              >
                {/* Output Header */}
                <div className="px-6 py-4 border-b border-black flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-black font-bold uppercase text-base text-sm">Generated Spark</span>
                  </div>
                  <span className="text-xs text-black/30">
                    {generatedContent.split(/\s+/).length} words
                  </span>
                </div>

                {/* Output Content */}
                <div className="p-6">
                  <div className="prose  prose-sm max-w-none text-black/90 font-bold leading-relaxed whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>

                {/* Output Actions */}
                <div className="px-6 py-4 border-t border-black flex flex-wrap gap-3">
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-black opacity-20 text-black/80 font-bold hover:text-black hover:bg-white/10 rounded-lg"
                  >
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={handleOpenInVedaScript}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg"
                  >
                    <ArrowRight className="w-4 h-4 mr-1.5" />
                    Open in VedaScript Engine
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-black opacity-20 text-black/80 font-bold hover:text-black hover:bg-white/10 rounded-lg"
                  >
                    {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {copied ? 'Copied' : 'Copy idea'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
