<template>
  <!-- GODLIKE 全屏故障特效 -->
  <div v-if="godlikeTriggered" class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
    <div class="absolute inset-0 glitch-overlay"></div>
    <div class="absolute inset-0 rgb-dispersion"></div>
    <div class="absolute inset-0 scanlines-heavy"></div>
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-center screen-shake">
        <div class="font-mono uppercase mb-3 animate-pulse" style="font-size:10px;letter-spacing:1em;color:rgba(239,68,68,0.9)">⚠ GODLIKE SYNC ACHIEVED</div>
        <div class="font-serif animate-pulse" style="font-size:64px;color:#fca5a5;text-shadow:0 0 30px rgba(239,68,68,0.8)">{{ props.hexagramData?.nameZh }}</div>
      </div>
    </div>
  </div>

  <!-- 主弹窗 -->
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto"
       style="background:rgba(0,0,0,0.97);backdrop-filter:blur(20px)">

    <!-- 稀有度标签 -->
    <div class="flex items-center gap-4 mb-4 animate-fade-in px-4">
      <div class="h-px flex-1" :style="{ background: `linear-gradient(to right, transparent, ${rarityAccent}40)` }"></div>
      <div class="font-mono font-black uppercase px-4 py-1.5 border"
           style="font-size:10px;letter-spacing:0.5em"
           :style="{ color: rarityAccent, borderColor: rarityAccent+'50', boxShadow: `0 0 16px ${rarityAccent}25, inset 0 0 12px ${rarityAccent}08` }">
        {{ rarityLabel }} ◈ SYNC {{ syncRate }}%
      </div>
      <div class="h-px flex-1" :style="{ background: `linear-gradient(to left, transparent, ${rarityAccent}40)` }"></div>
    </div>

    <!-- 卡片 -->
    <div class="relative perspective-2000 px-4"
         style="width:min(82vw,360px);aspect-ratio:9/16"
         @click="isFlipped = !isFlipped">
      <div class="relative w-full h-full transform-style-3d cursor-pointer transition-all duration-1000"
           :class="{ 'rotate-y-180': isFlipped }"
           :style="visualSeedStyles">

        <!-- ══ 正面 ══ -->
        <div class="absolute inset-0 backface-hidden flex flex-col overflow-hidden"
             :style="frontFaceStyle">

          <!-- 背景：视觉种子噪点 -->
          <div class="absolute inset-0 pointer-events-none" :style="noiseBgStyle"></div>
          <!-- 背景：赛博网格 -->
          <div class="absolute inset-0 pointer-events-none cyber-grid-bg" :style="gridStyle"></div>
          <!-- 边角装饰 -->
          <div class="absolute inset-0 pointer-events-none z-20">
            <div class="absolute top-0 left-0 w-5 h-5" :style="cornerStyle('tl')"></div>
            <div class="absolute top-0 right-0 w-5 h-5" :style="cornerStyle('tr')"></div>
            <div class="absolute bottom-0 left-0 w-5 h-5" :style="cornerStyle('bl')"></div>
            <div class="absolute bottom-0 right-0 w-5 h-5" :style="cornerStyle('br')"></div>
          </div>

          <!-- HUD 顶部 -->
          <div class="absolute top-0 inset-x-0 flex justify-between items-center px-2.5 pt-1.5 z-30 pointer-events-none">
            <span class="font-mono" style="font-size:6px;letter-spacing:0.3em" :style="hudStyle">SYNC·{{ syncRate }}%</span>
            <span class="font-mono" style="font-size:6px;letter-spacing:0.3em" :style="hudStyle">ENTROPY·{{ entropyLabel }}</span>
          </div>

          <!-- 身份头部 -->
          <div class="relative z-10 flex justify-between items-center px-3.5 pt-7 pb-3 border-b" :style="{ borderColor: rarityAccent+'18' }">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center rounded-sm" style="width:28px;height:28px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15)">
                <span class="font-mono" style="font-size:7px;color:rgba(255,255,255,0.35)">ID</span>
              </div>
              <div>
                <div class="font-mono uppercase" style="font-size:8px;letter-spacing:0.4em;color:rgba(255,255,255,0.45)">TEMPORAL LINK</div>
                <div class="font-mono" style="font-size:7px;letter-spacing:0.2em;color:rgba(255,255,255,0.22)">{{ userHash }}</div>
              </div>
            </div>
            <div class="text-right font-mono" style="font-size:7px" :style="hudStyle">
              <div>{{ lunarDateStamp }}</div>
              <div style="color:rgba(255,255,255,0.2);margin-top:2px">{{ cardDate }}</div>
            </div>
          </div>

          <!-- 雷达区 -->
          <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-5 border-b" :style="{ borderColor: rarityAccent+'12' }">
            <div class="font-serif text-white/85 uppercase mb-3" style="font-size:18px;letter-spacing:0.3em">{{ hexagramData.name }}</div>
            <div class="relative" style="width:170px;height:170px">
              <svg viewBox="0 0 100 100" class="w-full h-full" :style="{ filter: `drop-shadow(0 0 5px ${rarityAccent}55)` }">
                <!-- 外框 -->
                <polygon points="50,8 92,36 76,86 24,86 8,36" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
                <polygon points="50,22 74,40 66,71 34,71 26,40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.4"/>
                <!-- 轴线 -->
                <line x1="50" y1="8" x2="50" y2="86" stroke="rgba(255,255,255,0.04)" stroke-width="0.3"/>
                <line x1="8" y1="36" x2="92" y2="36" stroke="rgba(255,255,255,0.04)" stroke-width="0.3"/>
                <!-- 数据面 -->
                <polygon :points="radarPoints" :fill="rarityAccent+'22'" :stroke="rarityAccent" stroke-width="1.2" opacity="0.9"/>
                <!-- 顶点高亮 -->
                <circle v-for="(pt, i) in radarPointArr" :key="i" :cx="pt.x" :cy="pt.y" r="1.8"
                        :fill="rarityAccent" :style="{ filter: `drop-shadow(0 0 3px ${rarityAccent})` }"/>
                <!-- 标签 -->
                <text x="50" y="5.5" text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'88'">秩序</text>
                <text x="95.5" y="37" text-anchor="start"  font-family="monospace" font-size="3.8" :fill="rarityAccent+'88'">感知</text>
                <text x="76"   y="93" text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'88'">根源</text>
                <text x="24"   y="93" text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'88'">同步</text>
                <text x="4.5"  y="37" text-anchor="end"    font-family="monospace" font-size="3.8" :fill="rarityAccent+'88'">混沌</text>
              </svg>
            </div>
          </div>

          <!-- 卦辞摘要 -->
          <div class="relative z-10 px-4 py-3 flex flex-col gap-2">
            <div class="w-5 h-px" :style="{ background: rarityAccent+'50' }"></div>
            <p class="font-mono italic leading-relaxed line-clamp-3" style="font-size:9px;color:rgba(255,255,255,0.65)">
              {{ shortAiText }}
            </p>
            <div class="flex justify-between items-end mt-1">
              <span class="font-serif" style="font-size:8px;color:rgba(255,255,255,0.28);writing-mode:vertical-rl;letter-spacing:0.4em;border-left:1px solid rgba(255,255,255,0.12);padding-left:4px">{{ lunarDateStamp }}</span>
              <span class="font-mono" style="font-size:6px;color:rgba(255,255,255,0.14);letter-spacing:0.25em">SYS V2.0 // DECODED</span>
            </div>
          </div>

          <!-- HUD 侧边 -->
          <div class="absolute right-0 top-16 bottom-16 z-20 flex flex-col justify-between items-end pr-1.5 pointer-events-none">
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em" :style="hudStyle">KARMA·{{ karmaIndex }}</span>
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em" :style="hudStyle">FLUX·{{ fluxRate }}</span>
          </div>
          <div class="absolute left-0 top-16 bottom-16 z-20 flex flex-col justify-between items-start pl-1.5 pointer-events-none">
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em;transform:rotate(180deg)" :style="hudStyle">NODE·{{ nodeId }}</span>
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em;transform:rotate(180deg)" :style="hudStyle">VER·2.0.{{ versionSuffix }}</span>
          </div>

          <!-- HUD 底边 -->
          <div class="absolute bottom-0 inset-x-0 flex justify-between px-2.5 pb-1.5 z-30 pointer-events-none">
            <span class="font-mono" style="font-size:6px;letter-spacing:0.25em" :style="hudStyle">ARCHIVE·#CT-{{ archiveId }}</span>
            <span class="font-mono" style="font-size:6px;letter-spacing:0.25em" :style="hudStyle">{{ rarityLabel }}</span>
          </div>
        </div>

        <!-- ══ 背面 ══ -->
        <div class="absolute inset-0 backface-hidden rotate-y-180 flex flex-col overflow-hidden"
             :style="backFaceStyle">

          <!-- 神兽图层 -->
          <div class="relative flex-[0_0_58%] overflow-hidden border-b" :style="{ borderColor: rarityAccent+'25' }">

            <!-- 神兽图 -->
            <img :src="beastImageUrl"
                 class="absolute inset-0 w-full h-full object-cover mix-blend-screen scale-110"
                 style="opacity:0.7"/>

            <!-- ★ 神兽能量粒子光晕（CSS 动画模拟）-->
            <div class="absolute inset-0 z-[5] pointer-events-none beast-aura" :style="beastAuraStyle"></div>

            <!-- ★ 电路符咒 SVG 层（全层流动）-->
            <svg class="absolute inset-0 w-full h-full z-10 pointer-events-none"
                 viewBox="0 0 100 100" preserveAspectRatio="none"
                 :style="{ filter: `drop-shadow(0 0 4px ${rarityAccent}99)` }">

              <!-- 主符咒笔画（种子驱动路径）-->
              <g fill="none" :stroke="rarityAccent" opacity="0.6">
                <path v-for="(p, i) in talismanPaths" :key="`p${i}`" :d="p"
                      stroke-width="0.45" class="circuit-flow"
                      :style="`animation-delay:${i*0.9}s;animation-duration:${3+i*0.5}s`"/>
              </g>

              <!-- 电路节点 -->
              <g :stroke="rarityAccent" fill="none">
                <circle v-for="(n, i) in circuitNodes" :key="`n${i}`"
                        :cx="n.x" :cy="n.y" r="1.3"
                        :fill="n.filled ? rarityAccent : 'none'"
                        stroke-width="0.4"
                        class="node-pulse"
                        :style="`animation-delay:${i*0.45}s`"/>
              </g>

              <!-- 连接线 -->
              <g :stroke="rarityAccent+'70'" fill="none">
                <line v-for="(ln, i) in circuitLines" :key="`l${i}`"
                      :x1="ln.x1" :y1="ln.y1" :x2="ln.x2" :y2="ln.y2"
                      stroke-width="0.3"
                      class="circuit-flow"
                      :style="`animation-delay:${i*0.55}s;animation-duration:${4+i*0.3}s`"/>
              </g>

              <!-- ★ 流动的符文文字 -->
              <g :fill="rarityAccent+'60'" font-family="serif" font-size="4">
                <text v-for="(rune, i) in runePositions" :key="`r${i}`"
                      :x="rune.x" :y="rune.y"
                      class="rune-float"
                      :style="`animation-delay:${i*0.8}s`">{{ rune.char }}</text>
              </g>

              <!-- 四角华纹 -->
              <g :stroke="rarityAccent" stroke-width="0.7" fill="none" opacity="0.55">
                <path d="M4,4 L14,4 L14,7 M4,4 L4,14 L7,14"/>
                <path d="M96,4 L86,4 L86,7 M96,4 L96,14 L93,14"/>
                <path d="M4,96 L14,96 L14,93 M4,96 L4,86 L7,86"/>
                <path d="M96,96 L86,96 L86,93 M96,96 L96,86 L93,86"/>
              </g>

              <!-- ★ 能量扫描线（水平流动）-->
              <line class="scan-line" x1="0" :y1="scanY" x2="100" :y2="scanY"
                    :stroke="rarityAccent" stroke-width="0.3" opacity="0.5"/>
            </svg>

            <!-- 渐变遮罩 -->
            <div class="absolute inset-0 z-20 pointer-events-none"
                 style="background:linear-gradient(to bottom,rgba(5,5,5,0.1) 0%,rgba(5,5,5,0.3) 60%,rgba(5,5,5,0.95) 100%)"></div>

            <!-- 神兽标签 -->
            <div class="absolute top-3 left-3 z-30 font-serif uppercase" style="font-size:7px;letter-spacing:0.5em" :style="{ color: rarityAccent+'55' }">Sacred Entity</div>

            <!-- GODLIKE 标记 -->
            <div v-if="isGodlike" class="absolute top-3 right-3 z-30">
              <span class="font-mono animate-pulse" style="font-size:7px;letter-spacing:0.3em;color:#f87171;border:1px solid rgba(239,68,68,0.4);padding:2px 6px;box-shadow:0 0 10px rgba(239,68,68,0.4)">
                ⚡ GODLIKE
              </span>
            </div>
          </div>

          <!-- 卦象文字区 -->
          <div class="relative flex-1 overflow-hidden" :style="backInfoStyle">
            <!-- 噪点层 -->
            <div class="absolute inset-0 pointer-events-none" :style="{ ...noiseBgStyle, opacity: 0.035 }"></div>

            <div class="relative z-10 h-full p-5 flex justify-between items-start">
              <!-- 竖排卦名 + 卦辞 -->
              <div class="flex gap-4 h-full">
                <h1 class="font-serif font-bold h-full" style="font-size:52px;writing-mode:vertical-rl;letter-spacing:0.15em"
                    :style="{ color: rarityAccent, textShadow: `0 0 20px ${rarityAccent}55, 0 0 40px ${rarityAccent}28` }">
                  {{ hexagramData.nameZh }}
                </h1>
                <div class="w-px h-3/4 my-auto" :style="{ background: rarityAccent+'25' }"></div>
                <p class="font-serif text-white/75 h-full pt-2" style="font-size:15px;writing-mode:vertical-rl;letter-spacing:0.4em;line-height:1.8">
                  {{ hexagramData.poemZh }}
                </p>
              </div>

              <!-- 右侧：档案标签 + QR -->
              <div class="flex flex-col items-end justify-between h-full pb-2">
                <div class="font-serif uppercase" style="font-size:8px;letter-spacing:0.7em;writing-mode:vertical-rl" :style="{ color: rarityAccent+'30' }">Divine Archive</div>
                <!-- HUD 数据块 -->
                <div class="flex flex-col gap-1 items-end mb-2">
                  <div class="font-mono" style="font-size:6px;letter-spacing:0.2em" :style="hudStyle">SYNC {{ syncRate }}%</div>
                  <div class="font-mono" style="font-size:6px;letter-spacing:0.2em" :style="hudStyle">#CT-{{ archiveId }}</div>
                </div>
                <div class="p-1.5 border bg-black/80" :style="{ borderColor: rarityAccent+'25' }">
                  <img src="/qr-code.png" class="w-9 h-9 grayscale" style="filter:grayscale(1) brightness(1.3) contrast(1.2)"/>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 翻转提示 -->
    <p class="font-mono mt-3 animate-pulse" style="font-size:9px;letter-spacing:0.35em;color:rgba(200,170,110,0.3)">
      TAP TO FLIP
    </p>

    <!-- 操作按钮 -->
    <div class="mt-3 flex flex-col items-center gap-3 animate-fade-up px-4 w-full" style="max-width:360px">
      <div class="flex gap-3 w-full">
        <button @click="downloadImage('poster')"
                class="flex-1 border font-mono uppercase transition-all hover:bg-white/8"
                style="padding:10px 0;font-size:10px;letter-spacing:0.3em;border-color:rgba(255,255,255,0.18);color:rgba(255,255,255,0.6)">
          9:16 POSTER
        </button>
        <button @click="downloadImage('square')"
                class="flex-1 border font-mono uppercase font-bold transition-all"
                style="padding:10px 0;font-size:10px;letter-spacing:0.3em"
                :style="{ borderColor: rarityAccent+'55', color: rarityAccent, background: rarityAccent+'12', boxShadow: `0 0 14px ${rarityAccent}20` }">
          1:1 SQUARE
        </button>
      </div>
      <button @click="close" class="font-mono uppercase transition-colors hover:text-white/60"
              style="font-size:9px;letter-spacing:0.4em;color:rgba(255,255,255,0.22)">Dismiss</button>
    </div>
  </div>

  <!-- 导出隐藏DOM -->
  <div class="fixed pointer-events-none" style="top:-9999px;left:-9999px">
    <div ref="posterRef" class="w-[1080px] h-[1920px] bg-[#050505] flex flex-col overflow-hidden relative" :style="{ border: `16px solid #090909` }">
      <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110"/>
      <div class="z-10 w-full p-16 flex justify-between items-start border-b border-tao-gold/20">
        <div>
          <h2 class="font-serif text-white/90 uppercase" style="font-size:54px;letter-spacing:0.3em">{{ hexagramData.name }}</h2>
          <div class="font-mono text-white/35 mt-3" style="font-size:22px;letter-spacing:0.4em">HASH: {{ userHash }}</div>
          <div class="font-mono mt-2" style="font-size:18px;letter-spacing:0.3em" :style="{ color: rarityAccent+'70' }">{{ rarityLabel }} · SYNC {{ syncRate }}%</div>
        </div>
        <div class="font-serif" style="font-size:26px;letter-spacing:0.5em;writing-mode:vertical-rl" :style="{ color: rarityAccent+'60' }">{{ lunarDateStamp }}</div>
      </div>
      <div class="z-10 flex-1 w-full p-20 flex justify-center items-center relative">
        <h1 class="font-serif font-bold" style="font-size:280px;letter-spacing:0.1em;writing-mode:vertical-rl;position:absolute;right:35%" :style="{ color: rarityAccent }">{{ hexagramData.nameZh }}</h1>
        <p class="font-serif text-white/90" style="font-size:72px;letter-spacing:0.4em;writing-mode:vertical-rl;position:absolute;left:25%">{{ hexagramData.poemZh }}</p>
      </div>
      <div class="z-10 w-full p-16 border-t border-white/10 flex gap-12 items-end" style="background:rgba(10,10,10,0.85)">
        <p class="flex-1 font-mono italic text-white/80 leading-relaxed text-justify" style="font-size:34px">{{ aiPredictionText }}</p>
        <div class="flex flex-col items-center gap-6 border-l border-tao-gold/20 pl-12 shrink-0">
          <span class="font-serif uppercase" style="font-size:18px;letter-spacing:0.7em;writing-mode:vertical-rl" :style="{ color: rarityAccent+'45' }">Sync {{ syncRate }}%</span>
          <img src="/qr-code.png" class="w-40 h-40 grayscale" style="filter:grayscale(1) brightness(1.5);padding:16px;border:1px solid rgba(200,170,110,0.3);background:rgba(0,0,0,0.6)"/>
        </div>
      </div>
    </div>

    <div ref="squareRef" class="w-[1080px] h-[1080px] bg-[#050505] flex flex-col justify-between overflow-hidden relative p-16" :style="{ border: `20px solid #090909` }">
      <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen scale-125"/>
      <div class="z-10 flex justify-between items-start w-full">
        <div>
          <h2 class="font-serif font-bold" style="font-size:48px;letter-spacing:0.3em" :style="{ color: rarityAccent }">{{ hexagramData.nameZh }} // {{ hexagramData.name }}</h2>
          <div class="font-mono text-white/45 mt-3" style="font-size:22px;letter-spacing:0.3em">SYNC: {{ syncRate }}% | {{ rarityLabel }}</div>
        </div>
        <div class="font-serif" style="font-size:22px;letter-spacing:0.5em;writing-mode:vertical-rl;height:200px" :style="{ color: rarityAccent+'45' }">{{ lunarDateStamp }}</div>
      </div>
      <div class="z-10 flex w-full gap-12 items-end">
        <div class="flex-1 pt-8 border-t border-tao-gold/25">
          <p class="font-mono italic text-white/90 leading-relaxed" style="font-size:34px">{{ shortAiText }}</p>
        </div>
        <div class="shrink-0 p-4 border border-tao-gold/28 bg-black/80">
          <img src="/qr-code.png" class="w-32 h-32 grayscale" style="filter:grayscale(1) brightness(1.5)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText', 'userData'])

