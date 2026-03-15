<template>
  <!-- GODLIKE 全屏故障特效遮罩 -->
  <div
    v-if="godlikeTriggered"
    class="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
    :class="{ 'godlike-active': godlikeTriggered }"
  >
    <div class="absolute inset-0 glitch-overlay"></div>
    <div class="absolute inset-0 rgb-dispersion"></div>
    <div class="absolute inset-0 scanlines-heavy"></div>
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 screen-shake"
    >
      <div class="text-[10px] font-mono tracking-[1em] text-rose-400 animate-pulse uppercase mb-2">
        ⚠ GODLIKE SYNC ACHIEVED
      </div>
      <div
        class="text-6xl font-serif text-rose-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse"
      >
        {{ props.hexagramData?.nameZh }}
      </div>
    </div>
  </div>

  <!-- 主弹窗 -->
  <div
    v-if="showModal"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl overflow-y-auto"
  >
    <!-- 稀有度标签 -->
    <div class="flex items-center gap-4 mb-5 animate-fade-in">
      <div class="h-px w-10 bg-white/15"></div>
      <div
        :class="[
          'text-[9px] tracking-[0.6em] font-black uppercase px-3 py-1 border font-mono',
          rarityColor,
        ]"
        :style="rarityGlowStyle"
      >
        {{ rarityLabel }} // SYNC: {{ syncRate }}%
      </div>
      <div class="h-px w-10 bg-white/15"></div>
    </div>

    <!-- 卡片容器 -->
    <div
      class="relative w-[82vw] max-w-[380px] aspect-[9/16] perspective-2000"
      @click="isFlipped = !isFlipped"
    >
      <div
        class="relative w-full h-full transition-all duration-1000 transform-style-3d cursor-pointer"
        :class="{ 'rotate-y-180': isFlipped }"
        :style="[
          visualSeedStyles,
          godlikeTriggered ? 'animation: godlike-shake 0.3s ease-in-out' : '',
        ]"
      >
        <!-- ══════════════ FRONT FACE ══════════════ -->
        <div
          class="absolute inset-0 backface-hidden rounded-xl border bg-[#050505] flex flex-col overflow-hidden"
          :style="{ borderColor: cardBorderColor }"
        >
          <!-- 背景网格 -->
          <div class="absolute inset-0 cyber-grid opacity-[0.06]" :style="gridOffsetStyle"></div>
          <!-- 噪点纹理层（视觉种子驱动） -->
          <div class="absolute inset-0 noise-layer pointer-events-none" :style="noiseStyle"></div>

          <!-- HUD 数据层 - 顶边 -->
          <div
            class="absolute top-0 inset-x-0 flex justify-between items-center px-2 py-1 z-20 pointer-events-none"
          >
            <span class="text-[6px] font-mono tracking-wider" :style="hudTextStyle"
              >SYNC·{{ syncRate }}%</span
            >
            <span class="text-[6px] font-mono tracking-wider" :style="hudTextStyle"
              >ENTROPY·{{ entropyLabel }}</span
            >
          </div>

          <!-- Header -->
          <div
            class="relative pt-6 px-4 pb-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02] z-10"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-7 h-7 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center shrink-0"
              >
                <span class="text-[8px] text-white/40 font-mono">ID</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[8px] font-mono tracking-widest uppercase text-white/50"
                  >TEMPORAL LINK</span
                >
                <span class="text-[7px] text-white/25 font-mono tracking-wider">{{
                  userHash
                }}</span>
              </div>
            </div>
            <div class="text-[7px] font-mono text-right" :style="hudTextStyle">
              <div>{{ lunarDateStamp }}</div>
              <div class="text-white/20 mt-0.5">{{ cardTimestamp }}</div>
            </div>
          </div>

          <!-- 雷达图区域 -->
          <div
            class="relative flex-1 flex flex-col items-center justify-center p-5 border-b border-white/5 z-10"
          >
            <h1 class="text-xl font-serif text-white/90 tracking-[0.3em] uppercase mb-3">
              {{ hexagramData.name }}
            </h1>
            <div class="relative w-full aspect-square max-w-[180px]">
              <svg viewBox="0 0 100 100" class="w-full h-full" :style="radarGlowStyle">
                <!-- 外多边形框 -->
                <polygon
                  points="50,8 92,36 76,86 24,86 8,36"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  stroke-width="0.5"
                />
                <polygon
                  points="50,22 74,40 66,71 34,71 26,40"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  stroke-width="0.5"
                />
                <!-- 轴线 -->
                <line
                  x1="50"
                  y1="8"
                  x2="50"
                  y2="22"
                  stroke="rgba(255,255,255,0.05)"
                  stroke-width="0.3"
                />
                <line
                  x1="92"
                  y1="36"
                  x2="74"
                  y2="40"
                  stroke="rgba(255,255,255,0.05)"
                  stroke-width="0.3"
                />
                <!-- 数据多边形 -->
                <polygon
                  :points="radarPoints"
                  fill="currentColor"
                  class="opacity-20"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <!-- 标签 -->
                <g class="text-[4px] fill-white/40 font-mono">
                  <text x="50" y="6" text-anchor="middle">秩序</text>
                  <text x="95" y="37" text-anchor="start">感知</text>
                  <text x="76" y="93" text-anchor="middle">根源</text>
                  <text x="24" y="93" text-anchor="middle">同步</text>
                  <text x="5" y="37" text-anchor="end">混沌</text>
                </g>
              </svg>
            </div>
          </div>

          <!-- 底部摘要 -->
          <div
            class="relative p-4 flex flex-col gap-3 bg-gradient-to-t from-white/[0.04] to-transparent z-10"
          >
            <div class="w-6 h-px bg-white/25"></div>
            <p class="text-white/70 font-mono text-[9px] leading-relaxed italic line-clamp-3">
              {{ shortAiText }}
            </p>
            <div class="flex justify-between items-end">
              <span
                class="text-[8px] text-white/30 font-serif tracking-[0.5em] [writing-mode:vertical-rl] border-l border-white/10 pl-1.5"
              >
                {{ lunarDateStamp }}
              </span>
              <span class="text-[7px] text-white/15 font-mono tracking-widest"
                >SYS V2.0 // DECODED</span
              >
            </div>
          </div>

          <!-- HUD 数据层 - 右边 -->
          <div
            class="absolute right-0 top-16 bottom-16 flex flex-col justify-between items-end pr-1.5 z-20 pointer-events-none"
          >
            <span
              class="text-[5px] font-mono [writing-mode:vertical-rl] tracking-wider"
              :style="hudTextStyle"
              >KARMA·{{ karmaIndex }}</span
            >
            <span
              class="text-[5px] font-mono [writing-mode:vertical-rl] tracking-wider"
              :style="hudTextStyle"
              >FLUX·{{ fluxRate }}</span
            >
          </div>

          <!-- HUD 数据层 - 左边 -->
          <div
            class="absolute left-0 top-16 bottom-16 flex flex-col justify-between items-start pl-1.5 z-20 pointer-events-none"
          >
            <span
              class="text-[5px] font-mono [writing-mode:vertical-rl] tracking-wider rotate-180"
              :style="hudTextStyle"
              >NODE·{{ nodeId }}</span
            >
            <span
              class="text-[5px] font-mono [writing-mode:vertical-rl] tracking-wider rotate-180"
              :style="hudTextStyle"
              >VER·2.0.{{ versionSuffix }}</span
            >
          </div>
        </div>

        <!-- ══════════════ BACK FACE ══════════════ -->
        <div
          class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border bg-[#050505] overflow-hidden flex flex-col"
          :style="{ borderColor: cardBorderColor }"
        >
          <!-- 神兽图像层 -->
          <div class="relative h-[55%] w-full border-b border-tao-gold/20">
            <img
              :src="beastImageUrl"
              class="absolute inset-0 w-full h-full object-cover opacity-65 mix-blend-screen scale-105"
            />

            <!-- 电路板符咒 SVG 层 -->
            <svg
              class="absolute inset-0 w-full h-full z-10 pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              :style="circuitGlowStyle"
            >
              <!-- 经典符咒路径 + 电路板节点 -->
              <g fill="none" stroke="#c8aa6e" stroke-width="0.4" opacity="0.7">
                <!-- 流动符咒笔画 -->
                <path
                  v-for="(path, i) in talismanPaths"
                  :key="`t${i}`"
                  :d="path"
                  stroke-width="0.5"
                  class="circuit-pulse"
                  :style="`animation-delay: ${i * 0.7}s`"
                />
                <!-- 电路板节点 -->
                <circle
                  v-for="(node, i) in circuitNodes"
                  :key="`n${i}`"
                  :cx="node.x"
                  :cy="node.y"
                  r="1.2"
                  :fill="node.filled ? '#c8aa6e' : 'none'"
                  stroke="#c8aa6e"
                  stroke-width="0.4"
                  class="circuit-pulse"
                  :style="`animation-delay: ${i * 0.4}s`"
                />
                <!-- 横线连接 -->
                <line
                  v-for="(line, i) in circuitLines"
                  :key="`l${i}`"
                  :x1="line.x1"
                  :y1="line.y1"
                  :x2="line.x2"
                  :y2="line.y2"
                  stroke-width="0.3"
                  opacity="0.5"
                  class="circuit-pulse"
                  :style="`animation-delay: ${i * 0.6}s`"
                />
              </g>
              <!-- 四角古典纹样 -->
              <g stroke="#c8aa6e" stroke-width="0.6" fill="none" opacity="0.5">
                <path d="M5,5 L15,5 L15,8 M5,5 L5,15 L8,15" />
                <path d="M95,5 L85,5 L85,8 M95,5 L95,15 L92,15" />
                <path d="M5,95 L15,95 L15,92 M5,95 L5,85 L8,85" />
                <path d="M95,95 L85,95 L85,92 M95,95 L95,85 L92,85" />
              </g>
            </svg>

            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/30 to-[#050505] z-20"
            ></div>
            <div
              class="absolute top-3 left-3 text-[7px] text-tao-gold/40 tracking-[0.5em] font-serif uppercase z-30"
            >
              Sacred Entity
            </div>

            <!-- GODLIKE 专属标记 -->
            <div v-if="isGodlike" class="absolute top-3 right-3 z-30">
              <span
                class="text-[7px] font-mono tracking-widest text-rose-400 border border-rose-500/40 px-1.5 py-0.5 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              >
                ⚡ GODLIKE
              </span>
            </div>
          </div>

          <!-- 信息区 -->
          <div
            class="relative h-[45%] w-full p-5 flex justify-between items-start bg-gradient-to-t from-[#0a0a0a] to-[#050505]"
          >
            <!-- 噪点层 -->
            <div
              class="absolute inset-0 noise-layer pointer-events-none opacity-50"
              :style="noiseStyle"
            ></div>

            <div class="flex gap-5 h-full z-10">
              <h1
                class="text-5xl font-serif text-tao-gold tracking-widest font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)] h-full"
                :style="goldNeonStyle"
              >
                {{ hexagramData.nameZh }}
              </h1>
              <div class="w-px h-3/4 bg-tao-gold/20 my-auto"></div>
              <p
                class="text-white/80 text-base font-serif tracking-[0.4em] [writing-mode:vertical-rl] leading-loose h-full pt-2"
              >
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="flex flex-col items-end justify-between h-full pb-2 z-10">
              <div
                class="text-[8px] text-tao-gold/30 tracking-[0.8em] font-serif uppercase [writing-mode:vertical-rl]"
              >
                Divine Archive
              </div>
              <div class="p-1 border border-tao-gold/20 bg-black/80 backdrop-blur-sm">
                <img src="/qr-code.png" class="w-9 h-9 grayscale brightness-125 contrast-125" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-6 flex flex-col items-center gap-3 animate-fade-up">
      <div class="flex gap-3">
        <button
          @click="downloadImage('poster')"
          class="px-5 py-2.5 bg-white/8 border border-white/20 text-white text-[9px] tracking-[0.3em] hover:bg-white/15 transition-colors uppercase"
        >
          Save 9:16 Poster
        </button>
        <button
          @click="downloadImage('square')"
          class="px-5 py-2.5 bg-tao-gold/15 border border-tao-gold/40 text-tao-gold text-[9px] tracking-[0.3em] font-bold hover:bg-tao-gold/25 transition-colors uppercase shadow-[0_0_15px_rgba(200,170,110,0.2)]"
        >
          IG 1:1 Square
        </button>
      </div>
      <button
        @click="close"
        class="text-white/25 text-[9px] tracking-[0.4em] hover:text-white/60 transition-colors uppercase mt-1"
      >
        Dismiss
      </button>
    </div>
  </div>

  <!-- 导出用隐藏 DOM -->
  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div
      ref="posterRef"
      class="w-[1080px] h-[1920px] bg-[#050505] flex flex-col overflow-hidden relative border-[16px] border-[#0a0a0a]"
    >
      <img
        :src="beastImageUrl"
        class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110"
      />
      <div class="z-10 w-full p-16 flex justify-between items-start border-b border-tao-gold/20">
        <div class="flex flex-col gap-4">
          <h2 class="text-[54px] font-serif text-white/90 tracking-[0.3em] uppercase">
            {{ hexagramData.name }}
          </h2>
          <div class="text-[24px] text-white/40 font-mono tracking-[0.5em] uppercase">
            USER HASH: {{ userHash }}
          </div>
          <div class="text-[20px] text-tao-gold/40 font-mono tracking-widest">
            SYNC: {{ syncRate }}% · {{ rarityLabel }}
          </div>
        </div>
        <div
          class="text-[28px] text-tao-gold/60 font-serif tracking-[0.5em] [writing-mode:vertical-rl]"
        >
          {{ lunarDateStamp }}
        </div>
      </div>
      <div class="z-10 flex-1 w-full p-20 flex justify-center items-center relative">
        <h1
          class="text-[280px] font-serif text-tao-gold tracking-[0.1em] font-bold [writing-mode:vertical-rl] absolute right-[35%]"
        >
          {{ hexagramData.nameZh }}
        </h1>
        <p
          class="text-[72px] text-white/90 font-serif tracking-[0.4em] [writing-mode:vertical-rl] leading-relaxed absolute left-[25%]"
        >
          {{ hexagramData.poemZh }}
        </p>
      </div>
      <div class="z-10 w-full p-16 bg-[#0a0a0a]/80 border-t border-white/10 flex gap-12 items-end">
        <div class="flex-1">
          <p class="text-[34px] text-white/80 font-mono italic leading-[1.6] text-justify">
            {{ aiPredictionText }}
          </p>
        </div>
        <div class="flex flex-col items-center gap-6 border-l border-tao-gold/20 pl-12 shrink-0">
          <span
            class="text-[20px] text-tao-gold/40 font-serif tracking-[0.8em] [writing-mode:vertical-rl] uppercase"
            >Sync Rate: {{ syncRate }}%</span
          >
          <img
            src="/qr-code.png"
            class="w-40 h-40 grayscale brightness-150 p-4 border border-tao-gold/30 bg-black/60"
          />
        </div>
      </div>
    </div>

    <div
      ref="squareRef"
      class="w-[1080px] h-[1080px] bg-[#050505] flex flex-col justify-between overflow-hidden relative border-[20px] border-[#0a0a0a] p-16"
    >
      <img
        :src="beastImageUrl"
        class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen scale-125"
      />
      <div class="z-10 flex justify-between items-start w-full">
        <div>
          <h2 class="text-[48px] font-serif text-tao-gold tracking-[0.3em] font-bold">
            {{ hexagramData.nameZh }} // {{ hexagramData.name }}
          </h2>
          <div class="text-[24px] text-white/50 font-mono tracking-widest mt-4">
            SYNC: {{ syncRate }}% | {{ rarityLabel }}
          </div>
        </div>
        <div
          class="text-[24px] text-white/40 font-serif tracking-[0.5em] [writing-mode:vertical-rl] h-[200px]"
        >
          {{ lunarDateStamp }}
        </div>
      </div>
      <div class="z-10 flex w-full gap-12 items-end">
        <div class="flex-1 border-t border-tao-gold/30 pt-8">
          <p class="text-[36px] text-white/90 font-mono italic leading-relaxed">
            {{ shortAiText }}
          </p>
        </div>
        <div class="shrink-0 p-4 border border-tao-gold/30 bg-black/80">
          <img src="/qr-code.png" class="w-32 h-32 grayscale brightness-150" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText', 'userData'])
const showModal = ref(false)
const isFlipped = ref(false)
const godlikeTriggered = ref(false)
const posterRef = ref(null)
const squareRef = ref(null)
const generateTime = ref(Date.now())

// ─── 视觉种子算法 (userId + timestamp + hexagram) ───
const seed = computed(() => {
  const uid = props.userData?.id || 'guest'
  const hexLines = props.hexagramData?.lines?.join('') || '000000'
  const str = `${uid}-${generateTime.value}-${hexLines}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
})

// ─── Hash 签名 ───
const userHash = computed(() => `0x${seed.value.toString(16).toUpperCase().padStart(8, '0')}`)

// ─── 同步率 ───
const syncRate = computed(() => {
  const rate = 80 + (seed.value % 200) / 10
  return (rate > 99.9 ? 99.9 : rate).toFixed(1)
})

const isGodlike = computed(() => parseFloat(syncRate.value) >= 99.0)

// ─── 稀有度体系 ───
const rarityInfo = computed(() => {
  const rate = parseFloat(syncRate.value)
  if (rate >= 99.0)
    return {
      label: 'GODLIKE',
      color: 'text-rose-400 border-rose-500/50',
      hue: 'hue-rotate(-45deg)',
      accent: '#ef4444',
    }
  if (rate >= 95.1)
    return {
      label: 'ULTRA RARE',
      color: 'text-tao-gold border-tao-gold/50',
      hue: 'hue-rotate(30deg)',
      accent: '#c8aa6e',
    }
  if (rate >= 90.1)
    return {
      label: 'RARE',
      color: 'text-cyan-300 border-cyan-300/50',
      hue: 'hue-rotate(180deg)',
      accent: '#67e8f9',
    }
  return {
    label: 'COMMON',
    color: 'text-white/60 border-white/20',
    hue: 'hue-rotate(0deg)',
    accent: '#ffffff',
  }
})

const rarityLabel = computed(() => rarityInfo.value.label)
const rarityColor = computed(() => rarityInfo.value.color)

const rarityGlowStyle = computed(() => ({
  boxShadow: `0 0 10px ${rarityInfo.value.accent}30, 0 0 20px ${rarityInfo.value.accent}15`,
}))

// ─── 视觉种子驱动样式 ───
const visualSeedStyles = computed(() => ({
  filter: rarityInfo.value.hue,
  color: rarityInfo.value.label === 'COMMON' ? '#22d3ee' : 'currentColor',
}))

const cardBorderColor = computed(() => `${rarityInfo.value.accent}40`)

const goldNeonStyle = computed(() => ({
  textShadow: `0 0 20px ${rarityInfo.value.accent}60, 0 0 40px ${rarityInfo.value.accent}30`,
}))

const radarGlowStyle = computed(() => ({
  filter: `drop-shadow(0 0 4px ${rarityInfo.value.accent}60)`,
}))

const circuitGlowStyle = computed(() => ({
  filter: `drop-shadow(0 0 3px ${rarityInfo.value.accent}80)`,
}))

const hudTextStyle = computed(() => ({
  color: `${rarityInfo.value.accent}70`,
  textShadow: `0 0 6px ${rarityInfo.value.accent}40`,
}))

const gridOffsetStyle = computed(() => ({
  backgroundPosition: `${seed.value % 50}px ${seed.value % 50}px`,
}))

// 噪点纹理（种子驱动偏移，边框微偏色）
const noiseStyle = computed(() => ({
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.${65 + (seed.value % 30)}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
  backgroundSize: `${150 + (seed.value % 100)}px`,
  opacity: 0.04 + (seed.value % 3) * 0.01,
}))

// ─── HUD 实时数据（种子驱动，视觉唯一性）───
const entropyLabel = computed(() => {
  const labels = ['STABLE', 'NOMINAL', 'OPTIMAL', 'CRITICAL']
  return labels[seed.value % labels.length]
})

const karmaIndex = computed(() => {
  return ((seed.value % 9999) / 100).toFixed(2)
})

const fluxRate = computed(() => {
  return `${(seed.value % 100) / 10}GHz`
})

const nodeId = computed(() => `N${(seed.value % 9999).toString().padStart(4, '0')}`)

const versionSuffix = computed(() => (seed.value % 999).toString().padStart(3, '0'))

const cardTimestamp = computed(() => {
  const d = new Date(generateTime.value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})

// ─── 雷达图数据点 ───
const radarPoints = computed(() => {
  const getVal = (offset) => 30 + ((seed.value >> offset) % 60)
  const order = getVal(1),
    perceive = getVal(2),
    origin = getVal(3),
    sync = getVal(4),
    chaos = getVal(5)
  const p1 = `50,${50 - order * 0.4}`
  const p2 = `${50 + perceive * 0.38},${50 - perceive * 0.12}`
  const p3 = `${50 + origin * 0.23},${50 + origin * 0.35}`
  const p4 = `${50 - sync * 0.23},${50 + sync * 0.35}`
  const p5 = `${50 - chaos * 0.38},${50 - chaos * 0.12}`
  return `${p1} ${p2} ${p3} ${p4} ${p5}`
})

// ─── 电路板符咒路径（种子驱动，每张唯一）───
const talismanPaths = computed(() => {
  const s = seed.value
  return [
    `M ${20 + (s % 15)},${10 + (s % 20)} Q ${40 + (s % 25)},50 50,${75 + (s % 15)} T ${75 + (s % 15)},${85 + (s % 10)}`,
    `M 10,${45 + (s % 20)} L ${35 + (s % 20)},${50 + (s % 10)} L ${50 + (s % 10)},${85 + (s % 10)}`,
    `M ${75 + (s % 15)},10 C ${55 + (s % 20)},30 ${40 + (s % 15)},65 ${20 + (s % 15)},${78 + (s % 12)}`,
    `M 50,${8 + (s % 12)} L ${50 + (s % 5)},${38 + (s % 25)} L ${75 + (s % 15)},${78 + (s % 12)}`,
  ].slice(0, 2 + (s % 2))
})

// 电路板节点
const circuitNodes = computed(() => {
  const s = seed.value
  return [
    { x: 20 + (s % 20), y: 30 + (s % 20), filled: s % 3 === 0 },
    { x: 70 + (s % 15), y: 25 + (s % 15), filled: s % 3 === 1 },
    { x: 50, y: 50, filled: true },
    { x: 30 + (s % 10), y: 70 + (s % 10), filled: s % 2 === 0 },
    { x: 75 + (s % 10), y: 65 + (s % 10), filled: s % 2 === 1 },
  ]
})

// 电路连接线
const circuitLines = computed(() => {
  const nodes = circuitNodes.value
  return [
    { x1: nodes[0].x, y1: nodes[0].y, x2: nodes[2].x, y2: nodes[2].y },
    { x1: nodes[1].x, y1: nodes[1].y, x2: nodes[2].x, y2: nodes[2].y },
    { x1: nodes[2].x, y1: nodes[2].y, x2: nodes[3].x, y2: nodes[3].y },
    { x1: nodes[2].x, y1: nodes[2].y, x2: nodes[4].x, y2: nodes[4].y },
  ]
})

// ─── 时间印章 ───
const lunarDateStamp = computed(() => {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const year = new Date(generateTime.value).getFullYear()
  return `${stems[(year - 4) % 10]}${branches[(year - 4) % 12]}年·极数时空`
})

// ─── AI 摘要 ───
const shortAiText = computed(() => {
  if (!props.aiPredictionText) return ''
  const sentences = props.aiPredictionText.match(/[^.!?]+[.!?]+/g) || [props.aiPredictionText]
  return sentences.slice(0, 2).join(' ').trim()
})

// ─── 神兽选取 ───
const beastImageUrl = computed(() => {
  const name = (props.hexagramData?.name || '').toLowerCase()
  if (name.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (name.match(/fire|sun|bright|south/)) return '/guardian-phoenix.png'
  if (name.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (name.match(/water|rain|moon|north/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

// ─── GODLIKE 触发状态机 ───
const triggerGodlike = () => {
  if (!isGodlike.value) return
  godlikeTriggered.value = true
  // 屏幕震动 + RGB 色散持续 2.5 秒后消退
  setTimeout(() => {
    godlikeTriggered.value = false
  }, 2500)
}

// ─── 生成 ───
const generate = () => {
  generateTime.value = Date.now()
  isFlipped.value = false
  showModal.value = true
  // 延迟 500ms 后检测 GODLIKE（等待动画落地）
  setTimeout(triggerGodlike, 500)
}

// ─── 下载 ───
const downloadImage = async (format) => {
  const targetRef = format === 'poster' ? posterRef.value : squareRef.value
  if (!targetRef) return
  try {
    const dataUrl = await toPng(targetRef, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#050505',
    })
    const link = document.createElement('a')
    link.download = `CyberTao-${format}-${props.hexagramData.nameZh}.png`
    link.download = `CyberTao-${format}-${props.hexagramData.nameZh}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const close = () => {
  showModal.value = false
}
const close = () => {
  showModal.value = false
}
defineExpose({ generate })
</script>

<style scoped>
/* ─── 3D 卡片 ─── */
.perspective-2000 {
  perspective: 2000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* ─── 背景网格 ─── */
.cyber-grid {
  background-image:
    linear-gradient(rgba(200, 170, 110, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* ─── 电路脉冲动画 ─── */
@keyframes circuit-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
.circuit-pulse {
  animation: circuit-pulse 2s ease-in-out infinite;
}

/* ─── 卡片动画 ─── */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.85;
  }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

/* ─── GODLIKE 故障特效 ─── */
@keyframes godlike-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px) rotateY(180deg);
  }
  40% {
    transform: translateX(4px) rotateY(180deg);
  }
  60% {
    transform: translateX(-3px) rotateY(180deg);
  }
  80% {
    transform: translateX(3px) rotateY(180deg);
  }
}

.screen-shake {
  animation: godlike-shake 0.4s ease-in-out 3;
}

@keyframes glitch {
  0%,
  90%,
  100% {
    clip-path: none;
    opacity: 0;
  }
  91% {
    clip-path: inset(10% 0 80% 0);
    opacity: 0.6;
    transform: translate(-4px, 0);
    background: rgba(239, 68, 68, 0.15);
  }
  93% {
    clip-path: inset(60% 0 20% 0);
    opacity: 0.6;
    transform: translate(4px, 0);
    background: rgba(6, 182, 212, 0.15);
  }
  95% {
    clip-path: inset(30% 0 50% 0);
    opacity: 0.6;
    transform: translate(-2px, 0);
    background: rgba(239, 68, 68, 0.1);
  }
  97% {
    clip-path: none;
    opacity: 0.3;
  }
}

.glitch-overlay {
  background: transparent;
  animation: glitch 0.8s steps(1) 3;
  position: absolute;
  inset: 0;
}

@keyframes rgb-split {
  0%,
  100% {
    opacity: 0;
  }
  10%,
  90% {
    opacity: 0.08;
  }
  50% {
    opacity: 0.15;
  }
}

.rgb-dispersion {
  background:
    radial-gradient(ellipse at 30% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 60%);
  mix-blend-mode: screen;
  animation: rgb-split 2.5s ease-in-out forwards;
}

.scanlines-heavy {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.3) 2px,
    rgba(0, 0, 0, 0.3) 4px
  );
  animation: rgb-split 2.5s ease-in-out forwards;
}
</style>
