'use client';

import React, { useState } from 'react';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      message: '',
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#EEDFCA] flex items-center justify-center px-4 py-28 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '8px 8px', opacity: 0.05 }} />
      
      <div className="w-full max-w-xl bg-white border-[3px] border-black p-8 rounded-none shadow-[8px_8px_0_0_#000] relative z-10">
        <h1
          className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black text-center mb-8"
          style={{ WebkitTextStroke: '1px black' }}
        >
          Share Your <span className="text-[#cc3333]">Feedback</span>
        </h1>
        {submitted && (
          <div
            className="mb-6 p-4 rounded-none border-[3px] border-black 
          bg-[#cc3333] text-white
          font-black tracking-widest text-center uppercase animate-fade-in shadow-[4px_4px_0_0_#000]"
          >
            Thank You! Your Feedback Has Been Submitted.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Your Name (Optional)"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 rounded-none bg-white border-[3px] border-black focus:outline-none focus:border-[#cc3333] shadow-[4px_4px_0_0_#000] text-black font-bold placeholder:text-black/40 transition-colors"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email (Optional)"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-none bg-white border-[3px] border-black focus:outline-none focus:border-[#cc3333] shadow-[4px_4px_0_0_#000] text-black font-bold placeholder:text-black/40 transition-colors"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full p-4 rounded-none bg-white border-[3px] border-black focus:outline-none focus:border-[#cc3333] shadow-[4px_4px_0_0_#000] text-black font-bold placeholder:text-black/40 transition-colors resize-none"
          />

          <button
            type="submit"
            className="w-full py-5 text-xl font-black uppercase tracking-widest
            rounded-none border-[3px] border-black 
            bg-[#EEDFCA] text-black hover:bg-[#cc3333] hover:text-white
            shadow-[6px_6px_0_0_#000]
            active:translate-y-1 active:shadow-none
            transition-all duration-300 mt-4"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