const showModal     = ref(false)
const isFlipped     = ref(false)
const godlikeTriggered = ref(false)
const posterRef     = ref(null)
const squareRef     = ref(null)
const generateTime  = ref(Date.now())
const scanY         = ref(0)

// ── 扫描线动画 ──
let scanRaf = null
const animateScan = () => {
  scanY.value = (scanY.value + 0.3) % 100
  scanRaf = requestAnimationFrame(animateScan)
}
onMounted(() => { scanRaf = requestAnimationFrame(animateScan) })
onUnmounted(() => { if (scanRaf) cancelAnimationFrame(scanRaf) })

// ── 视觉种子算法 ──
const seed = computed(() => {
  const uid      = props.userData?.id || 'guest'
  const hexLines = props.hexagramData?.lines?.join('') || '000000'
  const str      = `${uid}-${generateTime.value}-${hexLines}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0
  }
  return Math.abs(hash)
})

const userHash = computed(() => `0x${seed.value.toString(16).toUpperCase().padStart(8,'0')}`)

// ── 同步率 + 稀有度 ──
const syncRate = computed(() => {
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})
const isGodlike = computed(() => parseFloat(syncRate.value) >= 99.0)

const rarityInfo = computed(() => {
  const r = parseFloat(syncRate.value)
  if (r >= 99.0) return { label:'GODLIKE',    accent:'#ef4444', hue:'hue-rotate(-45deg)' }
  if (r >= 95.1) return { label:'ULTRA RARE', accent:'#c8aa6e', hue:'hue-rotate(20deg)' }
  if (r >= 90.1) return { label:'RARE',       accent:'#67e8f9', hue:'hue-rotate(175deg)' }
  return               { label:'COMMON',     accent:'#22d3ee', hue:'hue-rotate(0deg)' }
})
const rarityLabel  = computed(() => rarityInfo.value.label)
const rarityAccent = computed(() => rarityInfo.value.accent)

// ── 视觉种子驱动样式 ──
const visualSeedStyles = computed(() => ({ filter: rarityInfo.value.hue }))

// 边框颜色微偏色（种子驱动，每张唯一）
const borderTint = computed(() => {
  const hueShift = (seed.value % 30) - 15   // ±15 度偏色
  const sat      = 40 + (seed.value % 20)   // 饱和度微调
  return `hsla(${38 + hueShift}, ${sat}%, 55%, 0.45)`
})

const frontFaceStyle = computed(() => ({
  background: '#050507',
  borderRadius: '12px',
  border: `1px solid ${borderTint.value}`,
  boxShadow: `0 0 0 1px ${rarityAccent.value}15, inset 0 0 40px rgba(0,0,0,0.7)`,
}))

const backFaceStyle = computed(() => ({
  background: '#040406',
  borderRadius: '12px',
  border: `1px solid ${borderTint.value}`,
  boxShadow: `0 0 0 1px ${rarityAccent.value}15`,
}))

const backInfoStyle = computed(() => ({
  background: `linear-gradient(to top, #0a0a0c, #050507)`,
}))

