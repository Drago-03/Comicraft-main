'use client';

import React from 'react';
import { Search, MessageSquare } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-[1400px] mx-auto min-h-screen">

      {/* ── Left Sidebar ── */}
      <aside className="col-span-1 lg:col-span-3 xl:col-span-2 flex flex-col space-y-8 pb-10">
        {/* Nav sections */}
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
          <h3 className="text-[10px] font-black text-black/50 tracking-widest uppercase mb-4 border-b-2 border-black pb-2">
            Community
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center text-[#cc3333] font-black cursor-pointer uppercase tracking-wide text-xs">
              <span className="w-2 h-2 bg-[#cc3333] mr-3 border border-black"></span>
              General Discussion
            </li>
            {['Lore Proposals', 'Technical Support', 'Feedback Loop'].map(label => (
              <li key={label} className="flex items-center text-black/60 hover:text-black font-bold cursor-pointer transition-colors text-xs uppercase tracking-wide">
                <span className="w-2 h-2 border-2 border-black mr-3"></span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Trending Tags */}
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
          <h3 className="text-[10px] font-black text-black/50 tracking-widest uppercase mb-4 border-b-2 border-black pb-2">
            Trending Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {['#Defragmentation', '#ManaCircuits', '#Web3Writing', '#AICharacter'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white text-black text-[10px] font-black border-2 border-black hover:bg-[#cc3333] hover:text-white cursor-pointer transition-colors shadow-[2px_2px_0_0_#000] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* DAO Governance */}
        <div className="bg-[#cc3333] border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase mb-2">
            OMNI GOVERNANCE
          </h3>
          <p className="text-xs text-white/80 font-bold mb-4 leading-relaxed">
            Stake $OMNI tokens to vote on community-driven multiverses and story directions.
          </p>
          <button className="w-full py-2 bg-white hover:bg-black hover:text-white text-black text-xs font-black border-[2px] border-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer">
            Enter DAO Governance
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="col-span-1 lg:col-span-6 xl:col-span-7 flex flex-col pb-10 border-l-[3px] border-r-[3px] border-black px-0 lg:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black bg-[#cc3333] shadow-[3px_3px_0_0_#000] text-[10px] font-black text-white uppercase tracking-widest mb-3">
              Commons
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black mb-2" style={{ WebkitTextStroke: '1px black' }}>
              COMMONS <span className="text-[#cc3333]">LOUNGE</span>
            </h1>
            <p className="text-sm font-bold text-black/60 hidden xl:block">
              Discuss lore, propose new multiverses, and collaborate<br />with creators across the Omni-Verse.
            </p>
            <p className="text-sm font-bold text-black/60 xl:hidden">
              Discuss lore, propose new multiverses, and collaborate with creators across the Omni-Verse.
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search threads or creators..."
              className="w-full bg-white border-[3px] border-black text-sm text-black font-bold py-2 pl-10 pr-4 focus:outline-none focus:border-[#cc3333] shadow-[2px_2px_0_0_#000] placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Active Multiverses */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="w-2 h-7 bg-[#cc3333] mr-3"></div>
            <h2 className="text-xl font-black uppercase text-black tracking-tight">Active Multiverses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=400&fit=crop',
                alt: 'Cyberpunk',
                genre: 'CYBERPUNK',
                level: 'LEVEL 4',
                genreColor: '#457b9d',
                title: 'Neon Shinjuku 2099',
                desc: 'A high-tech low-life setting where decentralized AIs...',
                active: '1.2k Active',
                avatars: ['#457b9d', '#6c3fc5', '#cc3333'],
                letters: ['A', 'B', 'C'],
              },
              {
                img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&fit=crop',
                alt: 'Fantasy',
                genre: 'FANTASY',
                level: 'LEVEL 2',
                genreColor: '#cc3333',
                title: 'Ether Gardens',
                desc: 'Floating botanical islands governed by mana-...',
                active: '850 Active',
                avatars: ['#d97706', '#6c3fc5'],
                letters: ['D', 'E'],
              },
              {
                img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&fit=crop',
                alt: 'Post-Apoc',
                genre: 'POST-APOC',
                level: 'HARDCORE',
                genreColor: '#92400e',
                title: 'Iron Wasteland',
                desc: 'Survival in the wreckage of a massive server-far...',
                active: '2.4k Active',
                avatars: ['#f97316', '#ec4899'],
                letters: ['F', 'G'],
              },
            ].map((card) => (
              <div key={card.title} className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 overflow-hidden group cursor-pointer transition-all">
                <div className="h-32 relative overflow-hidden">
                  <img src={card.img} alt={card.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-black text-white border-[2px] border-white uppercase" style={{ backgroundColor: card.genreColor }}>{card.genre}</span>
                    <span className="px-2 py-0.5 text-[10px] font-black text-white bg-black border-[2px] border-white uppercase">{card.level}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-black font-black text-sm mb-2 uppercase">{card.title}</h3>
                  <p className="text-xs text-black/60 font-bold mb-4 line-clamp-2">{card.desc}</p>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                    <div className="flex -space-x-2">
                      {card.avatars.map((color, i) => (
                        <div key={i} className="w-6 h-6 flex items-center justify-center text-[10px] text-white border-2 border-white font-black" style={{ backgroundColor: color }}>{card.letters[i]}</div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-black/50 uppercase">{card.active}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Threads */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-2 h-7 bg-[#cc3333] mr-3"></div>
              <h2 className="text-xl font-black uppercase text-black tracking-tight">Trending Threads</h2>
            </div>
            <button className="text-xs font-black text-[#cc3333] hover:text-black border-[2px] border-[#cc3333] hover:border-black hover:bg-[#cc3333]/10 px-3 py-1 transition-all uppercase tracking-wide">
              Start New Thread +
            </button>
          </div>

          <div className="space-y-4">
            {[
              { votes: 42, voteColor: '#cc3333', title: "Should we integrate 'Cyber-Toxins' into the Neon Shinjuku lore?", tag: 'Lore Proposal', author: 'Chronos_X', authorColor: '#cc3333', time: '2 hours ago', replies: 124 },
              { votes: 156, voteColor: '#457b9d', title: 'Weekly Creator Spotlight: Meet the architect of Iron Wasteland', tag: 'Events', author: 'OMNI_Mod', authorColor: '#cc3333', time: '6 hours ago', replies: 56 },
              { votes: 89, voteColor: '#cc3333', title: 'New AI Model update - Better prompt handling for character creation', tag: 'Updates', author: 'DevTeam', authorColor: '#cc3333', time: '1 day ago', replies: 312 },
            ].map((thread, i) => (
              <div key={i} className="bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:-translate-y-0.5 p-4 flex gap-4 cursor-pointer transition-all items-center">
                <div className="flex flex-col items-center justify-center text-center pl-2 pr-6 border-r-[3px] border-black min-w-20">
                  <span className="font-black text-xl" style={{ color: thread.voteColor }}>{thread.votes}</span>
                  <span className="text-[9px] text-black/50 uppercase tracking-widest mt-1 font-black">Votes</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-black mb-2 leading-tight uppercase">{thread.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 bg-white text-black text-[10px] font-black border-2 border-black uppercase">{thread.tag}</span>
                    <span className="text-[10px] text-black/50 font-bold">By <span className="font-black cursor-pointer hover:underline" style={{ color: thread.authorColor }}>{thread.author}</span> • {thread.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-black/50">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-black">{thread.replies}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8 text-sm">
            {[1, 2, 3].map((n) => (
              <button key={n} className={`w-8 h-8 border-[3px] border-black font-black flex items-center justify-center transition-all shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 ${n === 2 ? 'bg-[#cc3333] text-white' : 'bg-white text-black hover:bg-[#cc3333] hover:text-white'}`}>{n}</button>
            ))}
            <span className="text-black/50 font-black tracking-wider">...</span>
            <button className="w-8 h-8 border-[3px] border-black bg-white font-black flex items-center justify-center shadow-[2px_2px_0_0_#000] hover:bg-[#cc3333] hover:text-white transition-all">12</button>
          </div>
        </div>
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="col-span-1 lg:col-span-3 xl:col-span-3 flex flex-col space-y-8 pb-10">

        {/* Top Contributors */}
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
          <h3 className="text-[10px] font-black text-black/50 tracking-widest uppercase mb-4 border-b-2 border-black pb-2">
            Top Contributors
          </h3>
          <div className="space-y-4">
            {[
              { letter: 'J', name: 'Jade_Wanderer', pts: '2,450 Lore Pts', lvl: 'Lvl 12', color: '#cc3333' },
              { letter: 'K', name: 'Kaelen_01', pts: '1,920 Lore Pts', lvl: 'Lvl 10', color: '#457b9d' },
              { letter: 'M', name: 'Mystic_Dev', pts: '1,840 Lore Pts', lvl: 'Lvl 9', color: '#6c3fc5' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center font-black text-sm text-white border-[2px] border-black shadow-[2px_2px_0_0_#000]" style={{ backgroundColor: c.color }}>
                    {c.letter}
                  </div>
                  <div>
                    <div className="text-xs font-black text-black uppercase">{c.name}</div>
                    <div className="text-[10px] text-black/50 font-bold">{c.pts}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 border-[2px] border-black bg-[#cc3333] text-[10px] font-black text-white uppercase shadow-[1px_1px_0_0_#000]">{c.lvl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Omni Statistics */}
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5">
          <h3 className="text-[10px] font-black text-black/50 tracking-widest uppercase mb-4 border-b-2 border-black pb-2">
            Omni Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Multiverses', value: '1,429' },
              { label: 'Active Writers', value: '42.5k' },
              { label: 'Market Vol.', value: '$1.2M' },
              { label: 'DAU', value: '8.9k' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#EEDFCA] border-[2px] border-black p-3 shadow-[2px_2px_0_0_#000]">
                <div className="text-[9px] text-black/50 uppercase tracking-widest mb-1 font-black">{stat.label}</div>
                <div className="text-lg font-black text-black">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Join the Guild */}
        <div className="bg-[#cc3333] border-[3px] border-black shadow-[4px_4px_0_0_#000] p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '6px 6px' }}></div>
          <h3 className="text-lg font-black italic uppercase text-white mb-2 relative z-10" style={{ WebkitTextStroke: '0.5px black' }}>Join the Guild</h3>
          <p className="text-xs mb-6 font-bold text-white/80 relative z-10 leading-relaxed">
            Collaborate with experts to build massive persistent worlds.
          </p>
          <button className="w-full py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-black border-[2px] border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all uppercase relative z-10 cursor-pointer">
            Find a Guild
          </button>
        </div>

      </aside>
    </div>
  );
}
