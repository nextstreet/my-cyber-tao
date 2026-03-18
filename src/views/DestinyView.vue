<template>
  <!-- 全屏背景：粒子 Canvas + 暗色遮罩 -->
  <div class="destiny-root">
    <canvas ref="particleCanvas" class="destiny-bg-canvas"></canvas>
    <div class="destiny-bg-overlay"></div>

    <!-- 加载态 -->
    <div v-if="loading" class="destiny-state">
      <div class="loader-rings">
        <div class="ring ring-outer"></div>
        <div class="ring ring-inner"></div>
      </div>
      <p class="loader-text">ACCESSING DESTINY MATRIX...</p>
    </div>

    <!-- 错误态 -->
    <div v-else-if="error" class="destiny-state">
      <div style="font-size:36px;color:rgba(239,68,68,0.7)">⚠</div>
      <p style="font-size:13px;letter-spacing:0.4em;color:rgba(239,68,68,0.8);text-transform:uppercase">SIGNAL LOST</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);max-width:280px;text-align:center;line-height:1.7">{{ error }}</p>
      <button class="btn-ghost" @click="$router.push('/')">← RETURN</button>
    </div>

    <!-- 卡片主体 -->
    <div v-else-if="card" class="destiny-scroll">
      <div class="card-wrapper">

        <!-- ★ 真正的卡牌 -->
        <div class="destiny-card" :style="cardStyle">

          <!-- 外发光层（稀有度颜色） -->
          <div class="card-glow" :style="glowStyle"></div>

          <!-- 四角切角装饰 -->
          <div class="corner-tl" :style="cornerStyle"></div>
          <div class="corner-tr" :style="cornerStyle"></div>
          <div class="corner-bl" :style="cornerStyle"></div>
          <div class="corner-br" :style="cornerStyle"></div>

          <!-- 扫描线 -->
          <div class="scan-line" :style="{ top: scanY + '%', background: accentColor }"></div>

          <!-- ── 卡顶 HUD ── -->
          <div class="card-top-hud">
            <span class="hud-mono" :style="hudColor">CYBER·TAO</span>
            <!-- 验证徽章 -->
            <div class="verify-badge" :class="verifyState">
              <span class="verify-dot"></span>
              <span class="verify-label">{{ verifyLabel }}</span>
            </div>
            <span class="hud-mono" :style="hudColor">#{{ editionStr }}</span>
          </div>

          <!-- ── 神兽图区（卡上半部，占比约40%）── -->
          <div class="card-art">
            <img :src="beastImageUrl" class="beast-art-img" />
            <!-- 渐变遮罩，让图底部融入卡身 -->
            <div class="art-fade" :style="artFadeStyle"></div>
            <!-- 稀有度标签 -->
            <div class="rarity-tag" :style="rarityTagStyle">
              {{ rarityLabel }}
            </div>
            <!-- GODLIKE 标记 -->
            <div v-if="isGodlike" class="godlike-tag">⚡ GODLIKE</div>
          </div>

          <!-- ── 卡中：卦象 ── -->
          <div class="card-hex-section">
            <h1 class="hex-name" :style="hexNameStyle">{{ card.name_zh }}</h1>
            <p class="hex-en">{{ card.name_en }}</p>
            <div class="hex-divider" :style="{ background: accentColor }"></div>
            <!-- 爻象小图 -->
            <div class="hex-lines-display">
              <div v-for="(line, i) in hexLines" :key="i" class="hex-line-row">
                <template v-if="line === 1">
                  <div class="hl hl-yang" :style="{ background: accentColor, boxShadow: `0 0 8px ${accentColor}99` }"></div>
                </template>
                <template v-else>
                  <div class="hl hl-yin" :style="{ background: accentColor, boxShadow: `0 0 8px ${accentColor}99` }"></div>
                  <div class="hl-gap"></div>
                  <div class="hl hl-yin" :style="{ background: accentColor, boxShadow: `0 0 8px ${accentColor}99` }"></div>
                </template>
              </div>
            </div>
          </div>

          <!-- ── 卡下：Oracle 短句 ── -->
          <div class="card-oracle-section">
            <div class="oracle-deco-line" :style="{ background: `linear-gradient(to right, transparent, ${accentColor}60, transparent)` }"></div>
            <p class="oracle-text">{{ card.oracle || card.interpretation?.split('.')[0] || '' }}</p>
            <div class="oracle-deco-line" :style="{ background: `linear-gradient(to right, transparent, ${accentColor}40, transparent)` }"></div>
          </div>

          <!-- ── 卡底 HUD ── -->
          <div class="card-bottom-hud">
            <div class="hud-cell">
              <span class="hud-label">SYNC</span>
              <span class="hud-value" :style="{ color: accentColor }">{{ syncRate }}%</span>
            </div>
            <div class="hud-sep"></div>
            <div class="hud-cell">
              <span class="hud-label">ENTROPY</span>
              <span class="hud-value" style="color:rgba(255,255,255,0.6)">{{ entropyLabel }}</span>
            </div>
            <div class="hud-sep"></div>
            <div class="hud-cell">
              <span class="hud-label">HASH</span>
              <span class="hud-value" style="color:rgba(255,255,255,0.5);font-size:8px">{{ hashDisplay }}</span>
            </div>
          </div>

          <!-- 卡片ID -->
          <div class="card-id-strip">
            <span class="hud-mono" style="color:rgba(255,255,255,0.2);font-size:7px;letter-spacing:0.2em">{{ card.card_id }}</span>
          </div>

        </div>
        <!-- /card -->

        <!-- ── 操作按钮区 ── -->
        <div class="card-actions">
          <button class="btn-primary" :style="primaryBtnStyle" @click="shareCard">
            ⬡ SHARE THIS DESTINY
          </button>
          <div class="btn-row">
            <button class="btn-ghost" @click="copyLink">{{ copied ? '✓ COPIED' : 'COPY LINK' }}</button>
            <button class="btn-ghost" @click="$router.push('/')">← NEW ORACLE</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route  = useRoute()
