<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CoinToss from '@/components/CoinToss.vue'
import GuardianDisplay from '@/components/GuardianDisplay.vue'
import { linesToHexagram, lineIsYang, lineIsChanging, computeHash } from '@/lib/iching'
import { useSound } from '@/composables/useSound'
import { supabase } from '@/lib/supabase'
import type { LineValue, GuardianKey, DivinationLog } from '@/types'

const router = useRouter()
const { coinClang, hexagramReveal, sealChime } = useSound()

// ─── Restore ritual context from step 1 ──────────────────────────────────────
interface RitualContext {
  guardianKey: GuardianKey
  question: string
  mansionIndex: number
  ganzhiDay: string
}

const ctx = ref<RitualContext>({
  guardianKey: 'azure',
  question: '',
  mansionIndex: 0,
  ganzhiDay: '',
})

onMounted(() => {
  const raw = sessionStorage.getItem('cyber-tao-ritual')
  if (!raw) { router.replace({ name: 'home' }); return }
  try { ctx.value = JSON.parse(raw) as RitualContext }
  catch { router.replace({ name: 'home' }) }
})

// ─── Casting state ────────────────────────────────────────────────────────────
const lines = ref<LineValue[]>([])
const isComplete = computed(() => lines.value.length === 6)
const isSealing = ref(false)
const sealError = ref<string | null>(null)

const lineCount = computed(() => lines.value.length)
const promptText = computed(() => {
  if (isComplete.value) return '卦象已成 · HEXAGRAM COMPLETE'
  return `第 ${lineCount.value + 1} 爻 · LINE ${lineCount.value + 1} OF 6`
})

// ─── Hexagram preview (grows as lines are cast) ───────────────────────────────
function lineYang(v: LineValue) { return lineIsYang(v) }
function lineChanging(v: LineValue) { return lineIsChanging(v) }

// ─── Receive toss result from CoinToss component ──────────────────────────────
async function onToss(val: LineValue) {
  if (isComplete.value) return
  coinClang()
  lines.value.push(val)
  if (lines.value.length === 6) {
    hexagramReveal()
    await new Promise(r => setTimeout(r, 1200))
    await sealAndNavigate()
  }
}

// ─── Seal: write to Supabase, compute hash, navigate to result ──────────
async function sealAndNavigate() {
  isSealing.value = true
  sealError.value = null
  try {
    const hex = linesToHexagram(lines.value)
    const createdAt = new Date().toISOString()
    const hash = await computeHash(createdAt, ctx.value.question, lines.value)

    const { data, error: insertErr } = await supabase
      .from('divination_logs')
      .insert({
        created_at: createdAt,
        question: ctx.value.question,
        guardian_key: ctx.value.guardianKey,
        hexagram_index: hex.index,
        lines: lines.value,
        mansion_index: ctx.value.mansionIndex,
        ganzhi: ctx.value.ganzhiDay,
        fortune_zh: hex.judgment,
        fortune_en: hex.judgmentEn,
        verified_hash: hash,
      })
      .select('*')
      .single()

    if (insertErr || !data) throw new Error(insertErr?.message ?? 'Insert failed')

    sealChime()
    sessionStorage.setItem('cyber-tao-result', JSON.stringify(data))
    router.push({ name: 'result', params: { id: data.id } })
  } catch (e) {
    sealError.value = String(e)
    isSealing.value = false
  }
}

function goBack() { router.push({ name: 'home' }) }
</script>

<template>
  <div class="cast-root">
    <!-- Aurora bg -->
    <div class="cast-aurora" aria-hidden="true" />

    <div class="cast-inner">
      <!-- Top bar -->
      <div class="cast-topbar">
        <button class="back-btn" @click="goBack" aria-label="Back to step 1">
          ‹ 返回
        </button>
        <span class="cast-title">投币起卦 · CAST THE HEXAGRAM</span>
        <div class="cast-step">2 / 3</div>
      </div>

      <!-- Guardian with glow -->
      <div class="guardian-area">
        <GuardianDisplay :guardian-key="ctx.guardianKey" :size="180" />
        <div class="question-echo">{{ ctx.question }}</div>
      </div>

      <!-- Progress dots -->
      <div class="progress-row" role="progressbar" :aria-valuenow="lineCount" aria-valuemin="0" aria-valuemax="6">
        <div v-for="i in 6" :key="i"
          :class="['prog-dot',
            { done: i <= lineCount, active: i === lineCount + 1 }
          ]"
        />
      </div>

      <!-- Hexagram preview — builds bottom-to-top -->
      <div class="hex-preview" aria-label="Hexagram being formed">
        <div v-for="(_, i) in 6" :key="i" class="hex-row"
          :style="{ animationDelay: i * 0.08 + 's' }"
        >
          <template v-if="lines[5 - i] !== undefined">
            <!-- Yang: solid bar -->
            <div v-if="lineYang(lines[5 - i]!)"
              class="hex-bar yang"
              :class="{ changing: lineChanging(lines[5 - i]!) }"
            />
            <!-- Yin: two segments -->
            <template v-else>
              <div class="hex-bar yin-l" :class="{ changing: lineChanging(lines[5 - i]!) }" />
              <div class="hex-gap" />
              <div class="hex-bar yin-r" :class="{ changing: lineChanging(lines[5 - i]!) }" />
            </template>
          </template>
          <!-- Empty slot -->
          <div v-else class="hex-empty" />
        </div>
      </div>

      <!-- Cast prompt -->
      <p class="cast-prompt" :class="{ complete: isComplete }">{{ promptText }}</p>

      <!-- Coin toss component -->
      <CoinToss
        v-if="!isSealing"
        :disabled="isComplete"
        @toss="onToss"
      />

      <!-- Sealing indicator -->
      <div v-if="isSealing" class="sealing-indicator">
        <div class="seal-spinner" />
        <span>天命封印中 · Sealing your fate…</span>
      </div>

      <!-- Error -->
      <div v-if="sealError" class="seal-error">
        <p>封印失败 · Seal failed</p>
        <p class="error-detail">{{ sealError }}</p>
        <button class="retry-btn" @click="sealAndNavigate">重试 · Retry</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cast-root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #07041a; display: flex; flex-direction: column; }
