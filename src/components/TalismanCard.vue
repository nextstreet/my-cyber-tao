<template>
  <div class="fixed left-[-9999px]">
    <div
      ref="talismanEl"
      class="w-[375px] h-[667px] bg-[#050505] relative flex flex-col items-center pt-12 pb-8 px-8 overflow-hidden border-[12px] border-double border-[#c8aa6e]"
      style="font-family: 'Playfair Display', serif"
    >
      <div
        class="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none"
      >
        <h1 class="text-[14rem] text-[#c8aa6e] leading-none">
          {{ hexagramData.name.substring(0, 1) }}
        </h1>
      </div>

      <div class="z-10 text-center mb-8">
        <p class="text-[10px] tracking-[0.5em] text-[#c8aa6e] opacity-60 mb-2 uppercase">
          Cyber Tao Talisman
        </p>
        <div class="h-px w-12 bg-[#ff3333] mx-auto"></div>
      </div>

      <div class="z-10 flex flex-col-reverse gap-4 mb-10">
        <div v-for="(line, i) in hexagramData.lines" :key="i" class="w-48 h-3 flex justify-between">
          <template v-if="line === 1">
            <div class="w-full h-full bg-[#c8aa6e]"></div>
          </template>
          <template v-else>
            <div class="w-[44%] h-full bg-[#c8aa6e]"></div>
            <div class="w-[44%] h-full bg-[#c8aa6e]"></div>
          </template>
        </div>
      </div>

      <div class="z-10 text-center mb-6">
        <h2 class="text-3xl text-white tracking-[0.3em] mb-2">{{ hexagramData.name }}</h2>
        <p class="text-[#c8aa6e] text-xs italic tracking-widest px-4">
          {{ aiPredictionText.split('.')[0] }}...
        </p>
      </div>

      <div class="mt-auto pt-6 border-t border-[#c8aa6e]/20 w-full text-center">
        <p class="text-[8px] tracking-[2px] text-[#c8aa6e]/40 uppercase">
          Timestamp: {{ new Date().toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps(['hexagramData', 'aiPredictionText'])
const talismanEl = ref(null)

const generate = async () => {
  if (!talismanEl.value) return
  const canvas = await html2canvas(talismanEl.value, { backgroundColor: '#050505', scale: 2 })
  const link = document.createElement('a')
  link.download = `talisman-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

defineExpose({ generate })
</script>
