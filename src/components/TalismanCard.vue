<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
    <div class="flex flex-col items-center max-w-sm w-full animate-fade-in">
      <div class="text-tao-gold text-xs tracking-[0.3em] mb-4 font-serif uppercase animate-pulse">— Divine Manifestation —</div>
      <div class="relative group">
        <img :src="generatedImage" class="w-full border border-tao-gold/50 shadow-[0_0_30px_rgba(200,170,110,0.3)] rounded-sm" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span class="text-[10px] text-white/70 italic">Long press to save</span>
        </div>
      </div>
      <button @click="close" class="mt-8 px-8 py-2 border border-tao-gold/30 text-tao-gold/60 text-xs tracking-widest hover:text-tao-gold transition-all">CLOSE</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div ref="talismanRef" class="w-[375px] h-[667px] bg-[#050505] relative flex flex-col items-center pt-12 pb-8 px-8 overflow-hidden" style="border: 12px double #C8AA6E;">
      
      <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110" />
      
      <div class="z-10 flex flex-col-reverse gap-2.5 mb-10">
        <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-32 h-3.5 flex justify-between">
          <div v-if="line === 1" class="w-full h-full bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]"></div>
          <template v-else>
            <div class="w-[44%] h-full bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]"></div>
            <div class="w-[44%] h-full bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]"></div>
          </template>
        </div>
      </div>

      <div class="z-10 text-center flex-1 flex flex-col justify-center w-full px-2">
        <h2 class="text-[10px] text-[#C8AA6E]/60 tracking-[0.5em] uppercase mb-2">Neural Oracle Reading</h2>
        <h1 class="text-4xl font-serif text-[#C8AA6E] font-bold tracking-widest mb-6 uppercase">
          {{ hexagramData.name || 'DEPARTURE' }}
        </h1>
        <div class="w-12 h-[2px] bg-red-800 mx-auto mb-8 shadow-[0_0_8px_#991b1b]"></div>
        <p class="text-white/90 font-serif text-lg leading-relaxed italic">
          "{{ aiPredictionText }}"
        </p>
      </div>

      <div class="z-10 mt-auto flex items-end justify-between w-full border-t border-[#C8AA6E]/20 pt-6">
        <div class="text-left font-mono">
          <p class="text-[9px] text-[#C8AA6E] tracking-widest leading-loose uppercase">Cyber Taoism Sanctuary</p>
          <p class="text-[8px] text-white/30 italic">{{ currentDate }}</p>
        </div>
        <div class="relative p-1 border border-[#C8AA6E]/30 bg-black">
          <img src="/qr-code.png" class="w-12 h-12 grayscale brightness-150" />
        </div>
      </div>

      <div class="absolute inset-0 pointer-events-none opacity-[0.05]" style="background-image: url('/noise.png');"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText'])
const showModal = ref(false)
const generatedImage = ref(null)
const talismanRef = ref(null)
const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const beastImageUrl = computed(() => {
  const name = (props.hexagramData?.name || '').toLowerCase()
  if (name.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (name.match(/fire|sun|bright|south/)) return '/guardian-phoenix.png'
  if (name.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (name.match(/water|rain|moon|north/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

const generate = async () => {
  showModal.value = false
  await nextTick()
  if (!talismanRef.value) return
  try {
    setTimeout(async () => {
      const dataUrl = await toPng(talismanRef.value, { quality: 1, pixelRatio: 3, skipFonts: false })
      generatedImage.value = dataUrl
      showModal.value = true
    }, 200)
  } catch (err) { console.error('Generation failed:', err) }
}

const close = () => { showModal.value = false; generatedImage.value = null }
defineExpose({ generate })

// App.vue 中的调用确保传递 shareCount
<SpiritBottle 
  :lastReadingTime="lastReadingTime" 
  :isUnlimited="isAdmin" 
  :shareCount="shareCount" 
  @refill="handleRefillShare" 
/>

<TalismanCard 
  ref="talismanRef" 
  :hexagramData="{ name: hexagramData.nameEn, lines: hexagramResult, nameZh: hexagramData.nameZh }" 
  :aiPredictionText="aiResult"
/>  
</script>
