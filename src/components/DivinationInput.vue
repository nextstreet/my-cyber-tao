<template>
  <div class="divination-input">
    <div class="input-header">
      <span class="header-tag">// QUERY_INTERFACE</span>
      <span class="step-indicator">STEP {{ step }}/3</span>
    </div>

    <!-- STEP 1：输入问题 -->
    <transition name="step-fade">
      <div v-if="step === 1" class="step-block" key="s1">
        <div class="step-title">
          <span class="step-num">01</span>
          <span>输入你的问题</span>
        </div>
        <p class="step-desc">将意图明确化，系统才能精准解析时空节点。</p>
        <textarea
          v-model="question"
          class="question-input"
          placeholder="你想询问什么？&#10;例：近期事业发展方向如何？"
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="char-count">{{ question.length }} / 200</div>
        <button class="next-btn" :disabled="!question.trim()" @click="step = 2">
          确认意图 · CONFIRM →
        </button>
      </div>
    </transition>

    <!-- STEP 2：抛铜钱 / 起卦 -->
    <transition name="step-fade">
      <div v-if="step === 2" class="step-block" key="s2">
        <div class="step-title">
          <span class="step-num">02</span>
          <span>起卦</span>
        </div>
        <p class="step-desc">点击铜钱，投掷六次，生成本次时空卦象。</p>

        <!-- 铜钱投掷区（保留现有 SpiritBottle 逻辑） -->
        <div class="coin-area">
          <div class="coins-row">
            <div v-for="n in 3" :key="n"
              class="coin"
              :class="{ spinning: isSpinning, landed: lastThrow !== null }"
              @click="!isSpinning && throwCoins()"
            >
              <div class="coin-face front">
                <span>乾</span>
              </div>
              <div class="coin-face back">
                <span>●</span>
              </div>
            </div>
          </div>

          <!-- 当前卦爻预览 -->
          <div class="lines-preview">
            <div v-for="(line, i) in lines" :key="i"
              class="preview-line"
              :class="lineClass(line)"
            >
              <template v-if="line % 2 === 1">
                <!-- 阳爻 -->
                <div class="yang-line"></div>
              </template>
              <template v-else>
                <!-- 阴爻 -->
                <div class="yin-left"></div>
                <div class="yin-gap"></div>
                <div class="yin-right"></div>
              </template>
              <span class="line-value">{{ LINE_LABELS[line] }}</span>
            </div>
            <div v-for="i in (6 - lines.length)" :key="'empty-'+i" class="preview-line empty">
              <div class="empty-line"></div>
            </div>
          </div>

          <div class="throw-count">{{ lines.length }} / 6 爻</div>
        </div>

        <div class="step-actions">
          <button class="back-btn" @click="resetAndBack">← 返回</button>
          <button class="next-btn" :disabled="lines.length < 6" @click="confirmHexagram">
            确认卦象 · CAST →
          </button>
        </div>
      </div>
    </transition>

    <!-- STEP 3：确认提交 -->
    <transition name="step-fade">
      <div v-if="step === 3" class="step-block" key="s3">
        <div class="step-title">
          <span class="step-num">03</span>
          <span>确认占卜</span>
        </div>

        <div class="confirm-summary">
          <div class="summary-row">
            <span class="srow-label">问题</span>
            <span class="srow-value">{{ question }}</span>
          </div>
          <div class="summary-row">
            <span class="srow-label">卦象</span>
            <span class="srow-value hex-preview">
              {{ hexagramName }}
              <HexagramVisual :hexagram="hexagramData" style="transform:scale(0.6);transform-origin:left center" />
            </span>
          </div>
        </div>

        <div class="step-actions">
          <button class="back-btn" @click="step = 2">← 重新起卦</button>
          <button class="submit-btn" :disabled="loading" @click="submit">
            <span v-if="!loading">解卦 · DECODE DESTINY</span>
            <span v-else>
              <HexagramLoader />
              正在解析...
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HexagramVisual from './HexagramVisual.vue'
import HexagramLoader from './HexagramLoader.vue'

