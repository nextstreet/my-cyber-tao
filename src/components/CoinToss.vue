<template>
  <div class="flex flex-col items-center w-full justify-between py-2 gap-4">

    <!-- ── 爻象显示区 ── -->
    <div class="flex flex-col-reverse gap-3 h-44 justify-end w-full items-center relative">
      <transition-group name="line-appear">
        <div v-for="(line, i) in lines" :key="i" class="flex flex-col items-center gap-1">
          <span v-if="changingLines[i]"
            class="font-mono uppercase"
            style="font-size:9px;letter-spacing:0.3em;color:rgba(239,68,68,0.9);text-shadow:0 0 8px rgba(239,68,68,0.6)">
            ◈ CHANGING
          </span>
          <div v-if="line === 1" class="yang-line relative overflow-hidden"
               :class="{ 'is-changing': changingLines[i] }">
            <div class="absolute inset-0 line-shine"></div>
          </div>
          <div v-else class="flex justify-between w-44">
            <div class="yin-half relative overflow-hidden" :class="{ 'is-changing': changingLines[i] }">
              <div class="absolute inset-0 line-shine"></div>
            </div>
            <div class="yin-half relative overflow-hidden" :class="{ 'is-changing': changingLines[i] }">
              <div class="absolute inset-0 line-shine"></div>
            </div>
          </div>
        </div>
      </transition-group>
      <div v-if="lines.length === 0" class="font-mono absolute text-center"
           style="font-size:11px;letter-spacing:0.3em;line-height:1.8;color:rgba(200,170,110,0.22)">
        PROBABILITY FIELD OSCILLATING<br>ALIGN INTENTION · CAST
      </div>
    </div>

    <!-- ── 铜钱（每枚独立物理偏移）── -->
    <div class="flex gap-8 items-end" style="height:90px">
      <div v-for="(coin, index) in coins" :key="index"
           class="coin-container w-16 h-16 relative"
           :style="{ marginBottom: coin.restOffset + 'px' }">
        <div class="coin-body w-full h-full"
             :class="isTossing ? `is-tossing-${index}` : ''"
             :style="!isTossing ? getRestRotation(coin) : ''">
          <div class="coin-face front flex items-center justify-center relative">
            <span class="font-serif text-2xl" style="color:#c8aa6e;text-shadow:0 0 8px rgba(200,170,110,0.7)">乾</span>
            <div class="absolute inset-2 border rounded-full" style="border-color:rgba(200,170,110,0.2)"></div>
            <!-- 内圈刻纹 -->
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 64 64" style="opacity:0.18">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#c8aa6e" stroke-width="0.5" stroke-dasharray="4 2"/>
              <circle cx="32" cy="32" r="20" fill="none" stroke="#c8aa6e" stroke-width="0.3" stroke-dasharray="2 4"/>
            </svg>
          </div>
          <div class="coin-face back flex items-center justify-center relative">
            <span class="font-serif text-2xl" style="color:rgba(200,170,110,0.55)">坤</span>
            <div class="absolute inset-2 border rounded-full" style="border-color:rgba(200,170,110,0.15)"></div>
          </div>
          <div class="coin-side"></div>
        </div>
        <!-- 着地阴影（每枚偏移不同，强化立体感）-->
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
             style="width:48px;height:6px;background:radial-gradient(ellipse,rgba(0,0,0,0.6) 0%,transparent 70%)"
             :style="{ transform: `translateX(-50%) scaleX(${coin.shadowScale})`, opacity: coin.shadowOpacity }">
        </div>
      </div>
    </div>

    <!-- ── 进度点 ── -->
    <div class="flex gap-2.5 items-center">
      <div v-for="i in 6" :key="i" class="progress-dot"
           :class="{ 'dot-done': i<=lines.length, 'dot-active': i===lines.length+1&&lines.length<6, 'dot-pending': i>lines.length+1 }">
      </div>
    </div>

    <!-- ── 投掷按钮 ── -->
    <button @click="toss" :disabled="isTossing || lines.length >= 6"
      class="group relative w-full overflow-hidden border transition-all uppercase disabled:cursor-not-allowed"
      style="padding:14px 0;font-size:12px;font-weight:900;letter-spacing:0.6em;font-family:monospace"
      :style="btnStyle">
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
           style="background:rgba(200,170,110,0.07)"></div>
      <span class="relative z-10 transition-colors"
            :style="isTossing||lines.length>=6 ? 'color:rgba(200,170,110,0.25)' : 'color:#c8aa6e'">
        {{ btnLabel }}
      </span>
    </button>

    <div v-if="hasChangingLine" class="w-full px-3 py-2 text-center border"
         style="border-color:rgba(239,68,68,0.3);background:rgba(100,0,0,0.08)">
      <p class="font-mono uppercase" style="font-size:10px;letter-spacing:0.3em;color:rgba(239,68,68,0.8)">
        ◈ CHANGING LINE DETECTED · FATE IN FLUX
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['complete'])

