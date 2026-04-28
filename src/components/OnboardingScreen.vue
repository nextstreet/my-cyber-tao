<template>
  <Transition name="onboard-fade" appear>
    <div v-if="visible" class="onboard-root" @touchmove.prevent @contextmenu.prevent>

      <div class="bg-deep" />
      <canvas ref="ptcCanvas" class="bg-ptc" aria-hidden="true" />
      <Transition name="guardian-fade">
        <div v-if="guardianLoaded" class="bg-guardian"
             :style="{ backgroundImage: `url(${ambientUrl})` }" aria-hidden="true" />
      </Transition>
      <div class="bg-vignette" aria-hidden="true" />

      <!-- ═══ PHASE A: Question Hook ═══ -->
      <Transition name="phase-x">
        <section v-if="phase === 'question'" class="phase phase-a" key="a">

          <div class="taiji-system" aria-hidden="true">
            <div class="orb orb-1" /><div class="orb orb-2" /><div class="orb orb-3" />
            <div class="taiji-core">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="47" stroke="rgba(200,170,110,0.22)" stroke-width="0.6"/>
                <path d="M50,3 A47,47 0 0 1 50,97 A23.5,23.5 0 0 1 50,50 A23.5,23.5 0 0 0 50,3 Z" fill="rgba(200,170,110,0.1)"/>
                <circle cx="50" cy="26.5" r="9"   fill="rgba(200,170,110,0.14)"/>
                <circle cx="50" cy="73.5" r="9"   fill="rgba(34,211,238,0.06)"/>
                <circle cx="50" cy="26.5" r="3.2" fill="rgba(200,170,110,0.7)"/>
                <circle cx="50" cy="73.5" r="3.2" fill="rgba(200,170,110,0.2)"/>
              </svg>
            </div>
          </div>

          <div class="q-zone">
            <div class="q-rule" aria-hidden="true">
              <span class="q-line" /><span class="q-label">THE ORACLE ASKS</span><span class="q-line" />
            </div>
            <div class="q-display" role="status" aria-live="polite">
              <p class="q-text">{{ displayText }}<span class="q-cursor" :class="{ blink: atRest }" aria-hidden="true" /></p>
            </div>
            <div class="q-pips" aria-hidden="true">
              <span v-for="(_, i) in QUESTIONS" :key="i" class="q-pip" :class="{ active: i === qIdx }" />
            </div>
          </div>

          <div class="cta-zone">
            <button class="btn-primary" @click="enterRitual">
              <span>Consult the I Ching</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </button>
            <button class="btn-ghost" @click="skip">I know the way</button>
          </div>

        </section>
      </Transition>

      <!-- ═══ PHASE B: Coin Ritual ═══ -->
      <Transition name="phase-x">
        <section v-if="phase === 'ritual'" class="phase phase-b" key="b">

          <header class="rh" aria-hidden="true">
            <span class="rh-line" /><span class="rh-label">CYBER TAO · I CHING ORACLE</span><span class="rh-line" />
          </header>

          <div class="ritual-body">
            <p class="ritual-prompt">
              Touch the ancient coins<br>
              <span class="ritual-sub">to open your channel to the universe</span>
            </p>

            <div class="coins" role="group" aria-label="Three sacred coins">
              <div v-for="(coin, i) in coins" :key="i"
                   class="coin-slot" :style="{ '--delay': `${i * 0.18}s` }">
                <button
                  class="coin"
                  :class="{ awakened: coin.lit, shaking: coin.shake }"
                  :aria-label="`${coin.label} — ${coin.lit ? 'awakened' : 'touch to awaken'}`"
                  :aria-pressed="coin.lit"
                  @click="awakeCoin(i)"
                  @touchstart.prevent="awakeCoin(i)"
                >
                  <span class="coin-ring cr-out" aria-hidden="true" />
                  <span class="coin-ring cr-in"  aria-hidden="true" />
                  <span class="coin-face" aria-hidden="true">
                    <span class="coin-char">{{ coin.char }}</span>
                  </span>
                  <span v-if="coin.lit" class="coin-halo" aria-hidden="true" />
                </button>
                <span class="coin-name">{{ coin.label }}</span>
              </div>
            </div>

            <div class="rp">
              <div class="rp-track">
                <div class="rp-fill" :style="{ width: `${(awakened / 3) * 100}%` }" />
              </div>
              <span class="rp-label" aria-live="polite">{{ awakened }}/3 coins awakened</span>
            </div>
          </div>

          <footer class="ritual-footer" aria-hidden="true">
            <Transition name="wisdom-x" mode="out-in">
              <p class="wisdom-text" :key="wisdomIdx">{{ WISDOMS[wisdomIdx] }}</p>
            </Transition>
          </footer>

        </section>
      </Transition>

      <!-- ═══ PHASE C: Channel Open ═══ -->
      <Transition name="phase-x">
        <section v-if="phase === 'open'" class="phase phase-c" key="c">
          <div class="open-inner" role="status" aria-live="assertive">
            <div class="open-glyph" aria-hidden="true">☯</div>
            <p class="open-title">Your channel is open</p>
            <p class="open-sub">THE UNIVERSE IS LISTENING</p>
          </div>
        </section>
      </Transition>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGuardians } from '@/composables/useGuardians'

