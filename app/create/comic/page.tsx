'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  X,
  Image as ImageIcon,
  User,
  Users,
  Layers,
  Grid3X3,
  Film,
  Maximize2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Check,
  Palette,
  Type,
  Settings2,
  LayoutDashboard,
  Eye,
  Zap,
  Star,
  AlertCircle,
  Smile,
  BookOpenCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { generateComicFromSketches } from '@/lib/api-client';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface CharacterSketch {
  id: string;
  name: string;
  description: string;
  file: File | null;
  previewUrl: string | null;
}

interface GeneratedPanel {
  panelIndex: number;
  pageNumber: number;
  panelNumber: number;
  imageUrl: string | null;
  caption: string;
  dialogue: string;
  characters: string[];
  cameraDirection: string;
  beat: string;
}

interface GenerationResult {
  comicId: string;
  slug: string;
  title: string;
  panels: GeneratedPanel[];
  totalPages: number;
  panelsPerPage: number;
  stylePreset: string;
  summary: string;
}

type GenerationPhase =
  | 'idle'
  | 'analyzing'
  | 'composing'
  | 'rendering'
  | 'finalizing'
  | 'complete'
  | 'error';

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const ART_STYLES = [
  { value: 'manga', label: 'Manga', icon: '🇯🇵' },
  { value: 'western', label: 'Western Comic', icon: '🦸' },
  { value: 'minimalist', label: 'Minimalist', icon: '◻️' },
  { value: 'noir', label: 'Noir', icon: '🌑' },
  { value: 'watercolor', label: 'Watercolor', icon: '🎨' },
  { value: 'pixel-art', label: 'Pixel Art', icon: '👾' },
];

const LAYOUT_STYLES = [
  { value: 'grid', label: 'Classic Grid', icon: Grid3X3, desc: 'Uniform panel grid' },
  { value: 'cinematic', label: 'Cinematic', icon: Film, desc: 'Wide panoramic panels' },
  { value: 'hero-shots', label: 'Hero Shots', icon: Maximize2, desc: 'Full-page hero moments' },
];

const GENRES = [
  'Fantasy', 'Sci-Fi', 'Comedy', 'Drama', 'Horror',
  'Romance', 'Adventure', 'Mystery', 'Action', 'Slice of Life',
];

const BEAT_SLOTS = ['Intro', 'Conflict', 'Climax', 'Resolution'];

const PHASE_MESSAGES: Record<GenerationPhase, string> = {
  idle: '',
  analyzing: 'Analyzing sketches & building character models…',
  composing: 'Composing panel layouts & story beats…',
  rendering: 'Rendering comic panels with AI…',
  finalizing: 'Finalizing captions & dialogue…',
  complete: 'Comic generated successfully!',
  error: 'Generation failed. Please try again.',
};

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