const lines    = ref([])
const rawSums  = ref([])
const isTossing = ref(false)

// 每枚硬币带独立的物理状态
const coins = ref([
  { v: 1, restOffset: 0, tiltZ: 0, shadowScale: 1, shadowOpacity: 0.5 },
  { v: 1, restOffset: 0, tiltZ: 0, shadowScale: 1, shadowOpacity: 0.5 },
  { v: 1, restOffset: 0, tiltZ: 0, shadowScale: 1, shadowOpacity: 0.5 },
])

const changingLines = computed(() => rawSums.value.map(s => s === 9 || s === 6))
const hasChangingLine = computed(() => changingLines.value.some(Boolean))

const btnLabel = computed(() => {
  if (isTossing.value) return 'CALCULATING...'
  if (lines.value.length >= 6) return '⬡ ARRAY LOCKED'
  return `⬡ CAST · LINE ${lines.value.length + 1} / 6`
})

const btnStyle = computed(() => {
  if (isTossing.value || lines.value.length >= 6) {
    return { borderColor: 'rgba(200,170,110,0.12)', background: 'transparent', opacity: '0.4' }
  }
  return { borderColor: 'rgba(200,170,110,0.55)', background: 'rgba(200,170,110,0.07)', boxShadow: '0 0 18px rgba(200,170,110,0.12)' }
})

// 落地后的随机静止姿态：每枚高度差异 ±6px，轻微倾斜 ±4°
const getRestRotation = (coin) => {
  const base = coin.v === 0 ? 'rotateY(180deg)' : 'rotateY(0deg)'
  return { transform: `${base} rotateZ(${coin.tiltZ}deg)` }
}

// 更新落地物理状态（每枚独立随机）
const applyLandingPhysics = () => {
  coins.value = coins.value.map((coin) => {
    const restOffset = (Math.random() - 0.5) * 12   // ±6px 高度偏移
    const tiltZ = (Math.random() - 0.5) * 8         // ±4° 倾斜
    const shadowScale = 0.7 + Math.random() * 0.6    // 阴影大小随高度变化
    const shadowOpacity = 0.3 + Math.random() * 0.4
    return { ...coin, restOffset, tiltZ, shadowScale, shadowOpacity }
  })
}

// Web Audio
const playAudio = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'coin') {
      // 每枚错开时机，音调略有差异
      const pitchVariants = [700, 640, 760]
      pitchVariants.forEach((pitch, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator(), gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(pitch, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(170 + i * 20, ctx.currentTime + 0.2)
          gain.gain.setValueAtTime(0.28, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
          osc.start(); osc.stop(ctx.currentTime + 0.25)
        }, i * 55) // 每枚硬币错开55ms落地
      })
    } else if (type === 'lock') {
      [180, 270, 360, 540].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = 'sine'; o.frequency.value = freq
        g.gain.setValueAtTime(0.18 / (i + 1), ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2)
        o.start(); o.stop(ctx.currentTime + 2.2)
      })
    } else if (type === 'change') {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sawtooth'; o.frequency.setValueAtTime(440, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5)
      g.gain.setValueAtTime(0.12, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      o.start(); o.stop(ctx.currentTime + 0.6)
    }
  } catch (e) { /* silent */ }
}

const toss = () => {
  if (isTossing.value || lines.value.length >= 6) return
  isTossing.value = true
  playAudio('coin')

  setTimeout(() => {
    let sum = 0
    coins.value = coins.value.map((coin) => {
      const v = Math.random() > 0.5 ? 1 : 0
      sum += v === 1 ? 3 : 2
      return { ...coin, v }
    })

    const lineVal = (sum === 7 || sum === 9) ? 1 : 0
    lines.value = [...lines.value, lineVal]
    rawSums.value = [...rawSums.value, sum]

    // 应用落地物理差异
    applyLandingPhysics()
    isTossing.value = false

    if (sum === 9 || sum === 6) setTimeout(() => playAudio('change'), 180)

    if (lines.value.length === 6) {
      setTimeout(() => {
        playAudio('lock')
        emit('complete', {
          lines: lines.value,
          changingLines: changingLines.value,
          rawSums: rawSums.value,
        })
      }, 650)
    }
  }, 1200)
}
</script>

