<template>
  <div class="flex flex-col items-center w-full min-h-[500px] justify-between">
    <div class="flex flex-col-reverse gap-4 h-44 justify-end">
      <div v-for="(line, i) in lines" :key="i" class="animate-in">
        <div v-if="line === 1" class="w-44 h-3 bg-tao-gold shadow-[0_0_25px_rgba(200,170,110,0.8)] border border-white/10"></div>
        <div v-else class="w-44 h-3 flex justify-between">
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_25px_rgba(200,170,110,0.8)] border border-white/10"></div>
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_25px_rgba(200,170,110,0.8)] border border-white/10"></div>
        </div>
      </div>
      <div v-if="lines.length === 0" class="text-center opacity-30 italic text-[10px] tracking-widest px-8">
        THE MATRIX REQUIRES SIX INPUTS TO DECODE THE FLOW.<br>STAY FOCUSED ON YOUR INTENT.
      </div>
    </div>

    <div class="flex gap-8 my-8">
      <div v-for="(coin, index) in coins" :key="index" class="w-16 h-16 [perspective:1000px]">
        <div 
          class="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
          :class="{ 'animate-toss': isTossing }"
          :style="!isTossing ? (coin.v === 0 ? 'transform: rotateY(180deg)' : 'transform: rotateY(0deg)') : ''"
        >
          <div class="absolute inset-0 w-full h-full [backface-visibility:hidden]"><img src="/coin-head.png" class="w-full h-full object-contain" /></div>
          <div class="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]"><img src="/coin-tail.png" class="w-full h-full object-contain" /></div>
        </div>
      </div>
    </div>

    <button 
      @click="toss" 
      :disabled="isTossing || lines.length >= 6"
      class="w-full py-5 border-2 border-tao-gold text-tao-gold bg-black/60 font-black tracking-[0.5em] hover:bg-tao-gold hover:text-black transition-all active:scale-95 disabled:opacity-20"
    >
      {{ isTossing ? 'RESONATING...' : (lines.length >= 6 ? 'ALIGNMENT COMPLETE' : `CAST HEXAGRAM ${lines.length + 1}`) }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)
const coins = ref([{v:1}, {v:1}, {v:1}])

const toss = () => {
  if (isTossing.value || lines.value.length >= 6) return
  isTossing.value = true
  setTimeout(() => {
    let heads = 0
    coins.value = coins.value.map(() => {
      const v = Math.random() > 0.5 ? 1 : 0
      if (v === 1) heads++
      return { v }
    })
    lines.value.push(heads >= 2 ? 1 : 0)
    isTossing.value = false
    if (lines.value.length === 6) setTimeout(() => emit('complete', lines.value), 600)
  }, 800)
}
</script>

<style scoped>
@keyframes toss {
  0% { transform: rotateY(0) translateY(0); }
  50% { transform: rotateY(720deg) translateY(-80px); }
  100% { transform: rotateY(1440deg) translateY(0); }
}
.animate-toss { animation: toss 0.8s infinite linear; }
.animate-in { animation: slideIn 0.3s ease-out forwards; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>
