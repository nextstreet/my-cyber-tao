<template>
  <div class="flex flex-col items-center w-full justify-between py-2 gap-4">

    <!-- ── 爻象显示区 ── -->
    <div class="flex flex-col-reverse gap-3 h-44 justify-end w-full items-center relative">
      <transition-group name="line-appear">
        <div v-for="(line, i) in lines" :key="i" class="flex flex-col items-center gap-1">
          <span v-if="changingLines[i]"
            class="text-[9px] font-mono tracking-widest uppercase"
            style="color: rgba(239,68,68,0.9); text-shadow: 0 0 8px rgba(239,68,68,0.6)">
            ◈ CHANGING
          </span>
          <!-- 阳爻 -->
          <div v-if="line === 1"
               class="yang-line relative overflow-hidden"
               :class="{ 'is-changing': changingLines[i] }">
            <div class="absolute inset-0 line-shine"></div>
          </div>
          <!-- 阴爻 -->
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

      <div v-if="lines.length === 0"
           class="text-center font-mono absolute"
           style="color: rgba(200,170,110,0.25); font-size: 11px; letter-spacing: 0.3em; line-height: 1.8;">
        PROBABILITY FIELD OSCILLATING<br>ALIGN INTENTION · CAST
      </div>
    </div>

    <!-- ── 铜钱 ── -->
    <div class="flex gap-8 my-1">
      <div v-for="(coin, index) in coins" :key="index" class="coin-container w-16 h-16">
        <div class="coin-body"
             :class="{ 'is-tossing': isTossing }"
             :style="getRotation(coin.v)">
          <div class="coin-face front flex items-center justify-center relative">
            <span class="font-serif text-2xl coin-text-yang">乾</span>
            <div class="absolute inset-2 border border-tao-gold/20 rounded-full"></div>
          </div>
          <div class="coin-face back flex items-center justify-center relative">
            <span class="font-serif text-2xl coin-text-yin">坤</span>
            <div class="absolute inset-2 border border-tao-gold/15 rounded-full"></div>
          </div>
          <div class="coin-side"></div>
        </div>
      </div>
    </div>

    <!-- ── 进度点 ── -->
    <div class="flex gap-2.5 items-center">
      <div v-for="i in 6" :key="i" class="progress-dot"
           :class="{
             'dot-done':    i <= lines.length,
             'dot-active':  i === lines.length + 1 && lines.length < 6,
             'dot-pending': i > lines.length + 1
           }">
      </div>
    </div>

    <!-- ── 投掷按钮 ── -->
    <button
      @click="toss"
      :disabled="isTossing || lines.length >= 6"
      class="group relative w-full overflow-hidden border transition-all uppercase disabled:cursor-not-allowed"
      style="padding: 14px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.6em; font-family: monospace;"
      :style="getBtnStyle()"
    >
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
           style="background: rgba(200,170,110,0.08)"></div>
      <span class="relative z-10 transition-colors"
            :style="isTossing || lines.length >= 6 ? 'color: rgba(200,170,110,0.3)' : 'color: #c8aa6e'">
        {{ btnLabel }}
      </span>
    </button>

    <!-- 变爻提示 -->
    <div v-if="hasChangingLine"
         class="w-full px-3 py-2 text-center border"
         style="border-color: rgba(239,68,68,0.3); background: rgba(239,0,0,0.05)">
      <p class="font-mono uppercase" style="font-size: 10px; color: rgba(239,68,68,0.8); letter-spacing: 0.3em;">
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
const coins    = ref([{ v: 1 }, { v: 1 }, { v: 1 }])

const changingLines = computed(() => rawSums.value.map(s => s === 9 || s === 6))
const hasChangingLine = computed(() => changingLines.value.some(Boolean))

const btnLabel = computed(() => {
  if (isTossing.value) return 'CALCULATING...'
  if (lines.value.length >= 6) return '⬡ ARRAY LOCKED'
  return `⬡ CAST · LINE ${lines.value.length + 1} / 6`
})

const getBtnStyle = () => {
  if (isTossing.value || lines.value.length >= 6) {
    return { borderColor: 'rgba(200,170,110,0.15)', background: 'transparent', opacity: '0.4' }
  }
  return {
    borderColor: 'rgba(200,170,110,0.55)',
    background: 'rgba(200,170,110,0.07)',
    boxShadow: '0 0 18px rgba(200,170,110,0.12)',
  }
}

// Web Audio 音效
const playAudio = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'coin') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(700, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
      osc.start(); osc.stop(ctx.currentTime + 0.22)
    } else if (type === 'lock') {
      [180, 360, 540].forEach((freq, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = 'sine'; o.frequency.value = freq
        g.gain.setValueAtTime(0.2 / (i + 1), ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8)
        o.start(); o.stop(ctx.currentTime + 1.8)
      })
    } else if (type === 'change') {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sawtooth'; o.frequency.setValueAtTime(440, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5)
      g.gain.setValueAtTime(0.12, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      o.start(); o.stop(ctx.currentTime + 0.6)
    }
  } catch (e) { /* 静默 */ }
}

