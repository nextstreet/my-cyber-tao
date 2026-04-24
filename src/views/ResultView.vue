<template>
  <div class="result-view" :class="{ mobile: isMobile }">

    <!-- 背景装饰层 -->
    <div class="bg-aurora" aria-hidden="true"></div>
    <div class="bg-scanlines" aria-hidden="true"></div>

    <template v-if="!loading && result">
      <!-- 桌面双栏 -->
      <div v-if="!isMobile" class="result-layout">
        <!-- 左栏：仪表盘群 -->
        <aside class="dashboard-panel">
          <div class="dash-inner">
            <WuxingGauge :energy="result.wuxingEnergy" :dominant="result.hexagram.element" />
            <MansionResonance :mansion="result.mansion" :resonance="result.resonance" />
            <HexagramVisual :hexagram="result.hexagram" />
            <FortuneIndex :scores="result.fortuneScores" />
          </div>
          <!-- 左栏底部神兽剪影 -->
          <div class="guardian-silhouette" aria-hidden="true">
            <img :src="`/guardian-${guardianKey}.png`" :alt="guardianKey" />
          </div>
        </aside>
        <!-- 右栏：分析文案 -->
        <main class="analysis-panel">
          <!-- 顶部太极核心 -->
          <div class="analysis-taiji">
            <TaijituCore :isActive="true" />
          </div>

          <div class="hexagram-title">
            <span class="hex-number">第{{ result.hexagram.number }}卦</span>
            <span class="hex-name">{{ result.hexagram.name }}</span>
            <span class="hex-subtitle">{{ result.hexagram.subtitle }}</span>
          </div>
          <div class="hex-statement">{{ result.hexagram.statement }}</div>

          <!-- 祥云分割线 -->
          <div class="cloud-divider-wrap" aria-hidden="true">
            <img src="/cloud-divider.svg" alt="" class="cloud-divider" />
          </div>

          <div class="ai-analysis" v-html="formattedAnalysis"></div>

          <!-- 祥云分割线 -->
          <div class="cloud-divider-wrap" aria-hidden="true">
            <img src="/cloud-divider.svg" alt="" class="cloud-divider" />
          </div>

          <div class="seal-area">
            <button class="seal-btn" @click="goSeal">
              <span class="seal-btn-glow"></span>
              封印此卦 · SEAL DESTINY
              <span class="seal-hint">永久记录于命运区块链</span>
            </button>
          </div>
        </main>
      </div>

      <!-- 移动端上下布局 -->
      <div v-else class="result-mobile">
        <div class="mobile-dashboards">
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
          <div class="cloud-divider-wrap" aria-hidden="true">
            <img src="/cloud-divider.svg" alt="" class="cloud-divider" />
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
import TaijituCore from '../components/TaijituCore.vue'

interface HexagramInfo {
  number: number
  name: string
  subtitle: string
  statement: string
  element: string
  lines: number[]
  changingLines: boolean[]
}

interface ResultData {
  hexagram: HexagramInfo
  analysis: string
  wuxingEnergy: Record<string, number>
  mansion: any
  resonance: any
  fortuneScores: Record<string, number>
}

const router = useRouter()
const route = useRoute()
const isMobile = ref(window.innerWidth < 768)
const loading = ref(true)
const result = ref<ResultData | null>(null)

const guardianKey = computed(() => {
  if (!result.value?.hexagram?.element) return 'qilin'
  const map: Record<string, string> = {
    wood: 'dragon',
    fire: 'phoenix',
    earth: 'qilin',
    metal: 'tiger',
    water: 'turtle',
  }
  return map[result.value.hexagram.element] || 'qilin'
})

const formattedAnalysis = computed(() => {
  if (!result.value?.analysis) return ''
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
  sessionStorage.setItem('destinyResult', JSON.stringify(result.value))
  router.push('/destiny')
}
</script>

<style scoped>
.result-view {
  min-height: 100vh;
  background: #050510;
  color: rgba(200, 180, 255, 0.9);
  position: relative;
}

/* ── 背景装饰 ── */
.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(120, 80, 255, 0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(200, 170, 110, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.03) 0%, transparent 60%);
}
.bg-scanlines {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
}

.result-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.dashboard-panel {
  padding: 2rem 1.5rem;
  background: rgba(8, 8, 24, 0.98);
  border-right: 1px solid rgba(120, 80, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  position: relative;
}
.dash-inner {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── 神兽剪影 ── */
.guardian-silhouette {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0.12;
  margin-top: 2rem;
  pointer-events: none;
}
.guardian-silhouette img {
  width: 80%;
  max-width: 180px;
  height: auto;
  filter: grayscale(1) brightness(0.6) sepia(1) hue-rotate(240deg) saturate(0.5);
  object-fit: contain;
}

.analysis-panel {
  padding: 2.5rem 3rem;
  overflow-y: auto;
  max-width: 700px;
  position: relative;
}

/* ── 顶部太极 ── */
.analysis-taiji {
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
  opacity: 0.6;
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

/* ── 祥云分割线 ── */
.cloud-divider-wrap {
  width: 100%;
  margin: 1.5rem 0;
  opacity: 0.15;
  pointer-events: none;
}
.cloud-divider {
  width: 100%;
  height: auto;
  display: block;
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
  position: relative;
  overflow: hidden;
}
.seal-btn:hover {
  background: rgba(120, 80, 255, 0.15);
  border-color: rgba(120, 80, 255, 0.9);
  box-shadow: 0 0 20px rgba(120, 80, 255, 0.3);
}
.seal-btn-glow {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.5s;
  box-shadow: 0 0 30px rgba(120, 80, 255, 0.4), 0 0 60px rgba(120, 80, 255, 0.15);
}
.seal-btn:hover .seal-btn-glow {
  opacity: 1;
}
.seal-hint { font-size: 0.6rem; color: rgba(120, 80, 255, 0.5); }

/* 移动端 */
.result-mobile {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.mobile-dashboards { padding: 1rem; overflow-x: auto; }
.dash-scroll { display: flex; gap: 1rem; min-width: max-content; }
.mobile-analysis { padding: 1.5rem; }
</style>