const emit = defineEmits<{
  (e: 'submit', question: string, hexagram: any): void
}>()

const props = defineProps<{ loading: boolean }>()

const step = ref(1)
const question = ref('')
const lines = ref<number[]>([])   // 6=老阴, 7=少阳, 8=少阴, 9=老阳
const isSpinning = ref(false)
const lastThrow = ref<number[] | null>(null)

const LINE_LABELS: Record<number, string> = {
  6: '⊗ 老阴', 7: '— 少阳', 8: '-- 少阴', 9: '⊙ 老阳'
}

function lineClass(line: number) {
  return {
    'yang': line === 7 || line === 9,
    'yin':  line === 6 || line === 8,
    'changing': line === 6 || line === 9
  }
}

// 三枚铜钱：正面=3，背面=2，三枚之和 6/7/8/9
function throwCoins() {
  if (lines.value.length >= 6) return
  isSpinning.value = true
  setTimeout(() => {
    const coins = [0,1,2].map(() => Math.random() < 0.5 ? 3 : 2)
    const sum = coins.reduce((a,b) => a+b, 0)  // 6,7,8,9
    lines.value = [...lines.value, sum]
    lastThrow.value = coins
    isSpinning.value = false
  }, 600)
}

function resetAndBack() {
  lines.value = []
  lastThrow.value = null
  step.value = 1
}

// 六爻转卦号（简化，实际需要完整的 64 卦映射）
const hexagramData = computed(() => {
  if (lines.value.length < 6) return null
  // 将爻值转为本卦（奇=阳，偶=阴）
  const binaryLines = lines.value.map(l => l % 2 === 1 ? 1 : 0)
  // 变卦线
  const changingLines = lines.value.map(l => l === 6 || l === 9)
  return {
    lines: binaryLines,
    changingLines,
    element: inferElement(binaryLines),
    // 其他字段由后端补充
  }
})

const hexagramName = computed(() => hexagramData.value ? '本卦已生成' : '—')

function inferElement(lines: number[]): string {
  // 简单推算主五行，实际由后端返回
  const yangCount = lines.filter(l => l === 1).length
  if (yangCount >= 5) return '火'
  if (yangCount <= 1) return '水'
  if (yangCount === 3) return '木'
  return '土'
}

function confirmHexagram() {
  if (lines.value.length === 6) step.value = 3
}

function submit() {
  emit('submit', question.value, hexagramData.value)
}
</script>

<style scoped>
.divination-input { color: rgba(200, 180, 255, 0.9); font-family: 'Courier New', monospace; }

.input-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(120, 80, 255, 0.3);
}
.header-tag { font-size: 0.75rem; color: rgba(120, 80, 255, 0.7); }
.step-indicator { font-size: 0.7rem; color: rgba(160, 140, 200, 0.6); }

.step-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.step-num { font-size: 2rem; color: rgba(120, 80, 255, 0.3); font-weight: bold; }
.step-title > span:last-child { font-size: 1rem; color: rgba(220, 200, 255, 0.9); }
.step-desc { font-size: 0.75rem; color: rgba(160, 140, 200, 0.6); margin-bottom: 1.2rem; line-height: 1.6; }

