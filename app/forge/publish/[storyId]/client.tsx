'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, FileText, Pickaxe, Store, Award, Copyright, AlertTriangle, Scale, Lock, Loader2, ArrowRight, Share2, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Keep all checkboxes unchecked until user manually interacts.
const initialCheckboxState = {
  section1: false,
  section2: false,
  section3: false,
  section4: false,
  section5: false,
  section6: false,
  section7: false,
  section8: false,
};

export default function PublishConsentClient({ params }: { params: { storyId: string } }) {
  const router = useRouter();
  const { storyId } = params;
  
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  
  // Consent State
  const [checkboxes, setCheckboxes] = useState(initialCheckboxState);
  const [masterChecked, setMasterChecked] = useState(false);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  
  // Minting State
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState<any>(null);

  useEffect(() => {
    fetchSubmissionData();
    
    // Subscribe to realtime minting progress via Supabase
    const supabase = createClient();
    const channel = supabase
      .channel(`public:submissions:story_id=eq.${storyId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'submissions', filter: `story_id=eq.${storyId}` },
        (payload: any) => {
          if (payload.new && payload.new.minting_progress) {
            setMintProgress(payload.new.minting_progress);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId]);

  const fetchSubmissionData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://comicraft-main.onrender.com');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         router.push('/login');
         return;
      }
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const res = await fetch(`${baseUrl}/api/v1/submissions/${storyId}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      
      if (!res.ok) throw new Error('Failed to fetch story details');
      const data = await res.json();
      
      // If no submission data, mock it for demo if needed, but here we require valid data
      setSubmission(data.data);
      
      // If already minted, skip directly to dashboard
      if (data.data?.stories?.is_minted) {
         router.push('/profile/me?tab=nfts');
      }
      
    } catch (err: any) {
      toast.error(err.message || 'Error loading submission');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (section: keyof typeof initialCheckboxState) => {
    setCheckboxes(prev => {
      const updated = { ...prev, [section]: !prev[section] };
      const allChecked = Object.values(updated).every(Boolean);
      setMasterChecked(allChecked);
      return updated;
    });
  };

  const handleMasterCheckboxChange = () => {
    const newValue = !masterChecked;
    setMasterChecked(newValue);
    setCheckboxes({
      section1: newValue,
      section2: newValue,
      section3: newValue,
      section4: newValue,
      section5: newValue,
      section6: newValue,
      section7: newValue,
      section8: newValue,
    });
  };

  const downloadPDF = () => {
    toast.info('Generating PDF...', { id: 'pdf-toast' });
    const element = document.getElementById('legal-agreement-content');
    if (!element) return;
    
    html2canvas(element, { scale: 2 }).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Comicraft_TOS_${storyId}.pdf`);
      toast.success('PDF Downloaded!', { id: 'pdf-toast' });
    });
  };

  const handleConsentAndMint = async () => {
    setIsMinting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://comicraft-main.onrender.com');
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // 1. Record Consent
      const consentRes = await fetch(`${baseUrl}/api/v1/stories/${storyId}/consent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tos_version: 'v1.0',
          royalty_percentage: royaltyPercentage,
        })
      });
      
      if (!consentRes.ok) throw new Error('Failed to record consent');
      
      // 2. Trigger Minting Pipeline
      const mintRes = await fetch(`${baseUrl}/api/v1/stories/${storyId}/mint`, {
        method: 'POST',
        headers
      });
      
      if (!mintRes.ok) throw new Error('Mint pipeline failed to start');
      
      toast.success('Terms accepted. Minting process started!');
      setMintProgress({ metadata: { status: 'running' } }); // local optimistic start
      
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
      setIsMinting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  if (!submission) return <div className="p-8 text-center text-white">Submission not found. Please initiate publish flow from your draft.</div>;

  const allChecked = Object.values(checkboxes).every(Boolean);

  return (
    <div className="min-h-screen bg-black text-white font-sans py-12 px-4 relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header Summary */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 z-10">
            {submission.stories?.cover_image ? (
              <img src={submission.stories.cover_image} className="w-20 h-28 object-cover rounded-lg shadow-xl shadow-purple-900/20 border border-white/10" alt="Cover" />
            ) : (
              <div className="w-20 h-28 bg-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700">
                <FileText className="w-8 h-8 text-neutral-500" />
              </div>
            )}
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-4 h-4 text-green-400" />
                 <span className="text-xs font-bold uppercase tracking-wider text-green-400">KAVACH Approved</span>
               </div>
               <h1 className="text-2xl font-bold mb-1">{submission.stories?.title || 'Unknown Title'}</h1>
               <p className="text-sm text-white/50">Status: {submission.status.toUpperCase()} • Rating: {submission.content_rating}</p>
            </div>
          </div>
          <button onClick={downloadPDF} className="z-10 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium">
             <Download className="w-4 h-4" /> Save PDF
          </button>
        </div>

        {!isMinting ? (
           // --- TOS CONSENT FORM ---
          <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <Scale className="w-5 h-5 text-amber-400" /> Legal Consent & Minting Rights
              </h2>
              <p className="text-sm text-white/50 mt-1">Please read and acknowledge each section before minting your NFT.</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-8" id="legal-agreement-content">
              
              <Section 
                id="section1" 
                title="1. Intellectual Property Ownership" 
                icon={<Copyright />}
                checked={checkboxes.section1}
                onChange={() => handleCheckboxChange('section1')}
              >
                <p>I, the creator, hereby declare that the content submitted is my original work or that I have obtained all necessary rights, licenses, and permissions for any third-party content included.</p>
                <p>I understand that Comicraft has performed an automated IP compliance scan (KAVACH) but this does not constitute legal clearance. I bear sole responsibility for ensuring my content does not infringe upon any third-party intellectual property rights.</p>
                <p>I acknowledge that any false declaration of ownership may result in immediate removal of my content, forfeiture of associated tokens, and potential legal action.</p>
              </Section>

              <Section 
                id="section2" 
                title="2. NFT Minting Authorization" 
                icon={<Pickaxe />}
                checked={checkboxes.section2}
                onChange={() => handleCheckboxChange('section2')}
              >
                <p>I authorize Comicraft and its automated systems to mint my submitted work as a Non-Fungible Token (NFT) on the Ethereum blockchain.</p>
                <p>I understand that once minted, the blockchain record is permanent and immutable. The NFT cannot be 'unminted' or removed from the blockchain, though it can be delisted from marketplaces.</p>
                <p>I acknowledge that minting will generate a unique token linked to my content, and this token will be initially owned by my connected wallet address.</p>
              </Section>

              <Section 
                id="section3" 
                title="3. Marketplace Listing Authorization" 
                icon={<Store />}
                checked={checkboxes.section3}
                onChange={() => handleCheckboxChange('section3')}
              >
                <p>I authorize Comicraft to list my minted NFT on the following marketplaces: (a) Comicraft Bazaar (internal marketplace), and (b) OpenSea (external marketplace via cross-platform distribution).</p>
                <p>I understand that marketplace listings are subject to each platform's respective terms of service and community guidelines.</p>
                <p>I acknowledge that I may delist my NFT from any marketplace at any time, but this does not affect the underlying blockchain record.</p>
              </Section>

              <Section 
                id="section4" 
                title="4. Royalty Structure & Earnings" 
                icon={<Award />}
                checked={checkboxes.section4}
                onChange={() => handleCheckboxChange('section4')}
              >
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                  <label className="text-sm font-semibold flex items-center justify-between mb-2">
                    Creator Royalty for Secondary Sales: <span className="text-amber-400 font-mono text-lg">{royaltyPercentage}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="15" step="0.5" 
                    value={royaltyPercentage} 
                    onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-neutral-800 rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1 px-1">
                    <span>0%</span><span>Max 15%</span>
                  </div>
                </div>
                <p>I agree to the selected creator royalty structure. The Comicraft Platform Fee is fixed at 2.5% of secondary sales.</p>
                <p>I understand that on-chain royalty enforcement varies by marketplace. Comicraft strictly enforces royalties on the Bazaar. External marketplaces (like OpenSea) may treat royalties as optional based on their policies.</p>
              </Section>

              <Section 
                id="section5" 
                title="5. Content Licensing Terms" 
                icon={<FileText />}
                checked={checkboxes.section5}
                onChange={() => handleCheckboxChange('section5')}
              >
                <p>I retain full copyright ownership of my original work. Minting an NFT does not transfer copyright.</p>
                <p>I grant Comicraft a non-exclusive, worldwide license to display, promote, and distribute my content within the Comicraft platform, associated marketplaces, and marketing materials.</p>
                <p>NFT purchasers receive a personal, non-commercial display license unless a separate commercial license is negotiated through the IP Licensing Marketplace.</p>
              </Section>

              <Section 
                id="section6" 
                title="6. Platform Liability Limitation" 
                icon={<AlertTriangle />}
                checked={checkboxes.section6}
                onChange={() => handleCheckboxChange('section6')}
              >
                <p>Comicraft provides automated tools for creation, compliance scanning, and minting. Comicraft does not guarantee the legal validity, originality, or market value of any minted content.</p>
                <p>Comicraft is not liable for: (a) losses due to blockchain network issues, smart contract bugs, or wallet compromises; (b) third-party IP claims arising from creator-submitted content; (c) fluctuations in NFT market value; (d) actions taken by external marketplaces regarding listed content.</p>
                <p>I agree to indemnify and hold harmless Comicraft, its affiliates, and its agents from any claims, damages, or expenses arising from my content or my breach of these terms.</p>
              </Section>

              <Section 
                id="section7" 
                title="7. Dispute Resolution" 
                icon={<Scale />}
                checked={checkboxes.section7}
                onChange={() => handleCheckboxChange('section7')}
              >
                <p>Any disputes arising from this agreement shall be resolved through binding arbitration under applicable jurisdictional rules.</p>
                <p>I acknowledge that KAVACH compliance results, blockchain records, and platform logs may be used as evidence in any dispute proceedings.</p>
              </Section>

              <Section 
                id="section8" 
                title="8. Data & Privacy" 
                icon={<Lock />}
                checked={checkboxes.section8}
                onChange={() => handleCheckboxChange('section8')}
              >
                <p>I consent to Comicraft storing my content, metadata, wallet address, and transaction history as necessary for platform operations.</p>
                <p>My content fingerprint (generated during KAVACH compliance) will be stored permanently for provenance verification.</p>
              </Section>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/[0.08]">
               <label className="flex items-start gap-4 cursor-pointer group">
                 <div className="mt-1">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-black"
                     checked={masterChecked}
                     onChange={handleMasterCheckboxChange}
                   />
                 </div>
                 <div>
                   <span className="font-bold text-white group-hover:text-amber-400 transition-colors">Master Consent Agreement</span>
                   <p className="text-sm text-white/60 mt-0.5">I confirm that I have read, understood, and agree to ALL terms above. I am ready to permanently record my work on the blockchain.</p>
                 </div>
               </label>
               
               <button
                 disabled={!allChecked}
                 onClick={handleConsentAndMint}
                 className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] text-white"
               >
                 Sign Terms & Mint NFT <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        ) : (
          // --- MINTING PROGRESS TRACKER ---
          <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-10 text-center shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
             
             <div className="absolute top-0 inset-x-0 h-1 bg-white/5">
                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-amber-500 animate-[shimmer_2s_linear_infinite]" style={{ width: '100%', backgroundSize: '200% 100%' }} />
             </div>

             <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tight font-display">Forging NFT On-Chain</h2>
             
             <div className="max-w-md mx-auto space-y-4 text-left">
                <ProgressStep title="TOS Consent Recorded" status="passed" />
                <ProgressStep title="Constructing JSON Metadata" status={mintProgress?.metadata?.status} />
                <ProgressStep title="Pinning Assets to IPFS" status={mintProgress?.ipfs?.status} />
                <ProgressStep title="Executing Smart Contract Mint" status={mintProgress?.mint?.status} />
                <ProgressStep title="Securing Comicraft Bazaar Listing" status={mintProgress?.bazaar?.status} />
                <ProgressStep title="Distributing API to OpenSea" status={mintProgress?.opensea?.status} />
             </div>

             {mintProgress?.opensea?.status === 'passed' && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                   <div className="w-16 h-16 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                     <CheckCircle className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">Minting Complete!</h3>
                   <p className="text-white/50 mb-6">Your story is officially an NFT and live on the marketplace.</p>
                   
                   <div className="flex justify-center gap-4">
                     <button onClick={() => router.push('/profile/me?tab=nfts')} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-colors">
                       Manage My NFTs
                     </button>
                     <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold flex items-center gap-2 transition-colors">
                       <Share2 className="w-4 h-4" /> Share Listing
                     </button>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components

function Section({ id, title, icon, children, checked, onChange }: any) {
  return (
    <div className={`p-5 rounded-xl border transition-colors ${checked ? 'bg-amber-500/5 border-amber-500/30' : 'bg-neutral-900 border-neutral-800'}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500 focus:ring-offset-neutral-900"
            checked={checked}
            onChange={onChange}
          />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${checked ? 'text-amber-400' : 'text-white'}`}>
            <span className="p-1.5 rounded-md bg-white/5">{React.cloneElement(icon, { className: "w-4 h-4" })}</span>
            {title}
          </h3>
          <div className="text-sm text-neutral-400 leading-relaxed space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ title, status }: { title: string, status?: string }) {
  let icon = <div className="w-5 h-5 rounded-full border-2 border-white/20" />; // pending
  let textColor = 'text-white/30';

  if (status === 'passed') {
    icon = <CheckCircle className="w-5 h-5 text-green-400" />;
    textColor = 'text-green-400';
  } else if (status === 'running') {
    icon = <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />;
    textColor = 'text-white';
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${status === 'running' ? 'bg-white/5 border-white/10' : 'border-transparent'}`}>
      {icon}
      <span className={`font-medium ${textColor}`}>{title}</span>
    </div>
  );
}
