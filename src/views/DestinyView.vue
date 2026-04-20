<template>
  <div class="destiny-root">

    <!-- Layer 0: 粒子 Canvas（全程存在）-->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 加载态 -->
    <div v-if="phase === 'loading'" class="center-state">
      <div class="loader-ring"></div>
      <div class="loader-ring loader-ring-inner"></div>
      <p class="loader-text">ACCESSING DESTINY MATRIX...</p>
    </div>

    <!-- 错误态 -->
    <div v-else-if="phase === 'error'" class="center-state">
      <p style="font-size:32px;color:rgba(239,68,68,0.7)">⚠</p>
      <p style="font-size:11px;letter-spacing:0.4em;color:rgba(239,68,68,0.8);text-transform:uppercase">SIGNAL LOST</p>
      <p style="font-size:10px;color:rgba(255,255,255,0.4);max-width:260px;text-align:center;line-height:1.8">{{ errorMsg }}</p>
      <button class="btn-ghost" @click="$router.push('/')">← RETURN</button>
    </div>

    <!-- 主内容（加载成功后） -->
    <template v-else-if="card">

      <!-- ═══ Phase 1: SVG 入场动画（全屏遮罩） ═══ -->
      <div class="seal-stage" :class="{ 'seal-stage-exit': phase !== 'seal' }">
        <!-- 动态SVG：根据神兽类型切换 -->
        <svg class="seal-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <!-- 外旋转环 -->
          <circle cx="200" cy="200" r="160" fill="none"
            :stroke="accentColor" stroke-width="0.6" stroke-dasharray="8 4" opacity="0.4"
            style="transform-origin:200px 200px;animation:orbit-cw 8s linear infinite"/>
          <circle cx="200" cy="200" r="135" fill="none"
            :stroke="accentColor" stroke-width="0.4" stroke-dasharray="4 8" opacity="0.25"
            style="transform-origin:200px 200px;animation:orbit-ccw 12s linear infinite"/>

          <!-- 八卦方位射线 -->
          <g :stroke="accentColor" stroke-width="0.5" opacity="0.3">
            <line v-for="(a,i) in [0,45,90,135,180,225,270,315]" :key="i"
              :x1="200 + 80*Math.cos(a*Math.PI/180)"
              :y1="200 + 80*Math.sin(a*Math.PI/180)"
              :x2="200 + 155*Math.cos(a*Math.PI/180)"
              :y2="200 + 155*Math.sin(a*Math.PI/180)"
              :style="`animation:ray-pulse 2s ease-in-out ${i*0.25}s infinite`"/>
          </g>

          <!-- 神兽专属路径动画 -->
          <!-- DRAGON：蜿蜒收拢弧线 -->
          <g v-if="beastKey==='dragon'" fill="none" :stroke="accentColor" filter="url(#glow-filter)">
            <path d="M 60,200 Q 110,80 200,100 Q 290,120 340,200 Q 290,280 200,300 Q 110,320 60,200"
              stroke-width="1.5" stroke-dasharray="400" stroke-dashoffset="400" opacity="0.85"
              style="animation:draw-path 2.2s ease-out 0.3s forwards"/>
            <path d="M 200,40 Q 320,120 310,200 Q 300,280 200,360 Q 100,280 90,200 Q 80,120 200,40"
              stroke-width="1" stroke-dasharray="500" stroke-dashoffset="500" opacity="0.55"
              style="animation:draw-path 2.8s ease-out 0.6s forwards"/>
            <circle v-for="(p,i) in dragonPoints" :key="i" :cx="p.x" :cy="p.y" r="2"
              :fill="accentColor" :style="`animation:converge-point ${1.5+i*0.1}s ease-in ${0.3+i*0.08}s forwards`"/>
          </g>

          <!-- PHOENIX：展翅放射再收缩 -->
          <g v-else-if="beastKey==='phoenix'" fill="none" :stroke="accentColor" filter="url(#glow-filter)">
            <path d="M 200,200 Q 140,150 80,120 Q 120,160 130,200 Q 120,240 80,280 Q 140,250 200,200"
              stroke-width="1.5" stroke-dasharray="400" stroke-dashoffset="400" opacity="0.85"
              style="animation:draw-path 1.8s ease-out 0.2s forwards"/>
            <path d="M 200,200 Q 260,150 320,120 Q 280,160 270,200 Q 280,240 320,280 Q 260,250 200,200"
              stroke-width="1.5" stroke-dasharray="400" stroke-dashoffset="400" opacity="0.85"
              style="animation:draw-path 1.8s ease-out 0.4s forwards"/>
            <path d="M 200,200 L 170,320 M 200,200 L 200,340 M 200,200 L 230,320"
              stroke-width="1" stroke-dasharray="200" stroke-dashoffset="200" opacity="0.6"
              style="animation:draw-path 1.5s ease-out 1.2s forwards"/>
            <circle cx="200" cy="200" r="0" :fill="accentColor+'33'" stroke-width="2"
              style="animation:expand-ring 0.8s ease-out 1.8s forwards"/>
          </g>

          <!-- TURTLE：六边形龟甲层叠 -->
          <g v-else-if="beastKey==='turtle'" fill="none" :stroke="accentColor" filter="url(#glow-filter)">
            <polygon v-for="(r,i) in [40,65,90,115,140,160]" :key="i"
              :points="hexPoints(200,200,r)"
              stroke-width="0.8" :opacity="0.2+i*0.12"
              :style="`stroke-dasharray:${r*6.3};stroke-dashoffset:${r*6.3};animation:draw-path ${1.2+i*0.3}s ease-out ${i*0.25}s forwards`"/>
            <line v-for="(a,i) in [30,90,150,210,270,330]" :key="'l'+i"
              :x1="200 + 40*Math.cos(a*Math.PI/180)"
              :y1="200 + 40*Math.sin(a*Math.PI/180)"
              :x2="200 + 160*Math.cos(a*Math.PI/180)"
              :y2="200 + 160*Math.sin(a*Math.PI/180)"
              stroke-width="0.5" opacity="0.35"
              :style="`animation:ray-pulse 2s ease-in-out ${i*0.2}s infinite`"/>
          </g>

          <!-- TIGER：斜向扫描切割线 -->
          <g v-else-if="beastKey==='tiger'" fill="none" :stroke="accentColor" filter="url(#glow-filter)">
            <line x1="50" y1="100" x2="350" y2="180" stroke-width="2"
              stroke-dasharray="350" stroke-dashoffset="350" opacity="0.9"
              style="animation:draw-path 0.8s ease-out 0.1s forwards"/>
            <line x1="50" y1="200" x2="350" y2="200" stroke-width="2.5"
              stroke-dasharray="300" stroke-dashoffset="300" opacity="0.9"
              style="animation:draw-path 0.7s ease-out 0.35s forwards"/>
            <line x1="50" y1="300" x2="350" y2="220" stroke-width="2"
              stroke-dasharray="350" stroke-dashoffset="350" opacity="0.9"
              style="animation:draw-path 0.8s ease-out 0.6s forwards"/>
            <circle cx="200" cy="200" r="50" stroke-width="1.5"
              stroke-dasharray="315" stroke-dashoffset="315" opacity="0.7"
              style="animation:draw-path 1.2s ease-out 1.0s forwards"/>
            <circle cx="200" cy="200" r="25" stroke-width="2"
              stroke-dasharray="157" stroke-dashoffset="157" opacity="0.9"
              style="animation:draw-path 0.8s ease-out 1.8s forwards"/>
          </g>

          <!-- QILIN（default）：螺旋旋入 -->
          <g v-else fill="none" :stroke="accentColor" filter="url(#glow-filter)">
            <path :d="spiralPath(200,200,160,5)"
              stroke-width="1.2" stroke-dasharray="1200" stroke-dashoffset="1200" opacity="0.8"
              style="animation:draw-path 3s ease-out 0.2s forwards"/>
            <line x1="200" y1="200" x2="200" y2="30" stroke-width="3"
              stroke-dasharray="170" stroke-dashoffset="170" opacity="0.95"
              style="animation:draw-path 0.6s ease-out 2.8s forwards;filter:url(#glow-filter)"/>
          </g>

          <!-- 中心封印圆（所有神兽共有，最后出现） -->
          <circle cx="200" cy="200" r="35" fill="none"
            :stroke="accentColor" stroke-width="2"
            stroke-dasharray="220" stroke-dashoffset="220" opacity="0.9"
            style="animation:draw-path 0.8s ease-out 2.4s forwards"/>
          <circle cx="200" cy="200" r="8" :fill="accentColor" opacity="0"
            style="animation:dot-appear 0.4s ease-out 3.0s forwards;filter:url(#glow-filter)"/>

          <!-- 四角封印符文 -->
          <g :fill="accentColor" opacity="0" font-family="serif" font-size="14"
             style="animation:rune-appear 0.6s ease-out 2.6s forwards">
            <text x="30"  y="45"  text-anchor="middle">乾</text>
            <text x="370" y="45"  text-anchor="middle">坤</text>
            <text x="30"  y="375" text-anchor="middle">离</text>
            <text x="370" y="375" text-anchor="middle">坎</text>
          </g>
        </svg>

        <!-- 封印文字 -->
        <div class="seal-text" :style="{ color: accentColor }">
          <p class="seal-title">{{ card.name_zh }}</p>
          <p class="seal-sub">DESTINY SEALED · {{ rarityLabel }}</p>
        </div>
      </div>

      <!-- ═══ Phase 2+3: 卡片主体 ═══ -->
      <div class="card-scene" :class="{ 'card-visible': phase === 'card' || phase === 'converge' }">
        <div class="card-wrapper">

          <!-- 命运卡牌 -->
          <div class="destiny-card" :style="cardBodyStyle">

            <!-- 外发光（稀有度驱动） -->
            <div class="card-outer-glow" :style="glowStyle"></div>

            <!-- 四角装饰 -->
            <div class="corner corner-tl" :style="cornerStyle"></div>
            <div class="corner corner-tr" :style="cornerStyle"></div>
            <div class="corner corner-bl" :style="cornerStyle"></div>
            <div class="corner corner-br" :style="cornerStyle"></div>

            <!-- 扫描线 -->
            <div class="card-scanline" :style="{ top: scanY + '%', background: accentColor }"></div>

            <!-- 顶部 HUD -->
            <div class="card-hud-top">
              <span class="hud-mono" :style="hudStyle">CYBER·TAO</span>
              <div class="verify-badge" :class="verifyState">
                <span class="verify-dot"></span>
                <span>{{ verifyLabel }}</span>
              </div>
              <span class="hud-mono" :style="hudStyle">#{{ editionStr }}</span>
            </div>

            <!-- 神兽视频区（卡片上半约40%） -->
            <div class="card-video-wrap">
              <video ref="beastVideo"
                :src="`/beast-${beastKey}.mp4`"
                autoplay loop muted playsinline
                class="beast-video"
                :style="{ opacity: videoOpacity }">
              </video>
              <!-- Phase 2 粒子聚合时的遮罩 -->
              <div class="video-converge-mask" :style="{ opacity: maskOpacity }"></div>
              <!-- 稀有度渐变底部融合 -->
              <div class="video-fade-bottom" :style="videoFadeStyle"></div>
              <!-- 稀有度标签 -->
              <div class="rarity-tag" :style="rarityTagStyle">{{ rarityLabel }}</div>
              <div v-if="isGodlike" class="godlike-tag">⚡ GODLIKE</div>
            </div>

            <!-- 卦象区 -->
            <div class="card-hex">
              <h1 class="hex-name" :style="hexNameStyle">{{ card.name_zh }}</h1>
              <p class="hex-en-name">{{ card.name_en }}</p>
              <div class="hex-rule" :style="{ background: accentColor }"></div>
              <!-- 爻象 -->
              <div class="hex-lines">
                <div v-for="(line, i) in hexLines" :key="i" class="hex-row">
                  <template v-if="line === 1">
                    <div class="hl hl-yang" :style="hlStyle"></div>
                  </template>
                  <template v-else>
                    <div class="hl hl-yin" :style="hlStyle"></div>
                    <div class="hl-gap"></div>
                    <div class="hl hl-yin" :style="hlStyle"></div>
                  </template>
                </div>
              </div>
            </div>

            <!-- ═══ Oracle 短句区（分级展示，核心改造部分）═══ -->
            <div class="card-oracle" :class="`oracle-${rarityTier}`">

              <!-- GODLIKE / EPIC：先显示古典引用，再显示主短句 -->
              <template v-if="(rarityTier === 'godlike' || rarityTier === 'ultra') && classicalQuote">
                <div class="oracle-classical-wrap">
                  <span class="oracle-classical-glyph" :style="{ color: accentColor }">「</span>
                  <p class="oracle-classical-text" :style="{ color: accentColor + 'cc' }">
                    {{ classicalQuote }}
                  </p>
                  <span class="oracle-classical-glyph" :style="{ color: accentColor }">」</span>
                </div>
                <div class="oracle-divider" :style="oracleDividerStyle"></div>
              </template>

              <!-- 主短句 ── 所有稀有度都有，字号和样式随稀有度变化 -->
              <div class="oracle-line" :style="oracleLineStyle"></div>
              <p class="oracle-text" :class="`oracle-text-${rarityTier}`" :style="oracleTextStyle">
                {{ oracleDisplayText }}
              </p>
              <div class="oracle-line" :style="oracleLineStyle"></div>

              <!-- GODLIKE 专属：稀有度符文角标 -->
              <div v-if="rarityTier === 'godlike'" class="oracle-rune-row">
                <span v-for="r in ['☯','◈','⚡','◈','☯']" :key="r"
                  class="oracle-rune" :style="{ color: accentColor + '66' }">{{ r }}</span>
              </div>

              <!-- EPIC 专属：信号标签 -->
              <div v-else-if="rarityTier === 'ultra'" class="oracle-signal-tag" :style="{ borderColor: accentColor + '44', color: accentColor + '99' }">
                SIGNAL · {{ oracleSignalCode }}
              </div>

            </div>

            <!-- 底部 HUD -->
            <div class="card-hud-bottom">
              <div class="hud-cell">
                <span class="hud-label">SYNC</span>
                <span class="hud-val" :style="{ color: accentColor }">{{ syncRate }}%</span>
              </div>
              <div class="hud-sep"></div>
              <div class="hud-cell">
                <span class="hud-label">ENTROPY</span>
                <span class="hud-val">{{ entropyLabel }}</span>
              </div>
              <div class="hud-sep"></div>
              <div class="hud-cell">
                <span class="hud-label">HASH</span>
                <span class="hud-val" style="font-size:8px">{{ hashDisplay }}</span>
              </div>
            </div>

            <div class="card-id-bar">
              <span style="font-size:7px;letter-spacing:0.2em;color:rgba(255,255,255,0.18)">{{ card.card_id }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
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

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route  = useRoute()
const router = useRouter()

// ── 状态机 ──
const phase       = ref('loading')
const errorMsg    = ref('')
const card        = ref(null)
const verifyState = ref('pending')
const copied      = ref(false)

// ── Canvas & 扫描线 ──
const particleCanvas = ref(null)
const beastVideo     = ref(null)
const scanY          = ref(5)
let animRaf    = null
let scanRaf    = null
let phaseTimer = null

// ── 粒子系统状态 ──
const particleMode = ref('float')
const videoOpacity = ref(0)
const maskOpacity  = ref(1)

// ── 加载卡片 ──
const loadCard = async () => {
  const cardId = decodeURIComponent(route.params.cardId)
  if (!cardId) { phase.value = 'error'; errorMsg.value = 'Invalid card ID.'; return }
  try {
    const { data, error } = await supabase
      .from('divination_logs')
      .select(`
        card_id, edition_number, verified_hash,
        name_zh, name_en, hexagram_code,
        interpretation, oracle,
        oracle_short_sentence, classical_quote,
        fortune_scores, resonance, rarity,
        device_id, created_at, is_sealed
      `)
      .eq('card_id', cardId)
      .eq('is_sealed', true)
      .single()

    if (error || !data) {
      phase.value = 'error'
      errorMsg.value = 'CARD NOT FOUND · This destiny does not exist in the matrix.'
      return
    }
    card.value = data
    phase.value = 'seal'
    requestAnimationFrame(() => initParticles())
    animateScan()
    verifyHash(data)
    scheduleSealExit()
  } catch (e) {
    phase.value = 'error'
    errorMsg.value = 'NETWORK ERROR · The void is unreachable.'
  }
}

// ── 阶段调度 ──
const scheduleSealExit = () => {
  phaseTimer = setTimeout(() => {
    phase.value = 'converge'
    particleMode.value = 'converge'
    animateConverge()
    phaseTimer = setTimeout(() => {
      phase.value = 'card'
      particleMode.value = 'fade'
      videoOpacity.value = 1
      maskOpacity.value = 0
    }, 2000)
  }, 3500)
}

const animateConverge = () => {
  const duration = 2000
  const start = Date.now()
  const tick = () => {
    const t = Math.min(1, (Date.now() - start) / duration)
    maskOpacity.value = 1 - t
    videoOpacity.value = t
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ── 验证哈希 ──
const verifyHash = async (data) => {
  try {
    const raw = `${data.card_id}:${data.device_id}:${data.hexagram_code}:${data.created_at}`
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
    verifyState.value = hex.slice(0, 16) === data.verified_hash ? 'verified' : 'failed'
  } catch { verifyState.value = 'failed' }
}

const verifyLabel = computed(() => ({
  pending: 'VERIFYING...', verified: '✓ VERIFIED', failed: '✗ UNVERIFIED'
}[verifyState.value]))

// ── 视觉种子 & 稀有度 ──
const seed = computed(() => {
  if (!card.value) return 0
  const s = `${card.value.device_id}-${new Date(card.value.created_at).getTime()}-${card.value.hexagram_code}`
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return Math.abs(h)
})

const syncRate = computed(() => {
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})

const isGodlike = computed(() => parseFloat(syncRate.value) >= 99)

// ── 稀有度分层（扩展：优先使用后端字段 rarity，fallback 到 syncRate）──
const rarityTier = computed(() => {
  // 后端新字段优先
  const backendRarity = card.value?.rarity?.toUpperCase()
  if (backendRarity === 'GODLIKE') return 'godlike'
  if (backendRarity === 'EPIC')    return 'ultra'
  if (backendRarity === 'RARE')    return 'rare'
  if (backendRarity === 'COMMON')  return 'common'
  // fallback: syncRate 计算
  const r = parseFloat(syncRate.value)
  if (r >= 99)   return 'godlike'
  if (r >= 95.1) return 'ultra'
  if (r >= 90.1) return 'rare'
  return 'common'
})

const rarity = computed(() => {
  const map = {
    godlike: { label: 'GODLIKE',    accent: '#ef4444' },
    ultra:   { label: 'ULTRA RARE', accent: '#c8aa6e' },
    rare:    { label: 'RARE',       accent: '#67e8f9' },
    common:  { label: 'COMMON',     accent: '#22d3ee' },
  }
  return map[rarityTier.value]
})

const rarityLabel  = computed(() => rarity.value.label)
const accentColor  = computed(() => rarity.value.accent)
const entropyLabel = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])
const editionStr   = computed(() => card.value?.edition_number?.toString().padStart(4,'0') || '????')
const hashDisplay  = computed(() => card.value?.verified_hash?.slice(0,8).toUpperCase() || '--------')

// ── Oracle 短句分级逻辑 ──────────────────────────────────────────────

// 1. 主短句：优先后端新字段 oracle_short_sentence，fallback 截取 oracle 前 20 字
const oracleDisplayText = computed(() => {
  const shortSentence = card.value?.oracle_short_sentence
  if (shortSentence) return shortSentence

  // fallback: 从完整 oracle 截取，取第一个句号/逗号前的内容，或前 20 字
  const fullText = card.value?.oracle || ''
  if (!fullText) return ''
  const firstPunct = fullText.search(/[。，；！？,.;!?]/)
  if (firstPunct > 0 && firstPunct <= 30) return fullText.slice(0, firstPunct + 1)
  return fullText.slice(0, 20) + (fullText.length > 20 ? '…' : '')
})

// 2. 古典引用：后端新字段 classical_quote（仅 GODLIKE/EPIC 有）
const classicalQuote = computed(() => card.value?.classical_quote || null)

// 3. 信号码（EPIC 专属装饰）：由 hexagram_code + seed 生成，无需后端
const oracleSignalCode = computed(() => {
  const code = card.value?.hexagram_code || '000000'
  const hex  = (seed.value % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
  return `${code}-${hex}`
})

// ── 神兽key ──
const beastKey = computed(() => {
  const n = (card.value?.name_en || '').toLowerCase()
  if (n.match(/heaven|thunder|wind|wood/)) return 'dragon'
  if (n.match(/fire|sun|bright|clinging/)) return 'phoenix'
  if (n.match(/lake|mountain|metal/))      return 'tiger'
  if (n.match(/water|rain|moon|abyss/))    return 'turtle'
  return 'qilin'
})

// ── 爻象 ──
const hexLines = computed(() => {
  if (!card.value?.hexagram_code) return []
  return card.value.hexagram_code.split('').map(Number).reverse()
})

// ── 样式计算 ──
const glowStyle = computed(() => {
  const c = accentColor.value
  const tier = rarityTier.value
  if (tier === 'godlike') return {
    boxShadow: `0 0 0 1px ${c}, 0 0 24px ${c}aa, 0 0 60px ${c}55, 0 0 120px ${c}22`,
    animation: 'glow-godlike 1.5s ease-in-out infinite'
  }
  if (tier === 'ultra') return {
    boxShadow: `0 0 0 1px ${c}aa, 0 0 18px ${c}66, 0 0 45px ${c}33`,
    animation: 'glow-breathe 3s ease-in-out infinite'
  }
  if (tier === 'rare') return {
    boxShadow: `0 0 0 1px ${c}77, 0 0 14px ${c}44, 0 0 32px ${c}22`,
    animation: 'glow-breathe 4s ease-in-out infinite'
  }
  return { boxShadow: `0 0 0 1px ${c}44, 0 0 12px ${c}33` }
})

const cardBodyStyle    = computed(() => ({
  border: `1px solid ${accentColor.value}44`,
  background: 'linear-gradient(175deg, #08090f 0%, #04050a 60%, #060810 100%)',
}))
const cornerStyle      = computed(() => ({ borderColor: accentColor.value + 'cc', boxShadow: `0 0 8px ${accentColor.value}55` }))
const hudStyle         = computed(() => ({ color: accentColor.value + '88' }))
const hexNameStyle     = computed(() => ({ color: accentColor.value, textShadow: `0 0 18px ${accentColor.value}88, 0 0 40px ${accentColor.value}44` }))
const hlStyle          = computed(() => ({ background: accentColor.value, boxShadow: `0 0 7px ${accentColor.value}aa` }))
const rarityTagStyle   = computed(() => ({ color: accentColor.value, border: `1px solid ${accentColor.value}55`, background: accentColor.value + '18' }))
const videoFadeStyle   = computed(() => ({ background: `linear-gradient(to bottom, transparent 30%, #04050a 100%)` }))
const primaryBtnStyle  = computed(() => ({ borderColor: accentColor.value + '99', color: accentColor.value, background: accentColor.value + '15', boxShadow: `0 0 20px ${accentColor.value}25` }))

// Oracle 区样式（根据稀有度变化）
const oracleLineStyle = computed(() => ({
  background: `linear-gradient(to right, transparent, ${accentColor.value}50, transparent)`
}))
const oracleDividerStyle = computed(() => ({
  background: `linear-gradient(to right, transparent, ${accentColor.value}30, transparent)`,
  margin: '4px 0'
}))

// 主短句文字样式（稀有度驱动字号和颜色）
const oracleTextStyle = computed(() => {
  const tier = rarityTier.value
  const c = accentColor.value
  if (tier === 'godlike') return {
    fontSize: '13px',
    background: `linear-gradient(135deg, ${c}, ${c}bb, ${c}dd)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: `drop-shadow(0 0 6px ${c}66)`,
    letterSpacing: '0.08em',
  }
  if (tier === 'ultra') return {
    fontSize: '12px',
    color: `${c}ee`,
    filter: `drop-shadow(0 0 4px ${c}44)`,
    letterSpacing: '0.05em',
  }
  if (tier === 'rare') return {
    fontSize: '11.5px',
    color: 'rgba(220,210,255,0.88)',
    letterSpacing: '0.03em',
  }
  return {
    fontSize: '11px',
    color: 'rgba(200,190,240,0.78)',
    letterSpacing: '0.02em',
  }
})

// ── SVG 辅助函数 ──
const hexPoints = (cx, cy, r) =>
  Array.from({length:6}, (_,i) => {
    const a = (i*60 - 30) * Math.PI/180
    return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`
  }).join(' ')

const spiralPath = (cx, cy, maxR, turns) => {
  let d = `M ${cx} ${cy}`
  const steps = turns * 36
  for (let i = 1; i <= steps; i++) {
    const angle = (i / steps) * turns * 2 * Math.PI
    const r = (i / steps) * maxR
    d += ` L ${cx + r*Math.cos(angle - Math.PI/2)} ${cy + r*Math.sin(angle - Math.PI/2)}`
  }
  return d
}

const dragonPoints = computed(() =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2
    const r = 80 + Math.sin(a * 3) * 30
    return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) }
  })
)

