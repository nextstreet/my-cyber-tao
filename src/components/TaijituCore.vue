<template>
  <div class="taijitu-wrapper" :class="{ 'is-active': isActive }">

    <svg
      class="taijitu-svg"
      viewBox="-120 -120 240 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="太极旋转核心"
    >
      <defs>
        <!-- 金色发光滤镜 -->
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- 青色发光滤镜 -->
        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- 强发光（眼睛/核心用） -->
        <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="blur1"/>
          <feGaussianBlur stdDeviation="1.5" result="blur2"/>
          <feMerge><feMergeNode in="blur1"/><feMergeNode in="blur2"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- 渐变：阳鱼金 -->
        <radialGradient id="grad-yang" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffe8a0"/>
          <stop offset="60%" stop-color="#c8aa6e"/>
          <stop offset="100%" stop-color="#8a6e3a"/>
        </radialGradient>
        <!-- 渐变：阴鱼深 -->
        <radialGradient id="grad-yin" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#0d1520"/>
          <stop offset="60%" stop-color="#050a12"/>
          <stop offset="100%" stop-color="#020408"/>
        </radialGradient>
        <!-- 外圈描边渐变 -->
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c8aa6e" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#22d3ee" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#c8aa6e" stop-opacity="0.9"/>
        </linearGradient>
      </defs>

      <!-- ════════════════════════════════
           LAYER 1: 最外圈 — 数据流符文环
           速度最慢，顺时针 120s
      ════════════════════════════════ -->
      <g class="ring-data">
        <!-- 外圈底轨 -->
        <circle cx="0" cy="0" r="108"
          fill="none"
          stroke="rgba(200,170,110,0.12)"
          stroke-width="0.5"/>

        <!-- 数据字符，均匀分布在 r=108 的圆周上，共24个 -->
        <g filter="url(#glow-gold)" class="data-chars">
          <text v-for="(ch, i) in dataChars" :key="'dc'+i"
            :transform="`rotate(${i * 15}) translate(0, -108) rotate(${i * -15 + 90})`"
            text-anchor="middle"
            dominant-baseline="central"
            font-family="monospace"
            font-size="5"
            :fill="i % 3 === 0 ? '#c8aa6e' : i % 3 === 1 ? 'rgba(34,211,238,0.7)' : 'rgba(200,170,110,0.3)'"
          >{{ ch }}</text>
        </g>

        <!-- 数据流刻度线，每15度一个 -->
        <g v-for="i in 24" :key="'tick'+i"
          :transform="`rotate(${(i-1) * 15})`">
          <line
            x1="0" :y1="i % 3 === 0 ? -116 : -113"
            x2="0" y2="-110"
            :stroke="i % 3 === 0 ? 'rgba(200,170,110,0.6)' : 'rgba(200,170,110,0.2)'"
            :stroke-width="i % 3 === 0 ? 0.8 : 0.4"/>
        </g>
      </g>

      <!-- ════════════════════════════════
           LAYER 2: 中圈 — 八卦符文环
           反向旋转 80s
      ════════════════════════════════ -->
      <g class="ring-bagua">
        <!-- 八卦轨道 -->
        <circle cx="0" cy="0" r="90"
          fill="none"
          stroke="rgba(34,211,238,0.15)"
          stroke-width="0.5"
          stroke-dasharray="4 2"/>

        <!-- 八卦符号，每45度一个 -->
        <g v-for="(gua, i) in baguaSymbols" :key="'gua'+i"
          :transform="`rotate(${i * 45})`"
          filter="url(#glow-cyan)">
          <!-- 符号背景菱形 -->
          <rect
            x="-5.5" :y="-97"
            width="11" height="11"
            rx="1.5"
            transform="rotate(45, 0, -91.5)"
            fill="rgba(6,9,15,0.8)"
            stroke="rgba(34,211,238,0.35)"
            stroke-width="0.4"/>
          <!-- 八卦文字 -->
          <text
            x="0" :y="-89"
            text-anchor="middle"
            dominant-baseline="central"
            font-family="'Noto Serif SC', serif"
            font-size="7"
            fill="#22d3ee"
            opacity="0.85"
          >{{ gua.zh }}</text>
        </g>

        <!-- 八卦间的连接弧线（每45度区间一段） -->
        <g v-for="i in 8" :key="'arc'+i"
          :transform="`rotate(${(i-1) * 45 + 22.5})`"
          opacity="0.3">
          <path
            :d="`M ${Math.cos(-0.3) * 90} ${Math.sin(-0.3) * 90} A 90 90 0 0 1 ${Math.cos(0.3) * 90} ${Math.sin(0.3) * 90}`"
            fill="none"
            stroke="#22d3ee"
            stroke-width="1.5"/>
        </g>
      </g>

      <!-- ════════════════════════════════
           LAYER 3: 内圈 — 方形赛博框
           顺时针 40s
      ════════════════════════════════ -->
      <g class="ring-cyber">
        <circle cx="0" cy="0" r="72"
          fill="none"
          stroke="rgba(200,170,110,0.25)"
          stroke-width="0.5"/>

        <!-- 四个赛博切角 -->
        <g v-for="i in 4" :key="'corner'+i"
          :transform="`rotate(${(i-1) * 90 + 45})`"
          filter="url(#glow-gold)">
          <line x1="-6" y1="-72" x2="6" y2="-72"
            stroke="rgba(200,170,110,0.8)" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="0" y1="-66" x2="0" y2="-78"
            stroke="rgba(200,170,110,0.5)" stroke-width="0.6" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ════════════════════════════════
           LAYER 4: 核心 — 太极本体 (r=60)
           顺时针 30s
      ════════════════════════════════ -->
      <g class="ring-taiji">
        <!-- 外圈发光描边 -->
        <circle cx="0" cy="0" r="61"
          fill="none"
          stroke="url(#ring-grad)"
          stroke-width="1.2"
          filter="url(#glow-gold)"
          opacity="0.7"/>

        <!--
          太极图纯 SVG 路径
          上半：阳（金色）
            - 从 (0,-60) 顺时针绕外圆到 (0,60)
            - 从 (0,60) 逆时针绕下小圆半径30到 (0,0)
            - 从 (0,0) 顺时针绕上小圆半径30到 (0,-60)
          下半：阴（深色）反之
        -->

        <!-- 阳鱼 (金色) -->
        <path
          d="M 0,-60
             A 60,60 0 0,1 0,60
             A 30,30 0 0,1 0,0
             A 30,30 0 0,0 0,-60
             Z"
          fill="url(#grad-yang)"
          filter="url(#glow-gold)"/>

        <!-- 阴鱼 (深色) -->
        <path
          d="M 0,-60
             A 30,30 0 0,0 0,0
             A 30,30 0 0,1 0,60
             A 60,60 0 0,0 0,-60
             Z"
          fill="url(#grad-yin)"/>

        <!-- 阳眼（阴鱼中的小金圆）-->
        <circle cx="0" cy="-30" r="8"
          fill="url(#grad-yang)"
          filter="url(#glow-strong)"/>
        <!-- 阳眼瞳孔 -->
        <circle cx="0" cy="-30" r="3.5"
          fill="#050a12"/>

        <!-- 阴眼（阳鱼中的小深圆）-->
        <circle cx="0" cy="30" r="8"
          fill="url(#grad-yin)"
          filter="url(#glow-strong)"/>
        <!-- 阴眼发光描边 -->
        <circle cx="0" cy="30" r="8"
          fill="none"
          stroke="rgba(200,170,110,0.4)"
          stroke-width="0.8"
          filter="url(#glow-gold)"/>
        <!-- 阴眼瞳孔（发光点）-->
        <circle cx="0" cy="30" r="3"
          fill="#c8aa6e"
          filter="url(#glow-strong)"/>

        <!-- 太极外圆边框 -->
        <circle cx="0" cy="0" r="60"
          fill="none"
          stroke="#c8aa6e"
          stroke-width="1"
          opacity="0.5"/>
      </g>

      <!-- ════════════════════════════════
           LAYER 5: 呼吸脉冲环（静止）
      ════════════════════════════════ -->
      <circle class="pulse-ring pulse-1" cx="0" cy="0" r="64"
        fill="none"
        stroke="rgba(200,170,110,0.4)"
        stroke-width="1"/>
      <circle class="pulse-ring pulse-2" cx="0" cy="0" r="68"
        fill="none"
        stroke="rgba(34,211,238,0.2)"
        stroke-width="0.6"/>
    </svg>

    <!-- 同步率读数 -->
    <div class="sync-readout">
      <span class="sync-label">SYNC</span>
      <span class="sync-value">{{ syncDisplay }}</span>
      <span class="sync-unit">Hz</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 数据流字符（外圈）
