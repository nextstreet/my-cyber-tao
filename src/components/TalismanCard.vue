<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'
import { GUARDIANS } from '@/lib/guardians'
import type { Hexagram, GuardianKey } from '@/types'

function cornerStyles(size: string) {
  const runes = ['乾', '坤', '離', '坎']
  const offsets: Array<Record<string, string>> = [
    { top: '-0.5rem', left: '-0.5rem' },
    { top: '-0.5rem', right: '-0.5rem' },
    { bottom: '-0.5rem', left: '-0.5rem' },
    { bottom: '-0.5rem', right: '-0.5rem' },
  ]
  return runes.map((label, i) => ({
    label,
    style: { position: 'absolute' as const, fontSize: size, color: 'rgba(200,170,110,0.6)', ...offsets[i] },
  }))
}

const props = defineProps<{
  hexagram: Hexagram
  guardianKey: GuardianKey
  verifiedHash: string
  ganzhiDay: string
  mansionSymbol: string
}>()

const emit = defineEmits<{ (e: 'share'): void }>()
const guardian = computed(() => GUARDIANS[props.guardianKey])
const corners = cornerStyles('2.2rem')
const scanRaf = ref<number | null>(null)
const scanY = ref(0)
const showScan = ref(false)

const GUARDIAN_NAMES: Record<GuardianKey, string> = {
  azure: '青龙', vermilion: '朱雀', white: '白虎', black: '玄武',
}

function startScan() {
  showScan.value = true
  scanY.value = 0
  function loop() {
    scanY.value = (scanY.value + 1.2) % 100
    scanRaf.value = requestAnimationFrame(loop)
  }
  scanRaf.value = requestAnimationFrame(loop)
}

function stopScan() {
  showScan.value = false
  if (scanRaf.value !== null) { cancelAnimationFrame(scanRaf.value); scanRaf.value = null }
}

onMounted(() => { setTimeout(startScan, 500) })
onUnmounted(() => stopScan())

const cardStyle = computed((): CSSProperties => ({
  borderColor: guardian.value.color + '66',
  boxShadow: `0 0 40px ${guardian.value.glowColor}, inset 0 0 60px rgba(0,0,0,0.5)`,
}))

const hexSymbolStyle = computed((): CSSProperties => ({
  color: guardian.value.color,
  textShadow: `0 0 20px ${guardian.value.glowColor}`,
}))
</script>

<template>
  <div class="talisman-outer" :style="cardStyle">
    <!-- Corner runes -->
    <div v-for="(c, i) in corners" :key="i" :style="c.style" class="corner-rune">
      {{ c.label }}
    </div>

    <!-- Animated scan line -->
    <div v-if="showScan" class="scan-line" :style="{ top: scanY + '%' }" />

    <!-- Hexagram seal header -->
    <div class="tc-header">
      <div class="tc-hexsym" :style="hexSymbolStyle">{{ hexagram.symbol }}</div>
      <div class="tc-hexname">{{ hexagram.nameZh }} · {{ hexagram.nameEn }}</div>
      <div class="tc-meta">
        <span>{{ GUARDIAN_NAMES[guardianKey] }}</span>
        <span class="tc-dot">·</span>
        <span>{{ mansionSymbol }}宿</span>
        <span class="tc-dot">·</span>
        <span>{{ ganzhiDay }}</span>
      </div>
    </div>

    <!-- Judgement (卦辞) -->
    <div class="tc-judgement">
      <div class="tc-jlabel">卦辞 · Judgement</div>
      <div class="tc-jtext">{{ hexagram.judgment }}</div>
    </div>

    <!-- Oracle fortune (象辞 / extended) -->
    <div class="tc-fortune">
      <div class="tc-flabel">天机 · Oracle</div>
      <div class="tc-ftext">{{ hexagram.image }}</div>
      <div class="tc-fen">{{ hexagram.judgmentEn }}</div>
    </div>

    <!-- Cryptographic seal row -->
    <div class="tc-hash">
      <span class="tc-hash-icon">✦</span>
      <span class="tc-hash-label">已封印 · SEALED</span>
      <span class="tc-hash-val">{{ verifiedHash.slice(0, 16) }}</span>
    </div>

    <!-- Share button -->
    <button class="tc-share" @click="$emit('share')">
      分享天命 · Share Fate
    </button>
  </div>
</template>

<style scoped>
.talisman-outer {
  position: relative;
  background: linear-gradient(160deg, rgba(13,8,32,0.97) 0%, rgba(20,10,50,0.97) 100%);
  border: 0.5px solid;
  border-radius: 16px;
  padding: 20px 16px 16px;
  overflow: hidden;
  width: 100%;
  max-width: 380px;
}
.corner-rune {
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: rgba(201,168,76,0.35); pointer-events: none;
}
.scan-line {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
  pointer-events: none; transition: top 0s;
}
.tc-header { text-align: center; margin-bottom: 14px; }
.tc-hexsym { font-size: 44px; line-height: 1; }
.tc-hexname { font-size: 15px; color: #e8d4a0; font-weight: 500; margin-top: 4px; letter-spacing: .06em; }
.tc-meta { font-size: 10px; color: rgba(201,168,76,0.5); margin-top: 5px; letter-spacing: .05em; }
.tc-dot { margin: 0 5px; }
.tc-judgement {
  background: rgba(201,168,76,0.05); border: 0.5px solid rgba(201,168,76,0.15);
  border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;
}
.tc-jlabel { font-size: 9px; color: rgba(201,168,76,0.45); letter-spacing: .08em; margin-bottom: 3px; }
.tc-jtext { font-size: 13px; color: #e8d4a0; letter-spacing: .06em; }
.tc-fortune {
  background: rgba(30,15,70,0.6); border: 0.5px solid rgba(100,80,200,0.2);
  border-radius: 8px; padding: 10px 12px; margin-bottom: 10px;
}
.tc-flabel { font-size: 9px; color: rgba(201,168,76,0.45); letter-spacing: .08em; margin-bottom: 5px; }
.tc-ftext { font-size: 13px; color: rgba(220,210,255,0.9); line-height: 1.75; letter-spacing: .03em; margin-bottom: 6px; }
.tc-fen { font-size: 11px; color: rgba(180,170,220,0.6); line-height: 1.6; font-style: italic; }
.tc-hash {
  display: flex; align-items: center; gap: 6px;
  background: rgba(42,140,90,0.07); border: 0.5px solid rgba(42,140,90,0.2);
  border-radius: 6px; padding: 6px 10px; margin-bottom: 12px;
}
.tc-hash-icon { font-size: 11px; color: #6ed48a; }
.tc-hash-label { font-size: 10px; color: rgba(110,212,138,0.7); flex: 1; }
.tc-hash-val { font-size: 9px; color: rgba(110,212,138,0.45); font-family: monospace; }
.tc-share {
  width: 100%; padding: 11px;
  background: linear-gradient(135deg, rgba(80,20,140,0.55), rgba(139,26,26,0.55));
  border: 0.5px solid rgba(201,168,76,0.4);
  border-radius: 20px; color: #c9a84c; font-size: 13px;
  letter-spacing: .1em; font-weight: 500; cursor: pointer; transition: opacity .15s;
}
.tc-share:active { opacity: .7; }
</style>