const STORAGE_KEY = 'ct_onboarded_v1'

const QUESTIONS = [
  'Will you get what you want?',
  'Is now the right time?',
  'What does the universe see in you?',
  'What are you afraid to know?',
  'Which path leads to your destiny?',
]
const WISDOMS = [
  'Each coin carries three thousand years of wisdom.',
  'The hexagram forms from chaos and intention.',
  'Your question shapes the answer before it arrives.',
  'The I Ching does not predict the future — it reveals the present.',
]

const emit = defineEmits<{ done: [] }>()

// ── Guardian ambient bg ──────────────────────────────────────
const { ready, getUrl, randomKey } = useGuardians()
const pickedKey     = randomKey()           // pick once, stays fixed for this session
const ambientUrl    = computed(() => ready.value ? getUrl(pickedKey) : '')
const guardianLoaded = ref(false)

// ── Core state ───────────────────────────────────────────────
const visible     = ref(true)
const phase       = ref<'question' | 'ritual' | 'open'>('question')
const qIdx        = ref(0)
const displayText = ref('')
const atRest      = ref(false)
const wisdomIdx   = ref(0)
const ptcCanvas   = ref<HTMLCanvasElement | null>(null)

const coins = ref([
  { char: '乾', label: 'Heaven',  lit: false, shake: false },
  { char: '坤', label: 'Earth',   lit: false, shake: false },
  { char: '道', label: 'The Way', lit: false, shake: false },
])
const awakened = computed(() => coins.value.filter(c => c.lit).length)

let typeTimer:   ReturnType<typeof setTimeout>  | null = null
let cycleTimer:  ReturnType<typeof setTimeout>  | null = null
let wisdomTimer: ReturnType<typeof setInterval> | null = null
let rafId:       number | null = null

// ── Lifecycle ────────────────────────────────────────────────
onMounted(() => {
  if (localStorage.getItem(STORAGE_KEY)) { emit('done'); return }
  startTypewriter()
  initParticles()
  loadAmbientGuardian()
  wisdomTimer = setInterval(() => {
    wisdomIdx.value = (wisdomIdx.value + 1) % WISDOMS.length
  }, 3600)
})
onBeforeUnmount(cleanup)

// ── Watch for URL becoming available, then load image ────────
// (init() runs in App.vue onMounted — by the time user reaches Phase B
//  the URL is already resolved, but we handle the async case too)
function loadAmbientGuardian() {
  const tryLoad = () => {
    const url = ambientUrl.value
    if (!url) return                         // not ready yet, skip
    const img = new Image()
    img.onload  = () => { guardianLoaded.value = true }
    img.onerror = () => {}
    img.src = url
  }

  if (ready.value) {
    tryLoad()
  } else {
    // Poll until ready (init is synchronous so this resolves almost instantly)
    const poll = setInterval(() => {
      if (ready.value) { clearInterval(poll); tryLoad() }
    }, 50)
    setTimeout(() => clearInterval(poll), 3000)   // give up after 3s
  }
}

