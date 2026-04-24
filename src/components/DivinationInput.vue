<template>
  <div class="divination-input">

    <!-- 顶部 HUD -->
    <div class="input-header">
      <span class="header-tag">// QUERY_INTERFACE</span>
      <span class="step-indicator">STEP {{ step }}/3</span>
    </div>

    <!-- ── STEP 1：输入问题 ── -->
    <transition name="step-fade">
      <div v-if="step === 1" class="step-block" key="s1">
        <div class="step-title">
          <span class="step-num">01</span>
          <span>{{ t('inputQuestion') }}</span>
        </div>
        <p class="step-desc">{{ t('inputDesc') }}</p>
        <textarea
          v-model="question"
          class="question-input"
          :placeholder="t('placeholder')"
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="char-count">{{ question.length }} / 200</div>
        <button
          class="next-btn"
          :disabled="!question.trim()"
          @click="step = 2"
        >
          {{ t('confirmInt') }} →
        </button>
      </div>
    </transition>

    <!-- ── STEP 2：起卦 ── -->
    <transition name="step-fade">
      <div v-if="step === 2" class="step-block" key="s2">
        <div class="step-title">
          <span class="step-num">02</span>
          <span>{{ t('castTitle') }}</span>
        </div>
        <p class="step-desc">{{ t('castDesc') }}</p>

        <div class="coin-area">
          <!-- 铜钱：每枚有独立随机弹跳高度 -->
          <div class="coins-row">
            <div
              v-for="n in 3"
              :key="n"
              class="coin"
              :class="{ 'coin-toss': isSpinning, 'coin-landed': lastThrow !== null }"
              :style="isSpinning ? getCoinStyle(n) : undefined"
              @click="!isSpinning && lines.length < 6 && throwCoins()"
            >
              <div class="coin-face front"><span>乾</span></div>
              <div class="coin-face back"><span>●</span></div>
            </div>
          </div>

          <!-- ★ 独立投掷按钮 -->
          <button
            class="throw-btn"
            :disabled="isSpinning || lines.length >= 6"
            @click="throwCoins"
          >
            <span v-if="isSpinning">{{ t('casting') }}</span>
            <span v-else-if="lines.length >= 6">{{ t('castComplete') }}</span>
            <span v-else>{{ t('throwCoins') }} ({{ lines.length }}/6)</span>
          </button>

          <!-- 爻象预览（从下到上） -->
          <div class="lines-preview">
            <!-- 已有爻（倒序渲染让最新的在顶部，保持卦象从下到上的直觉） -->
            <div
              v-for="(line, i) in [...lines].reverse()"
              :key="i"
              class="preview-line"
              :class="lineClass(line)"
            >
              <template v-if="line % 2 === 1">
                <div class="yang-line"></div>
              </template>
              <template v-else>
                <div class="yin-left"></div>
                <div class="yin-gap"></div>
                <div class="yin-right"></div>
              </template>
              <span class="line-value">{{ LINE_LABELS[line] }}</span>
            </div>
            <!-- 空位占位 -->
            <div
              v-for="i in (6 - lines.length)"
              :key="'empty-' + i"
              class="preview-line empty"
            >
              <div class="empty-line"></div>
            </div>
          </div>

          <div class="throw-count">{{ lines.length }} / 6 {{ t('yao') }}</div>
        </div>

        <div class="step-actions">
          <button class="back-btn" @click="resetAndBack">← {{ t('back') }}</button>
          <button
            class="next-btn"
            :disabled="lines.length < 6"
            @click="confirmHexagram"
          >
            {{ t('confirmCast') }} →
          </button>
        </div>
      </div>
    </transition>

    <!-- ── STEP 3：确认提交 ── -->
    <transition name="step-fade">
      <div v-if="step === 3" class="step-block" key="s3">
        <div class="step-title">
          <span class="step-num">03</span>
          <span>{{ t('confirmTitle') }}</span>
        </div>

        <div class="confirm-summary">
          <div class="summary-row">
            <span class="srow-label">{{ t('labelQuestion') }}</span>
            <span class="srow-value">{{ question }}</span>
          </div>
          <div class="summary-row">
            <span class="srow-label">{{ t('labelHexagram') }}</span>
            <span class="srow-value hex-preview">
              {{ hexagramData ? t('hexReady') : '—' }}
              <!-- 小卦象预览 -->
              <svg v-if="hexagramData" viewBox="0 0 40 56" width="24" height="34" style="margin-left:8px;flex-shrink:0">
                <g v-for="(line, i) in [...(hexagramData.lines)].reverse()" :key="i" :transform="`translate(0,${i*9})`">
                  <line v-if="line===1" x1="0" y1="4" x2="40" y2="4" stroke="rgba(200,180,255,0.8)" stroke-width="2.5" stroke-linecap="round"/>
                  <template v-else>
                    <line x1="0" y1="4" x2="16" y2="4" stroke="rgba(200,180,255,0.8)" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="24" y1="4" x2="40" y2="4" stroke="rgba(200,180,255,0.8)" stroke-width="2.5" stroke-linecap="round"/>
                  </template>
                </g>
              </svg>
            </span>
          </div>
          <!-- 变爻提示 -->
          <div v-if="changingCount > 0" class="changing-hint">
            {{ t('changingLines', changingCount) }}
          </div>
        </div>

        <div class="step-actions">
          <button class="back-btn" @click="step = 2">← {{ t('recast') }}</button>
          <button
            class="submit-btn"
            :disabled="loading"
            @click="submit"
          >
            <span v-if="!loading">{{ t('decode') }}</span>
            <span v-else class="loading-span">
              <svg viewBox="0 0 60 84" width="20" height="28" class="mini-loader">
                <g v-for="j in 6" :key="j" :transform="`translate(0,${(j-1)*14})`">
                  <line class="loader-line" :style="{ animationDelay: `${(6-j)*0.18}s` }"
                    x1="0" y1="7" x2="60" y2="7"
                    stroke="rgba(180,140,255,0.8)" stroke-width="3" stroke-linecap="round"/>
                </g>
              </svg>
              {{ t('decoding') }}
            </span>
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── Props / Emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  loading: boolean
  language: 'zh' | 'en'
}>()
const emit = defineEmits<{
  (e: 'submit', question: string, hexagram: {
    lines: number[]
    changingLines: boolean[]
    element: string
  }): void
}>()