// 噪点背景（频率由种子驱动，每张纹路唯一）
const noiseBgStyle = computed(() => ({
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.${65+(seed.value%30)}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
  backgroundSize:  `${120 + (seed.value % 80)}px`,
  opacity:          0.05 + (seed.value % 3) * 0.012,
}))

const gridStyle = computed(() => ({
  backgroundPosition: `${seed.value % 28}px ${seed.value % 28}px`,
  opacity: 0.05,
}))

// 四角装饰（使用稀有度颜色）
const cornerStyle = (pos) => {
  const styles = {
    position: 'absolute',
    width: '18px', height: '18px',
  }
  const c = rarityAccent.value
  if (pos === 'tl') return { ...styles, top:0, left:0, borderTop:`2px solid ${c}cc`, borderLeft:`2px solid ${c}cc` }
  if (pos === 'tr') return { ...styles, top:0, right:0, borderTop:`2px solid ${c}cc`, borderRight:`2px solid ${c}cc` }
  if (pos === 'bl') return { ...styles, bottom:0, left:0, borderBottom:`2px solid ${c}cc`, borderLeft:`2px solid ${c}cc` }
  return { ...styles, bottom:0, right:0, borderBottom:`2px solid ${c}cc`, borderRight:`2px solid ${c}cc` }
}