const router = useRouter()

const loading     = ref(true)
const error       = ref(null)
const card        = ref(null)
const verifyState = ref('pending')
const copied      = ref(false)
const scanY       = ref(5)

const particleCanvas = ref(null)
let animRaf = null
let scanRaf = null

// ── 加载卡片 ──
const loadCard = async () => {
  const cardId = decodeURIComponent(route.params.cardId)
  if (!cardId) { error.value = 'Invalid card ID.'; loading.value = false; return }
  try {
    const { data, error: dbErr } = await supabase
      .from('divination_logs')
      .select('card_id,edition_number,verified_hash,name_zh,name_en,hexagram_code,interpretation,oracle,device_id,created_at,is_sealed')
      .eq('card_id', cardId)
      .eq('is_sealed', true)
      .single()
    if (dbErr || !data) { error.value = 'CARD NOT FOUND · This destiny does not exist.'; loading.value = false; return }
    card.value = data
    loading.value = false
    verifyHash(data)
    requestAnimationFrame(() => { initParticles(); animateScan() })
  } catch (e) {
    error.value = 'NETWORK ERROR · The void is unreachable.'
    loading.value = false
  }
}

// ── 验证哈希 ──
const verifyHash = async (data) => {
  try {
    const raw = `${data.card_id}:${data.device_id}:${data.hexagram_code}:${data.created_at}`
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
    verifyState.value = hex.slice(0,16) === data.verified_hash ? 'verified' : 'failed'
  } catch { verifyState.value = 'failed' }
}

const verifyLabel = computed(() => ({
  pending: 'VERIFYING...', verified: '✓ VERIFIED', failed: '✗ UNVERIFIED'
}[verifyState.value]))

// ── 视觉种子 ──
const seed = computed(() => {
  if (!card.value) return 0
  const s = `${card.value.device_id}-${new Date(card.value.created_at).getTime()}-${card.value.hexagram_code}`
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return Math.abs(h)
})

const syncRate = computed(() => {
  if (!seed.value) return '---'
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})

const isGodlike = computed(() => parseFloat(syncRate.value) >= 99)

const rarityInfo = computed(() => {
  const r = parseFloat(syncRate.value)
  if (r >= 99)   return { label: 'GODLIKE',    accent: '#ef4444' }
  if (r >= 95.1) return { label: 'ULTRA RARE', accent: '#c8aa6e' }
  if (r >= 90.1) return { label: 'RARE',       accent: '#67e8f9' }
  return               { label: 'COMMON',     accent: '#22d3ee' }
})

const rarityLabel  = computed(() => rarityInfo.value.label)
const accentColor  = computed(() => rarityInfo.value.accent)
const entropyLabel = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])
const editionStr   = computed(() => card.value?.edition_number?.toString().padStart(4,'0') || '????')
const hashDisplay  = computed(() => card.value?.verified_hash?.slice(0,8).toUpperCase() || '--------')

