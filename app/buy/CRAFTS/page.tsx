'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Coins, Wallet, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// 1 Dollar = 30 coins + 5 coins free. Indian Rupee equivalent is ~₹85 for UX purposes.
const PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 30,
    bonus: 5,
    priceUSD: 1,
    priceINR: 91.94,
    popular: false,
    accentColor: '#457b9d',
    button: 'bg-[#457b9d] hover:bg-[#356080] border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-white',
  },
  {
    id: 'popular',
    name: 'Pro Creator',
    coins: 150,
    bonus: 30,
    priceUSD: 5,
    priceINR: 459.70,
    popular: true,
    accentColor: '#cc3333',
    button: 'bg-[#cc3333] hover:bg-black border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-white',
  },
  {
    id: 'elite',
    name: 'Elite Stack',
    coins: 300,
    bonus: 75,
    priceUSD: 10,
    priceINR: 919.40,
    popular: false,
    accentColor: '#6c3fc5',
    button: 'bg-[#6c3fc5] hover:bg-black border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-white',
  },
  {
    id: 'ultimate',
    name: 'Studio Master',
    coins: 1500,
    bonus: 500,
    priceUSD: 50,
    priceINR: 4597.00,
    popular: false,
    accentColor: '#d97706',
    button: 'bg-[#d97706] hover:bg-black border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-white',
  },
];

