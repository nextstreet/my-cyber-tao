<script setup lang="ts">
import { computed } from 'vue'
import { MANSIONS, type LunarMansion } from '@/lib/almanac'

const props = defineProps<{
  todayIndex: number
  size?: number
}>()

const sz = computed(() => props.size ?? 220)
const cx = computed(() => sz.value / 2)
const cy = computed(() => sz.value / 2)
const rOuter = computed(() => sz.value * 0.41)
const rInner = computed(() => sz.value * 0.295)
const rLabel = computed(() => (rOuter.value + rInner.value) / 2)
const rCenter = computed(() => sz.value * 0.19)

const segments = computed(() => {
  const n = 28
  return MANSIONS.map((m: LunarMansion, i: number) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
    const aMid = (a0 + a1) / 2
    const x1 = cx.value + rOuter.value * Math.cos(a0)
    const y1 = cy.value + rOuter.value * Math.sin(a0)
    const x2 = cx.value + rOuter.value * Math.cos(a1)
    const y2 = cy.value + rOuter.value * Math.sin(a1)
    const xi1 = cx.value + rInner.value * Math.cos(a0)
    const yi1 = cy.value + rInner.value * Math.sin(a0)
    const xi2 = cx.value + rInner.value * Math.cos(a1)
    const yi2 = cy.value + rInner.value * Math.sin(a1)
    const tx = cx.value + rLabel.value * Math.cos(aMid)
    const ty = cy.value + rLabel.value * Math.sin(aMid) + 4
    const isToday = i === props.todayIndex
    return { m, i, x1, y1, x2, y2, xi1, yi1, xi2, yi2, tx, ty, isToday, aMid }
  })
})

const today = computed(() => MANSIONS[props.todayIndex] ?? MANSIONS[0]!)
</script>

<template>
  <svg :width="sz" :height="sz" :viewBox="`0 0 ${sz} ${sz}`" class="mansion-ring">
    <defs>
      <filter id="mglow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <circle :cx="cx" :cy="cy" :r="rOuter" fill="none" stroke="rgba(201,168,76,0.08)" stroke-width="0.5"/>
    <circle :cx="cx" :cy="cy" :r="rInner" fill="none" stroke="rgba(201,168,76,0.08)" stroke-width="0.5"/>
    <g v-for="seg in segments" :key="seg.i">
      <path
        :d="`M${seg.x1.toFixed(1)},${seg.y1.toFixed(1)} A${rOuter},${rOuter} 0 0,1 ${seg.x2.toFixed(1)},${seg.y2.toFixed(1)} L${seg.xi2.toFixed(1)},${seg.yi2.toFixed(1)} A${rInner},${rInner} 0 0,0 ${seg.xi1.toFixed(1)},${seg.yi1.toFixed(1)} Z`"
        :fill="seg.isToday ? 'rgba(201,168,76,0.22)' : 'rgba(201,168,76,0.03)'"
        :stroke="seg.isToday ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.14)'"
        stroke-width="0.5"
      />
      <text
        v-if="seg.isToday || seg.i % 4 === 0"
        :x="seg.tx.toFixed(1)"
        :y="seg.ty.toFixed(1)"
        text-anchor="middle"
        :font-size="seg.isToday ? 11 : 8"
        :fill="seg.isToday ? '#e8d4a0' : 'rgba(201,168,76,0.32)'"
        :font-weight="seg.isToday ? '600' : '400'"
      >{{ seg.m.symbol }}</text>
    </g>
    <circle :cx="cx" :cy="cy" :r="rCenter + 4" fill="rgba(13,8,32,0.9)" stroke="rgba(201,168,76,0.18)" stroke-width="0.5"/>
    <text :x="cx" :y="cy - 14" text-anchor="middle" font-size="22" fill="#c9a84c">{{ today.symbol }}</text>
    <text :x="cx" :y="cy + 4"  text-anchor="middle" font-size="9"  fill="rgba(201,168,76,0.65)">今日宿 · {{ today.symbol }}宿</text>
    <text :x="cx" :y="cy + 16" text-anchor="middle" font-size="8"  fill="rgba(201,168,76,0.38)">{{ today.nameEn }} · {{ today.element }}</text>
  </svg>
</template>

<style scoped>
.mansion-ring {
  display: block;
  overflow: visible;
}
</style>
