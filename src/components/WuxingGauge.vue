<template>
  <div class="wuxing-gauge">
    <div class="gauge-label">五行能量 · WUXING_MATRIX</div>
    <svg viewBox="-110 -110 220 220" class="gauge-svg">
      <!-- 背景网格 -->
      <polygon v-for="r in [0.25, 0.5, 0.75, 1]" :key="r"
        :points="getPolygonPoints(r)"
        fill="none"
        stroke="rgba(120,80,255,0.12)"
        stroke-width="1"
      />
      <!-- 轴线 -->
      <line v-for="(axis, i) in AXES" :key="'axis-'+i"
        x1="0" y1="0"
        :x2="axis.x * 100" :y2="axis.y * 100"
        stroke="rgba(120,80,255,0.2)"
        stroke-width="1"
      />
      <!-- 数据面 -->
      <polygon
        :points="dataPoints"
        :fill="`url(#wuxingGrad-${uid})`"
        stroke="rgba(180,140,255,0.6)"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <!-- 渐变定义 -->
      <defs>
        <radialGradient :id="`wuxingGrad-${uid}`">
          <stop offset="0%" :stop-color="dominantColor" stop-opacity="0.4"/>
          <stop offset="100%" :stop-color="dominantColor" stop-opacity="0.08"/>
        </radialGradient>
      </defs>
      <!-- 顶点圆点 -->
      <circle v-for="(pt, i) in dataPointsArr" :key="'pt-'+i"
        :cx="pt.x" :cy="pt.y" r="3"
        :fill="ELEMENT_COLORS[ELEMENT_ORDER[i]]"
        :filter="`url(#glow-${uid})`"
      />
      <!-- 发光滤镜 -->
      <defs>
        <filter :id="`glow-${uid}`" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- 标签 -->
      <text v-for="(axis, i) in AXES" :key="'lbl-'+i"
        :x="axis.x * 112" :y="axis.y * 112 + 4"
        text-anchor="middle"
        font-size="9"
        font-family="monospace"
        :fill="ELEMENT_COLORS[ELEMENT_ORDER[i]]"
      >{{ ELEMENT_ORDER[i] }}</text>
    </svg>
    <!-- 主导元素 -->
    <div class="dominant-display" v-if="dominant">
      <span class="dominant-label">主导元素</span>
      <span class="dominant-value" :style="{ color: ELEMENT_COLORS[dominant] }">
        {{ dominant }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  energy: Record<string, number>
  dominant?: string
}>()

const uid = Math.random().toString(36).slice(2, 7)

const ELEMENT_ORDER = ['木', '火', '土', '金', '水']
const ELEMENT_COLORS: Record<string, string> = {
  木: '#4ade80', 火: '#f97316', 土: '#fbbf24', 金: '#e5e7eb', 水: '#60a5fa'
}
// 五个顶点均匀分布在五边形
const AXES = ELEMENT_ORDER.map((_, i) => {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
  return { x: Math.cos(angle), y: Math.sin(angle) }
})

function getPolygonPoints(scale: number) {
  return AXES.map(a => `${a.x * 100 * scale},${a.y * 100 * scale}`).join(' ')
}

const dataPointsArr = computed(() =>
  ELEMENT_ORDER.map((el, i) => {
    const val = (props.energy?.[el] ?? 0) / 100
    return {
      x: AXES[i].x * 100 * val,
      y: AXES[i].y * 100 * val,
    }
  })
)

const dataPoints = computed(() =>
  dataPointsArr.value.map(p => `${p.x},${p.y}`).join(' ')
)

const dominantColor = computed(() =>
  props.dominant ? ELEMENT_COLORS[props.dominant] : '#7c3aed'
)
</script>

<style scoped>
.wuxing-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  align-self: flex-start;
}
.gauge-svg {
  width: 140px;
  height: 140px;
  overflow: visible;
}
.dominant-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dominant-label { font-size: 0.6rem; color: rgba(160, 140, 200, 0.6); font-family: monospace; }
.dominant-value { font-size: 1.1rem; font-weight: bold; font-family: monospace; }
</style>
