<template>
  <div class="tianji-panel">
    <div class="panel-header">
      <span class="header-tag">// SYS.TIANJI_SCAN</span>
      <span class="scan-status" :class="{ active: !loading }">
        {{ loading ? 'SCANNING...' : 'LOCKED' }}
      </span>
    </div>

    <template v-if="!loading && data">
      <!-- 时空坐标 -->
      <section class="data-section">
        <div class="section-label">时空坐标 · TIME_SPACE_COORD</div>
        <div class="pillars-grid">
          <div
            v-for="key in PILLAR_KEYS"
            :key="key"
            class="pillar-item"
          >
            <span class="pillar-label">{{ PILLAR_LABELS[key] }}</span>
            <span class="pillar-value">{{ data.pillars[key] }}</span>
            <span class="pillar-hint">{{ getPillarWuxing(data.pillars[key]) }}</span>
          </div>
        </div>
        <div class="location-tag">{{ data.locationLabel }}</div>
        <div class="lunar-tag">{{ data.lunarDate }}</div>
      </section>

      <!-- 五行能量 -->
      <section class="data-section">
        <div class="section-label">五行能量 · WUXING_MATRIX</div>
        <div class="wuxing-bars">
          <div
            v-for="el in WUXING_ORDER"
            :key="el"
            class="wuxing-row"
          >
            <span class="wx-name">{{ el }}</span>
            <div class="wx-bar-track">
              <div
                class="wx-bar-fill"
                :style="{ width: (data.wuxingEnergy[el] ?? 0) + '%' }"
                :data-element="el"
              ></div>
            </div>
            <span class="wx-val">{{ data.wuxingEnergy[el] ?? 0 }}</span>
          </div>
        </div>
      </section>

      <!-- 当前时宿 -->
      <section class="data-section">
        <div class="section-label">当前时宿 · STELLAR_NODE</div>
        <div class="mansion-display">
          <span class="mansion-name">{{ data.mansion.name }}</span>
          <span class="mansion-alias">{{ data.mansion.alias }}</span>
          <span class="mansion-element">元素 · {{ data.mansion.element }}</span>
          <span class="signal-tag">SIGNAL: {{ data.mansion.signal }}</span>
        </div>
      </section>

      <!-- 宜忌 -->
      <section class="data-section yiji-section">
        <div class="yiji-col">
          <div class="section-label yi">宜 · PERMITTED</div>
          <div
            v-for="item in data.yiji.yi"
            :key="item.traditional"
            class="yiji-item yi"
          >
            <span class="yiji-trad">{{ item.traditional }}</span>
            <span class="yiji-cyber">{{ item.cyber }}</span>
          </div>
        </div>
        <div class="yiji-divider"></div>
        <div class="yiji-col">
          <div class="section-label ji">忌 · RESTRICTED</div>
          <div
            v-for="item in data.yiji.ji"
            :key="item.traditional"
            class="yiji-item ji"
          >
            <span class="yiji-trad">{{ item.traditional }}</span>
            <span class="yiji-cyber">{{ item.cyber }}</span>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="loading-state">
      <div class="scan-lines"></div>
      <span>正在读取时空参数...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TianjiData } from '../utils/tianji'

defineProps<{
  data: TianjiData | null
  loading: boolean
}>()

// 使用固定的 key 数组替代 v-for 直接遍历对象（避免 key: string|symbol 类型问题）
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const
type PillarKey = typeof PILLAR_KEYS[number]

const PILLAR_LABELS: Record<PillarKey, string> = {
  year:  '年柱',
  month: '月柱',
  day:   '日柱',
  hour:  '时柱',
}

const WUXING_ORDER = ['木', '火', '土', '金', '水'] as const

const WUXING_MAP: Record<string, string> = {
  甲:'木', 乙:'木', 丙:'火', 丁:'火', 戊:'土',
  己:'土', 庚:'金', 辛:'金', 壬:'水', 癸:'水',
}

function getPillarWuxing(pillar: string | undefined): string {
  if (!pillar) return ''
  const gan = pillar[0]
  if (!gan) return ''
  const wx = WUXING_MAP[gan]
  return wx ? `[${wx}]` : ''
}
</script>