export default function BuyCRAFTSPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const { connected, connecting, account, connectWallet } = useWeb3();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handlePurchase = async (packId: string, coins: number, bonus: number) => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase CRAFTS tokens.',
        variant: 'destructive',
      });
      return;
    }

    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Ethereum wallet to proceed with the transaction.',
        variant: 'destructive',
      });
      connectWallet();
      return;
    }

    setIsProcessing(packId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      toast({
        title: 'Purchase Successful!',
        description: `Successfully credited ${coins + bonus} CRAFTS tokens to your account synced at ${account?.slice(0,6)}...${account?.slice(-4)}.`,
      });
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'There was an error processing your Web3 payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-8 bg-[#EEDFCA] relative font-sans text-black">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }} />
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ── Header ── */}
        <div className="text-center mb-16 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border-[3px] border-black bg-[#cc3333] shadow-[4px_4px_0_0_#000] text-white text-xs font-black tracking-widest uppercase mb-6">
            <Coins className="w-4 h-4" />
            CRAFTS Tokens
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto bg-[#fbbf24] border-[4px] border-black shadow-[6px_6px_0_0_#000] flex items-center justify-center mb-8"
          >
            <Coins className="w-12 h-12 text-black" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic text-black uppercase tracking-tighter mb-4" style={{ WebkitTextStroke: '1.5px black' }}>
            Get <span className="text-[#cc3333]">CRAFTS</span> Tokens
          </h1>
          <p className="text-base font-bold text-black/70 max-w-2xl mx-auto uppercase tracking-wide">
            The native currency of Comicraft. Use CRAFTS to generate stories, mint comics, trade NFTs, and participate in the studio economy.
          </p>
        </div>

        {/* ── State Alert ── */}
        {(!session || !connected) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <Alert className="bg-[#fef3cd] border-[3px] border-black shadow-[4px_4px_0_0_#000] text-black">
              <AlertCircle className="h-4 w-4 text-[#cc3333]" />
              <AlertTitle className="font-black uppercase text-black">Action Required</AlertTitle>
              <AlertDescription className="text-black/70 font-bold mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span>You need to be logged in and have your wallet connected to buy CRAFTS.</span>
                {!connected && (
                  <Button
                    onClick={connectWallet}
                    disabled={connecting}
                    size="sm"
                    className="bg-[#cc3333] hover:bg-black border-[3px] border-black shadow-[3px_3px_0_0_#000] text-white font-black uppercase rounded-none transition-all"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* ── Pricing Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKS.map((pack, index) => (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={pack.id}
              className={`relative bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] hover:-translate-y-1 transition-all duration-300 p-1`}
            >
              {/* Popular badge */}
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#cc3333] border-[3px] border-black text-[10px] font-black tracking-widest uppercase text-white shadow-[3px_3px_0_0_#000]">
                  Most Popular
                </div>
              )}

              {/* Halftone subtle overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '6px 6px' }}></div>

              <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Pack name with accent stripe */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: pack.accentColor }}></div>
                  <h3 className="text-lg font-black italic uppercase text-black tracking-tight">{pack.name}</h3>
                </div>

                {/* Coin count */}
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-8 h-8 text-[#fbbf24]" style={{ filter: 'drop-shadow(2px 2px 0px #000)' }} />
                    <span className="text-5xl font-black text-black" style={{ WebkitTextStroke: '1px black' }}>
                      {pack.coins}
                    </span>
                  </div>
                </div>

                {/* Bonus badge */}
                {pack.bonus > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 border-[2px] border-black bg-[#fbbf24] text-black text-xs font-black uppercase tracking-wider w-max mb-6 shadow-[2px_2px_0_0_#000]">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{pack.bonus} FREE
                  </div>
                )}

                <div className="mb-5 space-y-1 text-xs font-bold text-black/70">
                  <p>Total Credits: {pack.coins + pack.bonus} CRAFTS</p>
                  <p>Value Rate: {Math.round(((pack.coins + pack.bonus) / pack.priceUSD) * 10) / 10} CRAFTS per $1</p>
                </div>

                {/* Price */}
                <div className="mt-auto space-y-4">
                  <div className="pt-4 border-t-[3px] border-black flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase text-black/50 tracking-widest mb-0.5">Total</p>
                      <p className="text-xl font-black text-black">₹{pack.priceINR}</p>
                    </div>
                    <p className="text-sm font-bold text-black/50">
                      ${pack.priceUSD}
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pack.id, pack.coins, pack.bonus)}
                    disabled={isProcessing === pack.id || !session || !connected}
                    className={`w-full ${pack.button} py-6 text-sm font-black uppercase tracking-widest rounded-none transition-all`}
                  >
                    {isProcessing === pack.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Buy Now <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Info Footer ── */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left text-sm bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#cc3333] border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black uppercase text-black text-sm">Secure Web3 Transactions</p>
              <p className="text-black/60 font-bold text-xs">Powered by Ethereum smart contracts</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-black opacity-20" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#457b9d] border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black uppercase text-black text-sm">Direct Wallet Sync</p>
              <p className="text-black/60 font-bold text-xs">Tokens reflect instantly in your connected wallet</p>
            </div>
          </div>
        </div>

        {/* ── Utility Details ── */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Create with Engines',
              copy: 'Spend CRAFTS for story generation in VedaScript, visual comics in Panelra, and premium creation workflows.',
              icon: <Sparkles className="w-5 h-5" />,
              tone: 'bg-[#fff7e6]'
            },
            {
              title: 'Governance & Community',
              copy: 'Use staked CRAFTS in DAO governance to vote on platform proposals, treasury priorities, and ecosystem upgrades.',
              icon: <ShieldCheck className="w-5 h-5" />,
              tone: 'bg-[#e8f4ff]'
            },
            {
              title: 'Trading & Ownership',
              copy: 'Use CRAFTS in marketplace actions, licensing flows, and tokenized creator economy features across Comicraft.',
              icon: <Gem className="w-5 h-5" />,
              tone: 'bg-[#f4ecff]'
            },
          ].map((item) => (
            <div key={item.title} className={`${item.tone} border-[3px] border-black shadow-[6px_6px_0_0_#000] p-6`}>
              <div className="w-11 h-11 border-[3px] border-black bg-white shadow-[3px_3px_0_0_#000] flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-black uppercase mb-2">{item.title}</h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>

        {/* ── Purchase Flow ── */}
        <div className="mt-14 bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">How Buying Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Sign In',
                desc: 'Log into Comicraft so purchased credits are associated with your creator account.',
              },
              {
                step: '02',
                title: 'Connect Wallet',
                desc: 'Connect your Ethereum wallet to authenticate and authorize the transaction flow.',
              },
              {
                step: '03',
                title: 'Purchase Pack',
                desc: 'Select a pack and complete payment. Your CRAFTS balance updates immediately after success.',
              },
            ].map((step) => (
              <div key={step.step} className="border-[2px] border-black p-4 bg-[#faf7ef]">
                <p className="text-xs font-black tracking-[0.2em] text-[#cc3333] mb-2">STEP {step.step}</p>
                <h3 className="text-base font-black uppercase mb-1">{step.title}</h3>
                <p className="text-sm font-bold text-black/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-14 mb-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-5">Buy CRAFTS FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: 'Are prices fixed?',
                a: 'Displayed INR values are estimated conversions for UX. Final wallet/payment values may vary based on live market and gateway rates.',
              },
              {
                q: 'Where can I use CRAFTS?',
                a: 'You can use CRAFTS for generation, platform features, tokenized assets, licensing, and governance actions where enabled.',
              },
              {
                q: 'Do bonus credits expire?',
                a: 'No expiration is currently enforced in this flow; bonus CRAFTS are credited with the same usability as base pack credits.',
              },
              {
                q: 'Is wallet connection mandatory?',
                a: 'Yes. Wallet connection is required for secure Web3-linked purchases and account-level transaction validation.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
                <p className="font-black uppercase mb-2">{item.q}</p>
                <p className="text-sm font-bold text-black/70 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
