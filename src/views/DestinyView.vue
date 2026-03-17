<template>
  <div class="destiny-root">
    <canvas ref="particleCanvas" class="destiny-canvas"></canvas>

    <div v-if="card" class="beast-bg">
      <img :src="beastImageUrl" class="beast-img" crossorigin="anonymous" ref="beastImgEl" />
      <div class="beast-vignette"></div>
    </div>

    <div v-if="loading" class="state-center">
      <div class="spin-outer"></div>
      <div class="spin-inner"></div>
      <p class="state-text">ACCESSING DESTINY MATRIX...</p>
    </div>

    <div v-else-if="error" class="state-center">
      <p class="error-glyph">⚠</p>
      <p class="error-title">SIGNAL LOST</p>
      <p class="error-body">{{ error }}</p>
      <button class="btn-ghost" @click="$router.push('/')">← RETURN TO VOID</button>
    </div>

    <div v-else-if="card" class="content-wrap">

      <header class="top-bar">
        <div>
          <div class="brand">CYBER · TAO</div>
          <div class="edition"># {{ String(card.edition_number || 0).padStart(4,'0') }}</div>
        </div>
        <div class="verify-chip" :class="verifyState">
          <span class="verify-dot"></span>
          <span>{{ verifyLabel }}</span>
        </div>
        <div class="card-date">{{ cardDate }}</div>
      </header>

      <div class="name-block">
        <h1 class="gua-name" :style="glowStyle">{{ card.name_zh }}</h1>
        <div class="gua-meta">
          <span>{{ card.name_en }}</span>
          <span class="sep">·</span>
          <span class="mono">{{ card.hexagram_code }}</span>
        </div>
      </div>

      <div class="talisman-wrap">
        <svg class="talisman-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="94" fill="none"
                  :stroke="accent" stroke-width="0.4"
                  stroke-dasharray="5 3" opacity="0.3"
                  style="transform-origin:100px 100px;animation:cw 60s linear infinite"/>
          <circle cx="100" cy="100" r="78" fill="none"
                  :stroke="accent" stroke-width="0.3"
                  stroke-dasharray="3 6" opacity="0.2"
                  style="transform-origin:100px 100px;animation:ccw 45s linear infinite"/>
          <g :stroke="accent" stroke-width="0.25" opacity="0.18">
            <line v-for="a in [0,22.5,45,67.5,90,112.5,135,157.5]" :key="a"
                  :x1="100+65*Math.cos(a*Math.PI/180)" :y1="100+65*Math.sin(a*Math.PI/180)"
                  :x2="100-65*Math.cos(a*Math.PI/180)" :y2="100-65*Math.sin(a*Math.PI/180)"/>
          </g>
          <g fill="none" :stroke="accent">
            <path v-for="(p,pi) in tPaths" :key="pi" :d="p"
                  stroke-width="0.55" opacity="0.6"
                  class="t-path"
                  :style="`--delay:${pi*1.1}s;--dur:${3.8+pi*0.7}s`"/>
          </g>
          <circle v-for="(n,ni) in tNodes" :key="ni"
                  :cx="n.x" :cy="n.y" r="1.8"
                  :fill="accent" class="t-node"
                  :style="`--delay:${ni*0.55}s`"/>
          <g :stroke="accent" stroke-width="0.9" fill="none" opacity="0.65">
            <path d="M4,4 L16,4 L16,8 M4,4 L4,16 L8,16"/>
            <path d="M196,4 L184,4 L184,8 M196,4 L196,16 L192,16"/>
            <path d="M4,196 L16,196 L16,192 M4,196 L4,184 L8,184"/>
            <path d="M196,196 L184,196 L184,192 M196,196 L196,184 L192,184"/>
          </g>
          <text x="100" y="108" text-anchor="middle" dominant-baseline="central"
                font-family="serif" font-size="44" font-weight="900"
                :fill="accent+'0e'">{{ card.name_zh }}</text>
          <line x1="6" :y1="scanY*1.88+6" x2="194" :y2="scanY*1.88+6"
                :stroke="accent" stroke-width="0.45" opacity="0.45"/>
        </svg>

        <div class="hex-lines">
          <div v-for="(line, li) in hexLines" :key="li" class="hex-row"
               :style="`animation-delay:${li * 0.1}s`">
            <div v-if="line===1" class="yao yang" :style="yaoStyle"></div>
            <template v-else>
              <div class="yao yin" :style="yaoStyle"></div>
              <div class="yao-gap"></div>
              <div class="yao yin" :style="yaoStyle"></div>
            </template>
          </div>
        </div>
      </div>

      <p class="poem">{{ firstLine }}</p>

      <div v-if="card.oracle" class="oracle-wrap">
        <div class="oracle-rule" :style="{background:`linear-gradient(to right,transparent,${accent}55,transparent)`}"></div>
        <p class="oracle-text">{{ card.oracle }}</p>
        <div class="oracle-rule" :style="{background:`linear-gradient(to right,transparent,${accent}55,transparent)`}"></div>
      </div>

      <div class="hud-bar">
        <div class="hud-cell">
          <span class="hud-lbl">SYNC</span>
          <span class="hud-val" :style="{color:accent}">{{ syncRate }}%</span>
        </div>
        <div class="hud-rule"></div>
        <div class="hud-cell">
          <span class="hud-lbl">RARITY</span>
          <span class="hud-val" :style="{color:accent}">{{ rarityLabel }}</span>
        </div>
        <div class="hud-rule"></div>
        <div class="hud-cell">
          <span class="hud-lbl">ENTROPY</span>
          <span class="hud-val">{{ entropyLabel }}</span>
        </div>
        <div class="hud-rule"></div>
        <div class="hud-cell">
          <span class="hud-lbl">HASH</span>
          <span class="hud-val mono">{{ hashDisplay }}</span>
        </div>
      </div>

      <footer class="bottom-bar">
        <button class="btn-share" :style="shareStyle" @click="shareCard">
          ⬡ SHARE THIS DESTINY
        </button>
        <div class="btn-row">
          <button class="btn-ghost" @click="copyLink">
            {{ copied ? '✓ COPIED' : 'COPY LINK' }}
          </button>
          <button class="btn-ghost" @click="$router.push('/')">← NEW ORACLE</button>
        </div>
        <p class="card-id-lbl">{{ card.card_id }}</p>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore - supabase.js has no declaration file