<style scoped>
.tianji-panel {
  color: rgba(200, 180, 255, 0.9);
  font-family: 'Courier New', monospace;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(120, 80, 255, 0.3);
}
.header-tag   { color: rgba(120, 80, 255, 0.7); font-size: 0.75rem; }
.scan-status  { font-size: 0.7rem; color: rgba(100, 255, 160, 0.5); }
.scan-status.active {
  color: rgba(100, 255, 160, 0.9);
  text-shadow: 0 0 8px rgba(100, 255, 160, 0.5);
}

.data-section { margin-bottom: 1.25rem; }
.section-label {
  font-size: 0.7rem;
  color: rgba(150, 120, 220, 0.75);
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}
.section-label.yi { color: rgba(120, 230, 170, 0.8); }
.section-label.ji { color: rgba(255, 120, 130, 0.8); }

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}
.pillar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(120, 80, 255, 0.08);
  border: 1px solid rgba(120, 80, 255, 0.2);
  border-radius: 4px;
  padding: 0.4rem 0.2rem;
  gap: 2px;
}
.pillar-label { font-size: 0.62rem; color: rgba(170, 150, 230, 0.7); }
.pillar-value { font-size: 1.05rem; color: rgba(235, 220, 255, 0.95); font-weight: bold; }
.pillar-hint  { font-size: 0.62rem; color: rgba(140, 220, 170, 0.75); }
.location-tag, .lunar-tag {
  font-size: 0.68rem;
  color: rgba(170, 150, 210, 0.65);
  margin-top: 0.3rem;
}

.wuxing-bars { display: flex; flex-direction: column; gap: 5px; }
.wuxing-row  { display: flex; align-items: center; gap: 8px; }
.wx-name     { width: 1.25rem; font-size: 0.78rem; color: rgba(210, 190, 255, 0.85); }
.wx-bar-track {
  flex: 1;
  height: 7px;
  background: rgba(120, 80, 255, 0.12);
  border-radius: 3px;
  overflow: hidden;
}
.wx-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 6px currentColor;
}
.wx-bar-fill[data-element='木'] { background: linear-gradient(90deg, #22c55e, #4ade80); color: #4ade80; }
.wx-bar-fill[data-element='火'] { background: linear-gradient(90deg, #ef4444, #f97316); color: #f97316; }
.wx-bar-fill[data-element='土'] { background: linear-gradient(90deg, #d97706, #fbbf24); color: #fbbf24; }
.wx-bar-fill[data-element='金'] { background: linear-gradient(90deg, #9ca3af, #e5e7eb); color: #e5e7eb; }
.wx-bar-fill[data-element='水'] { background: linear-gradient(90deg, #3b82f6, #06b6d4); color: #06b6d4; }
.wx-val {
  width: 2rem;
  font-size: 0.68rem;
  color: rgba(170, 150, 210, 0.7);
  text-align: right;
}

.mansion-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem;
  background: rgba(120, 80, 255, 0.08);
  border-left: 2px solid rgba(140, 100, 255, 0.5);
}
.mansion-name    { font-size: 1.15rem; color: rgba(235, 220, 255, 0.95); }
.mansion-alias   { font-size: 0.78rem; color: rgba(170, 150, 210, 0.75); }
.mansion-element { font-size: 0.68rem; color: rgba(140, 220, 170, 0.85); }
.signal-tag      { font-size: 0.65rem; color: rgba(110, 210, 255, 0.7); letter-spacing: 0.08em; }

.yiji-section { display: flex; gap: 0.75rem; }
.yiji-col     { flex: 1; }
.yiji-divider { width: 1px; background: rgba(120, 80, 255, 0.2); }
.yiji-item    { display: flex; flex-direction: column; gap: 1px; margin-bottom: 0.45rem; }
.yiji-trad    { font-size: 0.78rem; color: rgba(215, 195, 255, 0.85); }
.yiji-cyber   { font-size: 0.65rem; letter-spacing: 0.03em; }
.yiji-item.yi .yiji-cyber { color: rgba(120, 230, 170, 0.75); }
.yiji-item.ji .yiji-cyber { color: rgba(255, 130, 110, 0.75); }

.loading-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  color: rgba(140, 100, 220, 0.7);
  font-size: 0.8rem;
}
</style>
