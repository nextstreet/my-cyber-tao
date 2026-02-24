<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl" @click.self="close">
    <div ref="talismanEl" class="w-[350px] h-[620px] bg-[#050505] relative p-12 flex flex-col items-center justify-between border-[12px] border-double border-[#c8aa6e]">
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.1] pointer-events-none p-16">
        <img :src="`/guardian-dragon.png`" class="w-full object-contain" />
      </div>

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15]">
        <span class="text-[18rem] font-serif text-[#c8aa6e] leading-none">{{ hexagramData.name }}</span>
      </div>

      <header class="relative z-10 text-center">
        <div class="text-[9px] tracking-[0.8em] text-[#c8aa6e]/60 mb-1 uppercase font-mono">Neural Artifact</div>
        <div class="h-[2px] w-12 bg-[#ff3333] mx-auto mb-10"></div>
      </header>

      <div class="relative z-10 flex flex-col-reverse gap-4">
        <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-44 h-3 flex justify-between">
          <div v-if="line === 1" class="w-full h-full bg-[#c8aa6e] shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
          <template v-else>
            <div class="w-[43%] h-full bg-[#c8aa6e] shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
            <div class="w-[43%] h-full bg-[#c8aa6e] shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
          </template>
        </div>
      </div>

      <div class="relative z-10 text-center mt-6">
        <h2 class="text-5xl font-serif text-white tracking-[0.5em] mb-4">{{ hexagramData.name }}</h2>
        <div class="w-full h-[1px] bg-[#c8aa6e]/20 mb-4"></div>
        <p class="text-[11px] text-[#c8aa6e]/80 italic px-4 leading-relaxed font-serif">{{ aiPredictionText }}</p>
      </div>

      <footer class="relative z-10 text-[8px] tracking-[0.4em] text-[#c8aa6e]/30 uppercase">
        Verified by Cyber-Sage Node #{{ Date.now().toString().slice(-4) }}
      </footer>
    </div>

    <div class="flex gap-8 mt-10 z-[110]">
      <button @click="download" class="px-10 py-4 bg-[#c8aa6e] text-black font-black text-xs uppercase tracking-widest">Download Artifact</button>
      <button @click="close" class="px-10 py-4 border border-[#c8aa6e]/40 text-[#c8aa6e] text-xs uppercase tracking-widest">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps(['hexagramData', 'aiPredictionText', 'guardian'])
const isVisible = ref(false)
const talismanEl = ref(null)

const show = () => { isVisible.value = true }
const close = () => { isVisible.value = false }

const download = async () => {
  if (!talismanEl.value) return
  const canvas = await html2canvas(talismanEl.value, { backgroundColor: '#050505', scale: 3 })
  const link = document.createElement('a')
  link.download = `cyber-tao-talisman.png`
  link.href = canvas.toDataURL()
  link.click()
}

defineExpose({ show })
</script>