export default function PanelraEnginePage() {
  // ── Character state ──────────────────────────────────────────
  const [hero, setHero] = useState<CharacterSketch>({
    id: 'hero',
    name: '',
    description: '',
    file: null,
    previewUrl: null,
  });

  const [coStars, setCoStars] = useState<CharacterSketch[]>([]);

  // ── Story state ──────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [stylePreset, setStylePreset] = useState('manga');

  // ── Layout state ─────────────────────────────────────────────
  const [totalPages, setTotalPages] = useState(4);
  const [panelsPerPage, setPanelsPerPage] = useState(6);
  const [layoutStyle, setLayoutStyle] = useState('grid');
  const [beats, setBeats] = useState<string[]>(['', '', '', '']);

  // ── UI state ─────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState({
    story: true,
    layout: false,
    beats: false,
    characters: false,
  });
  const [step, setStep] = useState<'basics' | 'characters' | 'layout' | 'review'>('basics');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ── Generation state ─────────────────────────────────────────
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────
  const heroInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ─────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (
      file: File,
      setter: (update: (prev: CharacterSketch) => CharacterSketch) => void
    ) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setter((prev) => ({
          ...prev,
          file,
          previewUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, (fn) => setHero(fn(hero)));
  };

  const addCoStar = () => {
    setCoStars((prev) => [
      ...prev,
      {
        id: `costar-${Date.now()}`,
        name: '',
        description: '',
        file: null,
        previewUrl: null,
      },
    ]);
  };

  const removeCoStar = (id: string) => {
    setCoStars((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCoStar = (id: string, field: keyof CharacterSketch, value: any) => {
    setCoStars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= 2) return prev;
      return [...prev, genre];
    });
  };

  const updateBeat = (index: number, value: string) => {
    setBeats((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  // ── Generate ─────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!title.trim() || !logline.trim()) {
      setError('Please fill in the comic title and logline.');
      return;
    }

    setError(null);
    setResult(null);

    // Simulate phased progress
    const phases: GenerationPhase[] = ['analyzing', 'composing', 'rendering', 'finalizing'];

    for (const p of phases) {
      setPhase(p);
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('logline', logline);
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('stylePreset', stylePreset);
      formData.append(
        'layoutConfig',
        JSON.stringify({ pages: totalPages, panelsPerPage, layoutStyle })
      );
      formData.append('beatOutline', JSON.stringify(beats.filter(Boolean)));
      formData.append('heroName', hero.name);
      formData.append('heroDescription', hero.description);

      if (hero.file) {
        formData.append('heroSketch', hero.file);
      }

      const coStarNames = coStars.map((c) => c.name);
      const coStarDescs = coStars.map((c) => c.description);
      formData.append('coStarNames', JSON.stringify(coStarNames));
      formData.append('coStarDescriptions', JSON.stringify(coStarDescs));

      coStars.forEach((c) => {
        if (c.file) formData.append('coStarSketches', c.file);
      });

      const res = await generateComicFromSketches(formData);

      console.log('[Panelra] Generation response:', { ok: res.ok, status: res.status, data: res.data });

      if (res.ok && (res.data as any)?.success) {
        setResult((res.data as any).data);
        setPhase('complete');
      } else {
        const errorMsg = (res.data as any)?.error
          || (res.data as any)?.message
          || (res.data as any)?.details
          || `Generation failed (HTTP ${res.status || 'unknown'})`;
        console.error('[Panelra] Generation failed:', res.data);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('[Panelra] Error:', err);
      setError(err.message || 'Something went wrong');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setHero({ id: 'hero', name: '', description: '', file: null, previewUrl: null });
    setCoStars([]);
    setTitle('');
    setLogline('');
    setSelectedGenres([]);
    setStylePreset('manga');
    setTotalPages(4);
    setPanelsPerPage(6);
    setLayoutStyle('grid');
    setBeats(['', '', '', '']);
    setPhase('idle');
    setResult(null);
    setError(null);
  };

  const isGenerating = !['idle', 'complete', 'error'].includes(phase);

  // ── Helper: Panel Grid Preview ────────────────────────────────
  const PanelGridPreview = ({ columns, rows }: { columns: number; rows: number }) => {
    const totalPanels = columns * rows;
    return (
      <div className="grid gap-1.5 p-4 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl border-2 border-dashed border-[#C0B591]/20">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '12px' }}>
          {Array.from({ length: totalPanels }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-gradient-to-br from-[#C0B591]/10 to-[#FF4444]/5 border border-[#C0B591]/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-[10px] text-[#C0B591]/60 font-semibold">Panel {i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#EEDFCA] relative text-black font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* ─── PROFESSIONAL HEADER ──────────────────────────────────── */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-white via-[#EEDFCA] to-white border-b-4 border-[#C0B591] shadow-[0_4px_0_0_rgba(192,181,145,0.2)] backdrop-blur-xl px-4 py-4">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/create">
                <button className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 border-2 border-[#C0B591] text-black font-bold hover:bg-white/50 transition-all text-sm">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Forge
                </button>
              </Link>
              <div className="w-px h-8 bg-[#C0B591]/30" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C0B591]/20 to-[#FF4444]/10 flex items-center justify-center border-2 border-[#C0B591]/30">
                  <BookOpenCheck className="w-5 h-5 text-[#C0B591]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Panelra Comic Engine</h1>
                  <p className="text-xs text-black/60 font-medium">Create stunning AI-powered comics</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {title && (
                <span className="text-sm text-black/50 px-3 py-1.5 bg-white/30 rounded-lg border border-[#C0B591]/20 hidden sm:block font-semibold">
                  {title}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-sm border-2 border-[#C0B591]/30 text-black bg-white/30 hover:bg-white/50 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
        <div className="max-w-[1800px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ════════════════════════════════════════════════════
               LEFT SIDEBAR — Configuration (Span 1)
               ════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-5 sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pr-2 pb-10"
            >
              {/* Progress Steps */}
              <Card className="bg-white/20 border-2 border-[#C0B591]/30 backdrop-blur-sm overflow-hidden shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-bold text-[#C0B591] uppercase tracking-wider">Your Journey</div>
                  <div className="space-y-2">
                    {[
                      { id: 'basics', label: 'Story Basics', icon: Type },
                      { id: 'characters', label: 'Your Characters', icon: Users },
                      { id: 'layout', label: 'Comic Layout', icon: LayoutDashboard },
                      { id: 'review', label: 'Review & Generate', icon: Sparkles },
                    ].map((st: any, idx) => {
                      const Icon = st.icon;
                      const isActive = step === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setStep(st.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                            isActive
                              ? 'bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 border-[#C0B591]/50 text-black font-bold'
                              : 'bg-white/10 border-black/10 text-black/60 hover:border-[#C0B591]/30'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#C0B591]' : 'text-black/40'}`} />
                          <span className="text-sm font-semibold">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-[#C0B591]/10 to-[#FF4444]/5 border-2 border-[#C0B591]/20 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-bold text-[#C0B591] uppercase tracking-wider">Comic Stats</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/30 rounded-lg p-2.5 text-center border border-[#C0B591]/20">
                      <div className="text-lg font-bold text-[#C0B591]">{totalPages}</div>
                      <div className="text-[10px] text-black/60 font-semibold">Pages</div>
                    </div>
                    <div className="bg-white/30 rounded-lg p-2.5 text-center border border-[#C0B591]/20">
                      <div className="text-lg font-bold text-[#FF4444]">{totalPages * panelsPerPage}</div>
                      <div className="text-[10px] text-black/60 font-semibold">Total Panels</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Helper Text */}
              <Card className="bg-white/15 border-2 border-[#C0B591]/20 backdrop-blur-sm shadow-lg">
                <CardContent className="p-3">
                  <div className="text-[11px] text-black/70 leading-relaxed">
                    <p className="font-bold text-[#C0B591] mb-1.5">💡 Tip:</p>
                    <p>Create your masterpiece step-by-step. Each section helps Panelra understand your vision better, resulting in comics that truly match your story.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ════════════════════════════════════════════════════
               MAIN CONTENT — Input & Results (Span 2)
               ════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-7 pb-20"
            >

              {/* ─── SECTION 1: STORY BASICS ─── */}
              {(step === 'basics' || step === 'review') && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <Card className="bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#C0B591]/30 backdrop-blur-sm shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 p-5 border-b-2 border-[#C0B591]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center border border-[#C0B591]/30">
                            <Type className="w-5 h-5 text-[#C0B591]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Story Basics</h3>
                            <p className="text-xs text-black/60">Tell us about your comic's foundation</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-5">
                        {/* Title */}
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-[#FF4444]" />
                            Comic Title
                          </Label>
                          <Input
                            placeholder="e.g., 'The Last Shard', 'Neon Dreams', 'Echoes of Tomorrow'"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-base bg-white/40 border-2 border-[#C0B591]/40 placeholder:text-black/40 focus:border-[#C0B591]/70 focus:bg-white/50 font-semibold"
                          />
                          <p className="text-xs text-black/50">Give your comic a memorable title that captures its essence</p>
                        </div>

                        {/* Logline */}
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-[#FF4444]" />
                            Story Premise (Logline)
                          </Label>
                          <Textarea
                            placeholder="Summarize your comic in 2-3 sentences. Example: 'A young detective discovers she can see people's memories, leading her down a dangerous path when she witnesses a crime that could change everything.'"
                            value={logline}
                            onChange={(e) => setLogline(e.target.value)}
                            className="text-sm bg-white/40 border-2 border-[#C0B591]/40 placeholder:text-black/40 focus:border-[#C0B591]/70 focus:bg-white/50 resize-none h-24"
                          />
                          <p className="text-xs text-black/50">This helps Panelra understand your story's core concept and emotional tone</p>
                        </div>

                        {/* Genres */}
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Palette className="w-3.5 h-3.5 text-[#FF4444]" />
                            Select Up to 2 Genres
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {GENRES.map((g) => (
                              <button
                                key={g}
                                onClick={() => toggleGenre(g)}
                                className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                                  selectedGenres.includes(g)
                                    ? 'bg-gradient-to-r from-[#C0B591]/30 to-[#FF4444]/20 border-[#C0B591]/50 text-black shadow-lg'
                                    : 'bg-white/20 border-black/20 text-black/70 hover:border-[#C0B591]/30 hover:bg-white/30'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Art Style */}
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF4444]" />
                            Visual Style
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            {ART_STYLES.map((s) => (
                              <button
                                key={s.value}
                                onClick={() => setStylePreset(s.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                                  stylePreset === s.value
                                    ? 'bg-gradient-to-br from-[#C0B591]/20 to-[#FF4444]/15 border-[#C0B591]/50 text-black font-bold shadow-lg'
                                    : 'bg-white/20 border-black/20 text-black/60 hover:border-[#C0B591]/30 hover:bg-white/30'
                                }`}
                              >
                                <span className="text-2xl">{s.icon}</span>
                                <span className="text-[11px] font-semibold text-center">{s.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ─── SECTION 2: CHARACTER SKETCHES ─── */}
              {(step === 'characters' || step === 'review') && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <Card className="bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#C0B591]/30 backdrop-blur-sm shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 p-5 border-b-2 border-[#C0B591]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center border border-[#C0B591]/30">
                            <Users className="w-5 h-5 text-[#C0B591]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Your Characters</h3>
                            <p className="text-xs text-black/60">(Optional but recommended for consistent visuals)</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        {/* Hero */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b-2 border-[#C0B591]/20">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C0B591]/20 to-[#FF4444]/10 flex items-center justify-center border border-[#C0B591]/30">
                              <Sparkles className="w-4 h-4 text-[#C0B591]" />
                            </div>
                            <h4 className="text-base font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Main Hero</h4>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 space-y-3">
                              <Input
                                placeholder="Hero's name (e.g., 'Aria', 'Marcus')"
                                value={hero.name}
                                onChange={(e) => setHero(prev => ({ ...prev, name: e.target.value }))}
                                className="text-sm bg-white/40 border-2 border-[#C0B591]/40 placeholder:text-black/40 focus:border-[#C0B591]/70 font-semibold"
                              />
                              <Textarea
                                placeholder="Describe your hero (personality, appearance, role)..."
                                value={hero.description}
                                onChange={(e) => setHero(prev => ({ ...prev, description: e.target.value }))}
                                className="text-sm bg-white/40 border-2 border-[#C0B591]/40 placeholder:text-black/40 focus:border-[#C0B591]/70 resize-none h-20"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-black/70">Character Sketch</Label>
                              {hero.previewUrl ? (
                                <div className="relative rounded-lg overflow-hidden border-2 border-[#C0B591]/30 bg-gradient-to-br from-[#C0B591]/10 to-white/5">
                                  <img src={hero.previewUrl} alt="Hero" className="w-full h-32 object-contain" />
                                  <button
                                    onClick={() => setHero(prev => ({ ...prev, file: null, previewUrl: null }))}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#FF4444]/80 hover:bg-[#FF4444] transition-colors"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => heroInputRef.current?.click()}
                                  className="w-full flex flex-col items-center gap-2 py-5 rounded-lg border-2 border-dashed border-[#C0B591]/40 bg-white/20 hover:bg-white/30 hover:border-[#C0B591]/60 transition-all"
                                >
                                  <Upload className="w-5 h-5 text-[#C0B591]/60" />
                                  <span className="text-[11px] text-black/60 font-semibold">Upload Sketch</span>
                                </button>
                              )}
                              <input
                                ref={heroInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleHeroFileChange}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t-2 border-[#C0B591]/20" />

                        {/* Co-Stars */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b-2 border-[#C0B591]/20">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C0B591]/20 to-[#FF4444]/10 flex items-center justify-center border border-[#C0B591]/30">
                                <Users className="w-4 h-4 text-[#C0B591]" />
                              </div>
                              <h4 className="text-base font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Supporting Characters</h4>
                              {coStars.length > 0 && (
                                <Badge className="bg-[#C0B591]/20 text-[#C0B591] border border-[#C0B591]/40 text-xs font-bold">{coStars.length}</Badge>
                              )}
                            </div>
                            <Button
                              onClick={addCoStar}
                              className="bg-gradient-to-r from-[#C0B591]/60 to-[#FF4444]/40 hover:from-[#C0B591]/70 hover:to-[#FF4444]/50 text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all text-sm"
                            >
                              <Plus className="w-4 h-4 mr-1.5" />
                              Add Character
                            </Button>
                          </div>

                          {coStars.length === 0 ? (
                            <div className="py-8 text-center">
                              <Smile className="w-10 h-10 text-[#C0B591]/30 mx-auto mb-2" />
                              <p className="text-sm text-black/50 font-semibold">No supporting characters yet</p>
                              <p className="text-xs text-black/40">Add up to 5 characters to bring your story to life</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {coStars.map((cs) => (
                                <div key={cs.id} className="p-4 rounded-lg bg-white/20 border-2 border-[#C0B591]/20 hover:border-[#C0B591]/40 transition-all hover:shadow-lg">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Input
                                          placeholder="Character name"
                                          value={cs.name}
                                          onChange={(e) => updateCoStar(cs.id, 'name', e.target.value)}
                                          className="text-sm bg-transparent border-0 border-b-2 border-[#C0B591]/30 p-0 text-black font-bold placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-[#C0B591]/60"
                                        />
                                        <button
                                          onClick={() => removeCoStar(cs.id)}
                                          className="p-1 rounded-lg hover:bg-[#FF4444]/20 transition-colors flex-shrink-0"
                                        >
                                          <X className="w-4 h-4 text-[#FF4444]/70" />
                                        </button>
                                      </div>
                                      <Textarea
                                        placeholder="Brief character description..."
                                        value={cs.description}
                                        onChange={(e) => updateCoStar(cs.id, 'description', e.target.value)}
                                        className="text-xs bg-white/20 border border-[#C0B591]/20 placeholder:text-black/30 resize-none h-16"
                                      />
                                    </div>

                                    {/* Sketch Preview */}
                                    {cs.previewUrl ? (
                                      <div className="relative rounded-lg overflow-hidden border-2 border-[#C0B591]/30 bg-gradient-to-br from-[#C0B591]/10 to-white/5 w-20 h-24 flex-shrink-0">
                                        <img src={cs.previewUrl} alt={cs.name} className="w-full h-full object-contain" />
                                        <button
                                          onClick={() => updateCoStar(cs.id, 'previewUrl', null)}
                                          className="absolute top-1 right-1 p-1 rounded-lg bg-[#FF4444]/80 hover:bg-[#FF4444]"
                                        >
                                          <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="flex items-center justify-center w-20 h-24 rounded-lg border-2 border-dashed border-[#C0B591]/30 bg-white/10 hover:bg-white/20 cursor-pointer transition-all">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                updateCoStar(cs.id, 'previewUrl', ev.target?.result as string);
                                                updateCoStar(cs.id, 'file', file);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                        <ImageIcon className="w-5 h-5 text-[#C0B591]/40" />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ─── SECTION 3: LAYOUT CONFIGURATION ─── */}
              {(step === 'layout' || step === 'review') && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <Card className="bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#C0B591]/30 backdrop-blur-sm shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 p-5 border-b-2 border-[#C0B591]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center border border-[#C0B591]/30">
                            <LayoutDashboard className="w-5 h-5 text-[#C0B591]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>Comic Layout</h3>
                            <p className="text-xs text-black/60">Design your comic's structure and pacing</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        {/* Pages & Panels Configuration */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-black flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#C0B591]" />
                              Total Pages
                            </Label>
                            <Select value={String(totalPages)} onValueChange={(v) => setTotalPages(Number(v))}>
                              <SelectTrigger className="text-base bg-white/40 border-2 border-[#C0B591]/40 focus:border-[#C0B591]/70 font-semibold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[2, 4, 6, 8, 12].map((n) => (
                                  <SelectItem key={n} value={String(n)} className="text-base font-semibold">{n} pages</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-black/50">Recommended: 4-8 pages for optimal storytelling</p>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-black flex items-center gap-2">
                              <Grid3X3 className="w-4 h-4 text-[#FF4444]" />
                              Panels Per Page
                            </Label>
                            <Select value={String(panelsPerPage)} onValueChange={(v) => setPanelsPerPage(Number(v))}>
                              <SelectTrigger className="text-base bg-white/40 border-2 border-[#C0B591]/40 focus:border-[#C0B591]/70 font-semibold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[3, 4, 6, 8, 9].map((n) => (
                                  <SelectItem key={n} value={String(n)} className="text-base font-semibold">{n} panels</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-black/50">More panels = faster pacing, fewer = cinematic feel</p>
                          </div>
                        </div>

                        {/* Panel Grid Preview */}
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#C0B591]" />
                            Preview: Your Panel Layout
                          </Label>
                          <PanelGridPreview columns={panelsPerPage === 3 ? 3 : panelsPerPage <= 4 ? 2 : panelsPerPage === 6 ? 3 : 4} rows={panelsPerPage === 3 ? 1 : panelsPerPage <= 4 ? 2 : panelsPerPage === 6 ? 2 : panelsPerPage === 8 ? 2 : 3} />
                          <div className="grid grid-cols-2 gap-3 text-center p-3 bg-white/20 rounded-lg border border-[#C0B591]/20">
                            <div>
                              <p className="text-lg font-bold text-[#C0B591]">{totalPages}</p>
                              <p className="text-xs text-black/60 font-semibold">Pages</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-[#FF4444]">{totalPages * panelsPerPage}</p>
                              <p className="text-xs text-black/60 font-semibold">Total Panels</p>
                            </div>
                          </div>
                        </div>

                        {/* Layout Style */}
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Palette className="w-4 h-4 text-[#FF4444]" />
                            Panel Layout Style
                          </Label>
                          <div className="space-y-2">
                            {LAYOUT_STYLES.map((l) => {
                              const Icon = l.icon;
                              return (
                                <button
                                  key={l.value}
                                  onClick={() => setLayoutStyle(l.value)}
                                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                                    layoutStyle === l.value
                                      ? 'bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 border-[#C0B591]/50 text-black font-bold shadow-lg'
                                      : 'bg-white/20 border-black/20 text-black/70 hover:border-[#C0B591]/30 hover:bg-white/30'
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                  <div className="text-left">
                                    <p className="text-base font-bold">{l.label}</p>
                                    <p className="text-xs text-black/60">{l.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Beat Outline */}
                        <div className="border-t-2 border-[#C0B591]/20 pt-6 space-y-3">
                          <Label className="text-sm font-bold text-black flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#FF4444]" />
                            Story Beat Outline (Optional)
                          </Label>
                          <p className="text-xs text-black/50">Guide Panelra through your story structure</p>
                          <div className="grid grid-cols-2 gap-3">
                            {BEAT_SLOTS.map((label, i) => (
                              <div key={label} className="space-y-1.5">
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white inline-block ${
                                  i === 0 ? 'bg-[#FF4444]' :
                                    i === 1 ? 'bg-orange-500' :
                                      i === 2 ? 'bg-amber-500' : 'bg-[#C0B591]'
                                }`}>
                                  {i + 1}. {label}
                                </div>
                                <Input
                                  placeholder={`${label} details...`}
                                  value={beats[i]}
                                  onChange={(e) => updateBeat(i, e.target.value)}
                                  className="text-xs h-9 bg-white/30 border border-[#C0B591]/30 placeholder:text-black/30 focus:border-[#C0B591]/60"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ─── SECTION 4: REVIEW & GENERATE ─── */}
              {(step === 'review' || isGenerating || phase === 'complete' || phase === 'error') && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Generate Button */}
                    <Card className="bg-gradient-to-r from-[#C0B591]/30 to-[#FF4444]/20 border-2 border-[#C0B591]/40 backdrop-blur-sm shadow-xl overflow-hidden">
                      <CardContent className="p-6">
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating || !title.trim() || !logline.trim()}
                          className="w-full py-7 text-lg font-bold bg-gradient-to-r from-[#C0B591] to-[#FF4444] hover:from-[#D4C4A8] hover:to-[#FF6666] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] active:shadow-[2px_2px_0px_0px_#000] active:translate-y-1 transition-all"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-6 h-6 mr-3" />
                          )}
                          {isGenerating ? `${PHASE_MESSAGES[phase]}` : 'Generate Your Comic'}
                        </Button>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 px-4 py-3 rounded-lg bg-[#FF4444]/20 border-2 border-[#FF4444]/40 text-[#FF4444]/80 text-sm font-semibold flex items-start gap-3"
                          >
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            {error}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Progress States */}
                    <AnimatePresence>
                      {isGenerating && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card className="bg-white/20 border-2 border-[#C0B591]/30 backdrop-blur-sm overflow-hidden shadow-xl">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="h-2 rounded-full bg-white/10 overflow-hidden border border-[#C0B591]/20">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-[#C0B591] to-[#FF4444]"
                                    initial={{ width: '0%' }}
                                    animate={{
                                      width:
                                        phase === 'analyzing' ? '25%' :
                                          phase === 'composing' ? '50%' :
                                            phase === 'rendering' ? '75%' :
                                              phase === 'finalizing' ? '90%' : '100%',
                                    }}
                                    transition={{ duration: 0.8 }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  {(['analyzing', 'composing', 'rendering', 'finalizing'] as GenerationPhase[]).map((p, i) => {
                                    const phaseIndex = ['analyzing', 'composing', 'rendering', 'finalizing'].indexOf(phase);
                                    const thisIndex = i;
                                    const isDone = thisIndex < phaseIndex;
                                    const isCurrent = p === phase;

                                    return (
                                      <div key={p} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                                        isCurrent ? 'bg-[#C0B591]/20 border-2 border-[#C0B591]/40' :
                                          isDone ? 'opacity-50' : 'opacity-30'
                                      }`}>
                                        {isDone ? (
                                          <Check className="w-5 h-5 text-[#FF4444]" />
                                        ) : isCurrent ? (
                                          <Loader2 className="w-5 h-5 text-[#C0B591] animate-spin" />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full border-2 border-black/20" />
                                        )}
                                        <span className="text-sm font-bold text-black">
                                          {PHASE_MESSAGES[p]}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Results */}
                    {result && phase === 'complete' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        <Card className="bg-gradient-to-r from-[#C0B591]/30 to-[#FF4444]/20 border-2 border-[#FF4444]/40 backdrop-blur-sm shadow-xl">
                          <CardContent className="py-4 flex items-center gap-3">
                            <Check className="w-6 h-6 text-[#FF4444]" />
                            <span className="text-base font-bold text-black">{result.summary}</span>
                          </CardContent>
                        </Card>

                        {/* Pages */}
                        {Array.from({ length: result.totalPages }, (_, pageIdx) => {
                          const pagePanels = result.panels.filter((p) => p.pageNumber === pageIdx + 1);
                          return (
                            <Card key={pageIdx} className="bg-white/20 border-2 border-[#C0B591]/30 backdrop-blur-sm overflow-hidden shadow-xl">
                              <CardHeader className="bg-gradient-to-r from-[#C0B591]/20 to-[#FF4444]/10 border-b-2 border-[#C0B591]/20 pb-3">
                                <CardTitle className="text-base flex items-center gap-3 text-black font-bold">
                                  <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center border border-[#C0B591]/30">
                                    <span className="text-sm font-bold text-[#C0B591]">{pageIdx + 1}</span>
                                  </div>
                                  Page {pageIdx + 1}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-5">
                                <div className={`grid gap-3 ${
                                  result.panelsPerPage <= 4 ? 'grid-cols-2' :
                                    result.panelsPerPage <= 6 ? 'grid-cols-3' : 'grid-cols-4'
                                }`}>
                                  {pagePanels.map((panel) => (
                                    <div
                                      key={panel.panelIndex}
                                      className="group relative rounded-lg border-2 border-[#C0B591]/30 bg-gradient-to-br from-white/20 to-white/5 overflow-hidden hover:border-[#C0B591]/60 transition-all hover:shadow-lg"
                                    >
                                      <div className="aspect-[3/4] bg-gradient-to-br from-[#C0B591]/5 to-[#FF4444]/5 flex flex-col items-center justify-center p-2">
                                        <ImageIcon className="w-8 h-8 text-[#C0B591]/30 mb-1" />
                                        <span className="text-[9px] text-[#C0B591]/50 text-center font-bold">{panel.cameraDirection}</span>
                                      </div>

                                      <div className="p-2.5 border-t-2 border-[#C0B591]/20">
                                        <p className="text-[10px] text-black font-bold line-clamp-2 mb-1">{panel.caption}</p>
                                        {panel.characters.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {panel.characters.map((c, ci) => (
                                              <Badge key={ci} className="text-[8px] px-1.5 py-0 h-5 bg-[#C0B591]/20 text-[#C0B591] border border-[#C0B591]/40 font-bold">
                                                {c}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setPhase('idle')}
                            className="border-2 border-[#C0B591]/40 text-black bg-white/30 hover:bg-white/50 font-bold py-6 text-base"
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Regenerate
                          </Button>
                          <Button className="bg-gradient-to-r from-[#C0B591] to-[#FF4444] hover:from-[#D4C4A8] hover:to-[#FF6666] text-black font-bold border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] active:shadow-[1px_1px_0px_0px_#000] active:translate-y-1 py-6 text-base transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            Save Comic
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {phase === 'idle' && !result && step === 'review' && (
                      <Card className="bg-white/15 border-2 border-[#C0B591]/30 backdrop-blur-sm shadow-xl">
                        <CardContent className="py-12 text-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C0B591]/20 to-[#FF4444]/10 flex items-center justify-center mx-auto mb-4 border-2 border-[#C0B591]/30">
                            <BookOpen className="w-10 h-10 text-[#C0B591]/50" />
                          </div>
                          <p className="text-lg font-bold text-black mb-2" style={{ fontFamily: 'Georgia, serif' }}>Ready to Create?</p>
                          <p className="text-sm text-black/60 mb-4">Review your settings and click Generate to bring your comic to life</p>
                          <Button onClick={() => setStep('basics')} className="bg-[#C0B591] hover:bg-[#D4C4A8] text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                            Edit Setup
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Navigation Buttons for Steps */}
              {!isGenerating && phase === 'idle' && !result && (
                <div className="flex gap-3">
                  {step !== 'basics' && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step === 'characters' ? 'basics' : step === 'layout' ? 'characters' : 'layout')}
                      className="flex-1 border-2 border-[#C0B591]/40 text-black bg-white/30 hover:bg-white/50 font-bold py-6 text-base"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  {step !== 'review' && (
                    <Button
                      onClick={() => setStep(step === 'basics' ? 'characters' : step === 'characters' ? 'layout' : 'review')}
                      className="flex-1 bg-gradient-to-r from-[#C0B591] to-[#FF4444] hover:from-[#D4C4A8] hover:to-[#FF6666] text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] active:shadow-[1px_1px_0px_0px_#000] active:translate-y-1 py-6 text-base transition-all"
                    >
                      {step === 'layout' ? 'Review & Generate' : 'Next Step'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
