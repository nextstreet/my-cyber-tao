<template>
  <div class="flex flex-col items-center">
    <div class="flex gap-6 mb-10 h-20 items-center">
      <div
        v-for="(coin, index) in coins"
        :key="index"
        class="coin-wrapper w-16 h-16"
        :class="{ 'is-flipping': isTossing }"
      >
        <div class="coin-inner">
          <div class="coin-face face-front">
            <img src="/coin-head.png" class="w-full h-full object-contain" />
          </div>
          <div class="coin-face face-back">
            <img src="/coin-tail.png" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>

    <button
      @click="toss"
      :disabled="isTossing || lines.length >= 6"
      class="px-8 py-3 border border-tao-gold text-tao-gold hover:bg-tao-gold hover:text-black transition-all disabled:opacity-30"
    >
      <span class="text-[10px] tracking-[0.4em] uppercase font-bold">
        {{
          isTossing
            ? 'Synchronizing...'
            : lines.length >= 6
              ? 'Hexagram Formed'
              : `Initiate Toss ( ${lines.length + 1} / 6 )`
        }}
      </span>
    </button>

    <div class="mt-8 flex flex-col-reverse gap-2">
      <div v-for="(line, i) in lines" :key="i" class="w-32 h-1.5 flex justify-between animate-in">
        <template v-if="line === 1">
          <div class="w-full h-full bg-tao-gold shadow-[0_0_8px_rgba(200,170,110,0.6)]"></div>
        </template>
        <template v-else>
          <div class="w-[45%] h-full bg-tao-gold shadow-[0_0_8px_rgba(200,170,110,0.6)]"></div>
          <div class="w-[45%] h-full bg-tao-gold shadow-[0_0_8px_rgba(200,170,110,0.6)]"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)
const coins = ref([{ v: 1 }, { v: 1 }, { v: 1 }])

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
.coin-wrapper {
  perspective: 1000px;
}
.coin-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.is-flipping .coin-inner {
  transform: rotateY(1440deg) rotateX(720deg) scale(1.2);
}
.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.face-back {
  transform: rotateY(180deg);
}
.animate-in {
  animation: slideIn 0.4s ease-out;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
