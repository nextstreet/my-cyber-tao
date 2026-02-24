<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl">
    <div class="text-tao-gold text-[10px] tracking-[0.5em] mb-8 font-serif uppercase opacity-50 animate-pulse">
      — ARCHIVING NEURAL DATA —
    </div>

    <div class="relative w-full max-w-5xl aspect-video perspective-2000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-all duration-1000 transform-style-3d cursor-pointer shadow-[0_0_60px_rgba(0,0,0,1)]"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-sm border border-cyan-500/30 bg-[#050505] flex overflow-hidden">
          <div class="cyber-grid absolute inset-0 opacity-[0.05]"></div>
          
          <div class="w-1/3 border-r border-cyan-500/20 flex flex-col items-center justify-center p-8 bg-cyan-500/[0.02]">
            <div class="flex flex-col-reverse gap-3 mb-12">
              <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-32 h-2.5 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <template v-else>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </template>
              </div>
            </div>
            <h1 class="text-3xl font-serif text-cyan-400 tracking-[0.3em] uppercase mb-2">{{ hexagramData.name }}</h1>
            <div class="text-[8px] text-cyan-500/30 font-mono tracking-widest uppercase">NODE ID: {{ hexagramData.lines?.join('') }}</div>
          </div>

          <div class="w-2/3 p-16 flex flex-col justify-center relative">
            <div class="absolute top-8 right-10 text-[7px] text-cyan-500/20 font-mono tracking-[0.5em] uppercase">Interpretation Module</div>
            <div class="space-y-8">
              <div class="w-16 h-px bg-cyan-400/50"></div>
              <p class="text-white/90 font-mono text-base md:text-lg leading-relaxed italic pr-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                {{ aiPredictionText }}
              </p>
              <div class="flex justify-between items-end pt-10 border-t border-cyan-500/10">
                <span class="text-[7px] text-cyan-500/40 font-mono tracking-widest uppercase">Access: Authenticated</span>
                <span class="text-[7px] text-cyan-500/40 font-mono tracking-widest uppercase">Ver: 2.0.6-SYNCH</span>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-sm border border-tao-gold/30 bg-[#050505] overflow-hidden flex">
          <div class="absolute inset-0">
            <img :src="beastImageUrl" class="w-full h-full object-cover opacity-60 mix-blend-screen scale-110" />
            <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/70"></div>
          </div>

          <div class="z-10 w-full flex items-center justify-between p-20">
            <div class="flex items-start gap-12">
              <h1 class="text-8xl md:text-9xl font-serif text-tao-gold tracking-[0.1em] font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_25px_rgba(200,170,110,0.5)]">
                {{ hexagramData.nameZh }}
              </h1>
              <div class="w-px h-48 bg-tao-gold/30 mt-6 shadow-[0_0_10px_rgba(200,170,110,0.2)]"></div>
              <p class="text-white/90 text-2xl md:text-4xl font-serif tracking-[0.6em] [writing-mode:vertical-rl] leading-[1.8] drop-shadow-md">
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="flex flex-col items-end justify-between h-full py-4">
              <div class="text-[12px] text-tao-gold/40 tracking-[1em] font-serif uppercase [writing-mode:vertical-rl] opacity-60">Divine Record</div>
              <div class="group relative p-2 border border-tao-gold/20 bg-black/60 backdrop-blur-md">
                <img src="/qr-code.png" class="w-16 h-16 grayscale brightness-125 contrast-125 transition-all group-hover:brightness-150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 flex gap-8 animate-fade-up">
      <button @click="downloadImage" class="group relative px-12 py-4 overflow-hidden transition-all bg-tao-gold/5">
        <div class="absolute inset-0 border border-tao-gold/30 group-hover:border-tao-gold transition-colors"></div>
        <span class="relative z-10 text-tao-gold text-xs font-black tracking-[0.5em] uppercase">Save Scroll</span>
      </button>
      <button @click="close" class="px-12 py-4 text-white/20 text-xs tracking-[0.5em] hover:text-white transition-colors uppercase">Dismiss</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[1920px] h-[1080px] bg-[#050505] flex overflow-hidden relative">
       <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-110" />
       <div class="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/90"></div>
       
       <div class="z-10 flex w-full p-32 items-center justify-between">
          <div class="flex items-center gap-20">
            <h1 class="text-[220px] font-serif text-tao-gold tracking-[0.1em] [writing-mode:vertical-rl] drop-shadow-2xl">{{ hexagramData.nameZh }}</h1>
            <div class="w-1 h-80 bg-tao-gold/20"></div>
            <p class="text-[64px] text-white/80 font-serif tracking-[0.5em] [writing-mode:vertical-rl] leading-relaxed">{{ hexagramData.poemZh }}</p>
          </div>
          
          <div class="flex flex-col items-end max-w-[900px]">
            <div class="text-[18px] text-cyan-400/40 font-mono tracking-[1.5em] uppercase mb-12">Neural Analysis Result</div>
            <p class="text-[42px] text-white/70 font-serif italic leading-[1.6] text-right mb-20">{{ aiPredictionText }}</p>
            <div class="flex items-center gap-10">
              <span class="text-[20px] text-tao-gold/30 font-serif tracking-[1em] uppercase">Cyber Tao Archive</span>
              <img src="/qr-code.png" class="w-32 h-32 grayscale brightness-150 p-4 border border-tao-gold/20 bg-black/40" />
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText'])
const showModal = ref(false)
const isFlipped = ref(false)
const talismanRef = ref(null)

const beastImageUrl = computed(() => {
  const name = (props.hexagramData?.name || '').toLowerCase()
  if (name.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (name.match(/fire|sun|bright|south/)) return '/guardian-phoenix.png'
  if (name.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (name.match(/water|rain|moon|north/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

const generate = () => {
  isFlipped.value = false
  showModal.value = true
}

const downloadImage = async () => {
  if (!talismanRef.value) return
  try {
    const dataUrl = await toPng(talismanRef.value, { 
      quality: 1.0, 
      pixelRatio: 2,
      backgroundColor: '#050505'
    })
    const link = document.createElement('a')
    link.download = `CyberTao-${props.hexagramData.nameZh}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const close = () => { showModal.value = false }
defineExpose({ generate })
</script>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

.cyber-grid {
  background-image: linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px);
  background-size: 50px 50px;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 10px; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
