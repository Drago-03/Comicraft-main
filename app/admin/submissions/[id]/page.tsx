'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle, ArrowLeft, Loader2, AlertTriangle, Fingerprint, BookOpen, Scale, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SubmissionReviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubmission();

    const supabase = createClient();
    const channel = supabase
      .channel(`public:submissions:id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'submissions', filter: `id=eq.${id}` },
        (payload: any) => {
          console.log('Realtime submission update:', payload);
          setSubmission((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/v1/submissions/${id}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });

      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setSubmission(data.data);
      setReviewNotes(data.data.review_notes || '');
    } catch (err: any) {
      toast.error(err.message || 'Error loading submission');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (status: 'approved' | 'rejected' | 'revision_requested') => {
    setActionLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/v1/submissions/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status, review_notes: reviewNotes }),
      });

      if (!res.ok) throw new Error('Failed to update review status');
      
      toast.success(`Submission ${status} successfully`);
      router.push('/admin/submissions');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  if (!submission) return <div className="p-8 text-center">Submission not found</div>;

  const kavach = submission.kavach_results || {};

  const PhaseItem = ({ title, icon, phaseData, delayStr }: any) => {
    const status = phaseData?.status || 'pending';
    let Icon = Loader2;
    let color = 'text-neutral-500';
    let bg = 'bg-neutral-800/50';

    if (status === 'running') {
      color = 'text-blue-400';
      bg = 'bg-blue-500/10 border-blue-500/30';
    } else if (status === 'passed') {
      Icon = CheckCircle;
      color = 'text-green-500';
      bg = 'bg-green-500/10 border-green-500/30';
    } else if (status === 'failed' || status === 'flagged') {
      Icon = AlertTriangle;
      color = 'text-red-500';
      bg = 'bg-red-500/10 border-red-500/30';
    }

    return (
      <div className={`flex items-center justify-between p-4 rounded-lg border border-neutral-800 transition-all ${bg}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-neutral-900 ${color}`}>{icon}</div>
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <span className="text-xs text-neutral-400">{status.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {status === 'running' && <Loader2 className={`w-5 h-5 animate-spin ${color}`} />}
          {status !== 'running' && status !== 'pending' && <Icon className={`w-5 h-5 ${color}`} />}
          {phaseData?.score !== undefined && <span className="text-xs mt-1 text-neutral-400">Score: {phaseData.score.toFixed(2)}</span>}
          {phaseData?.hash && <span className="text-xs mt-1 text-neutral-400 font-mono text-[10px] w-24 truncate">{phaseData.hash}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/admin/submissions" className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{submission.stories?.title || 'Unknown Story'}</h1>
          <p className="text-neutral-400">By {submission.profiles?.display_name || 'Anonymous'} (@{submission.profiles?.username || 'user'})</p>
        </div>
        <div className="text-right">
          <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm font-medium border border-neutral-700">
            Current Status: {submission.status.toUpperCase()}
          </span>
          <p className="text-xs text-neutral-500 mt-2">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: KAVACH Flow + Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-500" />
              Live KAVACH Pipeline
            </h3>
            
            <div className="space-y-3">
              <PhaseItem title="Plagiarism Scan" icon={<BookOpen className="w-4 h-4" />} phaseData={kavach.plagiarism} />
              <PhaseItem title="Content Policy Check" icon={<Shield className="w-4 h-4" />} phaseData={kavach.content_policy} />
              <PhaseItem title="Copyright / Trademark" icon={<Scale className="w-4 h-4" />} phaseData={kavach.copyright} />
              <PhaseItem title="Metadata Validation" icon={<FileText className="w-4 h-4" />} phaseData={kavach.metadata_validation} />
              <PhaseItem title="AI Fingerprint" icon={<Fingerprint className="w-4 h-4" />} phaseData={kavach.ai_fingerprint} />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Submission Meta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Rating</span><span className="text-white capitalize">{submission.content_rating?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Language</span><span className="text-white uppercase">{submission.language}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Tags</span><span className="text-white text-right max-w-[150px] truncate">{submission.tags?.join(', ') || 'None'}</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Story preview & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl relative min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-neutral-800 pb-3">Story Content Preview</h3>
            <div 
              className="prose prose-invert max-w-none text-neutral-300 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: submission.stories?.content || 'No content available.' }}
            />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-neutral-800 pb-3">Review Action</h3>
            <textarea
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
              rows={3}
              placeholder="Leave notes for the author or internal moderation logs..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleReviewAction('approved')}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
              >
                Approve & Publish
              </button>
              <button 
                onClick={() => handleReviewAction('revision_requested')}
                disabled={actionLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
              >
                Request Revision
              </button>
              <button 
                onClick={() => handleReviewAction('rejected')}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
              >
                Reject & Ban
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