const hudStyle = computed(() => ({
  color: `${rarityAccent.value}80`,
  textShadow: `0 0 6px ${rarityAccent.value}45`,
}))

// 神兽光晕（根据稀有度变化）
const beastAuraStyle = computed(() => ({
  background: `radial-gradient(ellipse at 50% 60%, ${rarityAccent.value}18 0%, transparent 65%)`,
  animation: 'beast-pulse 3s ease-in-out infinite',
}))

// ── HUD 数据（种子驱动）──
const entropyLabel = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])
const karmaIndex   = computed(() => ((seed.value % 9999) / 100).toFixed(2))
const fluxRate     = computed(() => `${(seed.value % 100) / 10}GHz`)
const nodeId       = computed(() => `N${(seed.value % 9999).toString().padStart(4,'0')}`)
const versionSuffix= computed(() => (seed.value % 999).toString().padStart(3,'0'))
const archiveId    = computed(() => seed.value.toString(16).toUpperCase().slice(-4))
const cardDate     = computed(() => {
  const d = new Date(generateTime.value)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
})

// ── 雷达图 ──
const radarPointArr = computed(() => {
  const gv = (o) => 30 + ((seed.value >> o) % 60)
  const [a,b,c,d,e] = [gv(1),gv(2),gv(3),gv(4),gv(5)]
  return [
    { x: 50,                   y: 50 - (a * 0.4) },
    { x: 50 + (b * 0.38),      y: 50 - (b * 0.12) },
    { x: 50 + (c * 0.23),      y: 50 + (c * 0.35) },
    { x: 50 - (d * 0.23),      y: 50 + (d * 0.35) },
    { x: 50 - (e * 0.38),      y: 50 - (e * 0.12) },
  ]
})
const radarPoints = computed(() =>
  radarPointArr.value.map(p => `${p.x},${p.y}`).join(' ')
)

