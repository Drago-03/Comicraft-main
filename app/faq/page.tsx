'use client';

import {
  HelpCircle,
  Wallet,
  BookOpen,
  Coins,
  Shield,
  Users,
  PenSquare,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Floating GitHub button component
import { FloatingGithub } from '../terms/page';

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEDFCA] flex items-center justify-center font-black uppercase text-2xl">Loading FAQ page...</div>}>
      <FAQContent />
    </Suspense>
  );
}
function FAQContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('category') || 'general'
  );

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', value);
    // Preserve the FAQ item if it exists
    const faqItem = searchParams.get('faq');
    if (faqItem) {
      params.set('faq', faqItem);
    }
    router.push(`/faq?${params.toString()}`);
  };

  // Handle direct links to specific FAQ items
  useEffect(() => {
    const faqItem = searchParams.get('faq');
    const category = searchParams.get('category');

    if (category) {
      setActiveTab(category);
    }
    if (faqItem) {
      setTimeout(() => {
        const element = document.getElementById(faqItem);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          const accordionTrigger = element.querySelector(
            '[data-state]'
          ) as HTMLElement;
          if (
            accordionTrigger &&
            accordionTrigger.getAttribute('data-state') === 'closed'
          ) {
            accordionTrigger.click();
          }
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [searchParams]);

  // Handle link clicks
  const handleLinkClick = (category: string, faqItem: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('faq', faqItem);
    router.push(`/faq?${params.toString()}`);
  };

  const tabs = [
    { value: 'general', icon: HelpCircle, label: 'General Questions' },
    { value: 'wallet', icon: Wallet, label: 'Wallet & NFTs' },
    { value: 'stories', icon: BookOpen, label: 'Stories' },
    { value: 'creators', icon: PenSquare, label: 'Creators' },
    { value: 'community', icon: Users, label: 'Community' },
    { value: 'troubleshooting', icon: Shield, label: 'Troubleshooting' },
  ];

  return (
    <div className="min-h-screen bg-[#EEDFCA] relative py-12">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }} />
      <FloatingGithub />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 mt-8">
          <div className="w-20 h-20 bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] mx-auto mb-6 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
            <HelpCircle className="w-10 h-10 text-[#cc3333]" strokeWidth={3} />
          </div>
          <h1
            className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-black mb-4"
            style={{ WebkitTextStroke: '1px black' }}
          >
            Frequently Asked <span className="text-[#cc3333]">Questions</span>
          </h1>
          <p className="text-black/70 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto">
            Find answers to common questions about Comicraft, from getting
            started to advanced features.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12 bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-6 text-center">
          <h2 className="text-xl font-black uppercase tracking-widest text-black mb-4">Quick Links</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleLinkClick('wallet', 'what-is-wallet')}
              className="text-sm font-bold uppercase tracking-widest text-[#cc3333] hover:text-black hover:underline transition-colors"
            >
              What is a Web3 wallet?
            </button>
            <span className="text-black/20">|</span>
            <button
              onClick={() => handleLinkClick('stories', 'story-types')}
              className="text-sm font-bold uppercase tracking-widest text-[#cc3333] hover:text-black hover:underline transition-colors"
            >
              Types of stories
            </button>
            <span className="text-black/20">|</span>
            <button
              onClick={() => handleLinkClick('creators', 'become-creator')}
              className="text-sm font-bold uppercase tracking-widest text-[#cc3333] hover:text-black hover:underline transition-colors"
            >
              Become a creator
            </button>
          </div>
        </div>

        {/* FAQ Categories / Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex items-center gap-2 px-5 py-3 font-black uppercase tracking-widest text-sm transition-all border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none ${
                activeTab === tab.value
                  ? "bg-[#cc3333] text-white"
                  : "bg-white text-black hover:bg-[#EEDFCA]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_0_#000] p-6 md:p-10 mb-16">
          {/* General FAQs */}
          {activeTab === 'general' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">General Questions</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Basic information about Comicraft</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="what-is-comicraft" id="what-is-comicraft" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What is Comicraft?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Comicraft is a Web3-enabled storytelling platform that
                    combines creative writing with blockchain technology. It
                    allows writers to create, share, and monetize their
                    stories through NFTs while building a community of readers
                    and fellow creators.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-to-start" id="how-to-start" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How do I get started?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    You can start by browsing stories without an account. To
                    create or interact with stories, you'll need to connect a
                    Web3 wallet like MetaMask. Once connected, you can create
                    your profile, write stories, and participate in the
                    community.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="is-it-free" id="is-it-free" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">Is Comicraft free to use?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Basic features like reading public stories and browsing
                    the platform are free. Creating and minting NFT stories
                    may involve gas fees on the blockchain. Some premium
                    features or exclusive content might require payment or
                    token ownership.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Wallet & NFTs FAQs */}
          {activeTab === 'wallet' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Wallet & NFTs</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Questions about Web3 wallets and NFT stories</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="what-is-wallet" id="what-is-wallet" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What is a Web3 wallet and why do I need one?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    A Web3 wallet like MetaMask is your digital identity on
                    the blockchain. It's needed to authenticate your account,
                    own NFT stories, and participate in transactions. Think of
                    it as your key to the Web3 features of Comicraft.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="supported-networks" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">Which networks are supported?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Comicraft currently supports Ethereum Mainnet and Polygon.
                    We chose these networks for their security, widespread
                    adoption, and reasonable transaction costs. More networks
                    may be added in the future.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="nft-ownership" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What does owning an NFT story mean?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    When you own an NFT story, you have verifiable ownership
                    of that digital content on the blockchain. This can
                    include special access rights, the ability to resell the
                    story, and participation in the story's community. The
                    specific rights are detailed in each NFT's description.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Stories FAQs */}
          {activeTab === 'stories' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Stories</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Information about reading and creating stories</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="story-types" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What types of stories can I create?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    You can create stories in various genres including Science
                    Fiction, Fantasy, Romance, Mystery, and more. Stories can
                    be traditional text-based narratives, interactive stories,
                    or multimedia experiences combining text with images and
                    audio.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="story-rights" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">Who owns the rights to my stories?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    You retain the intellectual property rights to your
                    stories. When you mint a story as an NFT, you're creating
                    a digital certificate of ownership that can be traded, but
                    the underlying creative rights remain with you unless
                    explicitly transferred.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="monetization" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How can I monetize my stories?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    There are several ways to monetize your stories on
                    Comicraft: 1. Mint them as NFTs for direct sales 2. Earn
                    royalties from secondary sales 3. Create premium content
                    for subscribers 4. Participate in writing contests and
                    challenges 5. Receive tips from readers
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Creators FAQs */}
          {activeTab === 'creators' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Creators</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Information for story creators and writers</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="become-creator" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How do I become a creator?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    To become a creator: 1. Connect your Web3 wallet 2.
                    Complete your creator profile 3. Pass the creator
                    verification process 4. Start creating and publishing
                    stories The verification process helps maintain quality
                    and prevent spam.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="creator-tools" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What tools are available for creators?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Comicraft provides several tools for creators: - Rich text
                    editor with formatting options - AI-assisted writing and
                    editing tools - Cover image generation - Analytics
                    dashboard - Community engagement tools - NFT minting
                    interface
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="revenue-share" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How does revenue sharing work?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Creators receive 90% of primary sales and can set their
                    own royalty percentage (up to 10%) for secondary sales.
                    Platform fees are 10% on primary sales to maintain and
                    improve the platform. All transactions are handled
                    automatically through smart contracts.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Community FAQs */}
          {activeTab === 'community' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Community</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Questions about community participation and interaction</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="interaction" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How can I interact with other users?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    You can interact through: - Comments on stories - Direct
                    messages to creators - Community forums - Writing
                    challenges and contests - Collaborative story projects -
                    Social features like following and sharing
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="reporting" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">How do I report inappropriate content?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Use the "Report" button on any content to flag it for
                    review. Our moderation team will investigate all reports
                    within 24 hours. You can also contact support directly for
                    urgent concerns. We take community safety seriously and
                    have zero tolerance for harmful content.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="community-guidelines" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What are the community guidelines?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Our community guidelines ensure a safe and creative
                    environment: - Respect intellectual property rights - No
                    hate speech or harassment - No plagiarism -
                    Age-appropriate content only - Constructive feedback
                    Violations may result in account suspension.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Troubleshooting FAQs */}
          {activeTab === 'troubleshooting' && (
            <div>
              <div className="mb-8 border-b-[3px] border-black pb-4">
                <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Troubleshooting</h2>
                <p className="font-bold text-black/60 uppercase text-sm">Common technical issues and solutions</p>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="wallet-not-connecting" id="wallet-not-connecting" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What should I do if my wallet doesn’t connect?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Ensure your wallet extension is installed and unlocked.
                    Confirm you are on a supported network and refresh the page.
                    If the issue persists, clear browser cache or try another browser.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="transaction-pending" id="transaction-pending" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">Why is my transaction pending?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Transactions may remain pending due to network congestion or low gas fees.
                    You can speed up the transaction from your wallet interface or wait for confirmation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="mint-failed" id="mint-failed" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">What if my NFT minting fails?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    Minting may fail due to insufficient balance or incorrect network.
                    Ensure you have enough funds for gas and are connected to the correct network.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="profile-not-loading" id="profile-not-loading" className="border-[3px] border-black bg-[#EEDFCA] shadow-[4px_4px_0_0_#000] px-4 group data-[state=open]:bg-white">
                  <AccordionTrigger className="font-black uppercase tracking-widest text-lg hover:no-underline [&[data-state=open]>svg]:rotate-180 py-4">
                    <span className="text-left flex-1 group-data-[state=open]:text-[#cc3333]">Why is my profile not loading?</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-bold text-black/80 pb-6 pt-2 text-base leading-relaxed border-t-[3px] border-black/10">
                    This can occur due to temporary backend issues.
                    Try refreshing the page or reconnecting your wallet.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 text-center bg-[#1a1a1a] border-[3px] border-black shadow-[8px_8px_0_0_#E63946] p-10 text-white relative flex flex-col items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946] blur-[60px] opacity-20 pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Still Need Help?</h2>
            <p className="text-white/70 font-bold mb-8 uppercase text-sm max-w-lg">
              Can't find the answer you're looking for? Our support team is
              here to help you decode the issue.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#E63946] hover:bg-white text-white hover:text-black border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-widest transition-all"
              >
                Contact Support
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 bg-white hover:bg-[#EEDFCA] text-black border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-widest transition-all"
              >
                View Documentation
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
