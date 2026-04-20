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
          <div v-for="(val, key) in data.pillars" :key="key" class="pillar-item">
            <span class="pillar-label">{{ PILLAR_LABELS[key] }}</span>
            <span class="pillar-value">{{ val }}</span>
            <span class="pillar-hint">{{ getPillarWuxing(val) }}</span>
          </div>
        </div>
        <div class="location-tag">{{ data.locationLabel }}</div>
        <div class="lunar-tag">{{ data.lunarDate }}</div>
      </section>

      <!-- 五行能量 -->
      <section class="data-section">
        <div class="section-label">五行能量 · WUXING_MATRIX</div>
        <div class="wuxing-bars">
          <div v-for="(val, name) in data.wuxingEnergy" :key="name" class="wuxing-row">
            <span class="wx-name">{{ name }}</span>
            <div class="wx-bar-track">
              <div class="wx-bar-fill" :style="{ width: val + '%' }" :data-element="name"></div>
            </div>
            <span class="wx-val">{{ val }}</span>
          </div>
        </div>
      </section>

      <!-- 当前时宿 -->
      <section class="data-section">
        <div class="section-label">当前时宿 · STELLAR_NODE</div>
        <div class="mansion-display">
          <span class="mansion-name">{{ data.mansion.name }}</span>
          <span class="mansion-alias">{{ data.mansion.alias }}</span>
          <span class="mansion-signal">SIGNAL: {{ data.mansion.signal }}</span>
        </div>
      </section>

      <!-- 宜忌 -->
      <section class="data-section yiji-section">
        <div class="yiji-col">
          <div class="section-label yi">宜 · PERMITTED</div>
          <div v-for="item in data.yiji.yi" :key="item.traditional" class="yiji-item yi">
            <span class="yiji-trad">{{ item.traditional }}</span>
            <span class="yiji-cyber">{{ item.cyber }}</span>
          </div>
        </div>
        <div class="yiji-divider"></div>
        <div class="yiji-col">
          <div class="section-label ji">忌 · RESTRICTED</div>
          <div v-for="item in data.yiji.ji" :key="item.traditional" class="yiji-item ji">
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
const props = defineProps<{ data: any; loading: boolean }>()

const PILLAR_LABELS: Record<string, string> = {
  year: '年柱', month: '月柱', day: '日柱', hour: '时柱'
}

const WUXING_MAP: Record<string, string> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土',
  '己':'土','庚':'金','辛':'金','壬':'水','癸':'水'
}

function getPillarWuxing(pillar: string) {
  const gan = pillar[0]
  return WUXING_MAP[gan] ? `[${WUXING_MAP[gan]}]` : ''
}
</script>

<style scoped>
.tianji-panel { color: rgba(200, 180, 255, 0.9); font-family: 'Courier New', monospace; }

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(120, 80, 255, 0.3);
}
.header-tag { color: rgba(120, 80, 255, 0.7); font-size: 0.75rem; }
.scan-status { font-size: 0.7rem; color: rgba(100, 255, 160, 0.5); }
.scan-status.active { color: rgba(100, 255, 160, 0.9); text-shadow: 0 0 8px rgba(100,255,160,0.5); }

.data-section { margin-bottom: 1.5rem; }
.section-label {
  font-size: 0.65rem;
  color: rgba(120, 80, 255, 0.6);
  letter-spacing: 0.1em;
  margin-bottom: 0.6rem;
  text-transform: uppercase;
}
.section-label.yi { color: rgba(100, 220, 160, 0.7); }
.section-label.ji { color: rgba(255, 100, 120, 0.7); }

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.pillar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(120, 80, 255, 0.07);
  border: 1px solid rgba(120, 80, 255, 0.15);
  border-radius: 4px;
  padding: 0.5rem 0.25rem;
  gap: 2px;
}
.pillar-label { font-size: 0.6rem; color: rgba(160, 140, 220, 0.6); }
.pillar-value { font-size: 1.1rem; color: rgba(220, 200, 255, 0.95); font-weight: bold; }
.pillar-hint { font-size: 0.6rem; color: rgba(120, 200, 160, 0.7); }
.location-tag, .lunar-tag { font-size: 0.65rem; color: rgba(160, 140, 200, 0.6); margin-top: 0.3rem; }

.wuxing-bars { display: flex; flex-direction: column; gap: 6px; }
.wuxing-row { display: flex; align-items: center; gap: 8px; }
.wx-name { width: 1.5rem; font-size: 0.8rem; color: rgba(200, 180, 255, 0.8); }
.wx-bar-track {
  flex: 1; height: 6px;
  background: rgba(120, 80, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.wx-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.wx-bar-fill[data-element='木'] { background: linear-gradient(90deg, #22c55e, #4ade80); }
.wx-bar-fill[data-element='火'] { background: linear-gradient(90deg, #ef4444, #f97316); }
.wx-bar-fill[data-element='土'] { background: linear-gradient(90deg, #d97706, #fbbf24); }
.wx-bar-fill[data-element='金'] { background: linear-gradient(90deg, #9ca3af, #e5e7eb); }
.wx-bar-fill[data-element='水'] { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
.wx-val { width: 2rem; font-size: 0.65rem; color: rgba(160, 140, 200, 0.6); text-align: right; }

.mansion-display {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.5rem;
  background: rgba(120, 80, 255, 0.07);
  border-left: 2px solid rgba(120, 80, 255, 0.4);
}
.mansion-name { font-size: 1.2rem; color: rgba(220, 200, 255, 0.95); }
.mansion-alias { font-size: 0.75rem; color: rgba(160, 140, 200, 0.7); }
.mansion-signal { font-size: 0.6rem; color: rgba(100, 200, 255, 0.6); letter-spacing: 0.1em; }

.yiji-section { display: flex; gap: 0.75rem; }
.yiji-col { flex: 1; }
.yiji-divider { width: 1px; background: rgba(120, 80, 255, 0.2); }
.yiji-item { display: flex; flex-direction: column; gap: 1px; margin-bottom: 0.5rem; }
.yiji-trad { font-size: 0.75rem; color: rgba(200, 180, 255, 0.8); }
.yiji-cyber { font-size: 0.6rem; letter-spacing: 0.03em; }
.yiji-item.yi .yiji-cyber { color: rgba(100, 220, 160, 0.7); }
.yiji-item.ji .yiji-cyber { color: rgba(255, 120, 100, 0.7); }

.loading-state {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  color: rgba(120, 80, 255, 0.6);
  font-size: 0.75rem;
}
</style>
