<template>
  <div class="bottle-wrap">
    <div class="bottle-neck"></div>
    <div class="bottle-body">
      <div class="liquid" :style="{ height: isUnlimited ? '100%' : (hasSpirit ? '100%' : '15%') }">
        <div class="wave"></div>
      </div>
    </div>
    <span class="text-[8px] mt-2 tracking-widest text-tao-gold/40">CORE STATUS: {{ hasSpirit ? 'STABLE' : 'DEPLETED' }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['lastReadingTime'])
const isUnlimited = computed(() => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const hasSpirit = computed(() => {
  if (isUnlimited.value) return true
  if (!props.lastReadingTime) return true
  return (new Date().getTime() - new Date(props.lastReadingTime).getTime()) / (1000 * 60 * 60) >= 12
})
</script>

<style scoped>
.bottle-wrap { @apply flex flex-col items-center py-4; }
.bottle-neck { @apply w-4 h-3 border-x-2 border-t-2 border-tao-gold/30 bg-black/20; }
.bottle-body { 
  @apply w-10 h-14 border-2 border-tao-gold/30 rounded-b-xl relative overflow-hidden bg-black/20;
  box-shadow: inset 0 0 15px rgba(200,170,110,0.1);
}
.liquid { 
  @apply absolute bottom-0 w-full bg-gradient-to-t from-tao-red via-tao-gold to-tao-gold-light transition-all duration-1000 shadow-[0_-5px_15px_rgba(200,170,110,0.4)]; 
}
.wave { @apply absolute top-0 w-full h-1 bg-white/20 animate-pulse; }
</style>