.question-input {
  width: 100%;
  background: rgba(8, 8, 28, 0.8);
  border: 1px solid rgba(120, 80, 255, 0.25);
  border-radius: 4px;
  color: rgba(220, 200, 255, 0.9);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.75rem;
  resize: none;
  line-height: 1.7;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.question-input:focus { border-color: rgba(120, 80, 255, 0.7); }
.question-input::placeholder { color: rgba(120, 80, 255, 0.3); }
.char-count { font-size: 0.62rem; color: rgba(120, 80, 255, 0.4); text-align: right; margin-top: 4px; }

.next-btn, .submit-btn {
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.85rem;
  background: transparent;
  border: 1px solid rgba(120, 80, 255, 0.5);
  color: rgba(200, 180, 255, 0.9);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 2px;
}
.next-btn:hover:not(:disabled), .submit-btn:hover:not(:disabled) {
  background: rgba(120, 80, 255, 0.15);
  border-color: rgba(180, 140, 255, 0.8);
  box-shadow: 0 0 16px rgba(120, 80, 255, 0.25);
}
.next-btn:disabled, .submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.submit-btn {
  border-color: rgba(160, 100, 255, 0.8);
  background: rgba(120, 80, 255, 0.1);
}

/* 铜钱区 */
.coin-area { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.coins-row { display: flex; gap: 1.5rem; margin-top: 0.5rem; }

.coin {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  border: 2px solid rgba(200, 160, 80, 0.5);
  background: radial-gradient(circle at 35% 35%, rgba(220,180,80,0.6), rgba(140,100,40,0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: rgba(255,220,120,0.9);
  box-shadow: 0 0 12px rgba(200,160,80,0.2), inset 0 0 8px rgba(0,0,0,0.3);
  user-select: none;
}
.coin:hover { box-shadow: 0 0 20px rgba(200,160,80,0.5), inset 0 0 8px rgba(0,0,0,0.3); }
.coin.spinning {
  animation: coinSpin 0.6s cubic-bezier(0.4,0,0.6,1) forwards;
}
@keyframes coinSpin {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(180deg) scale(0.8); }
  100% { transform: rotateY(360deg); }
}
.coin-face { position: absolute; }

/* 爻预览 */
.lines-preview {
  display: flex;
  flex-direction: column-reverse;  /* 从下往上显示 */
  gap: 5px;
  min-height: 90px;
}
.preview-line {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 10px;
}
.yang-line {
  width: 80px; height: 4px;
  background: rgba(220,200,255,0.9);
  border-radius: 2px;
}
.yin-left, .yin-right {
  width: 34px; height: 4px;
  background: rgba(220,200,255,0.9);
  border-radius: 2px;
}
.yin-gap { width: 12px; }
.preview-line.changing .yang-line,
.preview-line.changing .yin-left,
.preview-line.changing .yin-right {
  background: rgba(255,180,80,0.9);
  box-shadow: 0 0 4px rgba(255,180,80,0.5);
}
.empty-line {
  width: 80px; height: 4px;
  background: rgba(120,80,255,0.15);
  border-radius: 2px;
  border: 1px dashed rgba(120,80,255,0.2);
}
.line-value { font-size: 0.55rem; color: rgba(140,120,200,0.5); margin-left: 6px; white-space: nowrap; }
.throw-count { font-size: 0.65rem; color: rgba(120,80,255,0.5); font-family: monospace; }

/* 确认摘要 */
.confirm-summary { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.summary-row {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(120,80,255,0.06);
  border: 1px solid rgba(120,80,255,0.15);
  border-radius: 3px;
  align-items: flex-start;
}
.srow-label { font-size: 0.65rem; color: rgba(120,80,255,0.6); min-width: 2.5rem; padding-top: 2px; }
.srow-value { font-size: 0.82rem; color: rgba(200,180,255,0.9); line-height: 1.5; display: flex; align-items: center; gap: 0.5rem; }
.hex-preview { flex-wrap: wrap; }

.step-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.back-btn {
  padding: 0.7rem 1rem;
  background: transparent;
  border: 1px solid rgba(120,80,255,0.2);
  color: rgba(160,140,200,0.6);
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
}
.back-btn:hover { border-color: rgba(120,80,255,0.4); color: rgba(180,160,220,0.8); }

/* Step 过渡动画 */
.step-fade-enter-active, .step-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
  position: absolute;
  width: 100%;
}
.step-fade-enter-from { opacity: 0; transform: translateX(20px); }
.step-fade-leave-to  { opacity: 0; transform: translateX(-20px); }
.step-block { position: relative; }
</style>
