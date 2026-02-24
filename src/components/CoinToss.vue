<template>
  <div class="flex flex-col items-center w-full min-h-[500px] justify-between py-4">
    <div class="flex flex-col-reverse gap-3 h-40 justify-end">
      <div v-for="(line, i) in lines" :key="i" class="animate-line">
        <div v-if="line === 1" class="w-32 h-2 bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
        <div v-else class="w-32 h-2 flex justify-between">
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
          <div class="w-[44%] h-full bg-tao-gold shadow-[0_0_15px_rgba(200,170,110,0.4)]"></div>
        </div>
      </div>
    </div>

    <div class="flex gap-6 my-8">
      <div v-for="(coin, index) in coins" :key="index" class="coin-wrapper w-16 h-16" :class="{ 'is-flipping': isTossing }">
        <div class="coin-inner" :style="getRotation(coin.v)">
          <div class="coin-face face-front"><img src="/coin-head.png" class="w-full h-full object-contain" /></div>
          <div class="coin-face face-back"><img src="/coin-tail.png" class="w-full h-full object-contain" /></div>
        </div>
      </div>
    </div>

    <button 
      @click="toss" 
      :disabled="isTossing || lines.length >= 6"
      class="cast-btn"
    >
      <span>{{ isTossing ? 'COMMUNING...' : (lines.length >= 6 ? 'COMPLETED' : `CAST ${lines.length + 1} / 6`) }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)
const coins = ref([{v:1}, {v:1}, {v:1}])

// 修正 3D 旋转角度，确保 0 (背面) 和 1 (正面) 停留位置准确
const getRotation = (val) => {
  if (isTossing.value) return ''
  return val === 0 ? 'transform: rotateY(180deg)' : 'transform: rotateY(0deg)'
}

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
.cast-btn {
  @apply px-10 py-4 border border-tao-gold text-tao-gold bg-black/40 transition-all z-20;
  letter-spacing: 0.3em;
}
.cast-btn:hover:not(:disabled) { @apply bg-tao-gold text-black shadow-[0_0_20px_rgba(200,170,110,0.5)]; }
.cast-btn:disabled { @apply opacity-20; }

.coin-wrapper { perspective: 1000px; }
.coin-inner { 
  position: relative; width: 100%; height: 100%; 
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
  transform-style: preserve-3d; 
}
.is-flipping .coin-inner { animation: flip-animation 1s infinite; }
@keyframes flip-animation { 
  0% { transform: rotateY(0) translateY(0); }
  50% { transform: rotateY(720deg) translateY(-50px); }
  100% { transform: rotateY(1440deg) translateY(0); }
}
.coin-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; }
.face-back { transform: rotateY(180deg); }
</style>
