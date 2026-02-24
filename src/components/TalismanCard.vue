<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" @click.self="close">
    <div ref="talismanEl" class="w-[340px] h-[600px] bg-[#050505] relative p-10 border-[10px] border-double border-tao-gold shadow-[0_0_50px_rgba(200,170,110,0.2)]">
      
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none p-12">
        <img :src="`/guardian-${guardian}.png`" class="w-full object-contain" />
      </div>
      
      <div class="relative z-10 flex flex-col items-center w-full h-full justify-between text-center">
        <header>
          <p class="text-[8px] tracking-[0.6em] text-tao-gold/40 mb-2 uppercase font-mono">Artifact ID: {{ Date.now().toString().slice(-6) }}</p>
          <div class="h-px w-8 bg-tao-red mx-auto"></div>
        </header>

        <div class="flex flex-col-reverse gap-3">
          <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-40 h-2.5 flex justify-between">
            <div v-if="line === 1" class="w-full h-full bg-tao-gold"></div>
            <template v-else>
              <div class="w-[44%] h-full bg-tao-gold"></div>
              <div class="w-[44%] h-full bg-tao-gold"></div>
            </template>
          </div>
        </div>

        <div>
          <h2 class="text-4xl font-serif text-white tracking-[0.4em] mb-3">{{ hexagramData.name }}</h2>
          <p class="text-[10px] italic text-tao-gold/60 px-4 leading-relaxed font-mono">{{ aiPredictionText.slice(0, 80) }}...</p>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 flex gap-6">
      <button @click="download" class="px-8 py-3 bg-tao-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">Download</button>
      <button @click="close" class="px-8 py-3 border border-tao-gold/30 text-tao-gold text-xs uppercase tracking-widest">Close</button>
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
