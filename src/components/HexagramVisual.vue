<template>
  <div class="hexagram-visual">
    <div class="visual-label">卦象 · HEXAGRAM_GLYPH</div>
    <svg :viewBox="'0 0 60 84'" width="60" height="84" class="hex-svg">
      <g v-for="(line, i) in hexagramLines" :key="i" :transform="`translate(0, ${i * 14})`">
        <!-- 阳爻：实线 -->
        <line v-if="line === 1" x1="0" y1="7" x2="60" y2="7"
          stroke="rgba(200,180,255,0.9)" stroke-width="3" stroke-linecap="round"/>
        <!-- 阴爻：断线 -->
        <template v-else>
          <line x1="0" y1="7" x2="25" y2="7"
            stroke="rgba(200,180,255,0.9)" stroke-width="3" stroke-linecap="round"/>
          <line x1="35" y1="7" x2="60" y2="7"
            stroke="rgba(200,180,255,0.9)" stroke-width="3" stroke-linecap="round"/>
        </template>
        <!-- 变爻标记 -->
        <circle v-if="line === 6 || line === 9"
          cx="30" cy="7" r="3"
          fill="none" stroke="rgba(255,180,80,0.8)" stroke-width="1.5"/>
      </g>
    </svg>
    <div class="hex-binary" v-if="hexagram">
      {{ hexagram.binary ?? '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ hexagram: any }>()

const hexagramLines = computed(() => {
  // hexagram.lines 应该是 6 位数组，从下到上，1=阳,0=阴,6=阴变,9=阳变
  if (!props.hexagram?.lines) return [1,0,1,0,1,0]
  return [...props.hexagram.lines].reverse() // SVG从上画到下，卦从下读到上
})
</script>

<style scoped>
.hexagram-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(120, 80, 255, 0.05);
  border: 1px solid rgba(120, 80, 255, 0.15);
  border-radius: 4px;
}
.visual-label { font-size: 0.6rem; color: rgba(120, 80, 255, 0.6); font-family: monospace; }
.hex-svg { filter: drop-shadow(0 0 4px rgba(200, 180, 255, 0.3)); }
.hex-binary { font-family: monospace; font-size: 0.6rem; color: rgba(120, 80, 255, 0.5); letter-spacing: 0.2em; }
</style>
