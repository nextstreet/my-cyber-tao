<template>
  <div class="destiny-root" ref="rootEl">

    <!-- ░░ Canvas 粒子层（全屏背景）░░ -->
    <canvas ref="particleCanvas" class="destiny-canvas"></canvas>

    <!-- ░░ 神兽背景层 ░░ -->
    <div class="beast-bg" v-if="card">
      <img :src="beastImageUrl" class="beast-img" />
      <div class="beast-overlay"></div>
    </div>

    <!-- ░░ 加载态 ░░ -->
    <div v-if="loading" class="state-screen">
      <div class="loader-ring"></div>
      <div class="loader-ring loader-ring--inner"></div>
      <p class="loader-text">ACCESSING DESTINY MATRIX...</p>
    </div>

    <!-- ░░ 错误态 ░░ -->
    <div v-else-if="error" class="state-screen">
      <div class="error-icon">⚠</div>
      <p class="error-title">SIGNAL LOST</p>
      <p class="error-sub">{{ error }}</p>
      <button class="btn-return" @click="$router.push('/')">← RETURN</button>
    </div>

    <!-- ░░ 主内容 ░░ -->
    <div v-else-if="card" class="destiny-content">

      <!-- ── 顶部栏 ── -->
      <header class="destiny-header">
        <div class="header-left">
          <span class="brand-label">CYBER · TAO</span>
          <span class="edition-label"># {{ card.edition_number?.toString().padStart(4,'0') || '????' }}</span>
        </div>

        <!-- 实时验证徽章 -->
        <div class="verify-badge" :class="verifyState">
          <span class="verify-dot"></span>
          <span class="verify-text">{{ verifyLabel }}</span>
        </div>

        <div class="header-right">
          <span class="time-label">{{ cardTime }}</span>
        </div>
      </header>

      <!-- ── 中心卦象区 ── -->
      <main class="destiny-main">

        <!-- 卦名大字 -->
        <div class="hexagram-title-block">
          <h1 class="hexagram-name" :style="nameGlowStyle">{{ card.name_zh }}</h1>
          <div class="hexagram-meta">
            <span class="hex-en">{{ card.name_en }}</span>
            <span class="hex-sep">·</span>
            <span class="hex-code">{{ card.hexagram_code }}</span>
          </div>
        </div>

        <!-- 爻象图 + SVG 符咒覆盖层 -->
        <div class="talisman-frame">

          <!-- 爻象线 -->
          <div class="hexagram-lines">
            <div v-for="(line, i) in hexLines" :key="i" class="hex-line-row"
                 :style="{ animationDelay: `${i * 0.12}s` }">
              <template v-if="line === 1">
                <div class="hex-line hex-line--yang" :style="lineStyle"></div>
              </template>
              <template v-else>
                <div class="hex-line hex-line--yin" :style="lineStyle"></div>
                <div class="hex-gap"></div>
                <div class="hex-line hex-line--yin" :style="lineStyle"></div>
              </template>
            </div>
          </div>

          <!-- SVG 符咒动画层 -->
          <svg class="talisman-svg" viewBox="0 0 200 200">
            <!-- 外圆轨道 -->
            <circle cx="100" cy="100" r="95" fill="none"
                    :stroke="accentColor" stroke-width="0.4" stroke-dasharray="6 3" opacity="0.3"
                    class="orbit-ring orbit-cw"/>
            <circle cx="100" cy="100" r="80" fill="none"
                    :stroke="accentColor" stroke-width="0.3" stroke-dasharray="3 5" opacity="0.2"
                    class="orbit-ring orbit-ccw"/>

            <!-- 八卦方位线 -->
            <g :stroke="accentColor" stroke-width="0.3" opacity="0.25">
              <line v-for="(a,i) in [0,45,90,135]" :key="i"
                    :x1="100 + 60*Math.cos(a*Math.PI/180)"
                    :y1="100 + 60*Math.sin(a*Math.PI/180)"
                    :x2="100 - 60*Math.cos(a*Math.PI/180)"
                    :y2="100 - 60*Math.sin(a*Math.PI/180)"/>
            </g>

            <!-- 流动符咒路径 -->
            <g fill="none" :stroke="accentColor" opacity="0.55">
              <path v-for="(p, i) in talismanPaths" :key="i" :d="p"
                    stroke-width="0.6" class="talisman-path"
                    :style="`animation-delay:${i*1.1}s;animation-duration:${4+i*0.8}s`"/>
            </g>

            <!-- 发光节点 -->
            <g>
              <circle v-for="(n, i) in talismanNodes" :key="i"
                      :cx="n.x" :cy="n.y" r="2"
                      :fill="accentColor" class="talisman-node"
                      :style="`animation-delay:${i*0.5}s`"/>
            </g>

            <!-- 四角华纹 -->
            <g :stroke="accentColor" stroke-width="0.8" fill="none" opacity="0.6">
              <path d="M5,5 L18,5 L18,9 M5,5 L5,18 L9,18"/>
              <path d="M195,5 L182,5 L182,9 M195,5 L195,18 L191,18"/>
              <path d="M5,195 L18,195 L18,191 M5,195 L5,182 L9,182"/>
              <path d="M195,195 L182,195 L182,191 M195,195 L195,182 L191,182"/>
            </g>

            <!-- 卦名水印 -->
            <text x="100" y="108" text-anchor="middle" dominant-baseline="central"
                  font-family="serif" font-size="42" font-weight="bold"
                  :fill="accentColor + '12'">{{ card.name_zh }}</text>

            <!-- 扫描线 -->
            <line x1="5" :y1="scanY*1.9+5" x2="195" :y2="scanY*1.9+5"
                  :stroke="accentColor" stroke-width="0.4" opacity="0.4"/>
          </svg>
        </div>

        <!-- 卦辞 -->
        <p class="poem-text">{{ card.interpretation?.split('\n')[0] || '' }}</p>

        <!-- Oracle 神谕 -->
        <div class="oracle-block" v-if="card.oracle">
          <div class="oracle-line"></div>
          <p class="oracle-text">{{ card.oracle }}</p>
          <div class="oracle-line"></div>
        </div>

      </main>

      <!-- ── HUD 数据栏 ── -->
      <div class="hud-bar">
        <div class="hud-item">
          <span class="hud-label">SYNC</span>
          <span class="hud-value" :style="{ color: accentColor }">{{ syncRate }}%</span>
        </div>
        <div class="hud-sep"></div>
        <div class="hud-item">
          <span class="hud-label">RARITY</span>
          <span class="hud-value" :style="{ color: accentColor }">{{ rarityLabel }}</span>
        </div>
        <div class="hud-sep"></div>
        <div class="hud-item">
          <span class="hud-label">HASH</span>
          <span class="hud-value hud-mono">{{ card.verified_hash?.slice(0,8).toUpperCase() }}</span>
        </div>
        <div class="hud-sep"></div>
        <div class="hud-item">
          <span class="hud-label">ENTROPY</span>
          <span class="hud-value">{{ entropyLabel }}</span>
        </div>
      </div>

      <!-- ── 底部操作区 ── -->
      <footer class="destiny-footer">
        <!-- 分享按钮 -->
        <button class="btn-share" @click="shareCard" :style="shareBtnStyle">
          <span class="btn-icon">⬡</span>
          SHARE THIS DESTINY
        </button>

        <!-- 复制链接 -->
        <button class="btn-copy" @click="copyLink">
          {{ copied ? '✓ COPIED' : 'COPY LINK' }}
        </button>

        <!-- 返回 -->
        <button class="btn-return" @click="$router.push('/')">← NEW ORACLE</button>

        <!-- 卡片 ID -->
        <div class="card-id-display">
          <span class="card-id-label">DESTINY ID</span>
          <span class="card-id-value">{{ card.card_id }}</span>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route  = useRoute()