// ─── i18n 极简实现 ────────────────────────────────────────────────────────────
const STRINGS: Record<string, Record<string, string | ((n: number) => string)>> = {
  zh: {
    inputQuestion: '输入你的问题',
    inputDesc:     '将意图明确化，系统才能精准解析时空节点。',
    placeholder:   '你想询问什么？\n例：近期事业发展方向如何？',
    confirmIntent: '确认意图 · CONFIRM',
    castTitle:     '起卦',
    castDesc:      '点击铜钱或按下投掷按钮，生成本次卦象（共六次）。',
    throwCoins:    '⟳ 投掷铜钱',
    casting:       '投掷中...',
    castComplete:  '✓ 六爻已完成',
    back:          '返回',
    recast:        '重新起卦',
    confirmTitle:  '确认占卜',
    confirmCast:   '确认卦象 · CAST',
    labelQuestion: '问题',
    labelHexagram: '卦象',
    hexReady:      '本卦已生成',
    changingLines: (n: number) => `含 ${n} 个变爻，命运流动中`,
    yao:           '爻',
    decode:        '解卦 · DECODE DESTINY',
    decoding:      '正在解析...',
  },
  en: {
    inputQuestion: 'ENTER YOUR QUESTION',
    inputDesc:     'Crystallize your intent — the system reads the nodes of space and time.',
    placeholder:   'What do you seek to know?\nE.g.: How should I approach my career this season?',
    confirmInt:    'Confirm Intent · CONFIRM',
    castTitle:     'CAST HEXAGRAM',
    castDesc:      'Click coins or press throw to generate the hexagram (6 throws).',
    throwCoins:    '⟳ THROW COINS',
    casting:       'Casting...',
    castComplete:  '✓ ALL 6 LINES CAST',
    back:          '← Back',
    recast:        '← Recast',
    confirmTitle:  'CONFIRM DIVINATION',
    confirmCast:   'Confirm · CAST',
    labelQuestion: 'Question',
    labelHexagram: 'Hexagram',
    hexReady:      'Hexagram Generated',
    changingLines: (n: number) => `${n} changing line${n > 1 ? 's' : ''} — fate in flux`,
    yao:           'lines',
    decode:        'DECODE DESTINY',
    decoding:      'Decoding...',
  },
}

function t(key: string, ...args: unknown[]): string {
  const dict = (STRINGS[props.language] ?? STRINGS.en) as Record<string, string | ((...a: unknown[]) => string)>
  const val = dict[key]
  if (typeof val === 'function') return val(...args)
  return val ?? key
}

// ─── 状态 ────────────────────────────────────────────────────────────────────
const step       = ref(1)
const question   = ref('')
const lines      = ref<number[]>([])
const isSpinning = ref(false)
const lastThrow  = ref<number[] | null>(null)
const coinHeights = ref<number[]>([0, 0, 0])

// 爻符号
const LINE_LABELS: Record<number, string> = {
  6: '⊗ old yin',
  7: '— yang',
  8: '-- yin',
  9: '⊙ old yang',
}