// ── 电路符咒（种子驱动路径）──
const talismanPaths = computed(() => {
  const s = seed.value
  return [
    `M ${18+(s%16)},${8+(s%22)} Q ${38+(s%28)},${48+(s%12)} 50,${72+(s%16)} T ${72+(s%16)},${86+(s%10)}`,
    `M 8,${42+(s%22)} L ${32+(s%22)},${48+(s%12)} L ${48+(s%12)},${84+(s%12)}`,
    `M ${72+(s%16)},8 C ${52+(s%22)},28 ${38+(s%16)},62 ${18+(s%16)},${76+(s%14)}`,
    `M 48,${6+(s%14)} L ${50+(s%6)},${36+(s%28)} L ${73+(s%16)},${76+(s%14)}`,
    `M ${25+(s%20)},${20+(s%15)} Q ${60+(s%15)},${35+(s%15)} ${78+(s%12)},${55+(s%20)}`,
  ].slice(0, 3 + (s % 2))
})

const circuitNodes = computed(() => {
  const s = seed.value
  return [
    { x:18+(s%22), y:28+(s%22), filled:(s%3)===0 },
    { x:68+(s%16), y:22+(s%16), filled:(s%3)===1 },
    { x:50,         y:50,        filled:true       },
    { x:28+(s%12), y:68+(s%12), filled:(s%2)===0  },
    { x:73+(s%12), y:62+(s%12), filled:(s%2)===1  },
    { x:40+(s%18), y:38+(s%18), filled:(s%4)===0  },
  ]
})

