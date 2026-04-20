<template>
  <div class="fortune-index">
    <div class="gauge-label">运势指数 · FORTUNE_MATRIX</div>
    <div class="scores-list">
      <div v-for="item in DIMENSIONS" :key="item.key" class="score-row">
        <span class="score-dim">{{ item.label }}</span>
        <div class="score-track">
          <div class="score-fill"
            :style="{
              width: `${scores?.[item.key] ?? 0}%`,
              background: item.color
            }"
          ></div>
        </div>
        <span class="score-num">{{ scores?.[item.key] ?? '—' }}</span>
      </div>
    </div>
    <!-- 总势 -->
    <div class="total-fortune" v-if="totalScore !== null">
      <span class="total-label">总势</span>
      <span class="total-value" :style="{ color: totalColor }">
        {{ FORTUNE_LABELS[totalTier] }}
      </span>
      <span class="total-num">{{ totalScore }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ scores?: Record<string, number> }>()

const DIMENSIONS = [
  { key: 'career',    label: '事业', color: 'linear-gradient(90deg,#818cf8,#6366f1)' },
  { key: 'wealth',    label: '财运', color: 'linear-gradient(90deg,#fbbf24,#f59e0b)' },
  { key: 'relations', label: '人际', color: 'linear-gradient(90deg,#f472b6,#ec4899)' },
  { key: 'health',    label: '健康', color: 'linear-gradient(90deg,#34d399,#10b981)' },
  { key: 'timing',    label: '时机', color: 'linear-gradient(90deg,#60a5fa,#3b82f6)' },
]

const FORTUNE_LABELS: Record<string, string> = {
  godlike: '神运 GODLIKE',
  great:   '大吉 GREAT',
  good:    '吉 GOOD',
  neutral: '平 NEUTRAL',
  caution: '慎 CAUTION',
  bad:     '凶 CRITICAL',
}

const totalScore = computed(() => {
  if (!props.scores) return null
  const vals = DIMENSIONS.map(d => props.scores![d.key] ?? 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
})

const totalTier = computed(() => {
  const s = totalScore.value ?? 0
  if (s >= 95) return 'godlike'
  if (s >= 80) return 'great'
  if (s >= 60) return 'good'
  if (s >= 40) return 'neutral'
  if (s >= 20) return 'caution'
  return 'bad'
})

const totalColor = computed(() => ({
  godlike: '#a78bfa',
  great:   '#fbbf24',
  good:    '#34d399',
  neutral: '#94a3b8',
  caution: '#f97316',
  bad:     '#ef4444',
}[totalTier.value]))
</script>

<style scoped>
.fortune-index {
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
.scores-list { display: flex; flex-direction: column; gap: 7px; }
.score-row { display: flex; align-items: center; gap: 8px; }
.score-dim { width: 2rem; font-size: 0.72rem; color: rgba(180, 160, 240, 0.8); }
.score-track {
  flex: 1;
  height: 5px;
  background: rgba(120, 80, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.score-num { width: 1.8rem; font-size: 0.62rem; color: rgba(140, 120, 200, 0.6); text-align: right; font-family: monospace; }

.total-fortune {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(120, 80, 255, 0.15);
}
.total-label { font-size: 0.65rem; color: rgba(140, 120, 200, 0.6); }
.total-value { font-size: 0.82rem; font-family: monospace; font-weight: bold; letter-spacing: 0.05em; }
.total-num { margin-left: auto; font-size: 0.65rem; color: rgba(140, 120, 200, 0.5); font-family: monospace; }
</style>
