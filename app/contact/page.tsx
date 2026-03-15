'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Linkedin,
  Send,
  Hexagon,
  ArrowRight,
  Globe2
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Floating GitHub button component
import { FloatingGithub } from '../terms/page';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const ContactInfo = ({ icon: Icon, title, content, link }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} className="flex items-start space-x-4 p-5 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] transition-transform group">
    <div className="p-3 bg-[#EEDFCA] border-[3px] border-black shadow-[2px_2px_0_0_#000] group-hover:bg-[#cc3333] transition-colors">
      <Icon className="w-6 h-6 text-black group-hover:text-white" />
    </div>
    <div>
      <h3 className="font-black text-black text-sm tracking-widest uppercase mb-1">{title}</h3>
      {link ? (
        <Link href={link} className="text-base font-bold text-black hover:text-[#cc3333] transition-colors hover:underline">
          {content}
        </Link>
      ) : (
        <p className="text-base font-bold text-black">{content}</p>
      )}
    </div>
  </motion.div>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    form.reset();
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#EEDFCA] text-black font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }} />
      <FloatingGithub />

      <div className="container mx-auto px-6 py-24 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] text-xs font-black tracking-widest uppercase text-black mb-6">
            <Globe2 className="w-4 h-4" /> GLOBAL TRANSMISSION
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 relative" style={{ WebkitTextStroke: '1px black' }}>
            Establish <span className="text-[#cc3333]">Contact</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-black/80 leading-relaxed font-bold">
            Whether you have a question about the protocol, need technical engineering support, or want to forge a creative partnership.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-7">
            <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_0_#000] p-8 md:p-12 relative overflow-hidden group rounded-none">
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-16 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#EEDFCA] flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0_0_#000] mb-8 relative">
                      <Send className="w-8 h-8 text-[#cc3333]" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-widest mb-4">Transmission Received</h3>
                    <p className="text-black/70 mb-10 max-w-md mx-auto text-lg font-bold">
                      Your message has been securely anchored into our network. Our specialists will respond shortly.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} className="bg-white hover:bg-[#cc3333] hover:text-white text-black border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none rounded-none px-8 h-12 font-black uppercase tracking-widest transition-all">
                      Initialize New Query
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-8">
                       <h2 className="text-3xl font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Hexagon className="w-6 h-6 text-[#cc3333]" fill="#cc3333" /> Secure Terminal</h2>
                       <p className="text-black/60 font-bold uppercase text-sm">All entries are recorded to the Comicraft support mainframe.</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-black font-black uppercase tracking-widest">Designation</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-white border-[3px] border-black focus-visible:ring-0 focus-visible:border-[#cc3333] h-14 rounded-none text-black placeholder:text-black/40 font-bold shadow-[4px_4px_0_0_#000] transition-colors" />
                              </FormControl>
                              <FormMessage className="text-[#cc3333] font-bold text-sm" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-black font-black uppercase tracking-widest">Network Address (Email)</FormLabel>
                              <FormControl>
                                <Input placeholder="john@domain.com" {...field} className="bg-white border-[3px] border-black focus-visible:ring-0 focus-visible:border-[#cc3333] h-14 rounded-none text-black placeholder:text-black/40 font-bold shadow-[4px_4px_0_0_#000] transition-colors" />
                              </FormControl>
                              <FormMessage className="text-[#cc3333] font-bold text-sm" />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-black uppercase tracking-widest">Query Vector (Subject)</FormLabel>
                            <FormControl>
                              <Input placeholder="What do you need assistance with?" {...field} className="bg-white border-[3px] border-black focus-visible:ring-0 focus-visible:border-[#cc3333] h-14 rounded-none text-black placeholder:text-black/40 font-bold shadow-[4px_4px_0_0_#000] transition-colors" />
                            </FormControl>
                            <FormMessage className="text-[#cc3333] font-bold text-sm" />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="message" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-black uppercase tracking-widest">Data Payload (Message)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Transmit your message here..." className="bg-white border-[3px] border-black focus-visible:ring-0 focus-visible:border-[#cc3333] min-h-[160px] rounded-none text-black placeholder:text-black/40 font-bold shadow-[4px_4px_0_0_#000] transition-colors resize-none p-4" {...field} />
                            </FormControl>
                            <FormMessage className="text-[#cc3333] font-bold text-sm" />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#cc3333] hover:bg-black text-white font-black text-lg uppercase tracking-widest border-[3px] border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none rounded-none transition-all group mt-8">
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">Transmitting <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span>
                          ) : (
                            <span className="flex items-center gap-2 group-hover:gap-4 transition-all">Send Transmission <ArrowRight className="w-6 h-6" /></span>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Information & Socials */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5 flex flex-col gap-8">
             <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_0_#000] rounded-none p-8">
               <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Direct Channels</h3>
               <div className="space-y-6">
                  <ContactInfo icon={Mail} title="Support Node" content="mantejarora@gmail.com" link="mailto:mantejarora@gmail.com" />
                  <ContactInfo icon={MessageSquare} title="Live Interface" content="24/7 Premium Relay" />
                  <ContactInfo icon={Phone} title="Voice Comm" content="+91-1234567890" link="tel:+911234567890" />
                  <ContactInfo icon={MapPin} title="Physical Core" content="Indie Hub HQ, India" />
               </div>
             </div>

             <div className="bg-[#cc3333] border-[3px] border-black shadow-[8px_8px_0_0_#000] rounded-none p-8 text-white relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] pointer-events-none" />
               <h3 className="text-2xl font-black uppercase tracking-widest mb-6 relative z-10">Network Links</h3>
               <div className="grid grid-cols-2 gap-4 relative z-10">
                 <Button className="h-14 bg-white hover:bg-black text-black hover:text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none rounded-none transition-all font-black uppercase" asChild>
                   <Link href="https://github.com/Drago-03/" target="_blank">
                     <Github className="w-5 h-5 mr-2" /> GitHub
                   </Link>
                 </Button>
                 <Button className="h-14 bg-white hover:bg-[#0077b5] text-black hover:text-white border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none rounded-none transition-all font-black uppercase" asChild>
                   <Link href="https://www.linkedin.com/in/mantej-singh-arora/" target="_blank">
                     <Linkedin className="w-5 h-5 mr-2" /> LinkedIn
                   </Link>
                 </Button>
               </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
