'use client';
// KAVACH DMCA Takedown Form — Public page (no auth required)
// Per DMCA §512(c)(3), all 3 declarations are required for a valid notice
import { useState } from 'react';

export default function DMCAPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deadline, setDeadline] = useState('');
  const [form, setForm] = useState({
    claimant_name: '', claimant_email: '', claimant_organization: '',
    claimant_role: 'ip_owner', story_url: '', infringing_content_description: '',
    original_work_title: '', original_work_url: '', ip_registration_number: '',
    jurisdiction: 'US_DMCA', good_faith_declaration: false,
    accuracy_declaration: false, authorization_declaration: false, digital_signature: '',
  });

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
  const allValid = form.claimant_name && form.claimant_email && form.infringing_content_description &&
    form.original_work_title && form.good_faith_declaration && form.accuracy_declaration &&
    form.authorization_declaration && form.digital_signature;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) { setError('All required fields and declarations must be completed'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/kavach/dmca', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      setDeadline(data.response_deadline);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md text-center p-8">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-black mb-2">Takedown Notice Received</h1>
        <p className="text-zinc-400 text-sm mb-3">
          Your DMCA takedown notice has been received and logged. We will review and respond within <strong className="text-white">48 hours</strong>.
        </p>
        {deadline && <p className="text-xs text-zinc-500">Response deadline: {new Date(deadline).toLocaleString()}</p>}
        <p className="text-xs text-zinc-600 mt-4">Per DMCA §512(c)(3) and IT Act 2000 §79, your notice has been recorded in our compliance audit trail.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">⚖️</span>
          <div>
            <h1 className="text-2xl font-black">DMCA / IP Takedown Request</h1>
            <p className="text-xs text-zinc-400">File a takedown under DMCA §512, India Copyright Act 1957, or EU DSA</p>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Claimant Info */}
          <div className="kavach-card">
            <h2 className="font-bold mb-3">Claimant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required value={form.claimant_name} onChange={e => set('claimant_name', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="Full Name *" />
              <input required type="email" value={form.claimant_email} onChange={e => set('claimant_email', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="Email *" />
              <input value={form.claimant_organization} onChange={e => set('claimant_organization', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="Organization (optional)" />
              <select value={form.claimant_role} onChange={e => set('claimant_role', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
                <option value="ip_owner">IP Owner</option>
                <option value="authorized_agent">Authorized Agent</option>
                <option value="legal_representative">Legal Representative</option>
              </select>
            </div>
          </div>

          {/* Claim Details */}
          <div className="kavach-card">
            <h2 className="font-bold mb-3">Claim Details</h2>
            <div className="space-y-3">
              <input value={form.story_url} onChange={e => set('story_url', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="URL of infringing content on Comicraft" />
              <textarea required value={form.infringing_content_description} onChange={e => set('infringing_content_description', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Describe the infringing content *" />
              <input required value={form.original_work_title} onChange={e => set('original_work_title', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="Original work title *" />
              <input value={form.original_work_url} onChange={e => set('original_work_url', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="URL of original work (optional)" />
              <input value={form.ip_registration_number} onChange={e => set('ip_registration_number', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm" placeholder="IP registration number (optional)" />
              <select value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
                <option value="US_DMCA">US — DMCA §512</option>
                <option value="IN_COPYRIGHT_ACT">India — Copyright Act 1957</option>
                <option value="EU_DSA">EU — Digital Services Act</option>
                <option value="OTHER">Other Jurisdiction</option>
              </select>
            </div>
          </div>

          {/* Legal Declarations */}
          <div className="kavach-card border-amber-500/30">
            <h2 className="font-bold mb-1">Legal Declarations</h2>
            <p className="text-xs text-zinc-400 mb-3">Per DMCA §512(c)(3), all three declarations are required for a valid notice.</p>
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.good_faith_declaration} onChange={e => set('good_faith_declaration', e.target.checked)} className="mt-0.5 accent-amber-500" />
                <span className="text-xs">I have a good faith belief that use of the material identified above is not authorized by the copyright owner, its agent, or the law.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.accuracy_declaration} onChange={e => set('accuracy_declaration', e.target.checked)} className="mt-0.5 accent-amber-500" />
                <span className="text-xs">I swear, under penalty of perjury, that the information in this notification is accurate and that I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.authorization_declaration} onChange={e => set('authorization_declaration', e.target.checked)} className="mt-0.5 accent-amber-500" />
                <span className="text-xs">I am the copyright owner or authorized to act on behalf of the copyright owner of the work described above.</span>
              </label>
            </div>
          </div>

          {/* Digital Signature */}
          <div className="kavach-card">
            <h2 className="font-bold mb-2">Digital Signature</h2>
            <input required value={form.digital_signature} onChange={e => set('digital_signature', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm italic" placeholder="Type your full legal name as your digital signature *" />
            <p className="text-xs text-zinc-500 mt-1">By typing your name, you confirm this constitutes your electronic signature.</p>
          </div>

          <button type="submit" disabled={!allValid || loading}
            className="w-full bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-40">
            {loading ? 'Submitting...' : 'Submit Takedown Notice'}
          </button>
          <p className="text-xs text-zinc-600 text-center">We commit to responding within 48 hours of receipt.</p>
        </form>
      </div>
    </div>
  );
}