const circuitLines = computed(() => {
  const n = circuitNodes.value
  return [
    { x1:n[0].x, y1:n[0].y, x2:n[2].x, y2:n[2].y },
    { x1:n[1].x, y1:n[1].y, x2:n[2].x, y2:n[2].y },
    { x1:n[2].x, y1:n[2].y, x2:n[3].x, y2:n[3].y },
    { x1:n[2].x, y1:n[2].y, x2:n[4].x, y2:n[4].y },
    { x1:n[5].x, y1:n[5].y, x2:n[1].x, y2:n[1].y },
  ]
})

// ── 流动符文字符位置 ──
const runePositions = computed(() => {
  const s = seed.value
  const chars = ['乾','坤','坎','离','震','巽','艮','兑','☯','◈','⬡']
  return [
    { x: 10+(s%15), y: 18+(s%15), char: chars[s%chars.length]     },
    { x: 75+(s%15), y: 15+(s%12), char: chars[(s+1)%chars.length] },
    { x: 15+(s%12), y: 75+(s%15), char: chars[(s+2)%chars.length] },
    { x: 72+(s%12), y: 72+(s%12), char: chars[(s+3)%chars.length] },
    { x: 45+(s%8),  y: 12+(s%10), char: chars[(s+4)%chars.length] },
  ]
})

