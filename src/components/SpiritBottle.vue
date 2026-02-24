<template>
<div class="flex flex-col items-center py-6 group cursor-pointer" @click="$emit('refill')">
  <div class="flex flex-col items-center mt-3 space-y-1">
    <span class="text-[9px] tracking-[0.4em] text-tao-gold/50 uppercase font-mono">
      {{ isUnlimited ? 'ADMIN: UNLIMITED' : (hasSpirit ? 'SPIRIT SYNCED' : 'DEPLETED') }}
    </span>
    
    <span v-if="!hasSpirit && !isUnlimited" class="text-[7px] tracking-widest text-tao-red/60 uppercase">
      Daily Sync: {{ shareCount }}/3
    </span>
  </div>
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
