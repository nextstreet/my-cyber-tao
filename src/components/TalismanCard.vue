<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl">
    <div class="text-tao-gold text-[10px] tracking-[0.5em] mb-6 font-serif uppercase opacity-50 animate-pulse">
      — SECURE CHANNEL ESTABLISHED —
    </div>

    <div class="relative w-[85vw] max-w-[400px] aspect-[9/16] md:max-w-[450px] perspective-2000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-all duration-1000 transform-style-3d cursor-pointer shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-xl border border-cyan-500/30 bg-[#050505] flex flex-col overflow-hidden">
          <div class="cyber-grid absolute inset-0 opacity-[0.05]"></div>
          
          <div class="relative h-2/5 border-b border-cyan-500/20 flex flex-col items-center justify-center p-6 bg-cyan-500/[0.02]">
            <div class="absolute top-4 left-4 w-2 h-2 border-t border-l border-cyan-500/50"></div>
            <div class="absolute top-4 right-4 w-2 h-2 border-t border-r border-cyan-500/50"></div>
            
            <div class="flex flex-col-reverse gap-2.5 mb-6">
              <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-24 h-2 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                <template v-else>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                </template>
              </div>
            </div>
            
            <h1 class="text-2xl font-serif text-cyan-400 tracking-[0.3em] uppercase mb-2 text-center">{{ hexagramData.name }}</h1>
            <div class="text-[8px] text-cyan-500/40 font-mono tracking-widest uppercase">NODE ID: {{ hexagramData.lines?.join('') }}</div>
          </div>

          <div class="relative h-3/5 p-8 flex flex-col justify-between">
            <div class="absolute top-4 right-6 text-[7px] text-cyan-500/30 font-mono tracking-[0.4em] uppercase">Status: Decoded</div>
            
            <div class="mt-4 flex-1 overflow-hidden">
              <div class="w-8 h-px bg-cyan-400/50 mb-6"></div>
              
              <p class="md:hidden text-white/90 font-mono text-sm leading-relaxed italic pr-2">
                {{ shortAiText }}
              </p>
              
              <p class="hidden md:block text-white/90 font-mono text-sm leading-relaxed italic pr-4 h-[220px] overflow-y-auto custom-scrollbar">
                {{ aiPredictionText }}
              </p>
            </div>

            <div class="flex justify-between items-end pt-6 border-t border-cyan-500/10 mt-auto">
              <span class="text-[7px] text-cyan-500/50 font-mono tracking-widest uppercase">SYST: 2.0.6-LUNA</span>
              <span class="text-[7px] text-cyan-500/50 font-mono tracking-widest uppercase animate-pulse">Recording...</span>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-tao-gold/30 bg-[#050505] overflow-hidden flex flex-col">
          <div class="relative h-1/2 md:h-[55%] w-full border-b border-tao-gold/20">
            <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-screen scale-105" />
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]"></div>
            <div class="absolute top-4 left-4 text-[8px] text-tao-gold/50 tracking-[0.5em] font-serif uppercase">Sacred Entity</div>
          </div>

          <div class="relative h-1/2 md:h-[45%] w-full p-6 flex justify-between items-start bg-gradient-to-t from-[#0a0a0a] to-[#050505]">
            <div class="flex gap-6 h-full">
              <h1 class="text-6xl font-serif text-tao-gold tracking-widest font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)] h-full">
                {{ hexagramData.nameZh }}
              </h1>
              <div class="w-px h-3/4 bg-tao-gold/20 my-auto"></div>
              <p class="text-white/80 text-lg md:text-xl font-serif tracking-[0.4em] [writing-mode:vertical-rl] leading-loose h-full pt-2">
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="flex flex-col items-end justify-between h-full pb-2">
               <div class="text-[10px] text-tao-gold/30 tracking-[0.8em] font-serif uppercase [writing-mode:vertical-rl]">Divine Archive</div>
               <div class="p-1.5 border border-tao-gold/20 bg-black/80 backdrop-blur-sm">
                 <img src="/qr-code.png" class="w-10 h-10 grayscale brightness-125 contrast-125" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex gap-6 animate-fade-up">
      <button @click="downloadImage" class="group relative px-10 py-3.5 overflow-hidden transition-all bg-tao-gold/10 rounded-sm">
        <div class="absolute inset-0 border border-tao-gold/40 group-hover:border-tao-gold transition-colors"></div>
        <span class="relative z-10 text-tao-gold text-[10px] font-black tracking-[0.4em] uppercase">Save Scroll</span>
      </button>
      <button @click="close" class="px-10 py-3.5 text-white/30 text-[10px] tracking-[0.4em] hover:text-white transition-colors uppercase">Dismiss</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[1080px] h-[1920px] bg-[#050505] flex flex-col overflow-hidden relative border-[16px] border-[#0a0a0a]">
       <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110" />
       <div class="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]"></div>
       
       <div class="z-10 w-full p-16 flex justify-between items-start border-b border-tao-gold/20">
          <div class="flex flex-col gap-4">
            <h2 class="text-[54px] font-serif text-cyan-400 tracking-[0.3em] uppercase">{{ hexagramData.name }}</h2>
            <div class="text-[24px] text-cyan-500/40 font-mono tracking-[0.5em] uppercase">NODE ID: {{ hexagramData.lines?.join('') }}</div>
          </div>
          <div class="flex flex-col gap-3">
             <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-32 h-3 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400"></div>
                <template v-else>
                  <div class="w-[43%] h-full bg-cyan-400"></div>
                  <div class="w-[43%] h-full bg-cyan-400"></div>
                </template>
              </div>
          </div>
       </div>

       <div class="z-10 flex-1 w-full p-20 flex justify-center items-center relative">
          <h1 class="text-[280px] font-serif text-tao-gold tracking-[0.1em] font-bold [writing-mode:vertical-rl] drop-shadow-2xl absolute right-[35%]">{{ hexagramData.nameZh }}</h1>
          <p class="text-[72px] text-white/90 font-serif tracking-[0.4em] [writing-mode:vertical-rl] leading-relaxed absolute left-[25%]">{{ hexagramData.poemZh }}</p>
       </div>
       
       <div class="z-10 w-full p-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-cyan-500/20 flex gap-12 items-end">
          <div class="flex-1">
            <div class="w-24 h-1 bg-cyan-400/50 mb-8"></div>
            <p class="text-[34px] text-white/80 font-mono italic leading-[1.6] text-justify">{{ aiPredictionText }}</p>
          </div>
          <div class="flex flex-col items-center gap-6 border-l border-tao-gold/20 pl-12 shrink-0">
            <span class="text-[20px] text-tao-gold/40 font-serif tracking-[0.8em] [writing-mode:vertical-rl] uppercase">Cyber Tao Archive</span>
            <img src="/qr-code.png" class="w-40 h-40 grayscale brightness-150 p-4 border border-tao-gold/30 bg-black/60" />
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

// 提取精简版 AI 文本（前两句话）供移动端正面展示
const shortAiText = computed(() => {
  if (!props.aiPredictionText) return ''
  // 按照句号/问号/叹号分割，取前两句
  const sentences = props.aiPredictionText.match(/[^.!?]+[.!?]+/g) || [props.aiPredictionText]
  return sentences.slice(0, 2).join(' ').trim()
})

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
      pixelRatio: 2, // 确保在手机上导出也极度清晰
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
  background-image: linear-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1px, transparent 1px);
  background-size: 30px 30px;
}

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 10px; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