// ── 时间印章 ──
const lunarDateStamp = computed(() => {
  const stems   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const branches= ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const yr = new Date(generateTime.value).getFullYear()
  return `${stems[(yr-4)%10]}${branches[(yr-4)%12]}年·极数时空`
})

// ── AI 摘要 ──
const shortAiText = computed(() => {
  if (!props.aiPredictionText) return ''
  const sents = props.aiPredictionText.match(/[^.!?。！？]+[.!?。！？]+/g) || [props.aiPredictionText]
  return sents.slice(0,2).join(' ').trim()
})

// ── 神兽 ──
const beastImageUrl = computed(() => {
  const n = (props.hexagramData?.name || '').toLowerCase()
  if (n.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (n.match(/fire|sun|bright|south|clinging/)) return '/guardian-phoenix.png'
  if (n.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (n.match(/water|rain|moon|north|abyss/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

// ── GODLIKE ──
const triggerGodlike = () => {
  if (!isGodlike.value) return
  godlikeTriggered.value = true
  setTimeout(() => { godlikeTriggered.value = false }, 2800)
}

const generate = () => {
  generateTime.value = Date.now()
  isFlipped.value    = false
  showModal.value    = true
  setTimeout(triggerGodlike, 600)
}

const downloadImage = async (format) => {
  const el = format === 'poster' ? posterRef.value : squareRef.value
  if (!el) return
  try {
    const url  = await toPng(el, { quality:1, pixelRatio:2, backgroundColor:'#050505' })
    const link = document.createElement('a')
    link.download = `CyberTao-${format}-${props.hexagramData?.nameZh || 'card'}.png`
    link.href = url; link.click()
  } catch (e) { console.error('Export failed:', e) }
}

const close = () => { showModal.value = false }
defineExpose({ generate })
</script>

<style scoped>
/* 3D */
.perspective-2000     { perspective: 2000px; }
.transform-style-3d   { transform-style: preserve-3d; }
.backface-hidden      { backface-visibility: hidden; }
.rotate-y-180         { transform: rotateY(180deg); }

/* 背景网格 */
.cyber-grid-bg {
  background-image:
    linear-gradient(rgba(200,170,110,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,170,110,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ★ 电路符咒流动 */
@keyframes circuit-flow {
  0%   { stroke-dashoffset: 200; opacity: 0.2; }
  30%  { opacity: 0.85; }
  70%  { opacity: 0.85; }
  100% { stroke-dashoffset: 0;   opacity: 0.2; }
}
.circuit-flow {
  stroke-dasharray: 30 10;
  animation: circuit-flow 3.5s ease-in-out infinite;
}

/* ★ 节点脉冲 */
@keyframes node-pulse {
  0%, 100% { opacity: 0.3; r: 1.3; }
  50%       { opacity: 1.0; r: 2.2; }
}
.node-pulse { animation: node-pulse 2s ease-in-out infinite; }

/* ★ 符文浮动 */
@keyframes rune-float {
  0%, 100% { opacity: 0.15; transform: translateY(0); }
  50%       { opacity: 0.65; transform: translateY(-2px); }
}
.rune-float { animation: rune-float 4s ease-in-out infinite; }

/* ★ 神兽光晕脉冲 */
@keyframes beast-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.9; }
}

/* 卡片进入 */
@keyframes fade-in  { from{opacity:0} to{opacity:0.9} }
@keyframes fade-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
.animate-fade-in { animation: fade-in 0.9s ease-out forwards; }
.animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

/* GODLIKE 特效 */
@keyframes glitch {
  0%,88%,100%{ opacity:0 }
  89%{ clip-path:inset(10% 0 80% 0); opacity:0.7; transform:translate(-5px); background:rgba(239,68,68,0.18); }
  91%{ clip-path:inset(55% 0 25% 0); opacity:0.7; transform:translate(5px);  background:rgba(6,182,212,0.18); }
  93%{ clip-path:inset(28% 0 52% 0); opacity:0.6; transform:translate(-3px); }
  95%{ opacity:0.3 }
}
.glitch-overlay { background:transparent; animation:glitch 0.9s steps(1) 3; position:absolute; inset:0; }

@keyframes rgb-split { 0%,100%{opacity:0} 10%,90%{opacity:0.09} 50%{opacity:0.18} }
.rgb-dispersion {
  background: radial-gradient(ellipse at 30% 50%,rgba(239,68,68,0.35) 0%,transparent 60%),
              radial-gradient(ellipse at 70% 50%,rgba(6,182,212,0.35) 0%,transparent 60%);
  mix-blend-mode:screen;
  animation:rgb-split 2.8s ease-in-out forwards;
}
.scanlines-heavy {
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.28) 2px,rgba(0,0,0,0.28) 4px);
  animation:rgb-split 2.8s ease-in-out forwards;
}
@keyframes godlike-shake {
  0%,100%{transform:none} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
}
.screen-shake { animation:godlike-shake 0.35s ease-in-out 4; }
</style>