// ── 卡片样式 ──
const cardStyle = computed(() => ({
  border: `1px solid ${accentColor.value}55`,
  background: 'linear-gradient(175deg, #08090f 0%, #04050a 100%)',
}))

// 外发光（关键视觉——不同稀有度完全不同的光晕）
const glowStyle = computed(() => {
  const c = accentColor.value
  const r = parseFloat(syncRate.value)
  // GODLIKE：强烈红色脉冲，多层
  if (r >= 99) return {
    boxShadow: `0 0 0 1px ${c}, 0 0 20px ${c}99, 0 0 50px ${c}55, 0 0 100px ${c}22`,
    animation: 'godlike-pulse 1.5s ease-in-out infinite',
  }
  // ULTRA RARE：金色双层光晕
  if (r >= 95.1) return {
    boxShadow: `0 0 0 1px ${c}99, 0 0 16px ${c}66, 0 0 40px ${c}33`,
    animation: 'rare-breathe 3s ease-in-out infinite',
  }
  // RARE：青色柔光
  if (r >= 90.1) return {
    boxShadow: `0 0 0 1px ${c}77, 0 0 12px ${c}44, 0 0 28px ${c}22`,
    animation: 'rare-breathe 4s ease-in-out infinite',
  }
  // COMMON：基础蓝光
  return {
    boxShadow: `0 0 0 1px ${c}44, 0 0 10px ${c}33`,
  }
})

const cornerStyle = computed(() => ({
  borderColor: accentColor.value + 'cc',
  boxShadow: `0 0 8px ${accentColor.value}66`,
}))

const hudColor = computed(() => ({ color: accentColor.value + '88' }))

const hexNameStyle = computed(() => ({
  color: accentColor.value,
  textShadow: `0 0 20px ${accentColor.value}99, 0 0 40px ${accentColor.value}44`,
}))

const artFadeStyle = computed(() => ({
  background: `linear-gradient(to bottom, transparent 30%, #04050a 100%)`,
}))

const rarityTagStyle = computed(() => ({
  color: accentColor.value,
  border: `1px solid ${accentColor.value}55`,
  background: `${accentColor.value}18`,
  textShadow: `0 0 8px ${accentColor.value}66`,
}))

const primaryBtnStyle = computed(() => ({
  borderColor: accentColor.value + '99',
  color: accentColor.value,
  background: accentColor.value + '18',
  boxShadow: `0 0 20px ${accentColor.value}28`,
}))

// ── 爻象 ──
const hexLines = computed(() => {
  if (!card.value?.hexagram_code) return []
  return card.value.hexagram_code.split('').map(Number).reverse()
})

