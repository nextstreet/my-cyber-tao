<template>
  <div class="flex flex-col items-center justify-center w-full min-h-[250px]">
    <div class="flex gap-6 mb-8 perspective-1000">
      <div
        v-for="(coin, index) in coins"
        :key="index"
        class="relative w-16 h-16 transition-transform duration-700 transform-style-3d"
        :class="{ 'animate-flip': isTossing }"
        :style="{ animationDelay: `${index * 0.15}s` }"
      >
        <img
          src="/coin-head.png"
          class="absolute inset-0 w-full h-full object-contain backface-hidden"
          :class="coin.value === 1 ? 'opacity-100' : 'opacity-0'"
          alt="Yang"
        />
        <img
          src="/coin-tail.png"
          class="absolute inset-0 w-full h-full object-contain backface-hidden"
          :class="coin.value === 0 ? 'opacity-100' : 'opacity-0'"
          style="transform: rotateY(180deg)"
          alt="Yin"
        />
      </div>
    </div>

    <button
      @click="tossCoins"
      :disabled="isTossing || lines.length >= 6"
      class="px-8 py-3 border border-tao-gold text-tao-gold uppercase tracking-widest text-sm hover:bg-tao-gold hover:text-black transition-all active:scale-95 disabled:opacity-50"
    >
      {{
        isTossing
          ? 'Communing...'
          : lines.length === 0
            ? 'Initiate Toss (1/6)'
            : `Toss Again (${lines.length + 1}/6)`
      }}
    </button>

    <div class="mt-8 flex flex-col-reverse gap-2">
      <div
        v-for="(line, i) in lines"
        :key="i"
        class="w-24 h-2 flex justify-between transition-all duration-500"
      >
        <template v-if="line === 1">
          <div class="w-full h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
        </template>
        <template v-else>
          <div class="w-[45%] h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
          <div class="w-[45%] h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'value.

const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)

// 初始状态显示正面
const coins = ref([{ value: 1 }, { value: 1 }, { value: 1 }])

const tossCoins = () => {
  if (isTossing.value || lines.length >= 6) return
  isTossing.value = true

  // 播放抛硬币音效 (如果有的话)
  const audio = new Audio('/coin-clink.mp3')
  audio.play().catch((e) => console.log('Audio blocked by browser'))

  setTimeout(() => {
    // 随机生成 3 枚硬币的正反 (1=正面, 0=反面)
    let headsCount = 0
    coins.value = coins.value.map(() => {
      const val = Math.random() > 0.5 ? 1 : 0
      if (val === 1) headsCount++
      return { value: val }
    })

    // 易经逻辑：2个或3个正面为阳(1)，反之为阴(0) - 这里简化处理
    const lineValue = headsCount >= 2 ? 1 : 0
    lines.value.push(lineValue)

    isTossing.value = false

    if (lines.value.length === 6) {
      setTimeout(() => {
        emit('complete', lines.value)
      }, 800)
    }
  }, 1000) // 动画持续 1 秒
}
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}

/* 简单的翻转动画 */
@keyframes flipCoin {
  0% {
    transform: translateY(0) rotateX(0) rotateY(0) scale(1);
  }
  50% {
    transform: translateY(-50px) rotateX(720deg) rotateY(360deg) scale(1.2);
  }
  100% {
    transform: translateY(0) rotateX(1440deg) rotateY(720deg) scale(1);
  }
}
.animate-flip {
  animation: flipCoin 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
</style>
