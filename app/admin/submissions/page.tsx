'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';
      const token = localStorage.getItem('token');
      
      let url = `${baseUrl}/api/v1/submissions?limit=50`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }

      const res = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/auth');
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to load submissions');
      }

      const data = await res.json();
      setSubmissions(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold"><Clock className="w-3 h-3"/> Pending Review</span>;
      case 'in_review': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold"><Loader2 className="w-3 h-3 animate-spin"/> In KAVACH Pipeline</span>;
      case 'approved': return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'rejected': return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'revision_requested': return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 flex items-center gap-1 rounded text-xs font-semibold"><AlertCircle className="w-3 h-3"/> Revision Requested</span>;
      default: return <span className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-purple-500 w-8 h-8" />
            KAVACH Moderation Portal
          </h1>
          <p className="text-neutral-400 mt-1">Review generated stories for IP compliance & content policy.</p>
        </div>
        
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
          {['all', 'pending', 'in_review', 'approved', 'rejected', 'revision_requested'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            >
              {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-sm">
                <th className="p-4 font-semibold">Story Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Submitted Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading submissions...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 italic">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4 font-medium text-white">{sub.stories?.title || 'Unknown Title'}</td>
                    <td className="p-4 text-neutral-300">
                      <div className="flex flex-col">
                        <span>{sub.profiles?.display_name || 'Anonymous'}</span>
                        <span className="text-xs text-neutral-500">@{sub.profiles?.username || 'user'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400 text-sm">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