const router = useRouter()

// ── 状态 ──
const loading     = ref(true)
const error       = ref(null)
const card        = ref(null)
const verifyState = ref('pending')   // pending | verified | failed
const copied      = ref(false)
const scanY       = ref(5)

// ── Canvas ──
const rootEl         = ref(null)
const particleCanvas = ref(null)
let   animRaf        = null
let   scanRaf        = null

// ── 从 Supabase 加载卡片数据 ──
const loadCard = async () => {
  const cardId = route.params.cardId
  if (!cardId) { error.value = 'Invalid destiny card ID.'; loading.value = false; return }

  try {
    const { data, error: dbErr } = await supabase
      .from('divination_logs')
      .select('card_id, edition_number, verified_hash, name_zh, name_en, hexagram_code, interpretation, oracle, device_id, created_at, is_sealed')
      .eq('card_id', cardId)
      .eq('is_sealed', true)
      .single()

    if (dbErr || !data) {
      error.value = 'CARD NOT FOUND · This destiny does not exist in the matrix.'
      loading.value = false
      return
    }

    card.value = data
    loading.value = false

    // 异步验证 hash
    verifyHash(data)

    // 启动动画
    requestAnimationFrame(() => {
      initParticles()
      animateScan()
    })
  } catch (e) {
    error.value = 'NETWORK ERROR · The void is unreachable.'
    loading.value = false
  }
}