const getRotation = (v) => {
  if (isTossing.value) return ''
  const offset = (Math.random() - 0.5) * 8
  return v === 0
    ? `transform: rotateY(180deg) rotateZ(${offset}deg)`
    : `transform: rotateY(0deg) rotateZ(${offset}deg)`
}

const toss = () => {
  if (isTossing.value || lines.value.length >= 6) return
  isTossing.value = true
  ;[0, 80, 160].forEach(d => setTimeout(() => playAudio('coin'), d))

  setTimeout(() => {
    let sum = 0
    coins.value = coins.value.map(() => {
      const v = Math.random() > 0.5 ? 1 : 0
      sum += v === 1 ? 3 : 2
      return { v }
    })

    const lineVal = (sum === 7 || sum === 9) ? 1 : 0
    lines.value = [...lines.value, lineVal]
    rawSums.value = [...rawSums.value, sum]
    isTossing.value = false

    if (sum === 9 || sum === 6) setTimeout(() => playAudio('change'), 200)

    if (lines.value.length === 6) {
      setTimeout(() => {
        playAudio('lock')
        // ★ emit 一个对象，App.vue 用 payload.lines 等接收
        emit('complete', {
          lines: lines.value,
          changingLines: changingLines.value,
          rawSums: rawSums.value,
        })
      }, 700)
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
  background: linear-gradient(90deg, #c8aa6e, #ef4444, #c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7), 0 0 28px rgba(239,68,68,0.3);
  animation: changing-pulse 1.5s ease-in-out infinite;
}
.yin-half {
  width: 43%; height: 11px; border-radius: 2px;
  background: #c8aa6e;
  box-shadow: 0 0 14px rgba(200,170,110,0.7), 0 0 28px rgba(200,170,110,0.3);
}
.yin-half.is-changing {
  background: linear-gradient(90deg, #c8aa6e, #ef4444, #c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7);
  animation: changing-pulse 1.5s ease-in-out infinite;
}
@keyframes changing-pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

@keyframes shine { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
.line-shine { background: linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent); animation: shine 2.2s ease-in-out infinite; }

.line-appear-enter-active { animation: line-build 0.5s cubic-bezier(0.23,1,0.32,1) forwards; }
@keyframes line-build {
  from { opacity:0; transform:scaleX(0.3) translateY(8px); filter:blur(6px); }
  to   { opacity:1; transform:scaleX(1) translateY(0);     filter:blur(0); }
}

.coin-container { perspective: 1000px; }
.coin-body {
  position:relative; width:100%; height:100%;
  transform-style:preserve-3d;
  transition:transform 0.8s cubic-bezier(0.175,0.885,0.32,1.275);
}
.coin-face {
  position:absolute; inset:0; backface-visibility:hidden; border-radius:50%;
  background:#0d1117; border:2px solid rgba(200,170,110,0.6);
  box-shadow:0 0 10px rgba(200,170,110,0.2), inset 0 0 8px rgba(200,170,110,0.05);
}
.coin-face.back { transform:rotateY(180deg); }
.coin-text-yang { color:#c8aa6e; text-shadow:0 0 8px rgba(200,170,110,0.7); }
.coin-text-yin  { color:rgba(200,170,110,0.55); }
.coin-side {
  position:absolute; top:50%; left:50%; width:100%; height:4px;
  background:#c8aa6e; transform:translate(-50%,-50%) rotateX(90deg);
  border-radius:50%; opacity:0.2;
}
.is-tossing { animation:toss-physics 1.2s cubic-bezier(0.4,0,0.2,1); }
@keyframes toss-physics {
  0%  {transform:translateY(0) rotateY(0) scale(1)}
  30% {transform:translateY(-90px) rotateY(720deg) scale(1.15)}
  60% {transform:translateY(-110px) rotateY(1440deg) scale(1.08)}
  100%{transform:translateY(0) rotateY(2160deg) scale(1)}
}

.progress-dot { width:7px; height:7px; border-radius:50%; transition:all 0.4s; }
.dot-done    { background:#c8aa6e; box-shadow:0 0 7px rgba(200,170,110,0.8); }
.dot-active  { background:transparent; border:1.5px solid rgba(200,170,110,0.7); animation:dot-pulse 1s ease-in-out infinite; }
.dot-pending { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.08); }
@keyframes dot-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(200,170,110,0.5)} 50%{box-shadow:0 0 0 4px rgba(200,170,110,0)} }
</style>
