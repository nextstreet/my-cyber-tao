<template>
  <div class="flex flex-col items-center w-full min-h-[500px] justify-between">
    <div class="flex flex-col-reverse gap-4 h-44 justify-end">
      <div v-for="(line, i) in lines" :key="i" class="animate-in">
        <div v-if="line === 1" class="w-44 h-2.5 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-white/5"></div>
        <div v-else class="w-44 h-2.5 flex justify-between">
          <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-white/5"></div>
          <div class="w-[43%] h-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-white/5"></div>
        </div>
      </div>
      <div v-if="lines.length === 0" class="text-center opacity-20 italic text-[10px] tracking-[0.5em] px-8 leading-relaxed">
        OSCILLATING PROBABILITY FIELD...<br>RESONATE WITH THE VOID.
      </div>
    </div>

    <div class="flex gap-10 my-12">
      <div v-for="(coin, index) in coins" :key="index" class="coin-container w-16 h-16">
        <div 
          class="coin-body"
          :class="{ 'is-tossing': isTossing }"
          :style="getRotation(coin.v)"
        >
          <div class="coin-face front bg-[#1a1a1a] border-2 border-tao-gold/50 flex items-center justify-center">
            <span class="text-tao-gold font-serif text-2xl drop-shadow-[0_0_5px_rgba(200,170,110,0.5)]">乾</span>
            <div class="absolute inset-1 border border-tao-gold/10 rounded-full"></div>
          </div>
          <div class="coin-face back bg-[#1a1a1a] border-2 border-tao-gold/50 flex items-center justify-center">
            <span class="text-tao-gold/80 font-serif text-2xl">坤</span>
            <div class="absolute inset-1 border border-tao-gold/10 rounded-full"></div>
          </div>
          <div class="coin-side"></div>
        </div>
      </div>
    </div>

    <button 
      @click="toss" 
      :disabled="isTossing || lines.length >= 6"
      class="group relative w-full py-5 overflow-hidden border border-tao-gold/30 bg-black/40 transition-all hover:border-tao-gold disabled:opacity-10"
    >
      <div class="absolute inset-0 bg-tao-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span class="relative z-10 text-[11px] font-black tracking-[0.8em] text-tao-gold group-hover:text-white transition-colors">
        {{ isTossing ? 'CALCULATING...' : (lines.length >= 6 ? 'ARRAY LOCKED' : `ITERATE HEXAGRAM ${lines.length + 1}`) }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['complete'])
const lines = ref([])
const isTossing = ref(false)
// 默认全为正面
const coins = ref([{v:1}, {v:1}, {v:1}])

const getRotation = (v) => {
  if (isTossing.value) return ''
  // 增加一点随机扰动，让落地看起来不那么死板
  const randomOffset = (Math.random() - 0.5) * 10
  return v === 0 
    ? `transform: rotateY(180deg) rotateZ(${randomOffset}deg)` 
    : `transform: rotateY(0deg) rotateZ(${randomOffset}deg)`
}

const toss = () => {
  if (isTossing.value || lines.value.length >= 6) return
  isTossing.value = true
  
  // 模拟计算延迟
  setTimeout(() => {
    let sum = 0
    coins.value = coins.value.map(() => {
      // 1代表字(乾-阳-3), 0代表背(坤-阴-2)
      const v = Math.random() > 0.5 ? 1 : 0
      sum += (v === 1 ? 3 : 2)
      return { v }
    })
    
    // 易经算法：
    // 6, 8 为阴 (0)
    // 7, 9 为阳 (1)
    lines.value.push((sum === 7 || sum === 9) ? 1 : 0)
    
    isTossing.value = false
    if (lines.value.length === 6) {
      setTimeout(() => emit('complete', lines.value), 800)
    }
  }, 1200) // 增加到 1.2s 让抛掷动画更完整
}
</script>

<style scoped>
.coin-container {
  perspective: 1000px;
}

.coin-body {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.coin-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 50%;
}

.coin-face.back {
  transform: rotateY(180deg);
}

/* 硬币厚度装饰 */
.coin-side {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 4px;
  background: #C8AA6E;
  transform: translate(-50%, -50%) rotateX(90deg);
  border-radius: 50%;
  opacity: 0.3;
}

.is-tossing {
  animation: toss-physics 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toss-physics {
  0% { transform: translateY(0) rotateY(0) scale(1); }
  30% { transform: translateY(-100px) rotateY(720deg) scale(1.2); }
  60% { transform: translateY(-120px) rotateY(1440deg) scale(1.1); }
  100% { transform: translateY(0) rotateY(2160deg) scale(1); }
}

.animate-in {
  animation: slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: scaleX(0.5); filter: blur(10px); }
  to { opacity: 1; transform: scaleX(1); filter: blur(0); }
}

/* 按钮禁用状态的极简处理 */
button:disabled {
  cursor: not-allowed;
  border-color: rgba(200,170,110,0.05);
}
</style>
