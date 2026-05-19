<script setup lang="ts">
import { ref } from 'vue'
import type { LineValue } from '@/composables/tianji'

const emit = defineEmits<{ (e: 'toss', value: LineValue): void }>()
const props = defineProps<{ disabled?: boolean }>()

const flipping = ref([false, false, false])
const lastResult = ref<LineValue | null>(null)
const coinFaces = ref([0, 0, 0])

const LABELS: Record<LineValue, string> = {
  6: '⚋ 老阴  Old Yin  →',
  7: '⚊ 阳  Yang',
  8: '⚋ 阴  Yin',
  9: '⚊ 老阳  Old Yang  →',
}

function playCoinSound() {
  try {
    const ac = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    ;[0, 0.09, 0.18].forEach(d => setTimeout(() => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = 'triangle'
      o.frequency.value = 880 + Math.random() * 220
      g.gain.setValueAtTime(0.22, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
      o.connect(g); g.connect(ac.destination)
      o.start(); o.stop(ac.currentTime + 0.2)
    }, d * 1000))
  } catch { /* ignore */ }
}

function toss() {
  if (props.disabled) return
  playCoinSound()
  if (navigator.vibrate) navigator.vibrate([20, 50, 20])

  flipping.value = [true, true, true]
  setTimeout(() => {
    const vals = [
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ] as const
    coinFaces.value = [...vals]
    const sum = (vals[0] + vals[1] + vals[2]) as LineValue
    lastResult.value = sum
    flipping.value = [false, false, false]
    emit('toss', sum)
  }, 700)
}
</script>

<template>
  <div class="coin-area">
    <div class="coins-row">
      <div
        v-for="(_, i) in 3"
        :key="i"
        :class="['coin', { flipping: flipping[i], yang: coinFaces[i] === 3, yin: coinFaces[i] === 2 }]"
        @click="toss"
      >
        <span class="coin-inner">{{ coinFaces[i] === 3 ? '陽' : coinFaces[i] === 2 ? '陰' : '☯' }}</span>
      </div>
    </div>

    <div class="toss-result" v-if="lastResult">
      {{ LABELS[lastResult] }}
    </div>

    <button class="toss-btn" :disabled="disabled" @click="toss">
      投币起爻 · Cast
    </button>
  </div>
</template>

<style scoped>
.coin-area { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.coins-row { display: flex; gap: 18px; perspective: 400px; }
.coin {
  width: 52px; height: 52px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #e8d060, #b89030 55%, #7a5810);
  border: 1.5px solid rgba(201,168,76,0.8);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transform-style: preserve-3d;
  transition: transform .1s;
}
.coin:active { transform: scale(0.9); }
.coin-inner { font-size: 14px; color: rgba(100,60,0,0.9); font-weight: 700; pointer-events: none; }
.coin.flipping { animation: coinflip .7s ease-out forwards; }
.coin.yang { background: radial-gradient(circle at 35% 35%, #f0e070, #c8a030 55%, #906010); }
.coin.yin  { background: radial-gradient(circle at 35% 35%, #d0c060, #a08020 55%, #604010); }

.toss-result {
  font-size: 13px; color: rgba(201,168,76,0.85);
  letter-spacing: .04em; height: 20px; text-align: center;
}
.toss-btn {
  padding: 9px 32px; border-radius: 18px;
  background: rgba(139,26,26,0.35);
  border: 0.5px solid rgba(201,168,76,0.4);
  color: #c9a84c; font-size: 13px; letter-spacing: .08em;
  cursor: pointer; transition: background .15s;
}
.toss-btn:disabled { opacity: .4; cursor: default; }
.toss-btn:not(:disabled):active { background: rgba(139,26,26,0.65); }

@keyframes coinflip {
  0%   { transform: rotateX(0deg); }
  35%  { transform: rotateX(720deg); }
  65%  { transform: rotateX(1440deg); }
  100% { transform: rotateX(1800deg); }
}
</style>
