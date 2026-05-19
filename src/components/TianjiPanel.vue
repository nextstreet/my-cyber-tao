<script setup lang="ts">
import { computed } from 'vue'
import type { AlmanacDay } from '@/lib/almanac'

const props = defineProps<{ almanac: AlmanacDay }>()

const WUXING_COLORS: Record<string, string> = {
  '木': '#6ed48a', '火': '#ff8060', '土': '#e8d47a', '金': '#d0d4e8', '水': '#7ab0ff',
}
const WUXING_BG: Record<string, string> = {
  '木': 'rgba(42,140,90,0.15)', '火': 'rgba(204,51,0,0.15)',
  '土': 'rgba(180,140,60,0.15)', '金': 'rgba(180,180,200,0.15)', '水': 'rgba(30,80,180,0.15)',
}

const yearLabel = computed(() =>
  `${props.almanac.yearGanzhi.stem}${props.almanac.yearGanzhi.branch}年 · ${props.almanac.yearGanzhi.zodiac}年`)
const dayLabel = computed(() =>
  `${props.almanac.dayGanzhi.stem}${props.almanac.dayGanzhi.branch}日`)
</script>

<template>
  <div class="tianji-panel">
    <div class="tp-row">
      <div class="tp-cell">
        <div class="tp-label">干支年 · Year</div>
        <div class="tp-value">{{ yearLabel }}</div>
      </div>
      <div class="tp-cell">
        <div class="tp-label">干支日 · Day</div>
        <div class="tp-value">{{ dayLabel }}</div>
      </div>
    </div>
    <div class="tp-row">
      <div class="tp-cell">
        <div class="tp-label">宜 · Auspicious</div>
        <div class="tp-value auspicious">{{ almanac.auspicious.join(' · ') }}</div>
      </div>
      <div class="tp-cell">
        <div class="tp-label">忌 · Inauspicious</div>
        <div class="tp-value inauspicious">{{ almanac.inauspicious.join(' · ') }}</div>
      </div>
    </div>
    <div class="tp-wuxing">
      <div class="tp-label" style="margin-bottom:6px">当日五行 · Daily Elements</div>
      <div class="tp-wx-row">
        <span
          v-for="(el, i) in almanac.wuxingToday"
          :key="el"
          class="wx-badge"
          :style="{ background: WUXING_BG[el], color: WUXING_COLORS[el], border: `0.5px solid ${WUXING_COLORS[el]}40` }"
        >{{ el }} {{ almanac.wuxingEnToday[i] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tianji-panel { display: flex; flex-direction: column; gap: 8px; }
.tp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.tp-cell { background: rgba(201,168,76,0.05); border: 0.5px solid rgba(201,168,76,0.18); border-radius: 7px; padding: 8px 10px; }
.tp-label { font-size: 10px; color: rgba(201,168,76,0.5); letter-spacing: .06em; margin-bottom: 3px; }
.tp-value { font-size: 12px; color: #e8d4a0; font-weight: 500; }
.tp-value.auspicious { color: #6ed48a; }
.tp-value.inauspicious { color: #e06060; }
.tp-wuxing { background: rgba(201,168,76,0.04); border: 0.5px solid rgba(201,168,76,0.14); border-radius: 7px; padding: 8px 10px; }
.tp-wx-row { display: flex; gap: 6px; flex-wrap: wrap; }
.wx-badge { padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 500; }
</style>
