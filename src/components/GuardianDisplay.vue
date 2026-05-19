<script setup lang="ts">
import { computed } from 'vue'
import { GUARDIANS, beastBodyPath } from '@/lib/guardians'
import type { GuardianKey } from '@/types'

const props = defineProps<{ guardianKey: GuardianKey; size?: number }>()

const g = computed(() => GUARDIANS[props.guardianKey])
const sz = computed(() => props.size ?? 160)
const cx = computed(() => sz.value / 2)
const cy = computed(() => sz.value / 2)
const scale = computed(() => sz.value / 160)
const path = computed(() => beastBodyPath(props.guardianKey))
</script>

<template>
  <div class="gd-wrap" :style="{ width: sz + 'px', height: sz + 'px' }">
    <svg
      :width="sz"
      :height="sz"
      :viewBox="`0 0 ${sz} ${sz}`"
      class="gd-svg"
      :aria-label="g.name + ' · ' + g.en"
      role="img"
    >
      <g :style="`transform-origin:${cx}px ${cy}px`" class="bagua-ring">
        <circle :cx="cx" :cy="cy" :r="cx * 0.93" fill="none" :stroke="g.color" stroke-width="0.4" opacity="0.12"/>
        <text v-for="(tri, i) in ['☰','☱','☲','☳','☴','☵','☶','☷']" :key="i"
          :x="(cx + cx * 0.93 * Math.cos(i/8*Math.PI*2 - Math.PI/2)).toFixed(1)"
          :y="(cy + cx * 0.93 * Math.sin(i/8*Math.PI*2 - Math.PI/2) + 4).toFixed(1)"
          text-anchor="middle" :font-size="sz * 0.065" :fill="g.color" opacity="0.22"
        >{{ tri }}</text>
      </g>
      <circle
        :cx="cx" :cy="cy" :r="cx * 0.62"
        :fill="g.glowColor" :stroke="g.color"
        stroke-width="0.6" opacity="0.5"
        class="gd-aura"
      />
      <g
        :transform="`translate(${cx - 80 * scale},${cy - 80 * scale}) scale(${scale})`"
        class="gd-beast"
      >
        <path
          :d="path"
          :fill="g.color + '22'"
          :stroke="g.color"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.85"
        />
      </g>
      <text :x="cx" :y="sz - 18" text-anchor="middle" :font-size="sz * 0.082" :fill="g.color" opacity="0.7" letter-spacing="3">{{ g.name }}</text>
      <text :x="cx" :y="sz - 6"  text-anchor="middle" :font-size="sz * 0.055" :fill="g.color" opacity="0.38">{{ g.en }}</text>
    </svg>
    <div
      class="gd-halo"
      :style="{
        width: (sz * 0.9) + 'px',
        height: (sz * 0.9) + 'px',
        background: `radial-gradient(circle, ${g.glowColor}, transparent 70%)`,
      }"
    />
  </div>
</template>

<style scoped>
.gd-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.gd-svg { display: block; overflow: visible; }
.gd-halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: gdHaloPulse 3.2s ease-in-out infinite;
}
.gd-aura { animation: gdAuraPulse 3s ease-in-out infinite; }
.gd-beast { animation: gdBreathe 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.bagua-ring { animation: guardianSpin 55s linear infinite; }
@keyframes gdHaloPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.9;transform:scale(1.1)} }
@keyframes gdAuraPulse { 0%,100%{opacity:.45;r:attr(r)} 50%{opacity:.75} }
@keyframes gdBreathe   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
@keyframes guardianSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
</style>
