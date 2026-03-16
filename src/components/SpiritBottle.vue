<template>
  <div class="flex items-center justify-center gap-5 py-2 group cursor-pointer" @click="handleRefill">

    <!-- 灵力瓶 -->
    <div class="relative flex flex-col items-center gap-2">
      <!-- 瓶体 -->
      <div class="relative w-9 h-14 rounded-sm overflow-hidden transition-all duration-500"
           :style="bottleStyle">
        <!-- 扫描线 -->
        <div class="absolute inset-x-0 h-px z-20 mix-blend-screen bottle-scan"
             :style="{ background: scanColor }"></div>
        <!-- 液位 -->
        <div class="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-out z-10"
             :style="liquidStyle">
          <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 3px 3px;"></div>
        </div>
        <!-- 状态图标 -->
        <div class="absolute inset-0 z-30 flex items-center justify-center">
          <span v-if="isUnlimited" class="font-mono text-base" :style="infiniteStyle">∞</span>
          <span v-else-if="!hasSpirit" class="text-base font-bold animate-pulse" style="color: rgba(239,68,68,0.9); text-shadow: 0 0 8px rgba(239,68,68,0.6)">!</span>
        </div>
        <!-- 顶部高光 -->
        <div class="absolute top-0 inset-x-0 h-3 pointer-events-none z-20"
             style="background: linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)"></div>
      </div>

      <!-- 瓶盖 -->
      <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-sm"
           :style="capStyle"></div>
    </div>

    <!-- 状态文字 -->
    <div class="flex flex-col gap-1">
      <span class="text-[9px] tracking-[0.4em] uppercase font-mono transition-colors duration-300"
            :style="{ color: statusColor }">
        {{ statusText }}
      </span>

      <!-- 灵力充足 -->
      <template v-if="hasSpirit || isUnlimited">
        <div class="flex items-center gap-1.5">
          <div class="w-1 h-1 rounded-full animate-pulse" :style="{ background: statusColor }"></div>
          <span class="text-[7px] font-mono tracking-widest" style="color: rgba(255,255,255,0.3)">
            {{ isUnlimited ? 'ADMIN · UNRESTRICTED' : 'READY TO DIVINE' }}
          </span>
        </div>
      </template>

      <!-- 灵力耗尽 -->
      <template v-else>
        <span class="text-[7px] font-mono tracking-widest" style="color: rgba(239,68,68,0.55)">
          DAILY SYNC · {{ shareCount || 0 }}/3 USED
        </span>
        <span class="text-[7px] font-mono tracking-widest transition-colors group-hover:text-tao-gold"
              style="color: rgba(255,255,255,0.2)">
          TAP TO SHARE → REFILL
        </span>
      </template>
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

const statusText = computed(() => {
  if (props.isUnlimited) return 'INFINITE POWER'
  if (hasSpirit.value) return 'SPIRIT ALIGNED'
  return 'VOID DEPLETED'
})

const statusColor = computed(() => {
  if (props.isUnlimited) return '#22d3ee'
  if (hasSpirit.value) return 'rgba(34,211,238,0.75)'
  return 'rgba(239,68,68,0.75)'
})

const scanColor = computed(() => {
  if (props.isUnlimited || hasSpirit.value) return '#22d3ee'
  return 'rgba(239,68,68,0.7)'
})

const bottleStyle = computed(() => {
  const base = {
    background: '#040810',
    border: '1px solid',
  }
  if (props.isUnlimited || hasSpirit.value) {
    return { ...base, borderColor: 'rgba(34,211,238,0.55)', boxShadow: '0 0 12px rgba(34,211,238,0.25), inset 0 0 8px rgba(34,211,238,0.04)' }
  }
  return { ...base, borderColor: 'rgba(239,68,68,0.4)', boxShadow: '0 0 8px rgba(239,68,68,0.15)' }
})

const capStyle = computed(() => {
  if (props.isUnlimited || hasSpirit.value) {
    return { background: 'rgba(34,211,238,0.3)', border: '1px solid rgba(34,211,238,0.4)' }
  }
  return { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }
})

const liquidStyle = computed(() => {
  const height = (props.isUnlimited || hasSpirit.value) ? '100%' : '8%'
  let bg, shadow
  if (props.isUnlimited) {
    bg = 'rgba(34,211,238,0.4)'; shadow = '0 -4px 16px rgba(34,211,238,0.6)'
  } else if (hasSpirit.value) {
    bg = 'rgba(34,211,238,0.25)'; shadow = '0 -3px 12px rgba(34,211,238,0.4)'
  } else {
    bg = 'rgba(239,68,68,0.3)'; shadow = '0 -2px 8px rgba(239,68,68,0.3)'
  }
  return { height, background: bg, boxShadow: shadow, transition: 'height 1s ease, background 0.5s' }
})

const infiniteStyle = computed(() => ({
  color: '#22d3ee',
  textShadow: '0 0 10px rgba(34,211,238,0.9), 0 0 20px rgba(34,211,238,0.4)',
  animation: 'inf-pulse 3s ease-in-out infinite',
}))

const handleRefill = () => {
  if (!hasSpirit.value && !props.isUnlimited) emit('refill')
}
</script>

<style scoped>
@keyframes inf-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(34,211,238,0.8)); }
}
@keyframes bottle-scan {
  0%   { top: -1px; opacity: 0; }
  8%   { opacity: 0.9; }
  92%  { opacity: 0.9; }
  100% { top: calc(100% + 1px); opacity: 0; }
}
.bottle-scan { animation: bottle-scan 2.5s linear infinite; position: absolute; }
</style>