import { supabase } from '../lib/supabase'

const route  = useRoute()
const router = useRouter()

const loading     = ref(true)
const error       = ref<string | null>(null)
const card        = ref<any>(null)
const verifyState = ref<'pending' | 'verified' | 'failed'>('pending')
const copied      = ref(false)
const scanY       = ref(5)

const particleCanvas = ref<HTMLCanvasElement | null>(null)
const beastImgEl     = ref<HTMLImageElement | null>(null)
let animRaf: number | null = null
let scanRaf: number | null = null

// ── 加载卡片 ──
const loadCard = async () => {
  const cardId = route.params.cardId as string
  if (!cardId) { error.value = 'Invalid card ID.'; loading.value = false; return }

  const { data, error: dbErr } = await supabase
    .from('divination_logs')
    .select('card_id,edition_number,verified_hash,name_zh,name_en,hexagram_code,interpretation,oracle,device_id,created_at,is_sealed')
    .eq('card_id', cardId)
    .eq('is_sealed', true)
    .single()

  if (dbErr || !data) {
    error.value = 'CARD NOT FOUND · This destiny does not exist in the matrix.'
    loading.value = false
    return
  }

  card.value    = data
  loading.value = false
  verifyHash(data)
  requestAnimationFrame(() => { initPixelParticles(); animateScan() })
}

// ── 验证 ──
const verifyHash = async (data: any) => {
  try {
    const raw = `${data.card_id}:${data.device_id}:${data.hexagram_code}:${data.created_at}`
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(buf)).map((b: number) => b.toString(16).padStart(2,'0')).join('')
    verifyState.value = hex.slice(0,16) === data.verified_hash ? 'verified' : 'failed'
  } catch { verifyState.value = 'failed' }
}

const verifyLabel = computed(() => ({
  pending: 'VERIFYING...', verified: '✓ VERIFIED', failed: '✗ UNVERIFIED'
}[verifyState.value]))

// ── 视觉种子 ──
const seed = computed((): number => {
  if (!card.value) return 0
  const s = `${card.value.device_id}-${new Date(card.value.created_at).getTime()}-${card.value.hexagram_code}`
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return Math.abs(h)
})

const syncRate = computed((): string => {
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})

const rarityInfo = computed(() => {
  const r = parseFloat(syncRate.value)
  if (r >= 99)   return { label: 'GODLIKE',    accent: '#ef4444' }
  if (r >= 95.1) return { label: 'ULTRA RARE', accent: '#c8aa6e' }
  if (r >= 90.1) return { label: 'RARE',       accent: '#67e8f9' }
  return               { label: 'COMMON',     accent: '#22d3ee' }
})