.cast-aurora { position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 70% 55% at 50% 35%, rgba(55,20,110,0.9) 0%, rgba(7,4,26,0.98) 70%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(20,60,140,0.4) 0%, transparent 60%); }
.cast-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; height: 100%; overflow-y: auto; padding: 0 16px 40px; gap: 0; }

.cast-topbar { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 0 10px; border-bottom: 0.5px solid rgba(201,168,76,0.12); margin-bottom: 12px; flex-shrink: 0; }
.back-btn { background: transparent; border: none; color: rgba(201,168,76,0.55); font-size: 14px; cursor: pointer; padding: 4px 8px; letter-spacing: .04em; }
.back-btn:hover { color: #c9a84c; }
.cast-title { font-size: 13px; color: rgba(201,168,76,0.65); letter-spacing: .1em; }
.cast-step { font-size: 11px; color: rgba(201,168,76,0.35); letter-spacing: .06em; }

.guardian-area { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 8px; }
.question-echo { max-width: 280px; text-align: center; font-size: 13px; color: rgba(220,210,255,0.6); font-style: italic; line-height: 1.6; padding: 6px 12px; border-radius: 8px; background: rgba(201,168,76,0.04); border: 0.5px solid rgba(201,168,76,0.1); }

.progress-row { display: flex; gap: 7px; margin-bottom: 14px; }
.prog-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(201,168,76,0.12); border: 0.5px solid rgba(201,168,76,0.25); transition: background .3s, box-shadow .3s; }
.prog-dot.done   { background: rgba(201,168,76,0.65); }
.prog-dot.active { background: #c9a84c; box-shadow: 0 0 8px rgba(201,168,76,0.7); animation: pulseRing 1.8s ease-in-out infinite; }

.hex-preview { display: flex; flex-direction: column; gap: 6px; align-items: center; margin-bottom: 10px; min-height: 84px; }
.hex-row { display: flex; align-items: center; gap: 0; height: 10px; animation: fadeUp .25s ease-out both; }
.hex-bar { height: 6px; border-radius: 3px; transition: background .3s; }
.yang   { width: 80px; background: #c9a84c; }
.yin-l  { width: 34px; background: #c9a84c; }
.yin-r  { width: 34px; background: #c9a84c; }
.hex-gap { width: 12px; }
.hex-empty { width: 80px; height: 5px; border-radius: 3px; background: rgba(201,168,76,0.1); border: 0.5px dashed rgba(201,168,76,0.2); }
.changing { background: #e8a040 !important; box-shadow: 0 0 6px rgba(232,160,64,0.6); }

.cast-prompt { font-size: 12px; color: rgba(201,168,76,0.55); letter-spacing: .08em; text-align: center; margin-bottom: 8px; transition: color .3s; }
.cast-prompt.complete { color: #c9a84c; font-weight: 500; }

.sealing-indicator { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; color: rgba(201,168,76,0.65); font-size: 13px; letter-spacing: .06em; }
.seal-spinner { width: 32px; height: 32px; border: 1.5px solid rgba(201,168,76,0.2); border-top-color: #c9a84c; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.seal-error { text-align: center; padding: 16px; background: rgba(139,26,26,0.2); border: 0.5px solid rgba(139,26,26,0.4); border-radius: 10px; width: 100%; }
.seal-error p { color: #e06060; font-size: 13px; margin-bottom: 4px; }
.error-detail { font-size: 10px; color: rgba(224,96,96,0.6); font-family: monospace; word-break: break-all; }
.retry-btn { margin-top: 10px; padding: 7px 20px; background: rgba(139,26,26,0.4); border: 0.5px solid rgba(224,96,96,0.4); border-radius: 14px; color: #e06060; font-size: 12px; cursor: pointer; }
</style>
