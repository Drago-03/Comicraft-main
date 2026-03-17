'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Save, CheckCircle, Volume2, ShieldCheck, Tag as TagIcon, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StoryPreviewPage({ params }: { params: { storyId: string } }) {
  const router = useRouter();
  const { storyId } = params;

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [contentRating, setContentRating] = useState('teen');
  const [language, setLanguage] = useState('en');

  // TTS State
  const [ttsPlaying, setTtsPlaying] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const res = await fetch(`${baseUrl}/api/v1/stories/${storyId}`);
      if (!res.ok) throw new Error('Failed to load story');
      const data = await res.json();
      setStory(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setGenres(data.tags || data.genres || []);
    } catch (err: any) {
      toast.error(err.message || 'Error loading story');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!genres.includes(newTag.trim().toLowerCase())) {
        setGenres([...genres, newTag.trim().toLowerCase()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setGenres(genres.filter((g) => g !== tag));
  };

  const toggleTts = () => {
    // Simulated TTS toggle since endpoint might be missing
    setTtsPlaying(!ttsPlaying);
    if (!ttsPlaying) {
      toast('TTS Preview coming soon', { description: 'Audio player is initializing...' });
      setTimeout(() => setTtsPlaying(false), 3000);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${baseUrl}/api/v1/stories/${storyId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          tags: genres,
          content_rating: contentRating,
          language: language,
          tts_enabled: false,
          metadata: {
            synopsis: description,
            cover_image_url: story?.cover_image
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit');
      }

      toast.success('Submitted successfully', {
        description: 'Your story has been sent for KAVACH review.',
      });

      // Redirect to profile dashboard submission tracker
      router.push('/profile?tab=submissions');

    } catch (err: any) {
      toast.error(err.message || 'Error submitting story');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <h2 className="text-2xl font-bold mb-4">Story Not Found</h2>
        <p>Could not load the generated story preview.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: Editor & Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="text-green-500 w-6 h-6" />
              Finalize Your Story
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Story Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Synopsis / Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Content Rating</label>
                  <select
                    value={contentRating}
                    onChange={(e) => setContentRating(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="all_ages">All Ages (E)</option>
                    <option value="teen">Teen (T)</option>
                    <option value="mature">Mature (M)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Tags (Press Enter to add)</label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                  <TagIcon className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="sci-fi, cyberpunk, etc..."
                    className="bg-transparent text-white outline-none w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {genres.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-white">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                Protected by KAVACH IP Scan
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || story?.status !== 'draft'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {story?.status !== 'draft' ? 'Already Submitted' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Preview & TTS */}
        <div className="flex-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            {/* Visual Header */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/30 to-transparent pointer-events-none" />
            
            <h2 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center justify-between">
              Content Preview
              <button 
                onClick={toggleTts}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${ttsPlaying ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
              >
                {ttsPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {ttsPlaying ? 'Playing TTS...' : 'Listen to Preview'}
              </button>
            </h2>

            {/* Content Box */}
            <div className="prose prose-invert max-w-none text-neutral-300 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {story?.cover_image && (
                <img 
                  src={story.cover_image} 
                  alt="Cover" 
                  className="w-full max-h-64 object-cover rounded-lg mb-6 shadow-md border border-neutral-800"
                />
              )}
              
              <h1 className="text-3xl font-bold text-white mb-2">{title || story?.title}</h1>
              <div className="mb-6 flex gap-2 text-xs">
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400">{story?.format_type || 'Story'}</span>
                <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400">{story?.author_name || 'Anonymous'}</span>
              </div>
              
              <div 
                className="whitespace-pre-wrap leading-relaxed opacity-90"
                dangerouslySetInnerHTML={{ __html: story?.content }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
