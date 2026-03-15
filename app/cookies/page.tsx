'use client';

import { Github, Cookie, Shield, Settings, Info } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalHeader from '@/components/LegalHeader';

// Floating GitHub button component
import { FloatingGithub } from '../terms/page';

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }}></div>
);

const CookieSection = ({ icon: Icon, title, children }: any) => (
  <Card className="mb-8 border-[3px] border-black shadow-[6px_6px_0_0_#000] rounded-none bg-white">
    <CardHeader className="flex flex-row items-center space-x-4 border-b-[3px] border-black bg-white text-black py-4">
      <div className="p-2 border-[3px] border-black bg-[#EEDFCA] shadow-[3px_3px_0_0_#000]">
        <Icon className="w-6 h-6 text-black" />
      </div>
      <CardTitle className="font-black uppercase tracking-widest text-xl m-0">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 pt-6 text-black font-medium">{children}</CardContent>
  </Card>
);

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <CookieSection icon={Info} title="What Are Cookies?">
            <p>
              Cookies are small text files that are placed on your device when
              you visit our website. They help us provide you with a better
              experience by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remembering your preferences and settings</li>
              <li>Keeping you signed in to your account</li>
              <li>Understanding how you use our platform</li>
              <li>Improving our services based on your behavior</li>
            </ul>
          </CookieSection>

          <CookieSection icon={Cookie} title="Types of Cookies We Use">
            <h3 className="text-lg font-semibold">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to properly. They
              enable core functionality such as security, network management,
              and accessibility. You cannot opt out of these cookies.
            </p>

            <h3 className="text-lg font-semibold mt-4">Performance Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. They
              help us improve our platform.
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Functionality Cookies
            </h3>
            <p>
              These cookies enable enhanced functionality and personalization.
              They may be set by us or by third-party providers whose services
              we have added to our pages.
            </p>

            <h3 className="text-lg font-semibold mt-4">Targeting Cookies</h3>
            <p>
              These cookies may be set through our site by our advertising
              partners. They may be used by those companies to build a profile
              of your interests and show you relevant advertisements on other
              sites.
            </p>
          </CookieSection>

          <CookieSection icon={Shield} title="How We Protect Your Data">
            <p>
              We take the protection of your data seriously. Our cookies are
              encrypted and we follow industry best practices for data security.
              We never sell your personal information collected through cookies.
            </p>
            <p className="mt-2">
              For more information about how we protect your data, please read
              our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CookieSection>

          <CookieSection
            icon={Settings}
            title="Managing Your Cookie Preferences"
          >
            <h3 className="text-lg font-black uppercase text-black pt-4 border-t-[3px] border-black/10">Browser Settings</h3>
            <p>
              You can control and/or delete cookies as you wish. You can delete
              all cookies that are already on your computer and you can set most
              browsers to prevent them from being placed.
            </p>

            <div className="mt-4 space-y-4">
              <p className="text-lg font-black uppercase text-black pt-2">
                How to manage cookies in your browser:
              </p>

              <div className="space-y-2">
                <p>
                  <span className="font-black uppercase text-black">Chrome:</span> Settings {'->'}{' '}
                  Privacy and security {'->'} Cookies and other site data
                </p>
                <p>
                  <span className="font-black uppercase text-black">Firefox:</span> Options {'->'}{' '}
                  Privacy & Security {'->'} Cookies and Site Data
                </p>
                <p>
                  <span className="font-black uppercase text-black">Safari:</span> Preferences{' '}
                  {'->'} Privacy {'->'} Cookies and website data
                </p>
                <p>
                  <span className="font-black uppercase text-black">Edge:</span> Settings {'->'}{' '}
                  Cookies and site permissions {'->'} Cookies and site data
                </p>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Button className="w-full sm:w-auto bg-[#cc3333] hover:bg-black text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none font-black uppercase tracking-wide rounded-none transition-all">
                Update Cookie Preferences
              </Button>
            </div>
          </CookieSection>

          <div className="text-center font-bold text-black border-[3px] border-black bg-white p-6 shadow-[4px_4px_0_0_#000] mt-12">
            <p className="uppercase tracking-wide text-sm">
              For questions about our Cookie Policy, please{' '}
              <Link href="/contact" className="text-[#cc3333] hover:underline hover:text-black transition-colors underline-offset-4 font-black">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
