<template>
  <div class="flex flex-col items-center w-full min-h-[520px] justify-between py-6">
    <div class="flex flex-col-reverse gap-4 h-48 justify-end">
      <div v-for="(line, i) in lines" :key="i" class="animate-in">
        <div v-if="line === 1" class="w-40 h-2.5 bg-tao-gold shadow-[0_0_20px_rgba(200,170,110,0.8)] border border-white/20"></div>
        <div v-else class="w-40 h-2.5 flex justify-between">
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_20px_rgba(200,170,110,0.8)] border border-white/20"></div>
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_20px_rgba(200,170,110,0.8)] border border-white/20"></div>
        </div>
      </div>
      <div v-if="lines.length === 0" class="text-center opacity-40 italic text-[10px] tracking-[0.2em] px-10 leading-relaxed">
        THROUGH THE DIGITAL VOID, NANO-COINS WILL ALIGN WITH YOUR KARMA.<br>SIX TOSSES TO REVEAL THE CODE.
      </div>
    </div>

    <div class="flex gap-8 my-10">
      </div>

    <button 
      @click="toss" 
      :disabled="isTossing || lines.length >= 6"
      class="w-64 py-4 border-2 border-tao-gold text-tao-gold bg-black/60 font-bold tracking-[0.4em] transition-all hover:bg-tao-gold hover:text-black active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tao-gold"
    >
      {{ isTossing ? 'CALCULATING...' : (lines.length >= 6 ? 'ALIGNMENT READY' : `INITIATE CAST ${lines.length + 1}`) }}
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
      const res = Math.random() > 0.5 ? 1 : 0
      if (res === 1) heads++
      return { v: res }
    })
    lines.value.push(heads >= 2 ? 1 : 0)
    isTossing.value = false
    if (lines.value.length === 6) setTimeout(() => emit('complete', lines.value), 800)
  }, 1000)
}
</script>

<style scoped>
@keyframes flicker {
  0% { transform: rotateY(0) translateY(0); }
  50% { transform: rotateY(720deg) translateY(-50px); }
  100% { transform: rotateY(1440deg) translateY(0); }
}
.animate-flicker { animation: flicker 1s infinite linear; }
.animate-in { animation: slideIn 0.4s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: scaleX(1); } }
</style>
