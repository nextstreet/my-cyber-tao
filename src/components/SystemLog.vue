<template>
  <div class="w-full overflow-hidden" style="height: 28px;">
    <div class="font-mono text-[7px] md:text-[8px] tracking-[0.3em] text-tao-gold/30 whitespace-nowrap flex items-center gap-2">
      <span class="text-cyan-500/50 shrink-0">SYS</span>
      <div class="overflow-hidden flex-1" style="mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)">
        <div class="log-ticker" :style="{ animationDuration: `${tickerDuration}s` }">
          <span v-for="(msg, i) in displayMessages" :key="i" class="mr-8">
            <span :class="msg.color">{{ msg.prefix }}</span>
            {{ msg.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const LOG_POOL = [
  { prefix: 'SYSTEM:', text: 'Linking to neural grid... [OK]', color: 'text-green-400/70' },
  { prefix: 'TAO:', text: 'Hexagram matrix calibrated... [READY]', color: 'text-tao-gold/60' },
  { prefix: 'SYNC:', text: 'Quantum entanglement stable... [98.4%]', color: 'text-cyan-400/60' },
  { prefix: 'DAEMON:', text: 'Karmic flux buffer initialized', color: 'text-purple-400/60' },
  { prefix: 'ENTROPY:', text: 'Reading cosmic noise floor... [STABLE]', color: 'text-green-400/70' },
  { prefix: 'NEURAL:', text: 'Spirit channel open, awaiting query', color: 'text-tao-gold/60' },
  { prefix: 'WARN:', text: 'Temporal paradox detected, resolving...', color: 'text-yellow-400/60' },
  { prefix: 'CORE:', text: 'Divination engine v2.0 — operational', color: 'text-cyan-400/60' },
  { prefix: 'FATE:', text: 'Destiny thread index loaded [64/64]', color: 'text-tao-gold/60' },
  { prefix: 'VOID:', text: 'Accessing akashic records... [AUTH OK]', color: 'text-purple-400/60' },
]

// Shuffle and cycle messages
const seed = Date.now()
const displayMessages = computed(() => {
  return [...LOG_POOL].sort(() => Math.sin(seed) - 0.5)
})

const tickerDuration = computed(() => displayMessages.value.length * 5)
</script>

<style scoped>
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.log-ticker {
  display: inline-flex;
  /* 双倍内容实现无缝循环 */
  white-space: nowrap;
  animation: ticker linear infinite;
}

.log-ticker::after {
  content: attr(data-clone);
}
</style>
