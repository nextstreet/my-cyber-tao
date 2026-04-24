<template>
  <div class="home-container" :class="{ mobile: isMobile }">

    <!-- 背景装饰：八卦阵暗纹 -->
    <div class="bg-bagua-array" aria-hidden="true"></div>

    <!-- 背景装饰：神圣曼陀罗 -->
    <div class="bg-mandala" aria-hidden="true"></div>

    <!-- 背景装饰：CSS极光 -->
    <div class="bg-aurora" aria-hidden="true"></div>

    <!-- 页边神圣几何光环 -->
    <div class="edge-ring edge-ring-inner" aria-hidden="true"></div>
    <div class="edge-ring edge-ring-outer" aria-hidden="true"></div>

    <!-- 四角八卦符文 -->
    <div class="corner-rune corner-rune-tl" aria-hidden="true">☰</div>
    <div class="corner-rune corner-rune-tr" aria-hidden="true">☷</div>
    <div class="corner-rune corner-rune-bl" aria-hidden="true">☲</div>
    <div class="corner-rune corner-rune-br" aria-hidden="true">☵</div>

    <!-- 桌面：书页双栏 -->
    <div v-if="!isMobile" class="book-spread">
      <div class="book-page left-page">
        <div class="page-glyph" aria-hidden="true">☰ HEAVEN</div>
        <TianjiPanel :data="tianjiData" :loading="tianjiLoading" />
      </div>
      <div class="book-spine"></div>
      <div class="book-page right-page">
        <div class="page-glyph" aria-hidden="true">⚡ CAST</div>
        <DivinationInput
          :loading="divLoading"
          :language="lang"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <!-- 移动端：翻页 -->
    <div
      v-else
      class="mobile-pages"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div
        class="page-wrapper"
        :style="{ transform: `translateX(-${activePage * 100}%)` }"
      >
        <div class="mobile-page">
          <TianjiPanel :data="tianjiData" :loading="tianjiLoading" />
        </div>
        <div class="mobile-page">
          <DivinationInput
            :loading="divLoading"
            :language="lang"
            @submit="handleSubmit"
          />
        </div>
      </div>
      <div class="page-dots">
        <span :class="{ active: activePage === 0 }" @click="activePage = 0"></span>
        <span :class="{ active: activePage === 1 }" @click="activePage = 1"></span>
      </div>
    </div>

    <!-- 全局错误提示 -->
    <Transition name="toast">
      <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import TianjiPanel from '../components/TianjiPanel.vue'
import DivinationInput from '../components/DivinationInput.vue'
import { getTianjiData, type TianjiData } from '../utils/tianji'

const EDGE_FN_URL = import.meta.env.VITE_EDGE_FN_URL || 'https://uojcjpffbmygsffaqcux.supabase.co/functions/v1/cyber-sage'

const router       = useRouter()
const isMobile     = ref(window.innerWidth < 768)
const activePage   = ref(0)
const tianjiLoading = ref(true)
const divLoading   = ref(false)
const tianjiData   = ref<TianjiData | null>(null)
const errorMsg     = ref('')

const lang = ref<'zh' | 'en'>(
  navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
)

const onResize = () => { isMobile.value = window.innerWidth < 768 }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]; if (t) touchStartX = t.clientX
}
function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]; if (!t) return
  const delta = t.clientX - touchStartX
  if (delta < -50 && activePage.value < 1) activePage.value = 1
  else if (delta > 50 && activePage.value > 0) activePage.value = 0
}

onMounted(async () => {
  let coords: { lat: number; lng: number } | undefined
  try {
    coords = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { timeout: 3000 }
      )
    })
  } catch { /* no coords */ }

  tianjiData.value = getTianjiData(new Date(), coords)
  tianjiLoading.value = false
})

async function handleSubmit(question: string, hexagram: {
  lines: number[]
  changingLines: boolean[]
  element: string
}) {
  if (divLoading.value) return
  divLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        lines: hexagram.lines,
        changingLines: hexagram.changingLines,
        question,
        language: lang.value,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    const result = await res.json()

    const cardId   = crypto.randomUUID()
    const deviceId = getDeviceId()

    const now       = new Date().toISOString()
    const hexCode   = hexagram.lines.join('')
    const rawStr    = `${cardId}:${deviceId}:${hexCode}:${now}`
    const hashBuf   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawStr))
    const hashHex   = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: dbErr } = await supabase
      .from('divination_logs')
      .insert({
        card_id:        cardId,
        device_id:      deviceId,
        hexagram_code:  hexCode,
        name_zh:        result.hexagramNameZh,
        name_en:        result.hexagramNameEn,
        interpretation: result.interpretation,
        oracle:         result.oracle,
        poem_zh:        result.poemZh,
        verified_hash:  hashHex.slice(0, 16),
        is_sealed:      true,
        created_at:     now,
        geo_region:     result.geoRegion  ?? null,
        geo_beast:      result.geoBeast   ?? null,
        has_changing:   result.hasChangingLines ?? false,
      })

    if (dbErr) throw new Error(dbErr.message)

    router.push(`/destiny/${cardId}`)

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[CyberTao] Submit failed:', msg)
    errorMsg.value = lang.value === 'zh'
      ? `连接命运矩阵失败：${msg}`
      : `Connection to destiny matrix failed: ${msg}`
    setTimeout(() => { errorMsg.value = '' }, 5000)
  } finally {
    divLoading.value = false
  }
}