const dataChars = [
  '乾','1','坤','0','坎','F','离','A',
  '震','8','巽','E','艮','3','兑','C',
  '☯','9','⚡','2','◈','D','⬡','7'
]

// 八卦（中圈）
const baguaSymbols = [
  { zh: '乾', en: 'Heaven' },
  { zh: '兑', en: 'Lake' },
  { zh: '离', en: 'Fire' },
  { zh: '震', en: 'Thunder' },
  { zh: '巽', en: 'Wind' },
  { zh: '坎', en: 'Water' },
  { zh: '艮', en: 'Mountain' },
  { zh: '坤', en: 'Earth' },
]

// 同步率数字跳动
const syncDisplay = ref('432.7')
let syncInterval = null
const isActive = ref(false)

const randomSync = () => {
  const base = 428 + Math.random() * 12
  syncDisplay.value = base.toFixed(1)
}

onMounted(() => {
  // 入场延迟
  setTimeout(() => { isActive.value = true }, 100)
  syncInterval = setInterval(randomSync, 2000 + Math.random() * 1000)
})

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
})
</script>

<style scoped>
/* ══════════════════════════════════════════
   容器
══════════════════════════════════════════ */
.taijitu-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1),
              transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  /* 阻止触摸事件穿透影响父级滚动 */
  pointer-events: none;
  user-select: none;
}
.taijitu-wrapper.is-active {
  opacity: 1;
  transform: scale(1);
}

