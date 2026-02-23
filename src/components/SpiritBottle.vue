<template>
  <div class="flex flex-col items-center gap-2 group cursor-help" @click="$emit('share-refill')">
    <div class="relative w-16 h-4 border border-tao-gold/30 bg-black/40 overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-tao-red via-tao-gold to-tao-gold-light transition-all duration-1000 shadow-[0_0_10px_rgba(200,170,110,0.5)]"
        :style="{ width: hasSpirit ? '100%' : '15%' }"
      ></div>
      <div
        class="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(200,170,110,0.2)_50%,transparent_100%)] w-full h-full animate-scan"
      ></div>
    </div>
    <span class="text-[9px] tracking-[0.3em] text-tao-gold/60 uppercase">
      {{ hasSpirit ? 'Spirit Synchronized' : 'Recharge Required' }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['lastReadingTime'])
defineEmits(['share-refill'])

const hasSpirit = computed(() => {
  if (!props.lastReadingTime) return true
  const last = new Date(props.lastReadingTime).getTime()
  const now = new Date().getTime()
  return (now - last) / (1000 * 60 * 60) >= 12
})
</script>

<style scoped>
@keyframes scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-scan {
  animation: scan 2s linear infinite;
}
</style>
