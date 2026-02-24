<template>
  <div class="flex flex-col items-center w-full min-h-[500px] justify-between py-4">
    <div class="flex flex-col-reverse gap-3 h-40 justify-end">
      <div v-for="(line, i) in lines" :key="i" class="animate-in">
        <div v-if="line === 1" class="w-32 h-2 bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
        <div v-else class="w-32 h-2 flex justify-between">
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
        </div>
      </div>
    </div>

    <div class="flex gap-6 my-8">
      <div v-for="(coin, index) in coins" :key="index" class="relative w-16 h-16 [perspective:1000px]">
        <div 
          class="relative w-full h-full transition-transform duration-800 [transform-style:preserve-3d]"
          :class="{ 'animate-flicker': isTossing }"
          :style="!isTossing ? (coin.v === 0 ? 'transform: rotateY(180deg)' : 'transform: rotateY(0deg)') : ''"
        >
          <div class="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            <img src="/coin-head.png" class="w-full h-full object-contain" />
          </div>
          <div class="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <img src="/coin-tail.png" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>

    <button 
      @click="toss" 
      :disabled="isTossing || lines.length >= 6"
      class="px-10 py-4 border border-tao-gold text-tao-gold bg-black/40 transition-all z-20 hover:bg-tao-gold hover:text-black hover:shadow-[0_0_20px_rgba(200,170,110,0.5)] disabled:opacity-20 uppercase tracking-[0.3em]"
    >
      {{ isTossing ? 'COMMUNING...' : (lines.length >= 6 ? 'COMPLETED' : `CAST ${lines.length + 1} / 6`) }}
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
