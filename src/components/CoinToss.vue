<template>
  <div class="flex flex-col items-center w-full justify-between py-2 gap-3">

    <!-- ── 爻象显示区 ── -->
    <div class="flex flex-col-reverse gap-2.5 h-40 justify-end w-full items-center relative">

      <!-- 已生成的爻 -->
      <transition-group name="line-appear">
        <div v-for="(line, i) in lines" :key="i" class="flex flex-col items-center gap-0.5">
          <!-- 变爻标记 -->
          <span v-if="changingLines[i]"
            class="text-[7px] font-mono tracking-widest uppercase mb-0.5"
            style="color: rgba(239,68,68,0.9); text-shadow: 0 0 8px rgba(239,68,68,0.6)">
            ◈ CHANGING
          </span>

          <!-- 阳爻 (实线) -->
          <div v-if="line === 1"
               class="yang-line relative overflow-hidden"
               :class="{ 'is-changing': changingLines[i] }">
            <div class="absolute inset-0 line-shine"></div>
          </div>

          <!-- 阴爻 (断线) -->
          <div v-else class="flex justify-between w-40">
            <div class="yin-half relative overflow-hidden"
                 :class="{ 'is-changing': changingLines[i] }">
              <div class="absolute inset-0 line-shine"></div>
            </div>
            <div class="yin-half relative overflow-hidden"
                 :class="{ 'is-changing': changingLines[i] }">
              <div class="absolute inset-0 line-shine"></div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- 空态提示 -->
      <div v-if="lines.length === 0"
           class="text-center opacity-30 text-[9px] tracking-[0.5em] px-8 leading-relaxed font-mono absolute">
        PROBABILITY FIELD OSCILLATING<br>ALIGN INTENTION · CAST
      </div>
    </div>

    <!-- ── 铜钱区 ── -->
    <div class="flex gap-8 my-2">
      <div v-for="(coin, index) in coins" :key="index" class="coin-container w-14 h-14">
        <div class="coin-body"
             :class="{ 'is-tossing': isTossing }"
             :style="getRotation(coin.v)">
          <!-- 正面：乾 -->
          <div class="coin-face front flex items-center justify-center relative">
            <span class="font-serif text-xl coin-text-yang">乾</span>
            <div class="absolute inset-1.5 border border-tao-gold/20 rounded-full"></div>
            <!-- 内圈纹路 -->
            <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#c8aa6e" stroke-width="0.5" stroke-dasharray="3 2"/>
            </svg>
          </div>
          <!-- 背面：坤 -->
          <div class="coin-face back flex items-center justify-center relative">
            <span class="font-serif text-xl coin-text-yin">坤</span>
            <div class="absolute inset-1.5 border border-tao-gold/15 rounded-full"></div>
            <svg class="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#c8aa6e" stroke-width="0.5" stroke-dasharray="2 3"/>
            </svg>
          </div>
          <div class="coin-side"></div>
        </div>
      </div>
    </div>

    <!-- ── 进度指示 ── -->
    <div class="flex gap-2 items-center">
      <div v-for="i in 6" :key="i"
           class="progress-dot"
           :class="{
             'dot-done': i <= lines.length,
             'dot-active': i === lines.length + 1 && !isTossing,
             'dot-pending': i > lines.length + 1
           }">
      </div>
    </div>

    <!-- ── 投掷按钮 ── -->
    <button
      @click="toss"
      :disabled="isTossing || lines.length >= 6"
      class="group relative w-full py-3.5 overflow-hidden
              border transition-all uppercase
              disabled:opacity-20 disabled:cursor-not-allowed
              cyber-btn-toss"
      :class="lines.length >= 6 ? 'border-tao-gold/20' : 'border-tao-gold/50 hover:border-tao-gold/80'"
      :style="lines.length < 6 ? 'background: rgba(200,170,110,0.06); box-shadow: 0 0 16px rgba(200,170,110,0.08)' : ''"
    >
      <div class="absolute inset-0 bg-tao-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <!-- 按钮扫描线 -->
      <div v-if="!isTossing && lines.length < 6"
           class="absolute inset-x-0 h-px bg-tao-gold/20 btn-scan pointer-events-none"></div>
      <span class="relative z-10 text-[10px] font-black tracking-[0.7em] text-tao-gold group-hover:text-white transition-colors">
        {{ isTossing ? 'CALCULATING...' : (lines.length >= 6 ? '⬡ ARRAY LOCKED' : `⬡ CAST · LINE ${lines.length + 1} / 6`) }}
      </span>
    </button>

    <!-- 变爻说明（出现变爻时显示） -->
    <div v-if="hasChangingLine"
         class="w-full px-3 py-2 border border-red-500/30 bg-red-950/20 text-center"
         style="box-shadow: 0 0 12px rgba(239,68,68,0.1)">
      <p class="text-[8px] font-mono tracking-widest text-red-400/80 uppercase">
        ◈ CHANGING LINE DETECTED · FATE IN FLUX
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['complete'])
const lines = ref([])           // 0/1 阴阳
const rawSums = ref([])         // 每次投掷的原始和（6/7/8/9），用于判断变爻
const isTossing = ref(false)
const coins = ref([{ v: 1 }, { v: 1 }, { v: 1 }])

// 变爻计算：sum=9老阳（阳变阴）或 sum=6老阴（阴变阳）
const changingLines = computed(() =>
  rawSums.value.map(s => s === 9 || s === 6)
)
const hasChangingLine = computed(() => changingLines.value.some(Boolean))

