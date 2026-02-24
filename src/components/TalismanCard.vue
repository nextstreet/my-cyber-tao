<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl">
    <div class="text-tao-gold text-[10px] tracking-[0.5em] mb-10 font-serif uppercase opacity-50 animate-pulse">
      — ARCHIVING REALITY —
    </div>

    <div class="relative w-[320px] h-[540px] perspective-2000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-all duration-1000 transform-style-3d cursor-pointer shadow-[0_0_50px_rgba(0,0,0,1)]"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-sm border border-cyan-500/30 bg-[#050505] p-8 flex flex-col items-center overflow-hidden">
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
          <div class="cyber-grid absolute inset-0 opacity-[0.03]"></div>
          
          <div class="z-10 flex flex-col items-center h-full w-full">
            <div class="text-[8px] text-cyan-500/40 tracking-[0.4em] mb-8 font-mono">NEURAL SIGNAL DETECTED</div>
            
            <div class="flex flex-col-reverse gap-2.5 mb-10">
              <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-28 h-2.5 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <template v-else>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                  <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </template>
              </div>
            </div>

            <h1 class="text-3xl font-serif text-cyan-400 tracking-[0.2em] mb-2 uppercase">{{ hexagramData.name }}</h1>
            <div class="w-8 h-px bg-cyan-500/30 mb-10"></div>
            
            <p class="text-white/70 font-serif text-sm leading-relaxed italic text-center px-4 mt-auto mb-12">
              "{{ aiPredictionText }}"
            </p>
            
            <div class="mt-auto w-full flex justify-between items-end border-t border-cyan-500/10 pt-4">
              <span class="text-[7px] text-cyan-500/30 font-mono tracking-widest uppercase">Encryption: AES-256</span>
              <span class="text-[7px] text-cyan-500/30 font-mono tracking-widest uppercase">V1.0.4-β</span>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-sm border border-tao-gold/30 bg-[#050505] overflow-hidden flex flex-col items-center">
          <div class="absolute inset-0 w-full h-full">
            <img :src="beastImageUrl" class="w-full h-full object-cover opacity-60 scale-110 mix-blend-screen" />
            <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
          </div>

          <div class="z-10 flex flex-col items-center h-full w-full p-8">
            <div class="text-[9px] text-tao-gold/40 tracking-[0.6em] mb-4 font-serif uppercase">Divine Archive</div>
            
            <div class="my-auto flex flex-col items-center">
              <h1 class="text-6xl font-serif text-tao-gold tracking-[0.3em] font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)]">
                {{ hexagramData.nameZh }}
              </h1>
              <div class="w-px h-12 bg-tao-gold/40 my-6"></div>
              <p class="text-white/80 text-xl font-serif tracking-[0.4em] [writing-mode:vertical-rl] h-48 overflow-visible">
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="mt-auto relative p-1.5 border border-tao-gold/20 bg-black/40 backdrop-blur-sm">
              <img src="/qr-code.png" class="w-10 h-10 grayscale brightness-125 contrast-125" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 flex gap-6 animate-fade-up">
      <button @click="downloadImage" class="group relative px-8 py-3 overflow-hidden transition-all">
        <div class="absolute inset-0 border border-tao-gold/40 group-hover:border-tao-gold transition-colors"></div>
        <span class="relative z-10 text-tao-gold text-[11px] tracking-[0.3em] font-black">EXTRACT SCROLL</span>
      </button>
      <button @click="close" class="px-8 py-3 text-white/30 text-[11px] tracking-[0.3em] hover:text-white transition-colors">DISMISS</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[450px] bg-[#050505] flex flex-col p-12">
      <div class="w-[354px] h-[600px] border border-cyan-500/40 relative flex flex-col items-center p-12 mb-12 mx-auto">
        <div class="flex flex-col-reverse gap-3 mb-16 mt-8">
          <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-44 h-3 flex justify-between">
            <div v-if="line === 1" class="w-full h-full bg-cyan-400"></div>
            <template v-else>
              <div class="w-[43%] h-full bg-cyan-400"></div>
              <div class="w-[43%] h-full bg-cyan-400"></div>
            </template>
          </div>
        </div>
        <h1 class="text-4xl font-serif text-cyan-400 tracking-widest mb-10">{{ hexagramData.name }}</h1>
        <p class="text-white/80 text-lg font-serif italic text-center leading-loose px-4">"{{ aiPredictionText }}"</p>
      </div>

      <div class="w-[354px] h-[600px] border border-tao-gold/40 relative flex flex-col items-center p-12 mx-auto overflow-hidden">
        <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-125" />
        <div class="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
        <div class="z-10 flex flex-col items-center justify-between h-full">
          <h1 class="text-7xl font-serif text-tao-gold font-bold tracking-[0.4em] [writing-mode:vertical-rl]">{{ hexagramData.nameZh }}</h1>
          <p class="text-white text-2xl font-serif tracking-[0.5em] [writing-mode:vertical-rl] mt-6">{{ hexagramData.poemZh }}</p>
          <img src="/qr-code.png" class="mt-8 w-20 h-20 grayscale brightness-150 p-2 border border-tao-gold/30" />
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
      quality: 0.95, 
      pixelRatio: 3, // 提高导出清晰度
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

const close = () => {
  showModal.value = false
}

defineExpose({ generate })
</script>

<style scoped>
.perspective-2000 {
  perspective: 2000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

.cyber-grid {
  background-image: linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
