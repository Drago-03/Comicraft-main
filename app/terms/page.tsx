'use client';

import { Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LegalHeader from '@/components/LegalHeader';

export const FloatingGithub = () => (
  <Link
    href="https://github.com/Drago-03/Comicraft.git"
    target="_blank"
    className="fixed bottom-28 right-10 p-3 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-all active:translate-y-1 active:shadow-none z-50 group"
  >
    <Github className="w-6 h-6 text-black group-hover:text-white" />
  </Link>
);

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }}></div>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#EEDFCA] relative">
      <FloatingDoodles />
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LegalHeader />
          <h1
            className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black text-center mb-4"
            style={{ WebkitTextStroke: '1px black' }}
          >
            Terms of Service
          </h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-[#cc3333] text-white">
              <CardTitle className="font-black uppercase tracking-widest text-xl">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Comicraft ("the Platform"), you agree to
                be bound by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you
                are prohibited from using or accessing the Platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-blue-600 text-white">
              <CardTitle className="font-black uppercase tracking-widest text-xl">2. Use of Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <h3 className="text-lg font-black uppercase text-black">2.1 Account Creation</h3>
              <p>
                To access certain features of the Platform, you must create an
                account. You agree to provide accurate, current, and complete
                information during registration and to update such information
                to keep it accurate, current, and complete.
              </p>

              <h3 className="text-lg font-black uppercase text-black mt-6">2.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account and password. You agree to accept responsibility for all
                activities that occur under your account.
              </p>

              <h3 className="text-lg font-black uppercase text-black mt-6">2.3 Wallet Integration</h3>
              <p>
                The Platform integrates with Ethereum blockchain wallets. You are
                responsible for all activities conducted through your connected
                wallet and for maintaining its security.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-emerald-500 text-black">
              <CardTitle className="font-black uppercase tracking-widest text-xl">3. Content and NFTs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <h3 className="text-lg font-black uppercase text-black">
                3.1 AI-Generated Content
              </h3>
              <p>
                Stories generated through our Groq AI system are subject to
                certain usage rights. While you own the NFTs you mint, the
                underlying AI model and technology remain the property of their
                respective owners.
              </p>

              <h3 className="text-lg font-black uppercase text-black mt-6">3.2 NFT Ownership</h3>
              <p>
                Purchasing a story NFT grants you ownership of the token on the
                Ethereum blockchain. This ownership is subject to the terms of the
                smart contract and does not necessarily confer copyright or
                other intellectual property rights.
              </p>

              <h3 className="text-lg font-black uppercase text-black mt-6">3.3 Content Guidelines</h3>
              <p>
                Users must not generate, mint, or trade content that is illegal,
                harmful, threatening, abusive, harassing, defamatory, or
                otherwise objectionable.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-[#d97706] text-white">
              <CardTitle className="font-black uppercase tracking-widest text-xl">4. Fees and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <p>
                The Platform charges fees for certain services, including NFT
                minting and trading. All fees are clearly displayed before
                transactions and are non-refundable unless required by law.
              </p>
              <p>
                Transaction fees on the Ethereum blockchain (gas fees) are separate
                from Platform fees and are determined by network conditions.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-purple-600 text-white">
              <CardTitle className="font-black uppercase tracking-widest text-xl">5. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <p>
                We reserve the right to terminate or suspend your account and
                access to the Platform immediately, without prior notice or
                liability, for any reason whatsoever, including without
                limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-[#cc3333] text-white">
              <CardTitle className="font-black uppercase tracking-widest text-xl">6. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <p>
                The Platform is provided "as is" without any warranties,
                expressed or implied. We do not guarantee uninterrupted access
                to the Platform or that it will be free from errors.
              </p>
              <p>
                We are not responsible for any losses or damages arising from
                your use of the Platform, including but not limited to direct,
                indirect, incidental, consequential, or punitive damages.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
            <CardHeader className="border-b-[3px] border-black bg-[#EEDFCA] text-black">
              <CardTitle className="font-black uppercase tracking-widest text-xl">7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-black font-medium">
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes via email or through the
                Platform. Continued use of the Platform after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </CardContent>
          </Card>

          <div className="text-center font-bold text-black border-[3px] border-black bg-white p-6 shadow-[4px_4px_0_0_#000] mt-12">
            <p className="uppercase tracking-wide text-sm">
              For questions about these Terms of Service, please contact us at{' '}
              <Link href="/contact" className="text-[#cc3333] hover:underline hover:text-black transition-colors underline-offset-4 font-black">
                support@comicraft.com
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