// ── 扫描线 ──
const animateScan = () => {
  scanY.value = (scanY.value + 0.3) % 100
  scanRaf = requestAnimationFrame(animateScan)
}

// ── 粒子系统（分级：粒子数量、字符集、颜色强度随稀有度变化）──
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const accent = accentColor.value
  const tier   = rarityTier.value
  const CX = window.innerWidth / 2
  const CY = window.innerHeight / 2

  // 按稀有度定义粒子字符集
  const baseChars = ['◈','⬡','☯','乾','坤','坎','离','震','巽','艮','兑', '0','1','A','F']
  const hexCode   = card.value?.hexagram_code || '000000'
  const nameChar  = card.value?.name_zh?.[0] || '命'

  // GODLIKE: 加入古典卦辞字符；EPIC: 加入更多易学符号；RARE/COMMON: 基础集
  const tierChars = {
    godlike: [...baseChars, nameChar, '元','亨','利','贞','吉','凶','悔','吝','无','咎','⚡','✦','✧'],
    ultra:   [...baseChars, nameChar, '⚡','✦','▲','◉','⊕', ...hexCode.split('').map(n=>n==='1'?'阳':'阴')],
    rare:    [...baseChars, nameChar, ...hexCode.split('').map(n=>n==='1'?'阳':'阴')],
    common:  [...baseChars, nameChar],
  }
  const chars = tierChars[tier]

  // 按稀有度定义粒子数量
  const countMap = { godlike: 90, ultra: 65, rare: 40, common: 25 }
  const COUNT = countMap[tier]

  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -(0.15 + Math.random() * 0.5),
    alpha: 0.2 + Math.random() * 0.5,
    size: 8 + Math.floor(Math.random() * 6),
    char: chars[Math.floor(Math.random() * chars.length)],
    // GODLIKE/EPIC 有更高概率出现金色粒子
    gold: Math.random() > (tier === 'godlike' ? 0.75 : tier === 'ultra' ? 0.82 : 0.92),
    phase: Math.random() * Math.PI * 2,
    homeAngle: Math.random() * Math.PI * 2,
    homeDist: 20 + Math.random() * 80,
  }))

  // 按稀有度定义背景叠加密度（GODLIKE最浓）
  const bgAlphaMap = { godlike: 0.04, ultra: 0.05, rare: 0.055, common: 0.065 }
  const bgAlpha = bgAlphaMap[tier]

  const draw = () => {
    ctx.fillStyle = `rgba(3,3,10,${bgAlpha})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const t = Date.now() / 1000
    const mode = particleMode.value

    particles.forEach(p => {
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.7 + p.phase)
      let a = p.alpha * breathe

      if (mode === 'fade') a *= 0.3

      if (p.gold) {
        // 金色粒子：GODLIKE 用红金，其他用标准金
        const goldColor = tier === 'godlike' ? '239,100,80' : '200,170,110'
        ctx.fillStyle = `rgba(${goldColor},${a * 0.9})`
        ctx.shadowColor = tier === 'godlike' ? '#ef4444' : '#c8aa6e'
        ctx.shadowBlur  = tier === 'godlike' ? 8 : 5
      } else {
        const r = parseInt(accent.slice(1,3)||'22',16)
        const g = parseInt(accent.slice(3,5)||'d3',16)
        const b = parseInt(accent.slice(5,7)||'ee',16)
        // GODLIKE/EPIC 粒子透明度更高，更显眼
        const alphaMulti = tier === 'godlike' ? 0.65 : tier === 'ultra' ? 0.55 : 0.42
        ctx.fillStyle = `rgba(${r},${g},${b},${a * alphaMulti})`
        ctx.shadowBlur = 0
      }

      ctx.font = `${p.size}px monospace`
      ctx.fillText(p.char, p.x, p.y)
      ctx.shadowBlur = 0

      if (mode === 'float' || mode === 'fade') {
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.002
        if (p.alpha <= 0 || p.y < -20) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.alpha = 0.3 + Math.random() * 0.4
          p.vy = -(0.15 + Math.random() * 0.5)
          p.vx = (Math.random() - 0.5) * 0.7
          p.char = chars[Math.floor(Math.random() * chars.length)]
          p.gold = Math.random() > (tier === 'godlike' ? 0.75 : tier === 'ultra' ? 0.82 : 0.92)
        }
      } else if (mode === 'converge') {
        const tx = CX + p.homeDist * Math.cos(p.homeAngle)
        const ty = CY + p.homeDist * Math.sin(p.homeAngle)
        p.vx += (tx - p.x) * 0.03
        p.vy += (ty - p.y) * 0.03
        p.vx *= 0.9; p.vy *= 0.9
        p.x += p.vx; p.y += p.vy
        p.alpha = Math.min(0.8, p.alpha + 0.01)
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
        text: card.value?.oracle_short_sentence || oracleDisplayText.value,
        url: window.location.href
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
  if (animRaf)    cancelAnimationFrame(animRaf)
  if (scanRaf)    cancelAnimationFrame(scanRaf)
  if (phaseTimer) clearTimeout(phaseTimer)
})
</script>

<style scoped>
.destiny-root {
  position: fixed; inset: 0; background: #03030a;
  font-family: 'Share Tech Mono', monospace;
  overflow: hidden;
}

/* 粒子层 */
.particle-canvas {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
}

/* 中心状态（加载/错误） */
.center-state {
  position: absolute; inset: 0; z-index: 20;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}
.loader-ring {
  position: absolute; width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid rgba(200,170,110,0.2); border-top-color: #c8aa6e;
  animation: spin 1s linear infinite;
}
.loader-ring-inner {
  width: 28px; height: 28px; inset: 8px;
  border-color: rgba(34,211,238,0.2) transparent; border-bottom-color: #22d3ee;
  animation-direction: reverse; animation-duration: 0.7s;
}
.loader-text {
  position: relative; top: 36px;
  font-size: 10px; letter-spacing: 0.4em; color: rgba(200,170,110,0.6);
  text-transform: uppercase; animation: pulse 1.5s ease-in-out infinite;
}

/* ═══ Phase 1: 封印舞台 ═══ */
.seal-stage {
  position: absolute; inset: 0; z-index: 10;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(3,3,10,0.92);
  transition: opacity 0.8s ease-out;
}
.seal-stage-exit {
  opacity: 0; pointer-events: none;
}
.seal-svg {
  width: min(380px, 90vw); height: min(380px, 90vw);
}
.seal-text {
  text-align: center; margin-top: 16px;
}
.seal-title {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(32px, 10vw, 52px);
  font-weight: 900; letter-spacing: 0.1em; line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}
.seal-sub {
  font-size: 10px; letter-spacing: 0.5em; margin-top: 8px;
  text-transform: uppercase; opacity: 0.6;
  animation: fade-in-up 0.6s ease-out 2.8s both;
}

/* ═══ Phase 2+3: 卡片场景 ═══ */
.card-scene {
  position: absolute; inset: 0; z-index: 5;
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto;
  padding: 24px 16px 40px;
  opacity: 0; pointer-events: none;
  transition: opacity 0.8s ease-in;
}
.card-visible { opacity: 1; pointer-events: all; }
.card-wrapper {
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  width: 100%; max-width: 380px;
}

/* ═══ 卡牌本体（9:16比例）═══ */
.destiny-card {
  position: relative; width: 100%; aspect-ratio: 9/16;
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.6);
}

/* 外发光 */
.card-outer-glow {
  position: absolute; inset: -1px; border-radius: 17px;
  z-index: 0; pointer-events: none;
}

/* 四角装饰 */
.corner { position: absolute; width: 18px; height: 18px; z-index: 30; pointer-events: none; }
.corner-tl { top:0; left:0;    border-top: 2px solid; border-left: 2px solid;   border-radius: 16px 0 0 0; }
.corner-tr { top:0; right:0;   border-top: 2px solid; border-right: 2px solid;  border-radius: 0 16px 0 0; }
.corner-bl { bottom:0; left:0; border-bottom: 2px solid; border-left: 2px solid; border-radius: 0 0 0 16px; }
.corner-br { bottom:0; right:0;border-bottom: 2px solid; border-right: 2px solid;border-radius: 0 0 16px 0; }

/* 扫描线 */
.card-scanline {
  position: absolute; left:0; right:0; height:1px; z-index:25;
  pointer-events:none; opacity:0.4; transition: top 0.05s linear;
}

/* 顶部 HUD */
.card-hud-top {
  position: relative; z-index: 10; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px 7px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.35);
}
.hud-mono { font-size: 8px; letter-spacing: 0.28em; }

/* 验证徽章 */
.verify-badge {
  display: flex; align-items: center; gap: 4px; padding: 2px 7px;
  font-size: 8px; letter-spacing: 0.15em; border-radius: 2px; transition: all 0.4s;
}
.verify-badge.pending  { border: 1px solid rgba(200,170,110,0.2); color: rgba(200,170,110,0.5); }
.verify-badge.verified { border: 1px solid rgba(34,197,94,0.5); color: rgba(34,197,94,0.9); background: rgba(34,197,94,0.08); box-shadow: 0 0 8px rgba(34,197,94,0.2); }
.verify-badge.failed   { border: 1px solid rgba(239,68,68,0.4); color: rgba(239,68,68,0.7); }
.verify-dot { width:4px; height:4px; border-radius:50%; background:currentColor; }

/* 视频区 */
.card-video-wrap {
  position: relative; flex: 0 0 38%; overflow: hidden;
}
.beast-video {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 20%;
  transition: opacity 0.5s ease-in;
}
.video-converge-mask {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(3,3,10,0.95) 0%, rgba(3,3,10,0.7) 60%, transparent 100%);
  transition: opacity 0.3s;
}
.video-fade-bottom { position: absolute; inset: 0; }
.rarity-tag {
  position: absolute; top: 9px; right: 9px; z-index: 5;
  font-size: 8px; letter-spacing: 0.28em; padding: 3px 8px;
  font-family: monospace; text-transform: uppercase;
}
.godlike-tag {
  position: absolute; bottom: 12px; right: 9px; z-index: 5;
  font-size: 8px; letter-spacing: 0.25em;
  color: #f87171; border: 1px solid rgba(239,68,68,0.4);
  background: rgba(0,0,0,0.75); padding: 3px 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 卦象区 */
.card-hex {
  position: relative; z-index: 10; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 14px 8px;
}
.hex-name {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(38px, 12vw, 52px);
  font-weight: 900; letter-spacing: 0.06em; line-height: 1; margin-bottom: 3px;
}
.hex-en-name {
  font-size: 9px; letter-spacing: 0.4em; color: rgba(255,255,255,0.4);
  text-transform: uppercase; margin-bottom: 8px;
}
.hex-rule { width: 36px; height: 1px; margin-bottom: 8px; opacity: 0.6; }
.hex-lines { display: flex; flex-direction: column; gap: 4px; }
.hex-row { display: flex; align-items: center; justify-content: center; gap: 3px; }
.hl { height: 4px; border-radius: 2px; }
.hl-yang { width: 40px; }
.hl-yin  { width: 16px; }
.hl-gap  { width: 8px; }

/* ═══ Oracle 区（核心改造）═══ */
.card-oracle {
  position: relative; z-index: 10; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 6px 18px; gap: 6px;
}

/* GODLIKE 背景：径向红金光晕 */
.oracle-godlike::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.08) 0%, transparent 70%);
  pointer-events: none;
  animation: oracle-godlike-pulse 2.5s ease-in-out infinite;
}

/* EPIC 背景：斜向金色微光 */
.oracle-ultra::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(200,170,110,0.06) 0%, transparent 50%, rgba(200,170,110,0.04) 100%);
  pointer-events: none;
}

/* 古典引用（GODLIKE / EPIC 专属） */
.oracle-classical-wrap {
  display: flex; align-items: center; gap: 4px;
  width: 100%; justify-content: center;
}
.oracle-classical-glyph {
  font-family: 'Noto Serif SC', serif;
  font-size: 14px; line-height: 1;
  opacity: 0.7;
}
.oracle-classical-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 10px; letter-spacing: 0.12em; line-height: 1.7;
  text-align: center; font-style: italic;
}
.oracle-divider {
  width: 80%; height: 1px;
}

/* 分割线 */
.oracle-line { width: 100%; height: 1px; }

/* 主短句（所有稀有度共用基础样式，通过 JS style binding 覆盖） */
.oracle-text {
  font-family: 'Noto Serif SC', serif;
  line-height: 1.85; text-align: center;
  /* 基础颜色由 oracleTextStyle computed 注入 */
}

/* GODLIKE 文字动画 */
.oracle-text-godlike {
  animation: oracle-text-shimmer 3s ease-in-out infinite;
}

/* EPIC 文字动画 */
.oracle-text-ultra {
  animation: oracle-text-glow 2.5s ease-in-out infinite;
}

/* GODLIKE 符文行 */
.oracle-rune-row {
  display: flex; gap: 10px; align-items: center;
  animation: fade-in-up 0.5s ease-out 0.3s both;
}
.oracle-rune {
  font-size: 9px; letter-spacing: 0.05em;
  animation: pulse 2s ease-in-out infinite;
}
.oracle-rune:nth-child(1) { animation-delay: 0s; }
.oracle-rune:nth-child(2) { animation-delay: 0.3s; }
.oracle-rune:nth-child(3) { animation-delay: 0.6s; }
.oracle-rune:nth-child(4) { animation-delay: 0.9s; }
.oracle-rune:nth-child(5) { animation-delay: 1.2s; }

/* EPIC 信号标签 */
.oracle-signal-tag {
  font-size: 7px; letter-spacing: 0.25em;
  padding: 2px 8px; border: 1px solid; border-radius: 1px;
  font-family: monospace;
  animation: fade-in-up 0.5s ease-out 0.3s both;
}

/* 底部 HUD */
.card-hud-bottom {
  position: relative; z-index: 10; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 6px 0 3px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.3);
}
.hud-cell { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 0 12px; }
.hud-label { font-size: 7px; letter-spacing: 0.22em; color: rgba(255,255,255,0.22); text-transform: uppercase; }
.hud-val   { font-size: 10px; letter-spacing: 0.08em; color: rgba(255,255,255,0.6); font-family: monospace; }
.hud-sep   { width: 1px; height: 22px; background: rgba(255,255,255,0.07); }

.card-id-bar {
  position: relative; z-index: 10; flex-shrink: 0;
  text-align: center; padding: 3px 0 7px; background: rgba(0,0,0,0.3);
}

/* 操作按钮 */
.card-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.btn-primary {
  width: 100%; padding: 12px 0;
  font-family: monospace; font-size: 12px; font-weight: 900;
  letter-spacing: 0.5em; text-transform: uppercase;
  border: 1px solid; border-radius: 2px; cursor: pointer; transition: all 0.25s;
}
.btn-primary:hover { filter: brightness(1.2); }
.btn-row { display: flex; gap: 10px; width: 100%; }
.btn-ghost {
  flex: 1; padding: 8px 0;
  font-family: monospace; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(255,255,255,0.4); background: transparent;
  border: 1px solid rgba(255,255,255,0.14); border-radius: 2px; cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }

/* ═══ 动画定义 ═══ */
@keyframes spin      { to { transform: rotate(360deg) } }
@keyframes pulse     { 0%,100%{opacity:0.55} 50%{opacity:1} }
@keyframes fade-in-up { from{opacity:0;transform:translateY(8px)} to{opacity:0.6;transform:none} }

@keyframes draw-path   { to { stroke-dashoffset: 0 } }
@keyframes ray-pulse   { 0%,100%{opacity:0.1} 50%{opacity:0.45} }
@keyframes orbit-cw    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes orbit-ccw   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
@keyframes dot-appear  { from{opacity:0;r:2} to{opacity:1;r:8} }
@keyframes rune-appear { from{opacity:0} to{opacity:0.6} }
@keyframes expand-ring { from{r:0;opacity:0.8} to{r:60;opacity:0} }

@keyframes converge-point {
  from { transform: translate(0,0) }
  to   { transform: translate(calc(200px - var(--px)), calc(200px - var(--py))); opacity:0 }
}

@keyframes glow-godlike {
  0%,100%{ box-shadow: 0 0 0 1px #ef4444, 0 0 24px #ef4444aa, 0 0 60px #ef444455 }
  50%    { box-shadow: 0 0 0 2px #ef4444, 0 0 40px #ef4444cc, 0 0 90px #ef444477 }
}
@keyframes glow-breathe { 0%,100%{ opacity:0.85 } 50%{ opacity:1 } }

/* Oracle 区专属动画 */
@keyframes oracle-godlike-pulse {
  0%,100% { opacity: 0.6 }
  50%     { opacity: 1   }
}
@keyframes oracle-text-shimmer {
  0%,100% { filter: drop-shadow(0 0 4px rgba(239,68,68,0.4)) }
  50%     { filter: drop-shadow(0 0 10px rgba(239,68,68,0.8)) }
}
@keyframes oracle-text-glow {
  0%,100% { filter: drop-shadow(0 0 3px rgba(200,170,110,0.3)) }
  50%     { filter: drop-shadow(0 0 8px rgba(200,170,110,0.7)) }
}
</style>