// ── 实时验证 hash ──
const verifyHash = async (data) => {
  verifyState.value = 'pending'
  try {
    // 用 SubtleCrypto 重算哈希
    const raw = `${data.card_id}:${data.device_id}:${data.hexagram_code}:${data.created_at}`
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
    const localHash = hex.slice(0, 16)

    verifyState.value = localHash === data.verified_hash ? 'verified' : 'failed'
  } catch {
    verifyState.value = 'failed'
  }
}

const verifyLabel = computed(() => ({
  pending:  'VERIFYING...',
  verified: '✓ VERIFIED AUTHENTIC',
  failed:   '✗ UNVERIFIED',
}[verifyState.value]))

// ── 视觉种子（复用 TalismanCard 同款算法）──
const seed = computed(() => {
  if (!card.value) return 0
  const str = `${card.value.device_id}-${new Date(card.value.created_at).getTime()}-${card.value.hexagram_code}`
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h)
})

const syncRate = computed(() => {
  if (!seed.value) return '---'
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})

const rarityInfo = computed(() => {
  const r = parseFloat(syncRate.value)
  if (r >= 99.0) return { label:'GODLIKE',    accent:'#ef4444' }
  if (r >= 95.1) return { label:'ULTRA RARE', accent:'#c8aa6e' }
  if (r >= 90.1) return { label:'RARE',       accent:'#67e8f9' }
  return               { label:'COMMON',     accent:'#22d3ee' }
})
const rarityLabel  = computed(() => rarityInfo.value.label)
const accentColor  = computed(() => rarityInfo.value.accent)
const entropyLabel = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])

const nameGlowStyle = computed(() => ({
  color: accentColor.value,
  textShadow: `0 0 30px ${accentColor.value}80, 0 0 60px ${accentColor.value}40, 0 0 90px ${accentColor.value}20`,
}))
const lineStyle = computed(() => ({
  background: accentColor.value,
  boxShadow: `0 0 10px ${accentColor.value}bb, 0 0 20px ${accentColor.value}55`,
}))
const shareBtnStyle = computed(() => ({
  borderColor: accentColor.value + 'aa',
  color: accentColor.value,
  background: accentColor.value + '18',
  boxShadow: `0 0 24px ${accentColor.value}30`,
}))

// 爻线
const hexLines = computed(() => {
  if (!card.value?.hexagram_code) return []
  return card.value.hexagram_code.split('').map(Number)
})

// 卡片时间
const cardTime = computed(() => {
  if (!card.value?.created_at) return ''
  const d = new Date(card.value.created_at)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
})

