<template>
  <div class="mansion-resonance">
    <div class="gauge-label">星宿共鸣 · STELLAR_RESONANCE</div>
    <div class="resonance-body">
      <!-- 圆形进度 SVG -->
      <svg viewBox="0 0 80 80" width="80" height="80">
        <!-- 背景圆环 -->
        <circle cx="40" cy="40" r="32"
          fill="none"
          stroke="rgba(120,80,255,0.12)"
          stroke-width="5"
        />
        <!-- 进度圆环 -->
        <circle cx="40" cy="40" r="32"
          fill="none"
          :stroke="resonanceColor"
          stroke-width="5"
          stroke-linecap="round"
          :stroke-dasharray="`${circumference}`"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 40 40)"
          style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)"
          :filter="`url(#resGlow-${uid})`"
        />
        <defs>
          <filter :id="`resGlow-${uid}`" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <!-- 中心文字 -->
        <text x="40" y="37" text-anchor="middle" font-size="14" font-family="monospace"
          fill="rgba(220,200,255,0.9)" font-weight="bold">
          {{ Math.round(resonance ?? 0) }}
        </text>
        <text x="40" y="50" text-anchor="middle" font-size="6" font-family="monospace"
          fill="rgba(120,80,255,0.6)">RESONANCE</text>
      </svg>

      <div class="mansion-info">
        <div class="mansion-name-big">{{ mansion?.name ?? '—' }}</div>
        <div class="mansion-alias">{{ mansion?.alias ?? '' }}</div>
        <div class="mansion-element" v-if="mansion?.element">
          元素 · {{ mansion.element }}
        </div>
        <div class="signal-tag">{{ mansion?.signal ?? '' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ mansion: any; resonance?: number }>()
const uid = Math.random().toString(36).slice(2, 7)

const circumference = 2 * Math.PI * 32   // ≈ 201
const dashOffset = computed(() => {
  const pct = (props.resonance ?? 0) / 100
  return circumference * (1 - pct)
})
const resonanceColor = computed(() => {
  const r = props.resonance ?? 0
  if (r >= 80) return 'rgba(100,255,160,0.9)'
  if (r >= 50) return 'rgba(120,180,255,0.9)'
  return 'rgba(180,120,255,0.9)'
})
</script>

<style scoped>
.mansion-resonance {
  padding: 1rem;
  background: rgba(120, 80, 255, 0.04);
  border: 1px solid rgba(120, 80, 255, 0.15);
  border-radius: 4px;
}
.gauge-label {
  font-size: 0.6rem;
  color: rgba(120, 80, 255, 0.6);
  font-family: monospace;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}
.resonance-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.mansion-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mansion-name-big {
  font-size: 1.4rem;
  color: rgba(220, 200, 255, 0.95);
  font-weight: bold;
  font-family: monospace;
}
.mansion-alias { font-size: 0.7rem; color: rgba(160, 140, 200, 0.7); }
.mansion-element { font-size: 0.65rem; color: rgba(120, 200, 160, 0.8); font-family: monospace; }
.signal-tag { font-size: 0.58rem; color: rgba(100, 180, 255, 0.5); letter-spacing: 0.1em; margin-top: 2px; }
</style>
