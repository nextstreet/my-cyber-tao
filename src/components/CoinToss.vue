<template>
  <div class="flex flex-col items-center w-full justify-between py-2 gap-4">

    <!-- 爻象显示区 -->
    <div class="flex flex-col-reverse gap-3 h-36 justify-end w-full items-center">
      <div v-for="(line, i) in lines" :key="i" class="animate-in">
        <!-- 阳爻 (实线) -->
        <div v-if="line === 1"
             class="w-40 h-2.5 rounded-sm relative overflow-hidden"
             style="background: #22d3ee; box-shadow: 0 0 16px rgba(34,211,238,0.7), 0 0 32px rgba(34,211,238,0.3);">
          <div class="absolute inset-0 line-shine"></div>
        </div>
        <!-- 阴爻 (断线) -->
        <div v-else class="w-40 h-2.5 flex justify-between">
          <div class="w-[43%] h-full rounded-sm relative overflow-hidden"
               style="background: #22d3ee; box-shadow: 0 0 16px rgba(34,211,238,0.7), 0 0 32px rgba(34,211,238,0.3);">
            <div class="absolute inset-0 line-shine"></div>
          </div>
          <div class="w-[43%] h-full rounded-sm relative overflow-hidden"
               style="background: #22d3ee; box-shadow: 0 0 16px rgba(34,211,238,0.7), 0 0 32px rgba(34,211,238,0.3);">
            <div class="absolute inset-0 line-shine"></div>
          </div>
        </div>
      </div>

      <div v-if="lines.length === 0" class="text-center opacity-20 italic text-[9px] tracking-[0.5em] px-8 leading-relaxed font-mono">
        OSCILLATING PROBABILITY FIELD...<br>RESONATE WITH THE VOID.
      </div>
    </div>

    <!-- 铜钱区 -->
    <div class="flex gap-8 my-4">
      <div v-for="(coin, index) in coins" :key="index" class="coin-container w-14 h-14">
        <div
          class="coin-body"
          :class="{ 'is-tossing': isTossing }"
          :style="getRotation(coin.v)"
        >
          <div class="coin-face front flex items-center justify-center relative"
               style="background: #0d1117; border: 2px solid rgba(200,170,110,0.55); box-shadow: 0 0 10px rgba(200,170,110,0.2), inset 0 0 6px rgba(200,170,110,0.05);">
            <span class="text-tao-gold font-serif text-xl" style="text-shadow: 0 0 8px rgba(200,170,110,0.6);">乾</span>
            <div class="absolute inset-1.5 border border-tao-gold/10 rounded-full"></div>
          </div>
          <div class="coin-face back flex items-center justify-center relative"
               style="background: #0d1117; border: 2px solid rgba(200,170,110,0.55); box-shadow: 0 0 10px rgba(200,170,110,0.2), inset 0 0 6px rgba(200,170,110,0.05);">
            <span class="font-serif text-xl" style="color: rgba(200,170,110,0.7);">坤</span>
            <div class="absolute inset-1.5 border border-tao-gold/10 rounded-full"></div>
          </div>
          <div class="coin-side"></div>
        </div>
      </div>
    </div>

    <!-- 投掷按钮 -->
    <button
      @click="toss"
      :disabled="isTossing || lines.length >= 6"
      class="group relative w-full py-4 overflow-hidden border border-tao-gold/30 bg-black/50
              transition-all hover:border-tao-gold/60 disabled:opacity-10 disabled:cursor-not-allowed
              cyber-btn-toss"
    >
      <div class="absolute inset-0 bg-tao-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span class="relative z-10 text-[10px] font-black tracking-[0.7em] text-tao-gold group-hover:text-white transition-colors">
        {{ isTossing ? 'CALCULATING...' : (lines.length >= 6 ? 'ARRAY LOCKED' : `ITERATE ${lines.length + 1} / 6`) }}
      </span>
    </button>

  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)
const coins = ref([{v:1}, {v:1}, {v:1}])

const getRotation = (v) => {
  if (isTossing.value) return ''
  const randomOffset = (Math.random() - 0.5) * 10
  return v === 0
    ? `transform: rotateY(180deg) rotateZ(${randomOffset}deg)`
    : `transform: rotateY(0deg) rotateZ(${randomOffset}deg)`
}

const toss = () => {
  if (isTossing.value || lines.value.length >= 6) return
  isTossing.value = true
  setTimeout(() => {
    let sum = 0
    coins.value = coins.value.map(() => {
      const v = Math.random() > 0.5 ? 1 : 0
      sum += (v === 1 ? 3 : 2)
      return { v }
    })
    lines.value.push((sum === 7 || sum === 9) ? 1 : 0)
    isTossing.value = false
    if (lines.value.length === 6) {
      setTimeout(() => emit('complete', lines.value), 800)
    }
  }, 1200)
}
</script>

<style scoped>
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
}
.coin-face.back { transform: rotateY(180deg); }
.coin-side {
  position: absolute; top: 50%; left: 50%;
  width: 100%; height: 4px;
  background: #C8AA6E;
  transform: translate(-50%, -50%) rotateX(90deg);
  border-radius: 50%; opacity: 0.25;
}

.is-tossing { animation: toss-physics 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes toss-physics {
  0% { transform: translateY(0) rotateY(0) scale(1); }
  30% { transform: translateY(-90px) rotateY(720deg) scale(1.15); }
  60% { transform: translateY(-110px) rotateY(1440deg) scale(1.08); }
  100% { transform: translateY(0) rotateY(2160deg) scale(1); }
}

.animate-in { animation: slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
@keyframes slideIn {
  from { opacity: 0; transform: scaleX(0.4); filter: blur(8px); }
  to { opacity: 1; transform: scaleX(1); filter: blur(0); }
}

/* 爻线光泽流动 */
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.line-shine {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: shine 2s ease-in-out infinite;
}

.cyber-btn-toss {
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
}
</style>