// ── Typewriter ───────────────────────────────────────────────
function startTypewriter() {
  clearTimeout(typeTimer!); clearTimeout(cycleTimer!)
  displayText.value = ''; atRest.value = false
  const text = QUESTIONS[qIdx.value]; let i = 0
  const tick = () => {
    if (i <= text.length) {
      displayText.value = text.slice(0, i++)
      typeTimer = setTimeout(tick, i <= 2 ? 120 : 40)
    } else {
      atRest.value = true
      cycleTimer = setTimeout(() => {
        qIdx.value = (qIdx.value + 1) % QUESTIONS.length
        startTypewriter()
      }, 2800)
    }
  }
  tick()
}

function enterRitual() {
  clearTimeout(typeTimer!); clearTimeout(cycleTimer!)
  phase.value = 'ritual'
}
function skip() { finish() }
function finish() {
  localStorage.setItem(STORAGE_KEY, '1')
  visible.value = false
  setTimeout(() => emit('done'), 600)
}

function awakeCoin(i: number) {
  if (coins.value[i].lit) return
  coins.value[i].shake = true
  setTimeout(() => { coins.value[i].shake = false }, 420)
  setTimeout(() => {
    coins.value[i].lit = true
    if (awakened.value === 3)
      setTimeout(() => { phase.value = 'open'; setTimeout(finish, 1900) }, 550)
  }, 210)
}

// ── Particles ────────────────────────────────────────────────
function initParticles() {
  const canvas = ptcCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize(); window.addEventListener('resize', resize)
  const pts = Array.from({ length: 58 }, () => ({
    x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
    r: Math.random() * 1.3 + 0.2,
    vx: (Math.random() - 0.5) * 0.2,  vy: (Math.random() - 0.5) * 0.2,
    op: Math.random() * 0.42 + 0.08,  gold: Math.random() > 0.55,
  }))
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of pts) {
      p.x = (p.x + p.vx + canvas.width)  % canvas.width
      p.y = (p.y + p.vy + canvas.height) % canvas.height
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.gold
        ? `rgba(200,170,110,${p.op})`
        : `rgba(34,211,238,${p.op * 0.44})`
      ctx.fill()
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()
}

function cleanup() {
  clearTimeout(typeTimer!); clearTimeout(cycleTimer!); clearInterval(wisdomTimer!)
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
}
</script>

