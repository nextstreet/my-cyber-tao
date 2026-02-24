<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" @click.self="close">
    <div ref="talismanEl" class="talisman-container">
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
        <img :src="`/guardian-${guardian}.png`" class="w-[80%] object-contain" />
      </div>
      
      <div class="relative z-10 flex flex-col items-center w-full h-full justify-between">
        <header class="text-center">
          <p class="text-[8px] tracking-[0.6em] text-tao-gold/40 mb-2 uppercase">Cyber Taoism Artifact</p>
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

        <div class="text-center space-y-2">
          <h2 class="text-4xl font-serif text-white tracking-[0.4em]">{{ hexagramData.name }}</h2>
          <p class="text-[10px] italic text-tao-gold/60 px-4 leading-relaxed">{{ aiPredictionText.slice(0, 100) }}...</p>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 flex gap-6">
      <button @click="download" class="px-8 py-3 bg-tao-gold text-black font-bold text-xs uppercase tracking-widest">Download</button>
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

const show = () => isVisible.value = true
const close = () => isVisible.value = false

const download = async () => {
  const canvas = await html2canvas(talismanEl.value, { backgroundColor: '#050505', scale: 3 })
  const link = document.createElement('a')
  link.download = `cyber-talisman-${Date.now()}.png`
  link.href = canvas.toDataURL()
  link.click()
}

defineExpose({ show })
</script>

<style scoped>
.talisman-container {
  @apply w-[340px] h-[600px] bg-[#050505] relative p-10 border-[10px] border-double border-tao-gold;
  box-shadow: 0 0 50px rgba(200, 170, 110, 0.2);
}
</style>