function getDeviceId(): string {
  const KEY = 'ct_device_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* ── 背景：八卦阵暗纹 ── */
.bg-bagua-array {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: url('/bagua-array.svg');
  background-size: min(90vmin, 700px);
  background-position: center;
  background-repeat: no-repeat;
  animation: bg-rotate 120s linear infinite;
}
@keyframes bg-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── 背景：神圣曼陀罗 ── */
.bg-mandala {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: url('/sacred-mandala.svg');
  background-size: min(80vmin, 600px);
  background-position: center;
  background-repeat: no-repeat;
  animation: mandala-breathe 20s ease-in-out infinite;
}
@keyframes mandala-breathe {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.04); opacity: 0.16; }
}

/* ── 背景：CSS极光 ── */
.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 15% 80%, rgba(140, 90, 255, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 20%, rgba(200, 170, 110, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 60%);
}

/* ── 页面边缘：神圣光环 ── */
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
  border-color: rgba(140, 100, 255, 0.14);
  animation: edge-pulse 8s ease-in-out infinite;
}
.edge-ring-outer {
  width: min(100vmin, 850px);
  height: min(100vmin, 850px);
  border-color: rgba(200, 170, 110, 0.1);
  animation: edge-pulse 12s ease-in-out infinite reverse;
}
@keyframes edge-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; }
}

/* ── 四角八卦符文 ── */
.corner-rune {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  font-size: 1.8rem;
  opacity: 0.08;
  font-family: serif;
}
.corner-rune-tl { top: 2.5%; left: 3%; }
.corner-rune-tr { top: 2.5%; right: 3%; }
.corner-rune-bl { bottom: 2.5%; left: 3%; }
.corner-rune-br { bottom: 2.5%; right: 3%; }

/* ── 桌面书页 ── */
.book-spread {
  display: flex;
  width: min(1200px, 94vw);
  height: min(700px, 92vh);
  height: min(700px, 92dvh);
  position: relative;
  z-index: 1;
  box-shadow: 0 0 60px rgba(100, 60, 220, 0.2);
}
.book-page {
  flex: 1;
  background: rgba(8, 8, 28, 0.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(120, 80, 255, 0.15);
  padding: 1.75rem;
  overflow-y: auto;
  position: relative;
}
.left-page {
  border-right: none;
  border-radius: 6px 0 0 6px;
  background: linear-gradient(135deg, rgba(10, 8, 30, 0.8) 0%, rgba(18, 12, 38, 0.75) 100%);
}
.right-page {
  border-left: none;
  border-radius: 0 6px 6px 0;
}

/* ── 书页顶部标识 ── */
.page-glyph {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-family: 'Inter', monospace;
  pointer-events: none;
  opacity: 0.15;
  letter-spacing: 0.3em;
  z-index: 1;
}

.book-spine {
  width: 10px;
  background: linear-gradient(180deg,
    rgba(140, 100, 255, 0.5) 0%,
    rgba(80, 40, 180, 0.7) 50%,
    rgba(140, 100, 255, 0.5) 100%
  );
  position: relative;
  flex-shrink: 0;
}

/* ── 书页四角装饰 ── */
.book-page::before,
.book-page::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(140, 100, 255, 0.2);
  border-style: solid;
  pointer-events: none;
  transition: border-color 0.5s;
}
.book-page:hover::before,
.book-page:hover::after {
  border-color: rgba(140, 100, 255, 0.45);
}
.left-page::before {
  top: 6px; left: 6px;
  border-width: 1px 0 0 1px;
}
.left-page::after {
  bottom: 6px; left: 6px;
  border-width: 0 0 1px 1px;
}
.right-page::before {
  top: 6px; right: 6px;
  border-width: 1px 1px 0 0;
}
.right-page::after {
  bottom: 6px; right: 6px;
  border-width: 0 1px 1px 0;
}

/* ── 移动端翻页 ── */
.mobile-pages {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  z-index: 1;
}
.page-wrapper {
  display: flex;
  width: 200vw;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-page {
  width: 100vw;
  height: 100%;
  overflow-y: auto;
  padding: 1.25rem;
  box-sizing: border-box;
  background: rgba(8, 8, 28, 0.78);
  backdrop-filter: blur(8px);
}
.page-dots {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.page-dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(140, 100, 255, 0.3);
  border: 1px solid rgba(140, 100, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}
.page-dots span.active {
  background: rgba(140, 100, 255, 0.85);
  box-shadow: 0 0 10px rgba(140, 100, 255, 0.7);
}

/* ── 错误提示 ── */
.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: rgba(255, 160, 160, 0.9);
  padding: 0.75rem 1.5rem;
  font-family: 'Inter', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  border-radius: 4px;
  z-index: 100;
  max-width: 90vw;
  text-align: center;
}
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
