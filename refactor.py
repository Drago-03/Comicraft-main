import sys
path = r'app/community/creators/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Refactor the overall dark theme to light comic theme
c = c.replace('<div className="space-y-8 max-w-5xl mx-auto">', '<div className="min-h-screen bg-[#EEDFCA] relative pt-24 pb-12 px-4 font-sans text-black">\n      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: \'radial-gradient(circle, #000 1.5px, transparent 1.5px)\', backgroundSize: \'8px 8px\', opacity: 0.05 }} />\n      <div className="relative z-10 space-y-8 max-w-5xl mx-auto">')
c = c.replace('</div>\n    </div>\n  );\n}', '</div>\n      </div>\n    </div>\n  );\n}')

# Fix input area
c = c.replace('bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm', 'bg-white border-[3px] border-black p-4 shadow-[6px_6px_0_0_#000] rounded-none')
c = c.replace('text-white/40 group-focus-within:text-red-400', 'text-black/60 group-focus-within:text-[#cc3333]')
c = c.replace('text-white placeholder:text-white/20 transition-all hover:bg-black/70', 'text-black placeholder:text-black/40 font-bold')
c = c.replace('bg-black/50 border-white/10 focus-visible:ring-red-500 rounded-xl', 'bg-white border-[3px] border-black focus-visible:ring-0 focus-visible:border-[#cc3333] rounded-none shadow-[4px_4px_0_0_#000]')
c = c.replace('bg-black/50 border-white/10 focus:ring-red-500 rounded-xl text-white', 'bg-white border-[3px] border-black focus:ring-0 focus:border-[#cc3333] rounded-none text-black font-bold shadow-[4px_4px_0_0_#000]')
c = c.replace('bg-black/90 border-white/10 text-white backdrop-blur-xl', 'bg-white border-[3px] border-black text-black font-bold rounded-none shadow-[6px_6px_0_0_#000]')
c = c.replace('focus:bg-white/10 focus:text-white', 'focus:bg-[#cc3333] focus:text-white')

# Fix tabs
c = c.replace('bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-sm mx-auto max-w-xl', 'bg-white border-[3px] border-black p-2 mx-auto max-w-xl shadow-[6px_6px_0_0_#000] rounded-none')
c = c.replace('data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50', 'data-[state=active]:bg-[#cc3333] data-[state=active]:text-white text-black/60')
c = c.replace('rounded-xl', 'rounded-none')

# Fix cards
c = c.replace('bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 hover:border-red-500/30', 'bg-white border-[3px] border-black rounded-none shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] hover:-translate-y-1 transition-all duration-300')
c = c.replace('border-white/10 hover:border-red-500/40', 'border-black hover:border-[#cc3333]')
c = c.replace('text-white tracking-tight', 'text-black tracking-tight uppercase font-black')
c = c.replace('text-red-400/80', 'text-[#cc3333] font-black')
c = c.replace('text-white/60 mt-3 mb-4', 'text-black/80 font-bold mt-3 mb-4')
c = c.replace('bg-white/5 hover:bg-white/10 text-white/70 border border-white/10', 'bg-[#EEDFCA] border-[2px] border-black text-black shadow-[2px_2px_0_0_#000] uppercase font-black')
c = c.replace('group-hover/avatar:border-red-500/40', 'group-hover/avatar:border-[#cc3333]')

# Stats inside cards
c = c.replace('bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10', 'bg-[#EEDFCA] rounded-none p-3 border-[2px] border-black shadow-[2px_2px_0_0_#000] hover:bg-[#cc3333] border-white/10 group')
c = c.replace('text-white/40 mb-1', 'text-black/60 group-hover:text-white mb-1 font-black uppercase text-[10px]')
c = c.replace('font-bold text-lg text-white', 'font-black text-lg text-black group-hover:text-white')

# Buttons inside cards
c = c.replace('bg-white text-black hover:bg-white/90 font-bold rounded-xl h-11', 'bg-[#cc3333] text-white hover:bg-black font-black uppercase tracking-widest rounded-none border-[3px] border-black shadow-[4px_4px_0_0_#000] h-11 text-xs')
c = c.replace('border-white/10 bg-transparent hover:bg-white/5 text-white font-bold rounded-xl h-11', 'bg-white text-black hover:bg-black hover:text-white font-black uppercase tracking-widest rounded-none border-[3px] border-black shadow-[4px_4px_0_0_#000] h-11 text-xs')

# Find no entities
c = c.replace('bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg mx-auto backdrop-blur-md', 'bg-white border-[3px] border-black rounded-none p-12 max-w-lg mx-auto shadow-[8px_8px_0_0_#000]')
c = c.replace('text-white/40', 'text-black/40')
c = c.replace('text-white/60 mb-8 max-w-sm mx-auto', 'text-black/70 font-bold mb-8 max-w-sm mx-auto')
c = c.replace('bg-white text-black hover:bg-white/90 font-bold px-8 h-12 rounded-xl', 'bg-[#cc3333] text-white hover:bg-black font-black uppercase tracking-widest rounded-none border-[3px] border-black shadow-[4px_4px_0_0_#000] px-8 h-12')

# Ascend ranks section
c = c.replace('border border-white/10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group', 'border-[3px] border-black rounded-none bg-white relative overflow-hidden group shadow-[8px_8px_0_0_#000]')
c = c.replace('bg-white/5 border border-white/10 rounded-2xl mb-6', 'bg-[#EEDFCA] border-[3px] border-black rounded-none mb-6 shadow-[4px_4px_0_0_#000]')
c = c.replace('text-white/60 text-center max-w-2xl text-lg', 'text-black/70 font-bold text-center max-w-2xl text-lg')
c = c.replace('text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center', 'text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-center')

# Bottom cards
c = c.replace('bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10', 'bg-[#EEDFCA] border-[3px] border-black flex flex-col items-center text-center shadow-[4px_4px_0_0_#000] group')
c = c.replace('text-white text-center mb-8', 'text-black text-center mb-8 text-lg font-black')
c = c.replace('text-white/60 leading-relaxed', 'text-black/60 leading-relaxed font-bold')

# Final big button
c = c.replace('bg-white text-black hover:bg-white/90 font-bold text-lg rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all', 'bg-[#cc3333] text-white hover:bg-black font-black uppercase tracking-widest text-sm rounded-none border-[3px] border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all')

c = c.replace("bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500", "hidden")
c = c.replace("bg-gradient-to-r from-red-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl", "hidden")
c = c.replace("absolute inset-0 bg-blue-500/5 blur-3xl rounded-full", "hidden")

# some generic fixes from remaining `text-white`
c = c.replace('text-white', 'text-black')
c = c.replace('text-black tracking-tight', 'text-black tracking-tight uppercase font-black')
# Let's revert `text-white` for `bg-[#cc3333] text-white`
c = c.replace('bg-[#cc3333] text-black', 'bg-[#cc3333] text-white')
c = c.replace('hover:text-black hover:bg-black', 'hover:text-white hover:bg-black')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
