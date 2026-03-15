'use client';
// KAVACH Story Submission + Creator Warranty Page
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WARRANTY_TEXT, INDEMNIFICATION_TEXT, AI_DISCLOSURE_TEXT } from '@/lib/kavach/constants';

export default function SubmitStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showWarranty, setShowWarranty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Warranty form
  const [humanAuthor, setHumanAuthor] = useState('');
  const [humanCountry, setHumanCountry] = useState('India');
  const [origDecl, setOrigDecl] = useState(false);
  const [noInfDecl, setNoInfDecl] = useState(false);
  const [indemnDecl, setIndemnDecl] = useState(false);
  const [aiDecl, setAiDecl] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const allChecked = origDecl && noInfDecl && indemnDecl && aiDecl && humanAuthor.trim();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError('Title and content are required'); return; }
    if (wordCount < 10) { setError('Content must be at least 10 words'); return; }
    setShowWarranty(true);
  };

  const handleScanAndVerify = async () => {
    if (!allChecked) { setError('All declarations must be accepted'); return; }
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('You must be logged in'); setLoading(false); return; }

      // Create story
      const { data: story, error: storyErr } = await supabase.from('stories').insert({
        title, content, word_count: wordCount, author_id: user.id,
        author_name: humanAuthor, genre: 'other', status: 'scanning',
      }).select().single();
      if (storyErr || !story) throw storyErr || new Error('Failed to create story');

      // Accept warranty
      await fetch('/api/kavach/warranty', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, story_id: story.id, warranty_text: WARRANTY_TEXT,
          originality_declaration: origDecl, no_infringement_declaration: noInfDecl,
          indemnification_accepted: indemnDecl, ai_authorship_acknowledged: aiDecl,
          human_author_name: humanAuthor, human_author_country: humanCountry,
        }),
      });

      // Trigger scan
      const scanRes = await fetch('/api/kavach/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: story.id }),
      });
      const scanData = await scanRes.json();
      router.push(`/kavach/scan/${scanData.scan_id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-1">Submit Story for KAVACH Scan</h1>
        <p className="text-sm text-zinc-400 mb-6">Your story will be scanned for IP compliance before minting.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

        {!showWarranty ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Story Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                placeholder="Enter your story title..." />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Story Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={15}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition resize-y"
                placeholder="Paste or write your story here..." />
              <div className="text-xs text-zinc-500 mt-1">{wordCount} words</div>
            </div>
            <button onClick={handleSubmit} disabled={!title.trim() || wordCount < 10}
              className="w-full bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Continue to Warranty →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Warranty Modal */}
            <div className="kavach-card border-amber-500/30">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-amber-500">⚖️</span> Creator IP Warranty
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Required under Indian Copyright Act 1957 &amp; DPIIT 2025 Guidelines. All declarations must be accepted.
              </p>

              <div className="space-y-3">
                {/* Author Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Human Author Name *</label>
                    <input value={humanAuthor} onChange={e => setHumanAuthor(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm" placeholder="Your legal name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Country *</label>
                    <select value={humanCountry} onChange={e => setHumanCountry(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm">
                      <option>India</option><option>United States</option><option>United Kingdom</option>
                      <option>Canada</option><option>Australia</option><option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Declarations */}
                <div className="p-3 rounded-lg bg-zinc-800/50 text-xs leading-relaxed">
                  <p className="font-semibold text-amber-400 mb-2">IP Warranty Clause</p>
                  <p className="text-zinc-300">{WARRANTY_TEXT}</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={origDecl} onChange={e => setOrigDecl(e.target.checked)} className="mt-0.5 accent-amber-500" />
                  <span className="text-xs">I warrant this is my original work or properly licensed content</span>
                </label>

                <div className="p-3 rounded-lg bg-zinc-800/50 text-xs leading-relaxed">
                  <p className="font-semibold text-amber-400 mb-2">No Infringement Declaration</p>
                  <p className="text-zinc-300">My content does not infringe any third-party copyright, trademark, or IP right under Indian or international law.</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={noInfDecl} onChange={e => setNoInfDecl(e.target.checked)} className="mt-0.5 accent-amber-500" />
                  <span className="text-xs">I confirm my content does not infringe any third-party IP rights</span>
                </label>

                <div className="p-3 rounded-lg bg-zinc-800/50 text-xs leading-relaxed">
                  <p className="font-semibold text-amber-400 mb-2">Indemnification</p>
                  <p className="text-zinc-300">{INDEMNIFICATION_TEXT}</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={indemnDecl} onChange={e => setIndemnDecl(e.target.checked)} className="mt-0.5 accent-amber-500" />
                  <span className="text-xs">I accept the indemnification terms</span>
                </label>

                <div className="p-3 rounded-lg bg-zinc-800/50 text-xs leading-relaxed">
                  <p className="font-semibold text-amber-400 mb-2">AI Authorship Disclosure (DPIIT 2025)</p>
                  <p className="text-zinc-300">{AI_DISCLOSURE_TEXT}</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={aiDecl} onChange={e => setAiDecl(e.target.checked)} className="mt-0.5 accent-amber-500" />
                  <span className="text-xs">I acknowledge human authorship responsibility per DPIIT 2025</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowWarranty(false)} className="flex-1 border border-zinc-700 text-zinc-300 py-3 rounded-lg hover:bg-zinc-800 transition text-sm">
                ← Back
              </button>
              <button onClick={handleScanAndVerify} disabled={!allChecked || loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-40">
                {loading ? 'Scanning...' : '🛡️ Scan & Verify'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
