'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Type,
  UploadCloud,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Clock3,
  Tags,
  Save,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

type InputMode = 'document' | 'write';
type UploadStep = 'source' | 'details' | 'review';
type FormatType = 'storybook' | 'comic_book';

const GENRES = [
  'sci-fi',
  'fantasy',
  'mystery',
  'adventure',
  'romance',
  'horror',
  'drama',
  'thriller',
  'other',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function UploadPage() {
  const [step, setStep] = useState<UploadStep>('source');
  const [inputMode, setInputMode] = useState<InputMode>('document');

  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [genre, setGenre] = useState('other');
  const [formatType, setFormatType] = useState<FormatType>('storybook');
  const [characterSetting, setCharacterSetting] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  React.useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Access denied',
          description: 'Please sign in to upload your work.',
          variant: 'destructive',
        });
        router.push('/sign-in');
      }
    };

    checkAuth();
  }, [supabase.auth, router, toast]);

  React.useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      if (coverImagePreviewUrl) URL.revokeObjectURL(coverImagePreviewUrl);
    };
  }, [filePreviewUrl, coverImagePreviewUrl]);

  const totalWords = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;

  const canContinueFromSource =
    inputMode === 'document' ? !!file : markdownContent.trim().length > 0;

  const canContinueFromDetails =
    title.trim().length > 0 &&
    !!coverImage &&
    (inputMode === 'document' || markdownContent.trim().length > 0);

  const validateFile = (selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt', 'md'];

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension || '')) {
      toast({
        title: 'Invalid file type',
        description: 'Upload a PDF, DOCX, TXT, or MD file.',
        variant: 'destructive',
      });
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 50MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!validateFile(selectedFile)) return;

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (selectedFile.type === 'application/pdf' || extension === 'pdf') {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
      setTextPreview(null);
    } else if (
      ['text/plain', 'text/markdown'].includes(selectedFile.type) ||
      ['txt', 'md'].includes(extension || '')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextPreview((e.target?.result as string) || '');
        setFilePreviewUrl(null);
      };
      reader.readAsText(selectedFile);
    } else {
      setFilePreviewUrl(null);
      setTextPreview('Preview is not available for this format. File is ready for processing.');
    }

    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDropzone(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelection(dropped);
  };

  const clearFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFile(null);
    setFilePreviewUrl(null);
    setTextPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearCover = () => {
    if (coverImagePreviewUrl) URL.revokeObjectURL(coverImagePreviewUrl);
    setCoverImage(null);
    setCoverImagePreviewUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const addTag = () => {
    const normalized = tagInput.trim().toLowerCase();
    if (!normalized) return;
    if (tags.includes(normalized)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 12) {
      toast({
        title: 'Tag limit reached',
        description: 'Use up to 12 tags for better discoverability.',
        variant: 'destructive',
      });
      return;
    }
    setTags((prev) => [...prev, normalized]);
    setTagInput('');
  };

  const nextStep = () => {
    if (step === 'source') {
      if (!canContinueFromSource) {
        toast({
          title: 'Source required',
          description:
            inputMode === 'document'
              ? 'Upload a source document to continue.'
              : 'Write or paste content to continue.',
          variant: 'destructive',
        });
        return;
      }
      setStep('details');
      return;
    }

    if (step === 'details') {
      if (!canContinueFromDetails) {
        toast({
          title: 'Missing required fields',
          description: 'Title and cover image are required before review.',
          variant: 'destructive',
        });
        return;
      }
      setStep('review');
    }
  };

  const prevStep = () => {
    if (step === 'review') setStep('details');
    else if (step === 'details') setStep('source');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a title.', variant: 'destructive' });
      return;
    }

    if (!coverImage) {
      toast({ title: 'Cover image required', description: 'Please upload a cover image.', variant: 'destructive' });
      return;
    }

    if (inputMode === 'document' && !file) {
      toast({ title: 'Document required', description: 'Please upload a source file.', variant: 'destructive' });
      return;
    }

    if (inputMode === 'write' && !markdownContent.trim()) {
      toast({ title: 'Content required', description: 'Please add story content.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Authentication required');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('formatType', formatType === 'comic_book' ? 'Comic Book' : 'Storybook');
      formData.append('coverImage', coverImage);

      if (formatType === 'storybook') {
        formData.append('characterSetting', characterSetting);
        formData.append('tags', JSON.stringify(tags));
      }

      let endpoint = '';

      if (inputMode === 'document' && file) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com'}/api/v1/stories/upload-file`;
        formData.append('file', file);
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com'}/api/v1/stories/upload`;
        formData.append('content', markdownContent);
        formData.append('source', 'uploaded');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      toast({
        title: 'Published successfully',
        description: 'Your story is uploaded and now visible in your ecosystem flow.',
      });

      router.push('/gallery');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEDFCA] relative text-black font-sans overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 max-w-[1700px] mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <aside className="lg:col-span-4 xl:col-span-3 space-y-5 lg:sticky lg:top-24">
            <Card className="bg-white/20 border-2 border-[#C0B591]/30 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-[#C0B591]">
                  Upload Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'source', label: 'Source Input', icon: FileText },
                  { id: 'details', label: 'Metadata & Cover', icon: Layers },
                  { id: 'review', label: 'Review & Publish', icon: Eye },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = step === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 ${
                        active
                          ? 'bg-gradient-to-r from-[#C0B591]/30 to-[#FF4444]/15 border-[#C0B591]/50'
                          : 'bg-white/10 border-black/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#C0B591]' : 'text-black/40'}`} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#C0B591]/15 to-[#FF4444]/10 border-2 border-[#C0B591]/30 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#C0B591]">
                  Session Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/35 rounded-lg p-2 border border-[#C0B591]/30">
                  <p className="text-xs text-black/60 font-semibold">Mode</p>
                  <p className="text-sm font-bold">{inputMode === 'document' ? 'Document' : 'Writer'}</p>
                </div>
                <div className="bg-white/35 rounded-lg p-2 border border-[#C0B591]/30">
                  <p className="text-xs text-black/60 font-semibold">Format</p>
                  <p className="text-sm font-bold">{formatType === 'comic_book' ? 'Comic' : 'Story'}</p>
                </div>
                <div className="bg-white/35 rounded-lg p-2 border border-[#C0B591]/30">
                  <p className="text-xs text-black/60 font-semibold">Words</p>
                  <p className="text-sm font-bold">{totalWords}</p>
                </div>
                <div className="bg-white/35 rounded-lg p-2 border border-[#C0B591]/30">
                  <p className="text-xs text-black/60 font-semibold">Tags</p>
                  <p className="text-sm font-bold">{tags.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/15 border-2 border-[#C0B591]/20">
              <CardContent className="p-4 text-xs text-black/75 space-y-2">
                <p className="font-bold text-[#C0B591]">Production Guidelines</p>
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Max upload size: 50MB</p>
                <p className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5" /> Typical processing: 20-60 sec</p>
                <p className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> AI synopsis auto-generated on publish</p>
              </CardContent>
            </Card>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9 space-y-6 pb-20">
            <Card className="bg-gradient-to-r from-white/25 via-white/15 to-white/25 border-2 border-[#C0B591]/30">
              <CardContent className="p-6 md:p-7">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  Publish to Comicraft
                </h1>
                <p className="text-black/60 mt-2 text-sm md:text-base max-w-3xl">
                  A production-grade upload pipeline for creators. Add source material, metadata, and publish with a polished, marketplace-ready presentation.
                </p>
              </CardContent>
            </Card>

            <AnimatePresence mode="wait">
              {step === 'source' && (
                <motion.div
                  key="source"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/20 border-2 border-[#C0B591]/30">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#C0B591]" />
                        Source Input
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="p-1.5 bg-white/25 border border-[#C0B591]/30 rounded-xl flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInputMode('document')}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            inputMode === 'document'
                              ? 'bg-gradient-to-r from-[#C0B591]/60 to-[#FF4444]/40 border border-black/20'
                              : 'bg-white/20 text-black/60 hover:bg-white/35'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode('write')}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            inputMode === 'write'
                              ? 'bg-gradient-to-r from-[#C0B591]/60 to-[#FF4444]/40 border border-black/20'
                              : 'bg-white/20 text-black/60 hover:bg-white/35'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2"><Type className="w-4 h-4" /> Live Writer</span>
                        </button>
                      </div>

                      {inputMode === 'document' ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsHoveringDropzone(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setIsHoveringDropzone(false);
                          }}
                          onDrop={handleDrop}
                          className={`rounded-2xl border-2 border-dashed p-8 md:p-10 transition-all ${
                            isHoveringDropzone
                              ? 'border-[#C0B591] bg-[#C0B591]/15'
                              : 'border-[#C0B591]/40 bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.md"
                            className="hidden"
                            title="Upload source document"
                            aria-label="Upload source document"
                            onChange={(e) => {
                              const selected = e.target.files?.[0];
                              if (selected) handleFileSelection(selected);
                            }}
                          />

                          {!file ? (
                            <div className="text-center space-y-3">
                              <div className="mx-auto w-16 h-16 rounded-xl bg-white/50 border border-[#C0B591]/40 flex items-center justify-center">
                                <UploadCloud className="w-8 h-8 text-[#C0B591]" />
                              </div>
                              <p className="font-bold text-lg">Drop file here or click to browse</p>
                              <p className="text-sm text-black/60">Supports PDF, DOCX, TXT, MD up to 50MB.</p>
                              <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-[#C0B591] hover:bg-[#d4c4a8] text-black font-bold border border-black/20 mt-2"
                              >
                                Browse Files
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between bg-white/50 border border-[#C0B591]/30 rounded-xl p-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-[#C0B591]/20 border border-[#C0B591]/40 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-[#C0B591]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold truncate">{file.name}</p>
                                    <p className="text-xs text-black/55">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button type="button" variant="outline" onClick={clearFile} className="border-[#C0B591]/40 bg-white/40">
                                  <X className="w-4 h-4 mr-1" /> Clear
                                </Button>
                              </div>

                              <div className="rounded-xl border border-[#C0B591]/30 bg-black/80 text-white overflow-hidden min-h-[260px]">
                                {filePreviewUrl ? (
                                  <object data={filePreviewUrl} type="application/pdf" className="w-full h-[360px]">
                                    <div className="p-6 text-white/70">Preview unavailable in this browser.</div>
                                  </object>
                                ) : (
                                  <pre className="text-xs md:text-sm p-5 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[360px]">
                                    {textPreview || 'Preview unavailable for this file format. Ready for processing.'}
                                  </pre>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl overflow-hidden border-2 border-[#C0B591]/30 bg-black/80 text-white">
                          <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between text-xs">
                            <span className="font-semibold text-white/80">Editor</span>
                            <span className="text-white/55">{totalWords} words</span>
                          </div>
                          <Textarea
                            value={markdownContent}
                            onChange={(e) => setMarkdownContent(e.target.value)}
                            placeholder="# Chapter 1\n\nStart writing your story here..."
                            className="min-h-[420px] bg-transparent border-0 focus-visible:ring-0 rounded-none resize-none text-base leading-7 font-mono"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/20 border-2 border-[#C0B591]/30">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#C0B591]" />
                        Metadata & Presentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-semibold">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter story title"
                            className="h-11 bg-white/45 border-[#C0B591]/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold">Genre</Label>
                          <select
                            aria-label="Select genre"
                            title="Select genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full h-11 rounded-md px-3 bg-white/45 border border-[#C0B591]/40"
                          >
                            {GENRES.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold">Format</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFormatType('storybook')}
                              className={`h-11 rounded-md border text-sm font-bold ${
                                formatType === 'storybook'
                                  ? 'bg-[#C0B591]/30 border-[#C0B591]/60'
                                  : 'bg-white/35 border-[#C0B591]/30'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Storybook</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormatType('comic_book')}
                              className={`h-11 rounded-md border text-sm font-bold ${
                                formatType === 'comic_book'
                                  ? 'bg-[#C0B591]/30 border-[#C0B591]/60'
                                  : 'bg-white/35 border-[#C0B591]/30'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1.5"><Layers className="w-4 h-4" /> Comic</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-semibold">Description (Optional)</Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a concise synopsis for discovery and SEO..."
                            className="min-h-[100px] bg-white/45 border-[#C0B591]/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">Cover Image (Required)</Label>
                        <div className="relative rounded-xl border-2 border-dashed border-[#C0B591]/45 bg-white/25 p-4 hover:bg-white/35 transition-colors min-h-[220px]">
                          <input
                            ref={coverInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            title="Upload cover image"
                            aria-label="Upload cover image"
                            onChange={(e) => {
                              const selected = e.target.files?.[0];
                              if (!selected) return;
                              if (selected.size > 10 * 1024 * 1024) {
                                toast({
                                  title: 'Cover too large',
                                  description: 'Use an image up to 10MB.',
                                  variant: 'destructive',
                                });
                                return;
                              }
                              if (coverImagePreviewUrl) URL.revokeObjectURL(coverImagePreviewUrl);
                              setCoverImage(selected);
                              setCoverImagePreviewUrl(URL.createObjectURL(selected));
                            }}
                          />

                          {coverImagePreviewUrl ? (
                            <>
                              <img src={coverImagePreviewUrl} alt="Cover preview" className="w-full h-[240px] object-cover rounded-lg border border-[#C0B591]/40" />
                              <div className="mt-3 flex items-center justify-end gap-2">
                                <Button type="button" variant="outline" onClick={clearCover} className="bg-white/50 border-[#C0B591]/40">
                                  <X className="w-4 h-4 mr-1" /> Remove
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center text-black/60">
                              <ImageIcon className="w-8 h-8 text-[#C0B591] mb-2" />
                              <p className="font-semibold">Click to upload cover</p>
                              <p className="text-xs">Recommended: 16:9, JPG/PNG/WebP</p>
                              <Button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="mt-3 bg-[#C0B591] hover:bg-[#d4c4a8] text-black font-bold border border-black/20"
                              >
                                Upload Cover
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {formatType === 'storybook' && (
                        <div className="space-y-4 rounded-xl border border-[#C0B591]/35 bg-white/25 p-4">
                          <div className="space-y-2">
                            <Label className="font-semibold">Character Setting (Optional)</Label>
                            <Input
                              value={characterSetting}
                              onChange={(e) => setCharacterSetting(e.target.value)}
                              placeholder="e.g., A rogue AI and a weary detective"
                              className="h-10 bg-white/45 border-[#C0B591]/40"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="font-semibold flex items-center gap-2"><Tags className="w-4 h-4" /> Tags</Label>
                            <div className="flex gap-2">
                              <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                                placeholder="Add a tag and press Enter"
                                className="h-10 bg-white/45 border-[#C0B591]/40"
                              />
                              <Button type="button" onClick={addTag} className="bg-[#C0B591] hover:bg-[#d4c4a8] text-black font-bold border border-black/20">
                                Add
                              </Button>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {tags.map((tag) => (
                                  <Badge key={tag} className="bg-[#C0B591]/25 text-black border border-[#C0B591]/50 py-1">
                                    {tag}
                                    <button
                                      type="button"
                                      aria-label={`Remove tag ${tag}`}
                                      title={`Remove tag ${tag}`}
                                      className="ml-2"
                                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/20 border-2 border-[#C0B591]/30">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-[#C0B591]" />
                        Review & Publish
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-xl border border-[#C0B591]/35 bg-white/35 p-4 space-y-3">
                        <p className="text-sm"><span className="font-bold">Title:</span> {title || '-'}</p>
                        <p className="text-sm"><span className="font-bold">Genre:</span> {genre}</p>
                        <p className="text-sm"><span className="font-bold">Mode:</span> {inputMode === 'document' ? 'Document upload' : 'Live writer'}</p>
                        <p className="text-sm"><span className="font-bold">Format:</span> {formatType === 'comic_book' ? 'Comic Book' : 'Storybook'}</p>
                        <p className="text-sm"><span className="font-bold">Source:</span> {inputMode === 'document' ? file?.name || '-' : `${totalWords} words`}</p>
                        <p className="text-sm"><span className="font-bold">Tags:</span> {tags.length ? tags.join(', ') : 'None'}</p>
                        <p className="text-sm"><span className="font-bold">Description:</span> {description || 'AI will generate synopsis.'}</p>
                      </div>

                      {coverImagePreviewUrl && (
                        <div className="rounded-xl overflow-hidden border border-[#C0B591]/40 bg-white/30">
                          <img src={coverImagePreviewUrl} alt="Cover preview" className="w-full h-[240px] object-cover" />
                        </div>
                      )}

                      <div className="rounded-xl border border-[#C0B591]/35 bg-gradient-to-r from-[#C0B591]/15 to-[#FF4444]/10 p-4 text-sm text-black/70">
                        <p className="font-semibold">Publishing will:</p>
                        <ul className="mt-2 space-y-1">
                          <li>- Upload source content and cover image securely</li>
                          <li>- Trigger synopsis generation and indexing</li>
                          <li>- Publish to your gallery-ready pipeline</li>
                        </ul>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-gradient-to-r from-[#C0B591] to-[#FF4444] hover:from-[#d4c4a8] hover:to-[#ff6666] text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] transition-all"
                        >
                          {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              Publishing...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <Save className="w-4 h-4" />
                              Publish Story
                            </span>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step !== 'source' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-11 border-2 border-[#C0B591]/45 bg-white/35 text-black font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
              )}

              {step !== 'review' && (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 bg-gradient-to-r from-[#C0B591] to-[#FF4444] hover:from-[#d4c4a8] hover:to-[#ff6666] text-black font-bold border-2 border-black"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {(step === 'source' && !canContinueFromSource) || (step === 'details' && !canContinueFromDetails) ? (
              <div className="flex items-center gap-2 text-sm text-[#b45309] bg-amber-100/70 border border-amber-300 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                Complete required fields before continuing.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100/70 border border-emerald-300 rounded-lg px-3 py-2">
                <Check className="w-4 h-4" />
                Step ready. You can proceed.
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}
