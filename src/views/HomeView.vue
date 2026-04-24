<template>
  <div class="home-container" :class="{ mobile: isMobile }">

    <!-- 桌面：书页双栏 -->
    <div v-if="!isMobile" class="book-spread">
      <div class="book-page left-page">
        <TianjiPanel :data="tianjiData" :loading="tianjiLoading" />
      </div>
      <div class="book-spine"></div>
      <div class="book-page right-page">
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
      <!-- 翻页指示点 -->
      <div class="page-dots">
        <span :class="{ active: activePage === 0 }" @click="activePage = 0"></span>
        <span :class="{ active: activePage === 1 }" @click="activePage = 1"></span>
      </div>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import TianjiPanel from '../components/TianjiPanel.vue'
import DivinationInput from '../components/DivinationInput.vue'
import { getTianjiData, type TianjiData } from '../utils/tianji'

// ─── 常量 ────────────────────────────────────────────────────────────────────
const EDGE_FN_URL = 'https://uojcjpffbmygsffaqcux.supabase.co/functions/v1/cyber-sage'

// ─── 状态 ────────────────────────────────────────────────────────────────────
const router       = useRouter()
const isMobile     = ref(window.innerWidth < 768)
const activePage   = ref(0)
const tianjiLoading = ref(true)
const divLoading   = ref(false)
const tianjiData   = ref<TianjiData | null>(null)
const errorMsg     = ref('')

// 语言检测：优先浏览器语言，中文用户用 zh，其余用 en
const lang = ref<'zh' | 'en'>(
  navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
)

// ─── 响应式窗口 ───────────────────────────────────────────────────────────────
const onResize = () => { isMobile.value = window.innerWidth < 768 }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

// ─── 移动端滑动 ───────────────────────────────────────────────────────────────
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

// ─── 天机数据初始化 ────────────────────────────────────────────────────────────
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
  } catch { /* 优雅降级，不显示坐标 */ }

  tianjiData.value = getTianjiData(new Date(), coords)
  tianjiLoading.value = false
})

// ─── 占卜提交核心逻辑（恢复原始 cyber-sage 直连）────────────────────────────
async function handleSubmit(question: string, hexagram: {
  lines: number[]
  changingLines: boolean[]
  element: string
}) {
  if (divLoading.value) return
  divLoading.value = true
  errorMsg.value = ''

  try {
    // 1. 调用 Supabase Edge Function: cyber-sage
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // 2. 生成唯一 card_id 和 device_id
    const cardId   = crypto.randomUUID()
    const deviceId = getDeviceId()

    // 3. 计算哈希（与 DestinyView 验证逻辑一致）
    const now       = new Date().toISOString()
    const hexCode   = hexagram.lines.join('')
    const rawStr    = `${cardId}:${deviceId}:${hexCode}:${now}`
    const hashBuf   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawStr))
    const hashHex   = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    // 4. 写入 Supabase divination_logs
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
        // 可选扩展字段
        geo_region:     result.geoRegion  ?? null,
        geo_beast:      result.geoBeast   ?? null,
        has_changing:   result.hasChangingLines ?? false,
      })

    if (dbErr) throw new Error(dbErr.message)

    // 5. 跳转到命运卡片页
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

// ─── 工具：持久化 device_id ───────────────────────────────────────────────────
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050510;
  overflow: hidden;
}

/* ── 桌面书页 ── */
.book-spread {
  display: flex;
  width: min(1200px, 95vw);
  height: min(760px, 90vh);
  box-shadow: 0 0 80px rgba(100, 60, 220, 0.3);
}
.book-page {
  flex: 1;
  background: rgba(8, 8, 24, 0.95);
  border: 1px solid rgba(120, 80, 255, 0.2);
  padding: 2.5rem;
  overflow-y: auto;
}
.left-page {
  border-right: none;
  border-radius: 4px 0 0 4px;
  background: linear-gradient(135deg, rgba(8,8,24,0.98) 0%, rgba(15,8,35,0.95) 100%);
}
.right-page {
  border-left: none;
  border-radius: 0 4px 4px 0;
}
.book-spine {
  width: 12px;
  background: linear-gradient(180deg,
    rgba(120,80,255,0.6) 0%,
    rgba(60,30,160,0.8) 50%,
    rgba(120,80,255,0.6) 100%
  );
  position: relative;
  flex-shrink: 0;
}
.book-spine::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(200,180,255,0.15), transparent);
}

/* ── 移动端翻页 ── */
.mobile-pages {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
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
  padding: 1.5rem;
  box-sizing: border-box;
}
.page-dots {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.page-dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(120, 80, 255, 0.3);
  border: 1px solid rgba(120, 80, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}
.page-dots span.active {
  background: rgba(120, 80, 255, 0.9);
  box-shadow: 0 0 8px rgba(120, 80, 255, 0.8);
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
  font-family: monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-radius: 2px;
  z-index: 100;
  max-width: 90vw;
  text-align: center;
}
</style>