/* ══════════════════════════════════════════
   SVG 主体尺寸
══════════════════════════════════════════ */
.taijitu-svg {
  width: 200px;
  height: 200px;
  /* 整体外发光 */
  filter: drop-shadow(0 0 12px rgba(200, 170, 110, 0.25))
          drop-shadow(0 0 30px rgba(200, 170, 110, 0.10));
  overflow: visible;
}

/* ══════════════════════════════════════════
   旋转动画 — 每层独立速度和方向
══════════════════════════════════════════ */

/* 外圈：数据流，顺时针缓慢 */
.ring-data {
  transform-origin: 0 0;
  animation: spin-cw 120s linear infinite;
}

/* 八卦环：反向 */
.ring-bagua {
  transform-origin: 0 0;
  animation: spin-ccw 80s linear infinite;
}

/* 赛博内框：顺时针中速 */
.ring-cyber {
  transform-origin: 0 0;
  animation: spin-cw 40s linear infinite;
}

/* 太极本体：顺时针慢速 */
.ring-taiji {
  transform-origin: 0 0;
  animation: spin-cw 30s linear infinite;
}

@keyframes spin-cw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes spin-ccw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}

/* ══════════════════════════════════════════
   脉冲呼吸环
══════════════════════════════════════════ */
.pulse-ring {
  transform-origin: 0 0;
}
.pulse-1 {
  animation: pulse-breathe 3s ease-in-out infinite;
}
.pulse-2 {
  animation: pulse-breathe 3s ease-in-out infinite 1.5s;
}

@keyframes pulse-breathe {
  0%, 100% {
    opacity: 0.15;
    r: 64;
  }
  50% {
    opacity: 0.55;
    r: 67;
  }
}

/* ══════════════════════════════════════════
   同步率读数
══════════════════════════════════════════ */
.sync-readout {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
}
.sync-label {
  font-size: 8px;
  letter-spacing: 0.4em;
  color: rgba(200, 170, 110, 0.4);
  text-transform: uppercase;
}
.sync-value {
  font-size: 11px;
  color: rgba(34, 211, 238, 0.7);
  letter-spacing: 0.1em;
  transition: color 0.5s ease;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);
}
.sync-unit {
  font-size: 8px;
  color: rgba(200, 170, 110, 0.3);
  letter-spacing: 0.2em;
}

/* ══════════════════════════════════════════
   尊重用户的减少动画偏好
══════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .ring-data,
  .ring-bagua,
  .ring-cyber,
  .ring-taiji {
    animation: none;
  }
  .pulse-1,
  .pulse-2 {
    animation: none;
    opacity: 0.3;
  }
}
</style>
