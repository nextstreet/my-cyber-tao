<template>
  <div class="relative w-16 h-24 mx-auto cursor-pointer group" @click="handleBottleClick">
    <div
      class="absolute inset-0 border-2 border-tao-gold/50 rounded-t-lg rounded-b-xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.2)]"
    >
      <div
        class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-900 to-cyan-400 transition-all duration-1000 ease-out"
        :style="{ height: `${fillPercentage}%` }"
      >
        <div
          class="absolute top-[-5px] left-0 w-[200%] h-3 bg-cyan-400/50 rounded-[100%] animate-wave"
        ></div>
      </div>

      <div class="absolute top-1/4 left-0 w-full h-[1px] bg-white/10"></div>
      <div class="absolute top-2/4 left-0 w-full h-[1px] bg-white/10"></div>
      <div class="absolute top-3/4 left-0 w-full h-[1px] bg-white/10"></div>
    </div>

    <div class="absolute -bottom-6 w-full text-center text-[10px] text-cyan-300 tracking-wider">
      {{ isFull ? 'READY' : `${timeLeft}` }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { differenceInMinutes } from 'date-fns'

const props = defineProps(['lastReadingTime']) // 从 Supabase 获取的时间戳
const emit = defineEmits(['share-refill'])

const now = ref(new Date())
let timer = null

// 核心恢复逻辑
const fillPercentage = computed(() => {
  if (!props.lastReadingTime) return 100

  const last = new Date(props.lastReadingTime)
  const diffMinutes = differenceInMinutes(now.value, last)
  const totalMinutes = 12 * 60 // 12小时

  // 计算百分比，最高 100
  const percent = Math.min(100, (diffMinutes / totalMinutes) * 100)
  return Math.max(0, percent)
})

const isFull = computed(() => fillPercentage.value >= 100)

// 剩余时间显示
const timeLeft = computed(() => {
  const percent = fillPercentage.value
  const minsRemaining = Math.floor(12 * 60 * (1 - percent / 100))
  const h = Math.floor(minsRemaining / 60)
  const m = minsRemaining % 60
  return `${h}h ${m}m`
})

const handleBottleClick = () => {
  if (!isFull.value) {
    // 如果没满，点击触发分享
    emit('share-refill')
  }
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000) // 每分钟更新
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
@keyframes wave {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(0);
  }
}
.animate-wave {
  animation: wave 3s linear infinite;
}
</style>