// ── 神兽 ──
const beastImageUrl = computed(() => {
  const n = (card.value?.name_en || '').toLowerCase()
  if (n.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (n.match(/fire|sun|bright|south|clinging/)) return '/guardian-phoenix.png'
  if (n.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (n.match(/water|rain|moon|north|abyss/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

// ── 扫描线 ──
const animateScan = () => {
  scanY.value = (scanY.value + 0.35) % 100
  scanRaf = requestAnimationFrame(animateScan)
}

// ── 粒子系统（字符型，卦象相关）──
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  })

  const accent = accentColor.value
  const hexCode = card.value?.hexCode || '000000'
  const chars = [
    card.value?.name_zh || '命',
    ...('0123456789ABCDEF'.split('')),
    '◈', '⬡', '☯', '⚡', '⬡',
    '乾','坤','坎','离','震','巽','艮','兑'
  ]

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.2 + Math.random() * 0.6),
    alpha: Math.random() * 0.6,
    size: 9 + Math.floor(Math.random() * 5),
    char: chars[Math.floor(Math.random() * chars.length)],
    gold: Math.random() > 0.88,
    phase: Math.random() * Math.PI * 2,
  }))

  const draw = () => {
    ctx.fillStyle = 'rgba(4,5,10,0.06)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const t = Date.now() / 1000

    particles.forEach(p => {
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.7 + p.phase)
      const a = p.alpha * breathe
      if (p.gold) {
        ctx.fillStyle = `rgba(200,170,110,${a * 0.85})`
        ctx.shadowColor = '#c8aa6e'; ctx.shadowBlur = 7
      } else {
        const r = parseInt(accent.slice(1,3), 16)
        const g = parseInt(accent.slice(3,5), 16)
        const b = parseInt(accent.slice(5,7), 16)
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.5})`
        ctx.shadowBlur = 0
      }
      ctx.font = `${p.size}px monospace`
      ctx.fillText(p.char, p.x, p.y)
      ctx.shadowBlur = 0
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.002
      if (p.alpha <= 0 || p.y < -20) {
        p.x = Math.random() * canvas.width
        p.y = canvas.height + 10
        p.alpha = 0.4 + Math.random() * 0.4
        p.vy = -(0.2 + Math.random() * 0.6)
        p.vx = (Math.random() - 0.5) * 0.5
        p.char = chars[Math.floor(Math.random() * chars.length)]
        p.gold = Math.random() > 0.88
      }
    })
    animRaf = requestAnimationFrame(draw)
  }
  draw()
}

// ── 分享 / 复制 ──
const shareCard = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `命运卡 · ${card.value?.name_zh} · Cyber Tao`,
        text: card.value?.oracle || '',
        url: window.location.href,
      })
    } else { copyLink() }
  } catch {}
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}

onMounted(() => loadCard())
onUnmounted(() => {
  if (animRaf) cancelAnimationFrame(animRaf)
  if (scanRaf) cancelAnimationFrame(scanRaf)
})
</script>

<style scoped>
/* ── 根容器 ── */
.destiny-root {
  position: fixed; inset: 0;
  background: #03030a;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Share Tech Mono', monospace;
}

/* ── 背景 ── */
.destiny-bg-canvas {
  position: absolute; inset: 0; z-index: 0;
  pointer-events: none; opacity: 0.55;
}
.destiny-bg-overlay {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(ellipse 60% 60% at 50% 45%, transparent 30%, rgba(3,3,10,0.8) 100%);
}

/* ── 状态屏 ── */
.destiny-state {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.loader-rings {
  position: relative; width: 44px; height: 44px;
}
.ring {
  position: absolute; border-radius: 50%; animation: spin 1s linear infinite;
}
.ring-outer { inset: 0; border: 2px solid rgba(200,170,110,0.2); border-top-color: #c8aa6e; }
.ring-inner { inset: 8px; border: 1px solid rgba(34,211,238,0.2); border-bottom-color: #22d3ee;
  animation-direction: reverse; animation-duration: 0.7s; }
.loader-text {
  font-size: 10px; letter-spacing: 0.4em; color: rgba(200,170,110,0.6);
  text-transform: uppercase; animation: pulse 1.5s ease-in-out infinite;
}

/* ── 滚动容器 ── */
.destiny-scroll {
  position: relative; z-index: 10;
  width: 100%; height: 100%;
  overflow-y: auto;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 24px 16px 40px;
}
.card-wrapper {
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  width: 100%; max-width: 380px;
}

/* ══════════════════════════════════════
   ★ 命运卡牌主体 — 固定比例 9:16
══════════════════════════════════════ */
.destiny-card {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  overflow: hidden;
  display: flex; flex-direction: column;
  /* 基础阴影：卡片深度感 */
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.6);
}

/* 外发光层（absolute，不裁剪） */
.card-glow {
  position: absolute; inset: -2px;
  border-radius: 18px;
  z-index: 0;
  pointer-events: none;
  transition: box-shadow 0.5s;
}

/* 四角切角 */
.corner-tl, .corner-tr, .corner-bl, .corner-br {
  position: absolute; width: 20px; height: 20px; z-index: 20; pointer-events: none;
}
.corner-tl { top: 0; left: 0;     border-top: 2px solid; border-left: 2px solid;  border-radius: 16px 0 0 0; }
.corner-tr { top: 0; right: 0;    border-top: 2px solid; border-right: 2px solid; border-radius: 0 16px 0 0; }
.corner-bl { bottom: 0; left: 0;  border-bottom: 2px solid; border-left: 2px solid;  border-radius: 0 0 0 16px; }
.corner-br { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; border-radius: 0 0 16px 0; }

/* 扫描线 */
.scan-line {
  position: absolute; left: 0; right: 0; height: 1px;
  z-index: 25; pointer-events: none;
  opacity: 0.45;
  transition: top 0.05s linear;
}

/* ── 顶部 HUD ── */
.card-top-hud {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
}
.hud-mono {
  font-size: 8px; letter-spacing: 0.3em; font-family: monospace;
}

/* 验证徽章 */
.verify-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 2px;
  font-size: 8px; letter-spacing: 0.2em;
  transition: all 0.4s;
}
.verify-badge.pending  { border: 1px solid rgba(200,170,110,0.2); color: rgba(200,170,110,0.5); }
.verify-badge.verified { border: 1px solid rgba(34,197,94,0.5); color: rgba(34,197,94,0.9); background: rgba(34,197,94,0.08); box-shadow: 0 0 10px rgba(34,197,94,0.2); }
.verify-badge.failed   { border: 1px solid rgba(239,68,68,0.4); color: rgba(239,68,68,0.7); }
.verify-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: currentColor;
}
.verify-label { font-size: 8px; letter-spacing: 0.15em; }

/* ── 神兽图区（约38%高度）── */
.card-art {
  position: relative;
  flex: 0 0 38%;
  overflow: hidden;
}
.beast-art-img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 20%;
  opacity: 0.85;
}
.art-fade {
  position: absolute; inset: 0;
}
.rarity-tag {
  position: absolute; top: 10px; right: 10px;
  font-size: 8px; letter-spacing: 0.3em;
  padding: 3px 8px;
  font-family: monospace; text-transform: uppercase;
  z-index: 5;
}
.godlike-tag {
  position: absolute; bottom: 14px; right: 10px;
  font-size: 8px; letter-spacing: 0.3em;
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.45);
  background: rgba(0,0,0,0.7);
  padding: 3px 8px; z-index: 5;
  animation: pulse 1.5s ease-in-out infinite;
}

/* ── 卦象区 ── */
.card-hex-section {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 16px 10px;
  flex-shrink: 0;
}
.hex-name {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(42px, 14vw, 58px);
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1;
  margin-bottom: 4px;
}
.hex-en {
  font-size: 10px; letter-spacing: 0.45em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hex-divider {
  width: 40px; height: 1px; margin-bottom: 10px; opacity: 0.6;
}
/* 爻象显示 */
.hex-lines-display {
  display: flex; flex-direction: column; gap: 4px;
}
.hex-line-row {
  display: flex; align-items: center; justify-content: center; gap: 3px;
}
.hl { height: 4px; border-radius: 2px; }
.hl-yang { width: 44px; }
.hl-yin  { width: 18px; }
.hl-gap  { width: 8px; }

/* ── Oracle 短句区 ── */
.card-oracle-section {
  position: relative; z-index: 10;
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 8px 20px;
  gap: 8px;
}
.oracle-deco-line {
  width: 100%; height: 1px;
}
.oracle-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 12px;
  line-height: 1.85;
  color: rgba(255,255,255,0.82);
  text-align: center;
  letter-spacing: 0.03em;
  font-style: italic;
}

/* ── 底部 HUD ── */
.card-bottom-hud {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  gap: 0;
  padding: 8px 0 4px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
}
.hud-cell { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 0 14px; }
.hud-label { font-size: 7px; letter-spacing: 0.25em; color: rgba(255,255,255,0.25); text-transform: uppercase; }
.hud-value { font-size: 11px; letter-spacing: 0.1em; font-family: monospace; }
.hud-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.08); }

/* 卡片 ID 条 */
.card-id-strip {
  position: relative; z-index: 10;
  text-align: center; padding: 4px 0 8px;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
}

/* ── 操作按钮 ── */
.card-actions {
  display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;
}
.btn-primary {
  width: 100%; padding: 13px 0;
  font-family: monospace; font-size: 12px; font-weight: 900;
  letter-spacing: 0.55em; text-transform: uppercase;
  border: 1px solid; border-radius: 2px;
  cursor: pointer; transition: all 0.3s;
}
.btn-primary:hover { filter: brightness(1.2); }
.btn-row { display: flex; gap: 10px; width: 100%; }
.btn-ghost {
  flex: 1; padding: 8px 0;
  font-family: monospace; font-size: 10px; letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15); border-radius: 2px;
  cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }

/* ── 动画 ── */
@keyframes spin  { from { transform: rotate(0) }   to { transform: rotate(360deg) } }
@keyframes pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }
@keyframes godlike-pulse {
  0%,100% { box-shadow: 0 0 0 1px #ef4444, 0 0 20px #ef444499, 0 0 50px #ef444455; }
  50%      { box-shadow: 0 0 0 2px #ef4444, 0 0 35px #ef4444bb, 0 0 80px #ef444477; }
}
@keyframes rare-breathe {
  0%,100% { opacity: 0.8; }
  50%      { opacity: 1; }
}
</style>