function lineClass(line: number) {
  return {
    yang:     line === 7 || line === 9,
    yin:      line === 6 || line === 8,
    changing: line === 6 || line === 9,
  }
}

// ─── 起卦逻辑 ────────────────────────────────────────────────────────────────
function throwCoins() {
  if (isSpinning.value || lines.value.length >= 6) return
  isSpinning.value = true
  coinHeights.value = [0, 1, 2].map(() => 28 + Math.random() * 48)
  setTimeout(() => {
    const coins = [0, 1, 2].map(() => Math.random() < 0.5 ? 3 : 2)
    const sum   = coins.reduce((a, b) => a + b, 0)
    lines.value  = [...lines.value, sum]
    lastThrow.value = coins
    isSpinning.value = false
    coinHeights.value = [0, 0, 0]
  }, 600)
}

function getCoinStyle(index: number) {
  const h = coinHeights.value[index] ?? 0
  return {
    animation: `coinBounce 0.6s cubic-bezier(0.22,0.61,0.36,1) ${index * 0.06}s forwards`,
    '--coin-jump': `-${h}px`,
  }
}

function resetAndBack() {
  lines.value = []
  lastThrow.value = null
  step.value = 1
}

// ─── 卦象数据 ────────────────────────────────────────────────────────────────
const hexagramData = computed(() => {
  if (lines.value.length < 6) return null
  const binaryLines  = lines.value.map(l => l % 2 === 1 ? 1 : 0)
  const changingLines = lines.value.map(l => l === 6 || l === 9)
  return {
    lines: binaryLines,
    changingLines,
    element: inferElement(binaryLines),
  }
})

const changingCount = computed(() =>
  hexagramData.value?.changingLines.filter(Boolean).length ?? 0
)

function inferElement(ls: number[]): string {
  const yang = ls.filter(l => l === 1).length
  if (yang >= 5) return '火'
  if (yang <= 1) return '水'
  if (yang === 3) return '木'
  return '土'
}

function confirmHexagram() {
  if (lines.value.length === 6) step.value = 3
}

function submit() {
  if (!hexagramData.value) return
  emit('submit', question.value, hexagramData.value)
}
</script>

<style scoped>
.divination-input {
  color: rgba(215, 195, 250, 0.92);
  font-family: 'Inter', 'Courier New', monospace;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.divination-input::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url('/sacred-mandala.svg');
  background-size: 260px;
  background-position: 50% 40%;
  background-repeat: no-repeat;
  z-index: 0;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(140, 100, 255, 0.25);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.header-tag   { font-size: 0.78rem; color: rgba(150, 120, 220, 0.75); }
.step-indicator { font-size: 0.75rem; color: rgba(170, 150, 210, 0.7); }

.step-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.step-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
  flex-shrink: 0;
}
.step-num { font-size: 2rem; color: rgba(140, 100, 255, 0.35); font-weight: bold; }
.step-title > span:last-child { font-size: 1.05rem; color: rgba(238, 225, 255, 0.92); }
.step-desc {
  font-size: 0.8rem;
  color: rgba(170, 150, 210, 0.7);
  margin-bottom: 1rem;
  line-height: 1.5;
  flex-shrink: 0;
}

.question-input {
  width: 100%;
  background: rgba(12, 10, 30, 0.7);
  border: 1px solid rgba(140, 100, 255, 0.3);
  border-radius: 4px;
  color: rgba(235, 220, 255, 0.92);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.75rem;
  resize: none;
  line-height: 1.6;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  flex-shrink: 0;
}
.question-input:focus { border-color: rgba(140, 100, 255, 0.7); }
.question-input::placeholder { color: rgba(140, 100, 255, 0.35); }
.char-count {
  font-size: 0.68rem;
  color: rgba(140, 100, 255, 0.5);
  text-align: right;
  margin-top: 4px;
  flex-shrink: 0;
}

.next-btn, .submit-btn {
  margin-top: 1rem;
  padding: 0.8rem;
  background: transparent;
  border: 1px solid rgba(140, 100, 255, 0.5);
  color: rgba(215, 195, 250, 0.9);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
  flex-shrink: 0;
}
.next-btn { width: 100%; }
.next-btn:hover:not(:disabled),
.submit-btn:hover:not(:disabled) {
  background: rgba(140, 100, 255, 0.15);
  border-color: rgba(180, 140, 255, 0.8);
  box-shadow: 0 0 18px rgba(140, 100, 255, 0.25);
}
.next-btn:disabled,
.submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.submit-btn {
  flex: 1;
  border-color: rgba(160, 100, 255, 0.8);
  background: rgba(140, 100, 255, 0.1);
}

