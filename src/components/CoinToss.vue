<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-2xl mb-8 text-tao-gold-light tracking-widest uppercase animate-pulse">
      {{ lines.length < 6 ? `Cast ${lines.length + 1}/6` : 'Hexagram Complete' }}
    </h2>

    <div class="relative w-64 h-64 mb-10 flex justify-center items-center">
      <div
        v-if="isTossing"
        class="absolute inset-0 border-4 border-tao-gold rounded-full animate-spin"
      ></div>

      <div class="text-6xl transition-transform duration-500" :class="{ 'scale-110': isTossing }">
        🪙
      </div>
    </div>

    <div class="flex flex-col-reverse mb-10">
      <HexagramLine
        v-for="(line, index) in lines"
        :key="index"
        :isYang="line === 1"
        :animate="true"
      />
    </div>

    <button
      @click="handleToss"
      :disabled="isTossing || lines.length >= 6"
      class="px-8 py-3 border border-tao-gold text-tao-gold hover:bg-tao-gold hover:text-black transition-colors duration-300 disabled:opacity-50 tracking-widest uppercase"
    >
      {{ lines.length >= 6 ? 'Deciphering...' : 'Toss Coins' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HexagramLine from './HexagramLine.vue'
import { generateLine } from '../lib/fate'

const emit = defineEmits(['complete', 'update-entropy'])
const props = defineProps(['userEntropy'])

const lines = ref([]) // 存储 0 或 1
const isTossing = ref(false)

const handleToss = () => {
  if (lines.value.length >= 6) return

  isTossing.value = true

  // 播放音效 (逻辑需自行添加)
  // const audio = new Audio('/coin-sound.mp3'); audio.play();

  setTimeout(() => {
    // 结合用户之前输入的熵和当前时间
    const result = generateLine(props.userEntropy + lines.value.length)
    lines.value.push(result) // 添加到数组
    isTossing.value = false

    if (lines.value.length === 6) {
      setTimeout(() => emit('complete', lines.value), 1000)
    }
  }, 1200) // 模拟动画时长
}
</script>
