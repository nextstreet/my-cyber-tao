<template>
  <div class="result-view" :class="{ mobile: isMobile }">

    <div class="bg-mandala" aria-hidden="true"></div>
    <div class="bg-aurora" aria-hidden="true"></div>
    <div class="bg-scanlines" aria-hidden="true"></div>
    <div class="edge-ring edge-ring-inner" aria-hidden="true"></div>
    <div class="edge-ring edge-ring-outer" aria-hidden="true"></div>

    <template v-if="!loading && result">
      <div v-if="!isMobile" class="result-layout">
        <aside class="dashboard-panel">
          <div class="dash-inner">
            <WuxingGauge :energy="result.wuxingEnergy" :dominant="result.hexagram.element" />
            <MansionResonance :mansion="result.mansion" :resonance="result.resonance" />
            <HexagramVisual :hexagram="result.hexagram" />
            <FortuneIndex :scores="result.fortuneScores" />
          </div>
          <div class="guardian-silhouette" aria-hidden="true">
            <img :src="`/guardian-${guardianKey}.png`" :alt="guardianKey" />
          </div>
        </aside>
        <main class="analysis-panel">
          <div class="analysis-taiji">
            <TaijituCore :isActive="true" />
          </div>
          <div class="hexagram-title">
            <span class="hex-number">#{{ result.hexagram.number }}</span>
            <span class="hex-name">{{ result.hexagram.name }}</span>
            <span class="hex-subtitle">{{ result.hexagram.subtitle }}</span>
          </div>
          <div class="hex-statement">{{ result.hexagram.statement }}</div>

          <div class="sacred-divider-wrap" aria-hidden="true">
            <img src="/sacred-divider.svg" alt="" class="sacred-divider" />
          </div>

          <div class="ai-analysis" v-html="formattedAnalysis"></div>

          <div class="sacred-divider-wrap" aria-hidden="true">
            <img src="/sacred-divider.svg" alt="" class="sacred-divider" />
          </div>

          <div class="seal-area">
            <button class="seal-btn" @click="goSeal">
              <span class="seal-btn-glow"></span>
              SEAL DESTINY — 封印此卦
              <span class="seal-hint">Permanently recorded on the destiny chain</span>
            </button>
          </div>
        </main>
      </div>

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
          <div class="sacred-divider-wrap" aria-hidden="true">
            <img src="/sacred-divider.svg" alt="" class="sacred-divider" />
          </div>
          <div class="ai-analysis" v-html="formattedAnalysis"></div>
          <button class="seal-btn" @click="goSeal">SEAL DESTINY — 封印此卦</button>
        </div>
      </div>
    </template>

    <div v-else class="loading-overlay">
      <div class="hex-loading">
        <HexagramLoader />
        <span>Decoding destiny data stream...</span>
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
    wood: 'dragon', fire: 'phoenix', earth: 'qilin', metal: 'tiger', water: 'turtle',
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
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

.bg-mandala {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.08;
  background-image: url('/sacred-mandala.svg');
  background-size: min(80vmin, 600px);
  background-position: center;
  background-repeat: no-repeat;
  animation: mandala-breathe 20s ease-in-out infinite;
}
@keyframes mandala-breathe {
  0%, 100% { transform: scale(1); opacity: 0.08; }
  50% { transform: scale(1.03); opacity: 0.14; }
}

.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(140, 90, 255, 0.14) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(200, 170, 110, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.07) 0%, transparent 60%);
}

.bg-scanlines {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.25;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0, 0, 0, 0.06) 2px, rgba(0, 0, 0, 0.06) 4px
  );
}

.edge-ring {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  border: 1px solid;
}
.edge-ring-inner {
  width: min(85vmin, 650px);
  height: min(85vmin, 650px);
  border-color: rgba(140, 100, 255, 0.12);
  animation: edge-pulse 8s ease-in-out infinite;
}
.edge-ring-outer {
  width: min(105vmin, 900px);
  height: min(105vmin, 900px);
  border-color: rgba(200, 170, 110, 0.08);
  animation: edge-pulse 12s ease-in-out infinite reverse;
}
@keyframes edge-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; }
}

.result-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.dashboard-panel {
  padding: 1.5rem 1rem;
  background: rgba(8, 8, 28, 0.75);
  backdrop-filter: blur(6px);
  border-right: 1px solid rgba(120, 80, 255, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}
.dash-inner { display: flex; flex-direction: column; gap: 1.25rem; }

.guardian-silhouette {
  width: 100%;
  display: flex;
  justify-content: center;
  opacity: 0.1;
  margin-top: 1.5rem;
  pointer-events: none;
}
.guardian-silhouette img {
  width: 70%;
  max-width: 160px;
  height: auto;
  filter: grayscale(1) brightness(0.5) sepia(1) hue-rotate(240deg) saturate(0.4);
}

.analysis-panel {
  padding: 2rem 2.5rem;
  overflow-y: auto;
  max-width: 700px;
}

.analysis-taiji { width: 50px; height: 50px; margin-bottom: 1rem; opacity: 0.55; }

.hexagram-title {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(140, 100, 255, 0.15);
}
.hex-number { font-size: 0.78rem; color: rgba(160, 130, 230, 0.65); font-family: monospace; }
.hex-name { font-size: 2.2rem; color: rgba(240, 225, 255, 0.95); font-weight: bold; }
.hex-subtitle { font-size: 0.9rem; color: rgba(180, 155, 220, 0.75); }
.hex-statement {
  font-size: 0.95rem;
  color: rgba(200, 175, 245, 0.82);
  padding: 1rem;
  background: rgba(140, 100, 255, 0.06);
  border-left: 3px solid rgba(140, 100, 255, 0.35);
  margin-bottom: 1rem;
  line-height: 1.7;
}

.sacred-divider-wrap { width: 100%; margin: 1.25rem 0; opacity: 0.16; pointer-events: none; }
.sacred-divider { width: 100%; height: auto; display: block; }

.ai-analysis {
  font-size: 0.92rem;
  line-height: 1.8;
  color: rgba(215, 195, 250, 0.85);
}

.seal-area { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(140, 100, 255, 0.15); }
.seal-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(140, 100, 255, 0.45);
  color: rgba(215, 195, 250, 0.9);
  padding: 1rem 2rem;
  font-family: 'Inter', monospace;
  font-size: 0.88rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}
.seal-btn:hover {
  background: rgba(140, 100, 255, 0.12);
  border-color: rgba(140, 100, 255, 0.8);
  box-shadow: 0 0 24px rgba(140, 100, 255, 0.25);
}
.seal-btn-glow {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.5s;
  box-shadow: 0 0 30px rgba(140, 100, 255, 0.35), 0 0 60px rgba(140, 100, 255, 0.12);
}
.seal-btn:hover .seal-btn-glow { opacity: 1; }
.seal-hint { font-size: 0.65rem; color: rgba(140, 100, 255, 0.45); }

.result-mobile { display: flex; flex-direction: column; z-index: 1; height: 100%; }
.mobile-dashboards { padding: 1rem; overflow-x: auto; }
.dash-scroll { display: flex; gap: 1rem; min-width: max-content; }
.mobile-analysis { padding: 1.5rem; overflow-y: auto; }

.loading-overlay {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
}
.hex-loading { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.hex-loading span {
  font-family: monospace;
  font-size: 0.85rem;
  color: rgba(160, 130, 230, 0.7);
  letter-spacing: 0.1em;
}
</style>
