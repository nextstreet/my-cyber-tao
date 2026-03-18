<template>
  <div class="flex items-center justify-center gap-5 py-2 group cursor-pointer" @click="handleRefill">

    <!-- 灵力瓶 -->
    <div class="relative flex flex-col items-center gap-2">
      <div class="relative w-9 h-14 rounded-sm overflow-hidden transition-all duration-500"
           :style="bottleStyle">
        <div class="absolute inset-x-0 h-px z-20 mix-blend-screen bottle-scan"
             :style="{ background: scanColor }"></div>
        <div class="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-out z-10"
             :style="liquidStyle">
          <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 3px 3px;"></div>
        </div>
        <div class="absolute inset-0 z-30 flex items-center justify-center">
          <span v-if="isUnlimited" class="font-mono text-base" :style="infiniteStyle">∞</span>
          <!-- 显示灵力点数 -->
          <span v-else class="font-mono font-black" :style="pointsStyle">{{ spiritPoints }}</span>
        </div>
        <div class="absolute top-0 inset-x-0 h-3 pointer-events-none z-20"
             style="background: linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)"></div>
      </div>
      <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-sm" :style="capStyle"></div>
    </div>

    <!-- 状态文字 -->
    <div class="flex flex-col gap-1">
      <span class="text-[9px] tracking-[0.4em] uppercase font-mono transition-colors duration-300"
            :style="{ color: statusColor }">
        {{ statusText }}
      </span>

      <!-- Admin -->
      <template v-if="isUnlimited">
        <div class="flex items-center gap-1.5">
          <div class="w-1 h-1 rounded-full animate-pulse" :style="{ background: statusColor }"></div>
          <span class="text-[7px] font-mono tracking-widest" style="color: rgba(255,255,255,0.3)">ADMIN · UNRESTRICTED</span>
        </div>
      </template>

      <!-- 有灵力 -->
      <template v-else-if="hasEnough">
        <div class="flex items-center gap-1.5">
          <!-- 能量条：24点分3格，每格8点 -->
          <div class="flex gap-0.5">
            <div v-for="n in 3" :key="n"
                 class="w-3.5 h-1.5 rounded-sm transition-all duration-700"
                 :style="n <= activeBars
                   ? `background:#22d3ee;box-shadow:0 0 5px rgba(34,211,238,${0.4 + n*0.15})`
                   : 'background:rgba(255,255,255,0.08)'">
            </div>
          </div>
          <span class="text-[7px] font-mono tracking-widest" style="color: rgba(255,255,255,0.3)">
            {{ spiritPoints }}/24 ⚡
          </span>
        </div>
      </template>

      <!-- 灵力不足 -->
      <template v-else>
        <span class="text-[7px] font-mono tracking-widest" style="color: rgba(239,68,68,0.55)">
          INSUFFICIENT SPIRIT
        </span>
        <span class="text-[7px] font-mono tracking-widest transition-colors group-hover:text-tao-gold"
              style="color: rgba(255,255,255,0.2)">
          SHARE CARD → +8 ⚡
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  spiritPoints: { type: Number, default: 24 },
  isUnlimited:  { type: Boolean, default: false },
  shareCount:   { type: Number, default: 0 },
})
const emit = defineEmits(['refill'])

const MAX_SPIRIT = 24
const SPIRIT_PER_READ = 8

// 是否有足够灵力占卜（>=8点）
const hasEnough = computed(() => props.isUnlimited || props.spiritPoints >= SPIRIT_PER_READ)

// 能量条：每格=8点，3格=满
const activeBars = computed(() => Math.min(3, Math.ceil(props.spiritPoints / SPIRIT_PER_READ)))

const statusText = computed(() => {
  if (props.isUnlimited) return 'INFINITE POWER'
  if (props.spiritPoints >= 24) return 'SPIRIT ALIGNED'
  if (props.spiritPoints >= 8)  return 'SIGNAL ACTIVE'
  return 'VOID DEPLETED'
})

const statusColor = computed(() => {
  if (props.isUnlimited) return '#22d3ee'
  if (hasEnough.value) return 'rgba(34,211,238,0.75)'
  return 'rgba(239,68,68,0.75)'
})

const scanColor = computed(() => hasEnough.value ? '#22d3ee' : 'rgba(239,68,68,0.7)')

const bottleStyle = computed(() => {
  const base = { background: '#040810', border: '1px solid' }
  if (hasEnough.value) return { ...base, borderColor: 'rgba(34,211,238,0.55)', boxShadow: '0 0 12px rgba(34,211,238,0.25), inset 0 0 8px rgba(34,211,238,0.04)' }
  return { ...base, borderColor: 'rgba(239,68,68,0.4)', boxShadow: '0 0 8px rgba(239,68,68,0.15)' }
})

const capStyle = computed(() => {
  if (hasEnough.value) return { background: 'rgba(34,211,238,0.3)', border: '1px solid rgba(34,211,238,0.4)' }
  return { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }
})

const liquidStyle = computed(() => {
  // 液位跟随灵力点数
  const pct = props.isUnlimited ? 100 : Math.max(4, (props.spiritPoints / MAX_SPIRIT) * 100)
  let bg, shadow
  if (props.isUnlimited) {
    bg = 'rgba(34,211,238,0.4)'; shadow = '0 -4px 16px rgba(34,211,238,0.6)'
  } else if (hasEnough.value) {
    bg = 'rgba(34,211,238,0.25)'; shadow = '0 -3px 12px rgba(34,211,238,0.4)'
  } else {
    bg = 'rgba(239,68,68,0.3)'; shadow = '0 -2px 8px rgba(239,68,68,0.3)'
  }
  return { height: `${pct}%`, background: bg, boxShadow: shadow, transition: 'height 1s ease, background 0.5s' }
})

const pointsStyle = computed(() => {
  const color = hasEnough.value ? '#22d3ee' : 'rgba(239,68,68,0.9)'
  const shadow = hasEnough.value ? '0 0 10px rgba(34,211,238,0.8)' : '0 0 8px rgba(239,68,68,0.6)'
  return { fontSize: props.spiritPoints >= 10 ? '14px' : '16px', color, textShadow: shadow, fontFamily: 'monospace', fontWeight: '900' }
})

const infiniteStyle = computed(() => ({
  color: '#22d3ee',
  textShadow: '0 0 10px rgba(34,211,238,0.9), 0 0 20px rgba(34,211,238,0.4)',
  animation: 'inf-pulse 3s ease-in-out infinite',
}))

const handleRefill = () => {
  if (!hasEnough.value && !props.isUnlimited) emit('refill')
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
