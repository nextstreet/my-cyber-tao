<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl">
    <div class="text-tao-gold text-[10px] tracking-[0.5em] mb-8 font-serif uppercase opacity-50 animate-pulse">
      — NEURAL SCROLL ARCHIVED —
    </div>

    <div class="relative w-full max-w-4xl aspect-video perspective-2000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-all duration-1000 transform-style-3d cursor-pointer shadow-[0_0_60px_rgba(0,0,0,1)]"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-sm border border-cyan-500/30 bg-[#050505] overflow-hidden flex shadow-inner">
          <div class="cyber-grid absolute inset-0 opacity-[0.05]"></div>
          
          <div class="w-1/3 border-r border-cyan-500/20 flex flex-col items-center justify-center p-8 bg-cyan-500/[0.02]">
            <div class="text-[8px] text-cyan-500/40 tracking-[0.4em] mb-8 font-mono uppercase">Neural Signal Detect</div>
            <div class="flex flex-col-reverse gap-3 mb-10">
              <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-32 h-2.5 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <template v-else>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </template>
              </div>
            </div>
            <h1 class="text-3xl font-serif text-cyan-400 tracking-[0.3em] uppercase">{{ hexagramData.name }}</h1>
            <div class="mt-8 text-[8px] text-cyan-500/30 font-mono">NODE: {{ hexagramData.lines?.join('') }}</div>
          </div>

          <div class="w-2/3 p-12 flex flex-col justify-center">
            <div class="space-y-6">
              <div class="w-12 h-px bg-cyan-500/50"></div>
              <p class="text-white/80 font-serif text-lg leading-relaxed italic max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {{ aiPredictionText }}
              </p>
              <div class="flex justify-between items-end pt-8">
                <span class="text-[7px] text-cyan-500/30 font-mono tracking-widest uppercase">SYST: 2.0.4-LUNA</span>
                <span class="text-cyan-500/20 text-[10px] font-mono">ENCRYPTED DATA STREAM</span>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-sm border border-tao-gold/30 bg-[#050505] overflow-hidden flex">
          <div class="absolute inset-0">
            <img :src="beastImageUrl" class="w-full h-full object-cover opacity-50 mix-blend-screen scale-105" />
            <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/80"></div>
          </div>

          <div class="z-10 w-full flex items-center justify-between p-16">
            <div class="flex items-start gap-8">
              <h1 class="text-7xl md:text-8xl font-serif text-tao-gold tracking-[0.2em] font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_20px_rgba(200,170,110,0.6)]">
                {{ hexagramData.nameZh }}
              </h1>
              <div class="w-px h-32 bg-tao-gold/40 mt-4"></div>
              <p class="text-white/90 text-2xl md:text-3xl font-serif tracking-[0.5em] [writing-mode:vertical-rl] leading-relaxed pt-8">
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="flex flex-col items-end justify-between h-full">
              <div class="text-[10px] text-tao-gold/40 tracking-[0.8em] font-serif uppercase [writing-mode:vertical-rl]">Divine Archive</div>
              <div class="p-2 border border-tao-gold/30 bg-black/60 backdrop-blur-md">
                <img src="/qr-code.png" class="w-14 h-14 grayscale brightness-125 contrast-125" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 flex gap-8 animate-fade-up">
      <button @click="downloadImage" class="group relative px-10 py-4 overflow-hidden transition-all bg-tao-gold/10">
        <div class="absolute inset-0 border border-tao-gold/40 group-hover:border-tao-gold transition-colors"></div>
        <span class="relative z-10 text-tao-gold text-xs font-black tracking-[0.4em] uppercase">Download Scroll</span>
      </button>
      <button @click="close" class="px-10 py-4 text-white/30 text-xs tracking-[0.4em] hover:text-white transition-colors uppercase">Dismiss</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[1920px] h-[1080px] bg-[#050505] flex overflow-hidden">
      <div class="w-full h-full flex border-[12px] border-[#0a0a0a] relative">
         <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-110" />
         <div class="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/90"></div>
         
         <div class="z-10 flex w-full p-24 items-center justify-between">
            <div class="flex items-center gap-16">
              <h1 class="text-[180px] font-serif text-tao-gold tracking-[0.2em] [writing-mode:vertical-rl]">{{ hexagramData.nameZh }}</h1>
              <p class="text-[54px] text-white/90 font-serif tracking-[0.4em] [writing-mode:vertical-rl] border-r-4 border-tao-gold/30 pr-12">{{ hexagramData.poemZh }}</p>
              <div class="max-w-[800px] ml-12">
                <p class="text-[32px] text-white/70 font-serif italic leading-[1.8]">{{ aiPredictionText }}</p>
              </div>
            </div>
            <div class="flex flex-col items-center gap-12">
              <div class="text-[20px] text-tao-gold/40 tracking-[1em] [writing-mode:vertical-rl] uppercase">Cyber Tao Archive</div>
              <img src="/qr-code.png" class="w-32 h-32 grayscale brightness-150 p-4 border-2 border-tao-gold/30" />
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

.cyber-grid {
  background-image: linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px);
  background-size: 40px 40px;
}

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
