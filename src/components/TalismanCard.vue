<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md">
    <div class="text-tao-gold text-xs tracking-[0.3em] mb-8 font-serif uppercase animate-pulse">
      — Tap to Flip —
    </div>

    <div class="relative w-[320px] h-[520px] perspective-1000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-lg border-2 border-cyan-500/50 bg-black p-6 flex flex-col items-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div class="silk-thread-cyan"></div>
          <div class="z-10 flex flex-col items-center h-full w-full">
            <div class="flex flex-col-reverse gap-2 mb-8 mt-4">
              <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-24 h-2 flex justify-between">
                <div v-if="line === 1" class="w-full h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                <template v-else>
                  <div class="w-[44%] h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                  <div class="w-[44%] h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                </template>
              </div>
            </div>
            <h1 class="text-2xl font-serif text-cyan-400 tracking-widest mb-4 uppercase">{{ hexagramData.name }}</h1>
            <p class="text-white/80 font-serif text-sm leading-relaxed italic text-center px-2 mt-auto mb-8">
              "{{ aiPredictionText }}"
            </p>
            <div class="text-[8px] text-cyan-500/50 tracking-tighter">CYBER TAOISM SANCTUARY v1.0</div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-lg border-2 border-tao-gold/50 bg-black overflow-hidden shadow-[0_0_20px_rgba(200,170,110,0.2)]">
          <div class="silk-thread-gold"></div>
          <img :src="beastImageUrl" class="absolute top-0 left-0 w-full h-1/2 object-cover opacity-80" />
          <div class="absolute top-1/2 inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 flex flex-col items-center">
            <div class="w-px h-12 bg-tao-gold/30 mb-4"></div>
            <h1 class="text-4xl font-serif text-tao-gold tracking-[0.5em] mb-4">{{ hexagramData.nameZh }}</h1>
            <p class="text-white/90 text-lg font-serif tracking-widest text-center">{{ hexagramData.poemZh }}</p>
            <div class="mt-auto relative p-1 border border-tao-gold/30">
               <img src="/qr-code.png" class="w-10 h-10 grayscale brightness-125" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 flex gap-4">
      <button @click="downloadImage" class="px-6 py-2 bg-tao-gold text-black text-xs tracking-widest font-black hover:bg-white transition-all">SAVE SCROLL</button>
      <button @click="close" class="px-6 py-2 border border-white/20 text-white/50 text-xs tracking-widest hover:text-white transition-all">CLOSE</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[400px] bg-[#050505] flex flex-col">
      <div class="w-[400px] h-[600px] relative border-b border-tao-gold/20 p-10 flex flex-col items-center justify-center">
        <div class="absolute inset-4 border border-cyan-500/30"></div>
        <div class="flex flex-col-reverse gap-3 mb-12">
          <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-40 h-3 flex justify-between">
            <div v-if="line === 1" class="w-full h-full bg-cyan-400"></div>
            <template v-else>
              <div class="w-[44%] h-full bg-cyan-400"></div>
              <div class="w-[44%] h-full bg-cyan-400"></div>
            </template>
          </div>
        </div>
        <h1 class="text-3xl font-serif text-cyan-400 tracking-widest mb-6 uppercase">{{ hexagramData.name }}</h1>
        <p class="text-white text-lg font-serif italic text-center leading-relaxed">"{{ aiPredictionText }}"</p>
      </div>
      <div class="w-[400px] h-[600px] relative overflow-hidden">
        <img :src="beastImageUrl" class="absolute top-0 w-full h-2/3 object-cover" />
        <div class="absolute top-1/2 inset-x-0 bottom-0 bg-black p-10 flex flex-col items-center">
          <div class="w-16 h-px bg-tao-gold/50 mb-6"></div>
          <h1 class="text-5xl font-serif text-tao-gold tracking-[0.6em] mb-6">{{ hexagramData.nameZh }}</h1>
          <p class="text-white text-2xl font-serif tracking-[0.2em]">{{ hexagramData.poemZh }}</p>
          <img src="/qr-code.png" class="mt-auto w-16 h-16 grayscale brightness-125 border border-tao-gold/20 p-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
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
      pixelRatio: 2,
      backgroundColor: '#050505'
    })
    const link = document.createElement('a')
    link.download = `cyber-talisman-${Date.now()}.png`
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
.perspective-1000 {
  perspective: 1000px;
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

/* 丝线装饰效果 */
.silk-thread-cyan {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(6, 182, 212, 0.3);
  pointer-events: none;
}
.silk-thread-cyan::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 1px solid rgba(6, 182, 212, 0.1);
}

.silk-thread-gold {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(200, 170, 110, 0.3);
  pointer-events: none;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
