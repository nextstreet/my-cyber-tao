<template>
  <div class="flex flex-col items-center py-4 group cursor-pointer" @click="handleRefill">

    <div class="relative w-10 h-16 border rounded-sm overflow-hidden bg-[#020408] transition-all duration-500"
         :class="containerClass"
         :style="containerGlow">

      <!-- 扫描线 -->
      <div class="absolute inset-x-0 h-px z-20 mix-blend-screen"
           :class="scanColor"
           style="animation: bottle-scan 3s linear infinite;"></div>

      <!-- 液位 -->
      <div class="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10"
           :class="energyClass"
           :style="{ height: isUnlimited || hasSpirit ? '100%' : '8%' }">
        <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px); background-size: 3px 3px;"></div>
      </div>

      <!-- 状态图标 -->
      <div class="absolute inset-0 z-30 flex items-center justify-center">
        <span v-if="isUnlimited" class="font-mono text-lg" :style="infiniteStyle">∞</span>
        <span v-else-if="!hasSpirit" class="text-lg font-bold text-tao-red/90 animate-pulse">!</span>
      </div>

      <!-- 顶部高光 -->
      <div class="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/5 to-transparent z-20 pointer-events-none"></div>
    </div>

    <div class="flex flex-col items-center mt-3 space-y-1">
      <span class="text-[8px] tracking-[0.5em] uppercase font-mono transition-colors duration-300"
            :class="textClass">
        {{ isUnlimited ? 'ADMIN: ∞' : (hasSpirit ? 'SPIRIT ALIGNED' : 'VOID DEPLETED') }}
      </span>

      <div v-if="!hasSpirit && !isUnlimited" class="flex flex-col items-center mt-1 gap-1">
        <span class="text-[7px] tracking-widest text-tao-red/70 uppercase">Daily: {{ shareCount || 0 }}/3</span>
        <span class="text-[7px] tracking-[0.3em] text-white/25 uppercase group-hover:text-tao-gold/60 transition-colors">Tap to Sync</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['lastReadingTime', 'isUnlimited', 'shareCount'])
const emit = defineEmits(['refill'])

const hasSpirit = computed(() => {
  if (props.isUnlimited) return true
  if (!props.lastReadingTime) return true
  const hours = (Date.now() - new Date(props.lastReadingTime).getTime()) / (1000 * 60 * 60)
  return hours >= 12
})

const containerClass = computed(() => {
  if (props.isUnlimited || hasSpirit.value) return 'border-cyan-500/50'
  return 'border-tao-red/40 group-hover:border-tao-red/70'
})

const containerGlow = computed(() => {
  if (props.isUnlimited || hasSpirit.value)
    return { boxShadow: '0 0 12px rgba(34,211,238,0.25), 0 0 24px rgba(34,211,238,0.1), inset 0 0 8px rgba(34,211,238,0.05)' }
  return { boxShadow: '0 0 8px rgba(138,42,42,0.2), inset 0 0 6px rgba(138,42,42,0.05)' }
})

const energyClass = computed(() => {
  if (props.isUnlimited) return 'bg-cyan-500/35 shadow-[0_-4px_16px_rgba(34,211,238,0.5)]'
  if (hasSpirit.value) return 'bg-cyan-400/25 shadow-[0_-3px_12px_rgba(34,211,238,0.35)]'
  return 'bg-tao-red/35 shadow-[0_-2px_8px_rgba(220,38,38,0.3)]'
})

const textClass = computed(() => {
  if (props.isUnlimited) return 'text-cyan-400'
  if (hasSpirit.value) return 'text-cyan-400/60'
  return 'text-tao-red/60'
})

const scanColor = computed(() => {
  if (props.isUnlimited || hasSpirit.value) return 'bg-cyan-300/60'
  return 'bg-tao-red/50'
})

const infiniteStyle = computed(() => ({
  color: '#22d3ee',
  textShadow: '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)',
  animation: 'pulse-glow 3s ease-in-out infinite'
}))

const handleRefill = () => {
  if (!hasSpirit.value && !props.isUnlimited) emit('refill')
}
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 4px rgba(34,211,238,0.4)); }
  50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(34,211,238,0.9)); }
}

@keyframes bottle-scan {
  0% { top: -2px; opacity: 0; }
  8% { opacity: 0.8; }
  92% { opacity: 0.8; }
  100% { top: calc(100% + 2px); opacity: 0; }
}
</style>