const rarityLabel  = computed(() => rarityInfo.value.label)
const accent       = computed(() => rarityInfo.value.accent)
const entropyLabel = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])

const glowStyle  = computed(() => ({
  color: accent.value,
  textShadow: `0 0 28px ${accent.value}88,0 0 56px ${accent.value}44,0 0 90px ${accent.value}22`
}))
const yaoStyle   = computed(() => ({
  background: accent.value,
  boxShadow: `0 0 10px ${accent.value}cc,0 0 20px ${accent.value}55`
}))
const shareStyle = computed(() => ({
  borderColor: accent.value + 'aa',
  color: accent.value,
  background: accent.value + '1a',
  boxShadow: `0 0 22px ${accent.value}30`
}))

const hexLines   = computed((): number[] =>
  (card.value?.hexagram_code || '').split('').map(Number)
)
const firstLine  = computed((): string => {
  const interp: string = card.value?.interpretation || ''
  return interp.split(/[。\n]/)[0] || ''
})
const cardDate   = computed((): string => {
  if (!card.value?.created_at) return ''
  const d = new Date(card.value.created_at)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
})
const hashDisplay = computed((): string =>
  (card.value?.verified_hash || '').slice(0,8).toUpperCase()
)

const beastImageUrl = computed((): string => {
  const n = (card.value?.name_en || '').toLowerCase()
  if (n.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (n.match(/fire|sun|bright|south|clinging/)) return '/guardian-phoenix.png'
  if (n.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (n.match(/water|rain|moon|north|abyss/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

// ── 符咒路径 ──
const tPaths = computed((): string[] => {
  const s = seed.value
  return ([
    `M ${48+(s%18)},${18+(s%24)} Q ${98+(s%32)},${82+(s%18)} 100,${162+(s%18)} T ${162+(s%18)},${178+(s%14)}`,
    `M 18,${88+(s%28)} L ${68+(s%28)},${98+(s%18)} L ${93+(s%18)},${172+(s%18)}`,
    `M ${158+(s%22)},18 C ${118+(s%28)},52 ${78+(s%22)},128 ${38+(s%22)},${152+(s%18)}`,
    `M ${88+(s%8)},14 L ${98+(s%8)},${72+(s%32)} L ${158+(s%22)},${152+(s%18)}`,
  ] as string[]).slice(0, 3 + (s % 2))
})

const tNodes = computed((): Array<{x:number;y:number}> => {
  const s = seed.value
  return [
    { x:38+(s%28), y:52+(s%28) },
    { x:148+(s%22), y:38+(s%22) },
    { x:100, y:100 },
    { x:52+(s%18), y:148+(s%18) },
    { x:152+(s%18), y:138+(s%18) },
    { x:72+(s%22), y:72+(s%22) },
  ]
})

const animateScan = () => {
  scanY.value = (scanY.value + 0.35) % 100
  scanRaf = requestAnimationFrame(animateScan)
}

// ══════════════════════════════════════════
// ★ 像素感知粒子系统
// ══════════════════════════════════════════
interface EmitSource { x: number; y: number; brightness: number; r: number; g: number; b: number }
interface Particle {
  x: number; y: number; vx: number; vy: number
  alpha: number; decay: number; size: number; char: string
  type: 'gold' | 'glow' | 'beast' | 'dim'
  pr: number; pg: number; pb: number; phase: number
}

const initPixelParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const hexStr = accent.value.replace('#','')
  const ar = parseInt(hexStr.slice(0,2), 16)
  const ag = parseInt(hexStr.slice(2,4), 16)
  const ab = parseInt(hexStr.slice(4,6), 16)

  const guas = ['乾','坤','坎','离','震','巽','艮','兑']
  const hexCode: string = card.value?.hexagram_code || '000000'
  const cardChars: string[] = [
    card.value?.name_zh || '命',
    ...hexCode.split('').map((n: string) => n === '1' ? '阳' : '阴'),
    ...guas.slice(seed.value % 4, (seed.value % 4) + 4),
    '◈','⬡','☯','⚡','✦',
    ...'ABCDEF0123456789'.split('').slice(seed.value % 8, (seed.value % 8) + 6),
  ]

  const isGodlike = parseFloat(syncRate.value) >= 99
  const PARTICLE_N = isGodlike ? 160 : 110

  let emitSources: EmitSource[] = []
  let particles: Particle[] = []

  const fallbackSources = (): EmitSource[] =>
    Array.from({ length: 120 }, (): EmitSource => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.65,
      brightness: 160 + Math.random() * 80,
      r: ar, g: ag, b: ab,
    }))

  const samplePixels = (imgEl: HTMLImageElement): EmitSource[] => {
    const SW = 100, SH = 100
    const off = document.createElement('canvas')
    off.width = SW; off.height = SH
    const octx = off.getContext('2d')
    if (!octx) return fallbackSources()
    octx.drawImage(imgEl, 0, 0, SW, SH)

    let pixels: ImageData
    try {
      pixels = octx.getImageData(0, 0, SW, SH)
    } catch {
      return fallbackSources()
    }

    const data = pixels.data
    const scaleX = canvas.width  / SW
    const scaleY = canvas.height / SH

    const sources: EmitSource[] = []
    for (let py = 0; py < SH; py++) {
      for (let px = 0; px < SW; px++) {
        const idx = (py * SW + px) * 4
        const pr = data[idx] as number
        const pg = data[idx + 1] as number
        const pb = data[idx + 2] as number
        const pa = data[idx + 3] as number
        if (pa < 40) continue
        const brightness = 0.299 * pr + 0.587 * pg + 0.114 * pb
        if (brightness > 120) {
          sources.push({
            x: px * scaleX + (Math.random() - .5) * scaleX * 2.5,
            y: py * scaleY + (Math.random() - .5) * scaleY * 2.5,
            brightness,
            r: Math.round(pr * 0.6 + ar * 0.4),
            g: Math.round(pg * 0.6 + ag * 0.4),
            b: Math.round(pb * 0.6 + ab * 0.4),
          })
        }
      }
    }
    sources.sort((a, b) => b.brightness - a.brightness)
    return sources.slice(0, 250)
  }

  const makeParticle = (): Particle => {
    const def: EmitSource = { x: Math.random()*canvas.width, y: Math.random()*canvas.height*0.6, brightness:160, r:ar, g:ag, b:ab }
    const src: EmitSource = emitSources.length > 0
      ? (emitSources[Math.floor(Math.random() * emitSources.length)] ?? def)
      : def

    const roll = Math.random()
    const type = (roll > 0.94 ? 'gold' : roll > 0.80 ? 'glow' : roll > 0.62 ? 'beast' : 'dim') as Particle['type']

    return {
      x:     src.x + (Math.random() - .5) * 28,
      y:     src.y + (Math.random() - .5) * 18,
      vx:    (Math.random() - .5) * 0.75,
      vy:    -(0.18 + Math.random() * (isGodlike ? 1.4 : 0.85)),
      alpha: 0.65 + Math.random() * 0.35,
      decay: 0.003 + Math.random() * 0.005,
      size:  8 + Math.floor(Math.random() * (isGodlike ? 10 : 6)),
      char:  cardChars[Math.floor(Math.random() * cardChars.length)] ?? '◈',
      type,
      pr: src.r, pg: src.g, pb: src.b,
      phase: Math.random() * Math.PI * 2,
    }
  }

  const drawLoop = () => {
    ctx.fillStyle = 'rgba(3,3,10,0.065)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const t = Date.now() / 1000

    for (const p of particles) {
      const breathe = 0.55 + 0.45 * Math.sin(t * 1.0 + p.phase)
      const a = Math.max(0, p.alpha * breathe)
      if (a <= 0) continue

      ctx.shadowBlur = 0
      if (p.type === 'gold') {
        ctx.fillStyle   = `rgba(200,170,110,${a * 0.95})`
        ctx.shadowColor = '#c8aa6e'
        ctx.shadowBlur  = isGodlike ? 14 : 8
      } else if (p.type === 'glow') {
        ctx.fillStyle   = `rgba(${ar},${ag},${ab},${a * 0.88})`
        ctx.shadowColor = accent.value
        ctx.shadowBlur  = 7
      } else if (p.type === 'beast') {
        ctx.fillStyle   = `rgba(${p.pr},${p.pg},${p.pb},${a * 0.78})`
        ctx.shadowColor = `rgb(${p.pr},${p.pg},${p.pb})`
        ctx.shadowBlur  = 4
      } else {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${a * 0.30})`
      }

      ctx.font = `${p.size}px monospace`
      ctx.fillText(p.char, p.x, p.y)
      ctx.shadowBlur = 0

      p.x    += p.vx
      p.y    += p.vy
      p.vy   -= 0.007
      p.alpha -= p.decay

      if (p.alpha <= 0.02 || p.y < -30) {
        Object.assign(p, makeParticle())
      }
    }
    animRaf = requestAnimationFrame(drawLoop)
  }

  const launch = (sources: EmitSource[]) => {
    emitSources = sources
    particles   = Array.from({ length: PARTICLE_N }, makeParticle)
    drawLoop()
  }

  const tryLoad = () => {
    const domImg = beastImgEl.value
    if (domImg && domImg.complete && domImg.naturalWidth > 0) {
      launch(samplePixels(domImg)); return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = beastImageUrl.value
    img.onload  = () => launch(samplePixels(img))
    img.onerror = () => launch(fallbackSources())
  }
  setTimeout(tryLoad, 200)
}

const shareCard = async () => {
  const url  = window.location.href
  const text: string = card.value?.oracle || '命运已封印，解读正在流动...'
  try {
    if (navigator.share) await navigator.share({ title:`命运卡·${card.value?.name_zh}·Cyber Tao`, text, url })
    else await copyLink()
  } catch {}
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}

onMounted(loadCard)
onUnmounted(() => {
  if (animRaf) cancelAnimationFrame(animRaf)
  if (scanRaf) cancelAnimationFrame(scanRaf)
})
</script>

<style scoped>
.destiny-root {
  position: fixed; inset: 0; background: #03030a;
  overflow: hidden; display: flex; flex-direction: column;
  font-family: 'Share Tech Mono', monospace;
}
.destiny-canvas {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.7;
}
.beast-bg { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.beast-img {
  width: 100%; height: 100%; object-fit: cover;
  object-position: center 18%; opacity: 0.35;
}
.beast-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 38%, transparent 18%, rgba(3,3,10,0.62) 65%, rgba(3,3,10,0.96) 100%);
}
.state-center {
  position: relative; z-index: 10; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}
.spin-outer {
  width: 42px; height: 42px; border-radius: 50%;
  border: 2px solid rgba(200,170,110,0.2); border-top-color: #c8aa6e;
  animation: spin 1s linear infinite;
}
.spin-inner {
  width: 26px; height: 26px; border-radius: 50%; position: absolute;
  border: 1px solid rgba(34,211,238,0.2); border-bottom-color: #22d3ee;
  animation: spin 0.7s linear infinite reverse;
}
.state-text {
  font-size: 10px; letter-spacing: 0.4em; color: rgba(200,170,110,0.6);
  text-transform: uppercase; animation: pulse 1.5s ease-in-out infinite;
}
.error-glyph { font-size: 40px; color: rgba(239,68,68,0.7); }
.error-title { font-size: 13px; letter-spacing: 0.5em; color: rgba(239,68,68,0.8); text-transform: uppercase; }
.error-body  { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; text-align: center; padding: 0 28px; line-height: 1.7; }
.content-wrap {
  position: relative; z-index: 10; flex: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 0 18px; overflow-y: auto;
  max-width: 480px; width: 100%; margin: 0 auto;
}
.content-wrap::-webkit-scrollbar { width: 2px; }
.content-wrap::-webkit-scrollbar-thumb { background: rgba(200,170,110,0.3); border-radius: 4px; }
.top-bar {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 12px 2px; border-bottom: 1px solid rgba(200,170,110,0.14); flex-shrink: 0;
}
.brand   { font-size: 8px; letter-spacing: 0.5em; color: rgba(200,170,110,0.5); text-transform: uppercase; }
.edition { font-size: 11px; color: rgba(255,255,255,0.65); letter-spacing: 0.2em; }
.card-date { font-size: 9px; color: rgba(255,255,255,0.28); letter-spacing: 0.2em; }
.verify-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
  border: 1px solid; transition: all 0.5s;
}
.verify-chip.pending  { border-color: rgba(200,170,110,0.2); color: rgba(200,170,110,0.45); }
.verify-chip.verified { border-color: rgba(34,197,94,0.5);   color: rgba(34,197,94,0.9);   box-shadow: 0 0 12px rgba(34,197,94,0.2); }
.verify-chip.failed   { border-color: rgba(239,68,68,0.4);   color: rgba(239,68,68,0.7); }
.verify-dot { width: 5px; height: 5px; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
.verify-chip.pending  .verify-dot { background: rgba(200,170,110,0.5); }
.verify-chip.verified .verify-dot { background: rgba(34,197,94,0.9);  animation: none; }
.verify-chip.failed   .verify-dot { background: rgba(239,68,68,0.7);  animation: none; }
.name-block  { text-align: center; padding: 14px 0 8px; }
.gua-name {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(60px, 17vw, 96px); font-weight: 900;
  line-height: 1; letter-spacing: 0.05em;
  animation: breathe 4s ease-in-out infinite;
}
.gua-meta {
  display: flex; align-items: center; gap: 8px; justify-content: center; margin-top: 6px;
  font-size: 11px; letter-spacing: 0.35em; color: rgba(255,255,255,0.5); text-transform: uppercase;
}
.sep  { color: rgba(255,255,255,0.2); }
.mono { font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; }
.talisman-wrap {
  position: relative; width: min(210px, 52vw); height: min(210px, 52vw);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin: 4px 0;
}
.talisman-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.hex-lines { position: absolute; z-index: 2; display: flex; flex-direction: column-reverse; gap: 6px; }
.hex-row   { display: flex; align-items: center; gap: 4px; animation: line-in 0.4s ease-out backwards; }
.yao     { height: 5px; border-radius: 2px; }
.yang    { width: 54px; }
.yin     { width: 22px; }
.yao-gap { width: 10px; }
.poem {
  font-family: 'Noto Serif SC', serif;
  font-size: 13px; letter-spacing: 0.35em; line-height: 1.9;
  color: rgba(255,255,255,0.72); text-align: center; max-width: 300px; padding: 2px 0 4px;
}
.oracle-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 9px;
  width: 100%; max-width: 330px; padding: 2px 0 4px;
}
.oracle-rule { width: 100%; height: 1px; }
.oracle-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 13px; line-height: 1.85; letter-spacing: 0.04em;
  color: rgba(255,255,255,0.82); text-align: center; font-style: italic;
}
.hud-bar {
  width: 100%; display: flex; align-items: center; justify-content: center;
  padding: 8px 0; flex-shrink: 0;
  border-top: 1px solid rgba(200,170,110,0.1); border-bottom: 1px solid rgba(200,170,110,0.1);
  margin: 4px 0;
}
.hud-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 0 12px; }
.hud-lbl  { font-size: 7px; letter-spacing: 0.3em; color: rgba(255,255,255,0.28); text-transform: uppercase; }
.hud-val  { font-size: 11px; letter-spacing: 0.15em; color: rgba(255,255,255,0.65); }
.hud-rule { width: 1px; height: 26px; background: rgba(255,255,255,0.1); }
.bottom-bar {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 12px 0 20px; flex-shrink: 0;
}
.btn-share {
  width: 100%; padding: 13px 0; font-family: monospace; font-size: 12px; font-weight: 900;
  letter-spacing: 0.55em; text-transform: uppercase; border: 1px solid; cursor: pointer; transition: filter 0.2s;
}
.btn-share:hover { filter: brightness(1.25); }
.btn-row  { display: flex; gap: 12px; }
.btn-ghost {
  font-family: monospace; font-size: 10px; letter-spacing: 0.3em;
  color: rgba(255,255,255,0.38); background: transparent;
  border: 1px solid rgba(255,255,255,0.14); padding: 7px 18px;
  cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }
.card-id-lbl { font-size: 8px; letter-spacing: 0.18em; color: rgba(200,170,110,0.28); font-family: monospace; }
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes pulse   { 0%,100%{opacity:0.45} 50%{opacity:1} }
@keyframes breathe { 0%,100%{filter:brightness(0.88)} 50%{filter:brightness(1.15)} }
@keyframes line-in { from{opacity:0;transform:scaleX(0.35);filter:blur(5px)} to{opacity:1;transform:scaleX(1);filter:blur(0)} }
@keyframes cw      { to { transform: rotate(360deg);  } }
@keyframes ccw     { to { transform: rotate(-360deg); } }
@keyframes t-path-flow {
  0%   { stroke-dashoffset: 280; opacity: 0.15; }
  25%  { opacity: 0.75; }
  75%  { opacity: 0.75; }
  100% { stroke-dashoffset: 0;   opacity: 0.15; }
}
.t-path {
  stroke-dasharray: 38 14;
  animation: t-path-flow var(--dur, 4s) var(--delay, 0s) linear infinite;
}
@keyframes t-node-pulse { 0%,100%{opacity:0.28} 50%{opacity:1} }
.t-node { animation: t-node-pulse 2.5s var(--delay,0s) ease-in-out infinite; }
</style>
