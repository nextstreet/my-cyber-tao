<template>
  <div class="result-view" :class="{ mobile: isMobile }">
    <template v-if="!loading && result">
      <!-- 桌面双栏 -->
      <div v-if="!isMobile" class="result-layout">
        <!-- 左栏：仪表盘群 -->
        <aside class="dashboard-panel">
          <WuxingGauge :energy="result.wuxingEnergy" :dominant="result.hexagram.element" />
          <MansionResonance :mansion="result.mansion" :resonance="result.resonance" />
          <HexagramVisual :hexagram="result.hexagram" />
          <FortuneIndex :scores="result.fortuneScores" />
        </aside>
        <!-- 右栏：分析文案 -->
        <main class="analysis-panel">
          <div class="hexagram-title">
            <span class="hex-number">第{{ result.hexagram.number }}卦</span>
            <span class="hex-name">{{ result.hexagram.name }}</span>
            <span class="hex-subtitle">{{ result.hexagram.subtitle }}</span>
          </div>
          <div class="hex-statement">{{ result.hexagram.statement }}</div>
          <div class="ai-analysis" v-html="formattedAnalysis"></div>
          <div class="seal-area">
            <button class="seal-btn" @click="goSeal">
              封印此卦 · SEAL DESTINY
              <span class="seal-hint">永久记录于命运区块链</span>
            </button>
          </div>
        </main>
      </div>

      <!-- 移动端上下布局 -->
      <div v-else class="result-mobile">
        <div class="mobile-dashboards">
          <!-- 横向滚动仪表盘 -->
          <div class="dash-scroll">
            <WuxingGauge :energy="result.wuxingEnergy" :dominant="result.hexagram.element" />
            <HexagramVisual :hexagram="result.hexagram" />
            <FortuneIndex :scores="result.fortuneScores" />
          </div>
        </div>
        <div class="mobile-analysis">
          <div class="hexagram-title">
            <span class="hex-name">{{ result.hexagram.name }}</span>
          </div>
          <div class="ai-analysis" v-html="formattedAnalysis"></div>
          <button class="seal-btn" @click="goSeal">封印此卦 · SEAL DESTINY</button>
        </div>
      </div>
    </template>

    <div v-else class="loading-overlay">
      <div class="hex-loading">
        <HexagramLoader />
        <span>正在解析命运数据流...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import WuxingGauge from '../components/WuxingGauge.vue'
import MansionResonance from '../components/MansionResonance.vue'
import HexagramVisual from '../components/HexagramVisual.vue'
import FortuneIndex from '../components/FortuneIndex.vue'
import HexagramLoader from '../components/HexagramLoader.vue'

const router = useRouter()
const route = useRoute()
const isMobile = ref(window.innerWidth < 768)
const loading = ref(true)
const result = ref<any>(null)

const formattedAnalysis = computed(() => {
  if (!result.value?.analysis) return ''
  // 简单换行处理
  return result.value.analysis.replace(/\n/g, '<br>')
})

onMounted(async () => {
  const sessionId = route.params.sessionId as string
  try {
    const res = await fetch(`/api/result/${sessionId}`)
    result.value = await res.json()
  } finally {
    loading.value = false
  }
})

function goSeal() {
  // 将当前结果存入 store/sessionStorage，跳转封印页
  sessionStorage.setItem('destinyResult', JSON.stringify(result.value))
  router.push('/destiny')
}
</script>

<style scoped>
.result-view {
  min-height: 100vh;
  background: #050510;
  color: rgba(200, 180, 255, 0.9);
}

.result-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
}

.dashboard-panel {
  padding: 2rem 1.5rem;
  background: rgba(8, 8, 24, 0.98);
  border-right: 1px solid rgba(120, 80, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.analysis-panel {
  padding: 2.5rem 3rem;
  overflow-y: auto;
  max-width: 700px;
}

.hexagram-title {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(120, 80, 255, 0.2);
  padding-bottom: 1rem;
}
.hex-number { font-size: 0.75rem; color: rgba(120, 80, 255, 0.6); font-family: monospace; }
.hex-name { font-size: 2.5rem; color: rgba(220, 200, 255, 0.95); font-weight: bold; }
.hex-subtitle { font-size: 0.9rem; color: rgba(160, 140, 200, 0.7); }
.hex-statement {
  font-size: 1rem;
  color: rgba(180, 160, 240, 0.8);
  padding: 1rem;
  background: rgba(120, 80, 255, 0.07);
  border-left: 3px solid rgba(120, 80, 255, 0.4);
  margin-bottom: 1.5rem;
  line-height: 1.8;
}
.ai-analysis {
  font-size: 0.95rem;
  line-height: 1.9;
  color: rgba(200, 180, 255, 0.85);
}

.seal-area {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(120, 80, 255, 0.2);
}
.seal-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(120, 80, 255, 0.5);
  color: rgba(200, 180, 255, 0.9);
  padding: 1rem 2.5rem;
  font-family: monospace;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}
.seal-btn:hover {
  background: rgba(120, 80, 255, 0.15);
  border-color: rgba(120, 80, 255, 0.9);
  box-shadow: 0 0 20px rgba(120, 80, 255, 0.3);
}
.seal-hint { font-size: 0.6rem; color: rgba(120, 80, 255, 0.5); }

/* 移动端 */
.result-mobile { display: flex; flex-direction: column; }
.mobile-dashboards { padding: 1rem; overflow-x: auto; }
.dash-scroll { display: flex; gap: 1rem; min-width: max-content; }
.mobile-analysis { padding: 1.5rem; }
</style>