// 神兽
const beastImageUrl = computed(() => {
  const n = (card.value?.name_en || '').toLowerCase()
  if (n.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (n.match(/fire|sun|bright|south|clinging/)) return '/guardian-phoenix.png'
  if (n.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (n.match(/water|rain|moon|north|abyss/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

// ── SVG 符咒路径（种子驱动）──
const talismanPaths = computed(() => {
  const s = seed.value
  return [
    `M ${50+(s%30)},${20+(s%25)} Q ${100+(s%40)},${80+(s%20)} 100,${160+(s%20)} T ${160+(s%20)},${175+(s%15)}`,
    `M 20,${90+(s%30)} L ${70+(s%30)},${100+(s%20)} L ${95+(s%20)},${170+(s%20)}`,
    `M ${155+(s%25)},20 C ${115+(s%30)},55 ${80+(s%25)},130 ${40+(s%25)},${155+(s%20)}`,
    `M ${90+(s%8)},15 L ${100+(s%8)},${75+(s%35)} L ${155+(s%25)},${155+(s%20)}`,
  ].slice(0, 3 + (s % 2))
})

const talismanNodes = computed(() => {
  const s = seed.value
  return [
    { x: 40+(s%30), y: 55+(s%30) },
    { x: 140+(s%25), y: 45+(s%25) },
    { x: 100, y: 100 },
    { x: 55+(s%20), y: 140+(s%20) },
    { x: 148+(s%20), y: 130+(s%20) },
  ]
})

// 扫描线动画
const animateScan = () => {
  scanY.value = (scanY.value + 0.4) % 100
  scanRaf = requestAnimationFrame(animateScan)
}

// ── Canvas 粒子系统 ──
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

  // 粒子颜色跟随稀有度
  const accent  = accentColor.value
  const hexCode = card.value?.hexagram_code || '000000'

  // 根据爻象生成专属字符集（不是通用矩阵雨，而是与此次卦象相关）
  const hexagrams = ['乾','坤','坎','离','震','巽','艮','兑']
  const cardChars = [
    card.value?.name_zh || '命',
    ...hexCode.split('').map(n => n === '1' ? '阳' : '阴'),
    ...hexagrams.slice(0, 4),
    '◈', '⬡', '☯',
    ...'0123456789ABCDEF'.split('').slice(0, 8),
  ]

  // 粒子对象
  const PARTICLE_COUNT = 80
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(0.3 + Math.random() * 0.8),
    alpha: Math.random(),
    size: 9 + Math.floor(Math.random() * 6),
    char: cardChars[i % cardChars.length],
    glow: Math.random() > 0.85,         // 少数粒子高亮
    gold: Math.random() > 0.90,         // 极少数金色
    phase: Math.random() * Math.PI * 2, // 呼吸相位
  }))

  const draw = () => {
    ctx.fillStyle = 'rgba(4,4,10,0.06)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const t = Date.now() / 1000

    particles.forEach(p => {
      // 呼吸效果
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.8 + p.phase)
      const a = p.alpha * breathe

      if (p.gold) {
        ctx.fillStyle = `rgba(200,170,110,${a * 0.9})`
        ctx.shadowColor = '#c8aa6e'
        ctx.shadowBlur  = 8
      } else if (p.glow) {
        ctx.fillStyle = accent + Math.floor(a * 255).toString(16).padStart(2,'0')
        ctx.shadowColor = accent
        ctx.shadowBlur  = 6
      } else {
        // 主色调：根据 accentColor 变化
        const r = parseInt(accent.slice(1,3), 16)
        const g = parseInt(accent.slice(3,5), 16)
        const b = parseInt(accent.slice(5,7), 16)
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.55})`
        ctx.shadowBlur = 0
      }

      ctx.font = `${p.size}px monospace`
      ctx.fillText(p.char, p.x, p.y)
      ctx.shadowBlur = 0

      p.x += p.vx
      p.y += p.vy
      p.alpha -= 0.003

      // 重置
      if (p.alpha <= 0 || p.y < -20) {
        p.x     = Math.random() * canvas.width
        p.y     = canvas.height + 10
        p.alpha = 0.6 + Math.random() * 0.4
        p.vy    = -(0.3 + Math.random() * 0.8)
        p.vx    = (Math.random() - 0.5) * 0.6
        p.char  = cardChars[Math.floor(Math.random() * cardChars.length)]
        p.glow  = Math.random() > 0.85
        p.gold  = Math.random() > 0.90
      }
    })

    animRaf = requestAnimationFrame(draw)
  }
  draw()
}

// ── 分享 ──
const shareCard = async () => {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({
        title: `命运卡 · ${card.value?.name_zh} · Cyber Tao`,
        text: card.value?.oracle || '命运已封印，解读正在流动...',
        url,
      })
    } else {
      copyLink()
    }
  } catch {}
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}

onMounted(() => { loadCard() })
onUnmounted(() => {
  if (animRaf) cancelAnimationFrame(animRaf)
  if (scanRaf) cancelAnimationFrame(scanRaf)
})
</script>

<style scoped>
/* ══ 全局容器 ══ */
.destiny-root {
  position: fixed; inset: 0;
  background: #03030a;
  overflow: hidden;
  display: flex; flex-direction: column;
  font-family: 'Share Tech Mono', monospace;
}

.destiny-canvas {
  position: absolute; inset: 0; z-index: 0;
  pointer-events: none; opacity: 0.65;
}

/* ══ 神兽背景 ══ */
.beast-bg {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
}
.beast-img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 20%;
  opacity: 0.32;
}
.beast-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(3,3,10,0.65) 70%, rgba(3,3,10,0.95) 100%);
}

/* ══ 加载 / 错误 ══ */
.state-screen {
  position: relative; z-index: 10;
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
}
.loader-ring {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid rgba(200,170,110,0.2);
  border-top-color: #c8aa6e;
  animation: spin 1s linear infinite;
}
.loader-ring--inner {
  width: 28px; height: 28px; position: absolute;
  border-color: rgba(34,211,238,0.2) transparent;
  border-bottom-color: #22d3ee;
  animation-direction: reverse; animation-duration: 0.7s;
}
.loader-text {
  font-size: 10px; letter-spacing: 0.4em;
  color: rgba(200,170,110,0.6); text-transform: uppercase;
  animation: pulse 1.5s ease-in-out infinite;
}
.error-icon { font-size: 40px; color: rgba(239,68,68,0.7); }
.error-title { font-size: 14px; letter-spacing: 0.5em; color: rgba(239,68,68,0.8); text-transform: uppercase; }
.error-sub { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; text-align: center; padding: 0 32px; line-height: 1.6; }

/* ══ 主内容布局 ══ */
.destiny-content {
  position: relative; z-index: 10;
  flex: 1; display: flex; flex-direction: column;
  align-items: center;
  padding: 0 16px;
  overflow-y: auto;
  /* 限制宽度，手机端优先 */
  max-width: 480px; width: 100%; margin: 0 auto;
}

/* ══ 顶部栏 ══ */
.destiny-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 12px 4px;
  border-bottom: 1px solid rgba(200,170,110,0.15);
  flex-shrink: 0;
}
.header-left { display: flex; flex-direction: column; gap: 1px; }
.brand-label { font-size: 8px; letter-spacing: 0.5em; color: rgba(200,170,110,0.55); text-transform: uppercase; }
.edition-label { font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 0.2em; }
.time-label { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; }

/* 验证徽章 */
.verify-badge {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 2px;
  font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
  transition: all 0.5s;
}
.verify-badge.pending {
  border: 1px solid rgba(200,170,110,0.2);
  color: rgba(200,170,110,0.5);
  background: rgba(200,170,110,0.05);
}
.verify-badge.verified {
  border: 1px solid rgba(34,197,94,0.5);
  color: rgba(34,197,94,0.9);
  background: rgba(34,197,94,0.08);
  box-shadow: 0 0 12px rgba(34,197,94,0.2);
}
.verify-badge.failed {
  border: 1px solid rgba(239,68,68,0.4);
  color: rgba(239,68,68,0.7);
  background: rgba(239,68,68,0.05);
}
.verify-dot {
  width: 5px; height: 5px; border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
}
.verify-badge.pending .verify-dot  { background: rgba(200,170,110,0.5); }
.verify-badge.verified .verify-dot { background: rgba(34,197,94,0.9); animation: none; }
.verify-badge.failed .verify-dot   { background: rgba(239,68,68,0.7); animation: none; }

/* ══ 中心卦象 ══ */
.destiny-main {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; padding: 16px 0; width: 100%;
}

.hexagram-title-block { text-align: center; }
.hexagram-name {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(64px, 18vw, 100px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.05em;
  animation: name-breathe 4s ease-in-out infinite;
}
.hexagram-meta {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  margin-top: 6px;
}
.hex-en   { font-size: 11px; letter-spacing: 0.4em; color: rgba(255,255,255,0.55); text-transform: uppercase; }
.hex-sep  { color: rgba(255,255,255,0.2); }
.hex-code { font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); font-family: monospace; }

/* ══ 太极符咒框 ══ */
.talisman-frame {
  position: relative;
  width: min(220px, 55vw); height: min(220px, 55vw);
  display: flex; align-items: center; justify-content: center;
}
.talisman-svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  overflow: visible;
}

/* 爻象线 */
.hexagram-lines {
  position: absolute; z-index: 2;
  display: flex; flex-direction: column-reverse; gap: 6px;
}
.hex-line-row {
  display: flex; align-items: center; gap: 4px;
  animation: line-appear 0.4s ease-out backwards;
}
.hex-line {
  height: 5px; border-radius: 2px;
}
.hex-line--yang { width: 52px; }
.hex-line--yin  { width: 22px; }
.hex-gap { width: 8px; }

/* 符咒动画 */
@keyframes talisman-flow {
  0%   { stroke-dashoffset: 300; opacity: 0.2; }
  30%  { opacity: 0.8; }
  70%  { opacity: 0.8; }
  100% { stroke-dashoffset: 0;   opacity: 0.2; }
}
.talisman-path {
  stroke-dasharray: 40 15;
  animation: talisman-flow linear infinite;
}
@keyframes node-pulse {
  0%,100% { opacity: 0.3; r: 2; }
  50%      { opacity: 1.0; r: 3.5; }
}
.talisman-node { animation: node-pulse 2.5s ease-in-out infinite; }

/* 轨道旋转 */
@keyframes cw  { from{transform:rotate(0)}   to{transform:rotate(360deg)} }
@keyframes ccw { from{transform:rotate(0)}   to{transform:rotate(-360deg)} }
.orbit-ring { transform-origin: 100px 100px; }
.orbit-cw  { animation: cw  60s linear infinite; }
.orbit-ccw { animation: ccw 40s linear infinite; }

/* 卦辞 */
.poem-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 14px; letter-spacing: 0.4em; line-height: 1.8;
  color: rgba(255,255,255,0.75); text-align: center;
  max-width: 320px;
}

/* Oracle 神谕 */
.oracle-block {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  width: 100%; max-width: 340px;
}
.oracle-line {
  width: 100%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(200,170,110,0.4), transparent);
}
.oracle-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 13px; line-height: 1.8; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.85); text-align: center;
  font-style: italic;
}

/* ══ HUD 数据栏 ══ */
.hud-bar {
  width: 100%;
  display: flex; align-items: center; justify-content: center;
  gap: 0; padding: 8px 0;
  border-top: 1px solid rgba(200,170,110,0.1);
  border-bottom: 1px solid rgba(200,170,110,0.1);
  flex-shrink: 0;
}
.hud-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 0 14px; }
.hud-label { font-size: 7px; letter-spacing: 0.3em; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.hud-value { font-size: 11px; letter-spacing: 0.15em; color: rgba(255,255,255,0.7); }
.hud-mono  { font-family: monospace; font-size: 9px; }
.hud-sep { width: 1px; height: 28px; background: rgba(255,255,255,0.1); }

/* ══ 底部 ══ */
.destiny-footer {
  width: 100%; display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 14px 0 20px; flex-shrink: 0;
}
.btn-share {
  width: 100%; padding: 13px 0;
  font-family: monospace; font-size: 12px; font-weight: 900;
  letter-spacing: 0.6em; text-transform: uppercase;
  border: 1px solid; border-radius: 2px;
  cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-share:hover { filter: brightness(1.2); }
.btn-icon { font-size: 14px; }

.btn-copy {
  font-family: monospace; font-size: 10px; letter-spacing: 0.35em;
  color: rgba(255,255,255,0.45); background: transparent;
  border: 1px solid rgba(255,255,255,0.15); padding: 7px 24px;
  cursor: pointer; transition: all 0.2s; border-radius: 2px;
}
.btn-copy:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.3); }

.btn-return {
  font-family: monospace; font-size: 10px; letter-spacing: 0.3em;
  color: rgba(255,255,255,0.3); background: transparent; border: none;
  cursor: pointer; transition: color 0.2s; padding: 4px 8px;
}
.btn-return:hover { color: rgba(255,255,255,0.6); }

.card-id-display {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  margin-top: 4px;
}
.card-id-label { font-size: 7px; letter-spacing: 0.4em; color: rgba(255,255,255,0.2); text-transform: uppercase; }
.card-id-value { font-size: 9px; letter-spacing: 0.15em; color: rgba(200,170,110,0.35); font-family: monospace; }

/* ══ 通用动画 ══ */
@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
@keyframes dot-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
@keyframes line-appear {
  from { opacity:0; transform:scaleX(0.4); filter:blur(4px); }
  to   { opacity:1; transform:scaleX(1);   filter:blur(0); }
}
@keyframes name-breathe {
  0%,100% { filter: brightness(0.9); }
  50%     { filter: brightness(1.15); }
}
</style>
