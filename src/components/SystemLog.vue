<template>
  <div class="w-full overflow-hidden sys-log-bar" style="height: 22px;">
    <div class="flex items-center gap-2 h-full">
      <span class="text-[7px] font-mono tracking-[0.3em] shrink-0"
            style="color: rgba(34,211,238,0.5)">SYS</span>
      <span class="text-[7px] font-mono shrink-0"
            style="color: rgba(200,170,110,0.25)">▶</span>
      <div class="overflow-hidden flex-1 relative h-full flex items-center"
           style="mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent)">
        <div class="log-ticker flex items-center whitespace-nowrap"
             :style="{ animationDuration: `${tickerDuration}s` }">
          <template v-for="(msg, i) in doubledMessages" :key="i">
            <span class="mr-10 flex items-center gap-1.5 text-[7px] font-mono tracking-[0.2em]">
              <span :style="{ color: msg.color }">{{ msg.prefix }}</span>
              <span style="color: rgba(180,175,165,0.55)">{{ msg.text }}</span>
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const LOG_POOL = [
  { prefix: 'SYSTEM:', text: 'Neural grid link established ··· [OK]',        color: 'rgba(34,197,94,0.7)' },
  { prefix: 'TAO:',    text: 'Hexagram matrix calibrated ··· [64/64]',        color: 'rgba(200,170,110,0.7)' },
  { prefix: 'SYNC:',   text: 'Quantum entanglement stable ··· 98.4%',         color: 'rgba(34,211,238,0.65)' },
  { prefix: 'DAEMON:', text: 'Karmic flux buffer initialized',                 color: 'rgba(167,139,250,0.65)' },
  { prefix: 'ENTROPY:',text: 'Cosmic noise floor nominal ··· [STABLE]',       color: 'rgba(34,197,94,0.7)' },
  { prefix: 'NEURAL:', text: 'Spirit channel open ··· awaiting query',        color: 'rgba(200,170,110,0.7)' },
  { prefix: 'WARN:',   text: 'Temporal paradox detected ··· resolving',       color: 'rgba(251,191,36,0.7)' },
  { prefix: 'CORE:',   text: 'Divination engine v2.0 ··· operational',        color: 'rgba(34,211,238,0.65)' },
  { prefix: 'FATE:',   text: 'Destiny thread index loaded ··· [64/64]',       color: 'rgba(200,170,110,0.7)' },
  { prefix: 'VOID:',   text: 'Akashic records ··· AUTH OK',                   color: 'rgba(167,139,250,0.65)' },
  { prefix: 'BAGUA:',  text: 'Eight trigram array aligned ··· [READY]',       color: 'rgba(34,197,94,0.7)' },
  { prefix: 'CLOCK:',  text: 'Celestial cycle synchronized ··· 甲辰年',       color: 'rgba(200,170,110,0.7)' },
  { prefix: 'PROBE:',  text: 'Reading morphic resonance field ··· active',    color: 'rgba(34,211,238,0.65)' },
  { prefix: 'COIN:',   text: 'Probability collapse pending ··· standby',      color: 'rgba(251,191,36,0.7)' },
]

// 打乱顺序，增加随机感（基于当前分钟，每分钟变化）
const shuffled = computed(() => {
  const seed = Math.floor(Date.now() / 60000)
  return [...LOG_POOL].sort((a, b) => {
    const ha = (a.prefix.charCodeAt(0) * seed) % 100
    const hb = (b.prefix.charCodeAt(0) * seed) % 100
    return ha - hb
  })
})

// 双倍内容实现无缝循环
const doubledMessages = computed(() => [...shuffled.value, ...shuffled.value])
const tickerDuration = computed(() => shuffled.value.length * 4.5)
</script>

<style scoped>
.sys-log-bar {
  border-top: 1px solid rgba(200, 170, 110, 0.08);
  padding-top: 4px;
}

@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.log-ticker {
  animation: ticker linear infinite;
  will-change: transform;
}
</style>