<style scoped>
.onboard-root {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
}
.bg-deep    { position: absolute; inset: 0; background: #020308; }
.bg-ptc     { position: absolute; inset: 0; pointer-events: none; }
.bg-guardian {
  position: absolute; inset: 0;
  background-size: cover; background-position: center top; background-repeat: no-repeat;
  opacity: 0.14;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 50%, transparent 82%);
  mask-image:         linear-gradient(to bottom, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 50%, transparent 82%);
  pointer-events: none;
}
.bg-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 82% 92% at 50% 38%, transparent 28%, rgba(0,0,0,.76) 100%);
  pointer-events: none;
}
.phase {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding-top:    max(60px, env(safe-area-inset-top,    20px));
  padding-bottom: max(48px, env(safe-area-inset-bottom, 20px));
  padding-left: 28px; padding-right: 28px;
}
/* Taiji */
.taiji-system { position: relative; width: 188px; height: 188px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.orb { position: absolute; border-radius: 50%; border: .5px solid rgba(200,170,110,.13); animation: ospin linear infinite; }
.orb-1 { width: 188px; height: 188px; animation-duration: 44s; }
.orb-2 { width: 144px; height: 144px; animation-duration: 30s; animation-direction: reverse; border-color: rgba(34,211,238,.09); }
.orb-3 { width: 106px; height: 106px; animation-duration: 19s; }
@keyframes ospin { to { transform: rotate(360deg); } }
.taiji-core { width: 70px; height: 70px; animation: ospin 64s linear infinite reverse; }
.taiji-core svg { width: 100%; height: 100%; }
/* Question */
.q-zone { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; width: 100%; max-width: 380px; }
.q-rule { display: flex; align-items: center; gap: 10px; width: 100%; justify-content: center; }
.q-line { flex: 1; max-width: 50px; height: .5px; background: rgba(200,170,110,.22); }
.q-label { font-size: 10px; font-family: 'Space Mono', monospace; letter-spacing: .28em; color: rgba(200,170,110,.42); white-space: nowrap; }
.q-display { min-height: 88px; display: flex; align-items: center; justify-content: center; width: 100%; }
.q-text { font-family: 'Noto Serif SC', Georgia, serif; font-size: clamp(19px, 5.5vw, 27px); font-weight: 400; color: rgba(255,252,242,.92); text-align: center; line-height: 1.48; }
.q-cursor { display: inline-block; width: 2px; height: 1.05em; background: rgba(200,170,110,.9); margin-left: 3px; vertical-align: middle; border-radius: 1px; }
.q-cursor.blink { animation: cblink 1.1s step-end infinite; }
@keyframes cblink { 0%,100%{opacity:1} 50%{opacity:0} }
.q-pips { display: flex; gap: 7px; }
.q-pip { display: block; width: 4px; height: 4px; border-radius: 50%; background: rgba(200,170,110,.18); transition: background .35s, transform .35s; }
.q-pip.active { background: rgba(200,170,110,.88); transform: scale(1.45); }
/* CTA */
.cta-zone { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; max-width: 340px; }
.btn-primary { width: 100%; padding: 15px 24px; background: transparent; border: .5px solid rgba(200,170,110,.55); border-radius: 2px; color: rgba(200,170,110,.95); font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: .18em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background .22s, border-color .22s; -webkit-tap-highlight-color: transparent; }
.btn-primary:hover, .btn-primary:focus-visible { background: rgba(200,170,110,.08); border-color: rgba(200,170,110,.85); outline: none; }
.btn-primary:active { transform: scale(.98); }
.btn-arrow { font-size: 16px; transition: transform .2s; display: inline-block; }
.btn-primary:hover .btn-arrow { transform: translateX(5px); }
.btn-ghost { background: transparent; border: none; color: rgba(255,255,255,.24); font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: .12em; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 4px; -webkit-tap-highlight-color: transparent; }
.btn-ghost:hover { color: rgba(255,255,255,.44); }
/* Ritual header */
.rh { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 360px; flex-shrink: 0; }
.rh-line { flex: 1; height: .5px; background: rgba(200,170,110,.16); }
.rh-label { font-size: 9px; font-family: 'Space Mono', monospace; letter-spacing: .24em; color: rgba(200,170,110,.32); white-space: nowrap; }
/* Ritual body */
.ritual-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px; }
.ritual-prompt { font-family: 'Noto Serif SC', Georgia, serif; font-size: clamp(18px,5vw,22px); color: rgba(255,252,242,.8); text-align: center; line-height: 1.65; }
.ritual-sub { display: block; margin-top: 4px; font-size: 13px; color: rgba(255,255,255,.3); font-family: 'Space Mono', monospace; letter-spacing: .04em; }
/* Coins */
.coins { display: flex; gap: 24px; align-items: flex-start; }
.coin-slot { display: flex; flex-direction: column; align-items: center; gap: 10px; animation: cfloat 3.2s ease-in-out var(--delay,0s) infinite; }
@keyframes cfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
.coin { width: 74px; height: 74px; border-radius: 50%; background: transparent; border: none; padding: 0; cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; -webkit-tap-highlight-color: transparent; transition: transform .18s; }
.coin:active:not(.awakened) { transform: scale(.9); }
.coin.shaking { animation: cshake .38s ease; }
@keyframes cshake { 0%{transform:rotate(0)scale(1)} 20%{transform:rotate(-14deg)scale(.88)} 45%{transform:rotate(11deg)scale(1.06)} 65%{transform:rotate(-7deg)scale(.96)} 82%{transform:rotate(4deg)scale(1.02)} 100%{transform:rotate(0)scale(1)} }
.coin-ring { position: absolute; border-radius: 50%; transition: border-color .4s; }
.cr-out { inset: 0;   border: 1px solid rgba(200,170,110,.32); }
.cr-in  { inset: 9px; border: .5px solid rgba(200,170,110,.16); }
.coin.awakened .cr-out { border-color: rgba(200,170,110,.9); }
.coin.awakened .cr-in  { border-color: rgba(200,170,110,.5); }
.coin-face { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 36% 34%, rgba(200,170,110,.12), rgba(200,170,110,.02) 70%); display: flex; align-items: center; justify-content: center; transition: background .4s; }
.coin.awakened .coin-face { background: radial-gradient(circle at 36% 34%, rgba(200,170,110,.28), rgba(200,170,110,.06) 70%); }
.coin-char { font-size: 28px; font-family: 'Noto Serif SC', serif; color: rgba(200,170,110,.65); line-height: 1; transition: color .4s; position: relative; z-index: 1; }
.coin.awakened .coin-char { color: rgba(200,170,110,.98); }
.coin-halo { position: absolute; inset: -7px; border-radius: 50%; border: 1px solid rgba(200,170,110,.35); animation: hpulse 1.6s ease-out infinite; }
@keyframes hpulse { 0%{transform:scale(1);opacity:.65} 100%{transform:scale(1.55);opacity:0} }
.coin-name { font-size: 10px; font-family: 'Space Mono', monospace; letter-spacing: .2em; color: rgba(255,255,255,.24); text-transform: uppercase; }
/* Progress */
.rp { display: flex; flex-direction: column; align-items: center; gap: 7px; }
.rp-track { width: 168px; height: 1px; background: rgba(255,255,255,.07); border-radius: 1px; overflow: hidden; }
.rp-fill { height: 100%; background: rgba(200,170,110,.72); border-radius: 1px; transition: width .5s cubic-bezier(.4,0,.2,1); }
.rp-label { font-size: 10px; font-family: 'Space Mono', monospace; letter-spacing: .1em; color: rgba(255,255,255,.2); }
/* Wisdom */
.ritual-footer { width: 100%; max-width: 340px; text-align: center; min-height: 44px; display: flex; align-items: center; justify-content: center; }
.wisdom-text { font-size: 12px; font-family: 'Noto Serif SC', Georgia, serif; color: rgba(255,255,255,.24); line-height: 1.65; font-style: italic; }
/* Phase C */
.phase-c { justify-content: center; }
.open-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; animation: oreveal .65s cubic-bezier(.34,1.56,.64,1); }
@keyframes oreveal { from{opacity:0;transform:scale(.84)} to{opacity:1;transform:scale(1)} }
.open-glyph { font-size: 80px; color: rgba(200,170,110,.72); line-height: 1; animation: ospin 20s linear infinite; }
.open-title { font-family: 'Noto Serif SC', Georgia, serif; font-size: 24px; color: rgba(255,252,242,.9); letter-spacing: .04em; }
.open-sub { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .28em; color: rgba(200,170,110,.42); }
/* Transitions */
.onboard-fade-enter-active { transition: opacity .5s ease; }
.onboard-fade-leave-active { transition: opacity .65s ease; }
.onboard-fade-enter-from, .onboard-fade-leave-to { opacity: 0; }
.phase-x-enter-active { transition: opacity .45s ease, transform .45s ease; }
.phase-x-leave-active { transition: opacity .3s ease, transform .3s ease; position: absolute; width: 100%; }
.phase-x-enter-from { opacity: 0; transform: translateY(20px); }
.phase-x-leave-to   { opacity: 0; transform: translateY(-20px); }
.guardian-fade-enter-active { transition: opacity 1.8s ease; }
.guardian-fade-enter-from   { opacity: 0; }
.wisdom-x-enter-active { transition: opacity .55s ease; }
.wisdom-x-leave-active { transition: opacity .4s ease; }
.wisdom-x-enter-from, .wisdom-x-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .orb, .taiji-core, .coin-slot, .open-glyph { animation: none; }
  .coin-halo { animation: none; opacity: .4; }
  .phase-x-enter-active, .phase-x-leave-active { transition-duration: .15s; }
}
</style>
