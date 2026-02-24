<template>
  <div class="flex flex-col items-center py-6 group cursor-pointer" @click="$emit('refill')">
    <div class="relative">
      <div class="w-5 h-4 border-x-2 border-t-2 border-tao-gold/40 bg-black/40 mx-auto"></div>
      <div class="w-12 h-16 border-2 border-tao-gold/40 rounded-b-2xl relative overflow-hidden bg-black/20 shadow-[0_0_20px_rgba(200,170,110,0.1)]">
        <div 
          class="absolute bottom-0 w-full transition-all duration-1000 ease-in-out"
          :class="[hasSpirit ? 'bg-gradient-to-t from-tao-red via-tao-gold to-tao-gold-light' : 'bg-gray-800']"
          :style="{ height: hasSpirit ? '100%' : '15%' }"
        >
          <div v-if="hasSpirit" class="absolute inset-0 animate-pulse-glow bg-white/10"></div>
          <div class="absolute top-0 w-full h-1 bg-white/40 shadow-[0_0_10px_white] animate-scan"></div>
        </div>
      </div>
    </div>
    <span class="text-[9px] mt-3 tracking-[0.4em] text-tao-gold/50 uppercase font-mono">
      {{ isUnlimited ? 'ADMIN: UNLIMITED' : (hasSpirit ? 'SPIRIT SYNCED' : 'DEPLETED') }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['lastReadingTime', 'isUnlimited'])
defineEmits(['refill'])

const hasSpirit = computed(() => {
  if (props.isUnlimited) return true
  if (!props.lastReadingTime) return true
  const hours = (new Date().getTime() - new Date(props.lastReadingTime).getTime()) / (1000 * 60 * 60)
  return hours >= 12
})
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}
@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(60px); opacity: 0; }
}
.animate-pulse-glow { animation: pulse-glow 3s infinite ease-in-out; }
.animate-scan { animation: scan 4s infinite linear; }
</style>
