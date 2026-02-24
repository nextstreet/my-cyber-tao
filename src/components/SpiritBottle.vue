<template>
  <div class="flex flex-col items-center py-6 group cursor-pointer" @click="handleRefill">
    
    <div class="relative w-12 h-20 border-2 rounded-sm overflow-hidden mb-6 bg-[#050505] transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
         :class="containerClass">
      
      <div class="absolute inset-x-0 h-[1px] bg-white/40 animate-scan z-20 mix-blend-screen"></div>

      <div class="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] z-10"
           :class="energyClass"
           :style="{ height: isUnlimited || hasSpirit ? '100%' : '10%' }">
        <div class="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4px_4px] opacity-20"></div>
      </div>

      <div class="absolute inset-0 z-30 flex items-center justify-center">
        <span v-if="isUnlimited" class="text-cyan-400 font-mono text-xl animate-pulse-glow">∞</span>
        <span v-else-if="!hasSpirit" class="text-tao-red text-xl font-bold opacity-80 animate-pulse">!</span>
      </div>
    </div>

    <div class="flex flex-col items-center space-y-2">
      <span class="text-[10px] tracking-[0.5em] uppercase font-mono transition-colors duration-300"
            :class="textClass">
        {{ isUnlimited ? 'ADMIN: INFINITE' : (hasSpirit ? 'SPIRIT ALIGNED' : 'VOID DEPLETED') }}
      </span>
      
      <div v-if="!hasSpirit && !isUnlimited" class="flex flex-col items-center mt-2">
        <span class="text-[8px] tracking-widest text-tao-red/80 uppercase">Daily Sync: {{ shareCount || 0 }}/3</span>
        <span class="text-[7px] tracking-[0.3em] text-white/30 uppercase mt-3 group-hover:text-tao-gold transition-colors">Tap to Channel Sync</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 修复：添加了 shareCount
const props = defineProps(['lastReadingTime', 'isUnlimited', 'shareCount'])
const emit = defineEmits(['refill'])

const hasSpirit = computed(() => {
  if (props.isUnlimited) return true
  if (!props.lastReadingTime) return true
  const hours = (new Date().getTime() - new Date(props.lastReadingTime).getTime()) / (1000 * 60 * 60)
  return hours >= 12
})

// 动态计算样式类
const containerClass = computed(() => {
  if (props.isUnlimited || hasSpirit.value) {
    return 'border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
  }
  return 'border-tao-red/30 shadow-[0_0_15px_rgba(220,38,38,0.1)] group-hover:border-tao-red/60'
})

const energyClass = computed(() => {
  if (props.isUnlimited) return 'bg-cyan-500/40 shadow-[0_-5px_20px_rgba(34,211,238,0.4)]'
  if (hasSpirit.value) return 'bg-cyan-400/30 shadow-[0_-5px_15px_rgba(34,211,238,0.3)]'
  return 'bg-tao-red/40 shadow-[0_-2px_10px_rgba(220,38,38,0.3)]'
})

const textClass = computed(() => {
  if (props.isUnlimited) return 'text-cyan-400'
  if (hasSpirit.value) return 'text-cyan-400/70'
  return 'text-tao-red/60'
})

const handleRefill = () => {
  // 只有在灵力枯竭且非管理员的情况下，点击才触发 refill (分享逻辑)
  if (!hasSpirit.value && !props.isUnlimited) {
    emit('refill')
  }
}
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; text-shadow: 0 0 5px rgba(34,211,238,0.2); }
  50% { opacity: 0.8; text-shadow: 0 0 15px rgba(34,211,238,0.8); }
}

@keyframes scan {
  0% { transform: translateY(-10px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(80px); opacity: 0; }
}

.animate-pulse-glow { animation: pulse-glow 3s infinite ease-in-out; }
.animate-scan { animation: scan 3s infinite linear; }
</style>