// ── Web Audio 音效（纯合成，无需文件）──
const playAudio = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'coin') {
      // 铜钱碰撞：短促金属冲击音
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      osc.start(); osc.stop(ctx.currentTime + 0.2)
    } else if (type === 'lock') {
      // 卦象锁定：低频钟声 + 泛音
      [180, 360, 540].forEach((freq, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = 'sine'
        o.frequency.value = freq
        g.gain.setValueAtTime(0.25 / (i + 1), ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0)
        o.start(); o.stop(ctx.currentTime + 2.0)
      })
    } else if (type === 'change') {
      // 变爻：神秘弦音
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(440, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5)
      g.gain.setValueAtTime(0.15, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      o.start(); o.stop(ctx.currentTime + 0.6)
    }
  } catch (e) { /* 静默处理：部分浏览器限制 AudioContext */ }
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

  // 播放投掷音（每枚硬币一个稍微错开的金属声）
  [0, 80, 160].forEach(delay => setTimeout(() => playAudio('coin'), delay))

  setTimeout(() => {
    let sum = 0
    coins.value = coins.value.map(() => {
      const v = Math.random() > 0.5 ? 1 : 0
      sum += v === 1 ? 3 : 2
      return { v }
    })

    // 易经规则：7/9=阳，6/8=阴
    const lineValue = (sum === 7 || sum === 9) ? 1 : 0
    lines.value.push(lineValue)
    rawSums.value.push(sum)

    isTossing.value = false

    // 变爻时额外音效
    if (sum === 9 || sum === 6) {
      setTimeout(() => playAudio('change'), 200)
    }

    if (lines.value.length === 6) {
      setTimeout(() => {
        playAudio('lock')
        // 传递 lines + changingLines 给父组件
        emit('complete', {
          lines: lines.value,
          changingLines: changingLines.value,
          rawSums: rawSums.value
        })
      }, 600)
    }
  }, 1200)
}
</script>

<style scoped>
/* ── 阳爻线 ── */
.yang-line {
  width: 160px;
  height: 10px;
  border-radius: 2px;
  background: #c8aa6e;
  box-shadow: 0 0 14px rgba(200,170,110,0.7), 0 0 28px rgba(200,170,110,0.3);
  transition: box-shadow 0.3s;
}
.yang-line.is-changing {
  background: linear-gradient(90deg, #c8aa6e, #ef4444, #c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7), 0 0 28px rgba(239,68,68,0.35);
  animation: changing-pulse 1.5s ease-in-out infinite;
}

/* ── 阴爻半段 ── */
.yin-half {
  width: 43%;
  height: 10px;
  border-radius: 2px;
  background: #c8aa6e;
  box-shadow: 0 0 14px rgba(200,170,110,0.7), 0 0 28px rgba(200,170,110,0.3);
}
.yin-half.is-changing {
  background: linear-gradient(90deg, #c8aa6e, #ef4444, #c8aa6e);
  box-shadow: 0 0 14px rgba(239,68,68,0.7), 0 0 28px rgba(239,68,68,0.35);
  animation: changing-pulse 1.5s ease-in-out infinite;
}

@keyframes changing-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ── 光泽流动 ── */
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
.line-shine {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: shine 2s ease-in-out infinite;
}

/* ── 爻入场动画 ── */
.line-appear-enter-active { animation: line-build 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
@keyframes line-build {
  from { opacity: 0; transform: scaleX(0.3) translateY(6px); filter: blur(6px); }
  to   { opacity: 1; transform: scaleX(1) translateY(0);    filter: blur(0); }
}

/* ── 铜钱 ── */
.coin-container { perspective: 1000px; }
.coin-body {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.coin-face {
  position: absolute; inset: 0;
  backface-visibility: hidden;
  border-radius: 50%;
  background: #0d1117;
  border: 2px solid rgba(200,170,110,0.6);
  box-shadow: 0 0 10px rgba(200,170,110,0.2), inset 0 0 8px rgba(200,170,110,0.05);
}
.coin-face.back { transform: rotateY(180deg); }
.coin-text-yang {
  color: #c8aa6e;
  text-shadow: 0 0 8px rgba(200,170,110,0.7);
}
.coin-text-yin {
  color: rgba(200,170,110,0.6);
}
.coin-side {
  position: absolute; top: 50%; left: 50%;
  width: 100%; height: 4px;
  background: #c8aa6e;
  transform: translate(-50%, -50%) rotateX(90deg);
  border-radius: 50%; opacity: 0.2;
}

.is-tossing { animation: toss-physics 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes toss-physics {
  0%   { transform: translateY(0) rotateY(0) scale(1); }
  30%  { transform: translateY(-90px) rotateY(720deg) scale(1.15); }
  60%  { transform: translateY(-110px) rotateY(1440deg) scale(1.08); }
  100% { transform: translateY(0) rotateY(2160deg) scale(1); }
}

/* ── 进度点 ── */
.progress-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  transition: all 0.4s;
}
.dot-done {
  background: #c8aa6e;
  box-shadow: 0 0 6px rgba(200,170,110,0.8);
}
.dot-active {
  background: transparent;
  border: 1.5px solid rgba(200,170,110,0.7);
  animation: dot-pulse 1s ease-in-out infinite;
}
.dot-pending {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
}
@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200,170,110,0.4); }
  50%       { box-shadow: 0 0 0 3px rgba(200,170,110,0); }
}

/* ── 按钮 ── */
.cyber-btn-toss {
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
}
@keyframes btn-scan {
  0%   { top: 0;    opacity: 0; }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.6; }
  100% { top: 100%; opacity: 0; }
}
.btn-scan { animation: btn-scan 3s linear infinite; position: absolute; }
</style>