.coin-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}
.coins-row { display: flex; gap: 1.5rem; margin-top: 0.25rem; }
.coin {
  width: 52px; height: 52px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(200, 160, 80, 0.5);
  background: radial-gradient(circle at 35% 35%, rgba(220,180,80,0.6), rgba(140,100,40,0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: rgba(255, 220, 120, 0.9);
  box-shadow: 0 0 12px rgba(200,160,80,0.2), inset 0 0 8px rgba(0,0,0,0.3);
  user-select: none;
  transition: box-shadow 0.2s, transform 0.3s;
}
.coin:hover { box-shadow: 0 0 22px rgba(200,160,80,0.55), inset 0 0 8px rgba(0,0,0,0.3); }
.coin-toss { animation: coinBounce var(--coin-dur, 0.6s) cubic-bezier(0.22,0.61,0.36,1) var(--coin-delay, 0s) forwards; }
.coin-landed { transform: translateY(0); transition: transform 0.1s; }
@keyframes coinBounce {
  0%   { transform: translateY(0) rotateY(0deg) scale(1); }
  20%  { transform: translateY(var(--coin-jump, -40px)) rotateY(120deg) scale(1.05); }
  40%  { transform: translateY(calc(var(--coin-jump, -40px) * 0.6)) rotateY(240deg) scale(0.95); }
  60%  { transform: translateY(calc(var(--coin-jump, -40px) * 0.2)) rotateY(340deg) scale(1); }
  80%  { transform: translateY(0) rotateY(350deg) scale(0.98); }
  100% { transform: translateY(0) rotateY(360deg) scale(1); }
}

.throw-btn {
  padding: 0.65rem 2rem;
  background: rgba(200, 160, 80, 0.12);
  border: 1px solid rgba(200, 160, 80, 0.45);
  color: rgba(220, 185, 120, 0.9);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.25s;
  min-width: 200px;
}
.throw-btn:hover:not(:disabled) {
  background: rgba(200, 160, 80, 0.22);
  border-color: rgba(200, 160, 80, 0.8);
  box-shadow: 0 0 14px rgba(200, 160, 80, 0.25);
}
.throw-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.lines-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}
.preview-line {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 12px;
}
.yang-line {
  width: 80px; height: 5px;
  background: rgba(225,210,255,0.9);
  border-radius: 2px;
}
.yin-left, .yin-right {
  width: 34px; height: 5px;
  background: rgba(225,210,255,0.9);
  border-radius: 2px;
}
.yin-gap { width: 12px; }
.preview-line.changing .yang-line,
.preview-line.changing .yin-left,
.preview-line.changing .yin-right {
  background: rgba(255, 190, 90, 0.9);
  box-shadow: 0 0 5px rgba(255, 180, 80, 0.5);
}
.empty-line {
  width: 80px; height: 5px;
  background: rgba(140, 100, 255, 0.12);
  border-radius: 2px;
  border: 1px dashed rgba(140, 100, 255, 0.15);
}
.line-value {
  font-size: 0.6rem;
  color: rgba(150, 130, 210, 0.6);
  margin-left: 6px;
  white-space: nowrap;
  min-width: 60px;
}
.throw-count {
  font-size: 0.7rem;
  color: rgba(140, 100, 255, 0.55);
  letter-spacing: 0.05em;
}

.confirm-summary { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.75rem; flex-shrink: 0; }
.summary-row {
  display: flex;
  gap: 1rem;
  padding: 0.65rem;
  background: rgba(140,100,255,0.08);
  border: 1px solid rgba(140,100,255,0.2);
  border-radius: 4px;
  align-items: center;
}
.srow-label { font-size: 0.7rem; color: rgba(150,120,220,0.7); min-width: 3rem; flex-shrink: 0; }
.srow-value { font-size: 0.85rem; color: rgba(215,195,250,0.9); line-height: 1.5; display: flex; align-items: center; }
.changing-hint {
  font-size: 0.7rem;
  color: rgba(255, 190, 90, 0.75);
  letter-spacing: 0.04em;
  padding: 0.4rem 0.75rem;
  border-left: 2px solid rgba(255, 180, 80, 0.4);
  background: rgba(255, 180, 80, 0.06);
}

.step-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.75rem;
  flex-shrink: 0;
}
.back-btn {
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1px solid rgba(140,100,255,0.2);
  color: rgba(170,150,210,0.7);
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover { border-color: rgba(140,100,255,0.4); color: rgba(190,170,230,0.85); }

.loading-span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.mini-loader { flex-shrink: 0; }
.loader-line {
  animation: linePulse 1.2s ease-in-out infinite alternate;
  opacity: 0.3;
}
@keyframes linePulse {
  0%   { opacity: 0.15; }
  100% { opacity: 1; }
}

.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.step-fade-enter-from { opacity: 0; transform: translateX(16px); }
.step-fade-leave-to   { opacity: 0; transform: translateX(-16px); }
</style>