<style scoped>
.yang-line {
  width: 176px; height: 11px; border-radius: 2px;
  background: #c8aa6e;
  box-shadow: 0 0 14px rgba(200,170,110,0.7), 0 0 28px rgba(200,170,110,0.3);
}
.yang-line.is-changing {
  background: linear-gradient(90deg,#c8aa6e,#ef4444,#c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7), 0 0 28px rgba(239,68,68,0.3);
  animation: changing-pulse 1.5s ease-in-out infinite;
}
.yin-half {
  width: 43%; height: 11px; border-radius: 2px;
  background: #c8aa6e;
  box-shadow: 0 0 14px rgba(200,170,110,0.7), 0 0 28px rgba(200,170,110,0.3);
}
.yin-half.is-changing {
  background: linear-gradient(90deg,#c8aa6e,#ef4444,#c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7);
  animation: changing-pulse 1.5s ease-in-out infinite;
}
@keyframes changing-pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

@keyframes shine { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
.line-shine {
  background: linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent);
  animation: shine 2.2s ease-in-out infinite;
}

.line-appear-enter-active { animation: line-build 0.5s cubic-bezier(0.23,1,0.32,1) forwards; }
@keyframes line-build {
  from { opacity:0; transform:scaleX(0.3) translateY(8px); filter:blur(6px); }
  to   { opacity:1; transform:scaleX(1) translateY(0);     filter:blur(0); }
}

/* 铜钱 3D */
.coin-container { perspective: 1000px; }
.coin-body {
  position: relative; transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.coin-face {
  position:absolute; inset:0; backface-visibility:hidden; border-radius:50%;
  background:#0d1117; border:2px solid rgba(200,170,110,0.6);
  box-shadow:0 0 12px rgba(200,170,110,0.22), inset 0 0 8px rgba(200,170,110,0.06);
}
.coin-face.back { transform:rotateY(180deg); }
.coin-side {
  position:absolute; top:50%; left:50%; width:100%; height:4px;
  background:linear-gradient(to right,#8a6e3a,#c8aa6e,#8a6e3a);
  transform:translate(-50%,-50%) rotateX(90deg);
  border-radius:50%; opacity:0.3;
}

/* 三枚硬币各自独立的抛掷动画，峰值高度略有不同 */
.is-tossing-0 { animation: toss-0 1.2s cubic-bezier(0.4,0,0.2,1); }
.is-tossing-1 { animation: toss-1 1.25s cubic-bezier(0.35,0,0.2,1); }
.is-tossing-2 { animation: toss-2 1.15s cubic-bezier(0.45,0,0.2,1); }

@keyframes toss-0 {
  0%  {transform:translateY(0) rotateY(0) scale(1)}
  28% {transform:translateY(-88px) rotateY(720deg) scale(1.14)}
  58% {transform:translateY(-105px) rotateY(1440deg) scale(1.07)}
  100%{transform:translateY(0) rotateY(2160deg) scale(1)}
}
@keyframes toss-1 {
  0%  {transform:translateY(0) rotateY(0) scale(1)}
  32% {transform:translateY(-100px) rotateY(800deg) scale(1.18)}
  62% {transform:translateY(-118px) rotateY(1600deg) scale(1.09)}
  100%{transform:translateY(0) rotateY(2400deg) scale(1)}
}
@keyframes toss-2 {
  0%  {transform:translateY(0) rotateY(0) scale(1)}
  25% {transform:translateY(-76px) rotateY(640deg) scale(1.11)}
  55% {transform:translateY(-92px) rotateY(1280deg) scale(1.06)}
  100%{transform:translateY(0) rotateY(1920deg) scale(1)}
}

/* 进度点 */
.progress-dot { width:7px; height:7px; border-radius:50%; transition:all 0.4s; }
.dot-done    { background:#c8aa6e; box-shadow:0 0 7px rgba(200,170,110,0.8); }
.dot-active  { background:transparent; border:1.5px solid rgba(200,170,110,0.7); animation:dot-pulse 1s ease-in-out infinite; }
.dot-pending { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.08); }
@keyframes dot-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(200,170,110,0.5)} 50%{box-shadow:0 0 0 4px rgba(200,170,110,0)} }
</style>
