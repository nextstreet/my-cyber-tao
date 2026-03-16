<template>
  <div class="fixed inset-0 bg-[#06090f] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans">

    <!-- ░░ LAYER 0: Canvas 赛博字符瀑布 ░░ -->
    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-70"></canvas>

    <!-- ░░ LAYER 1: 边缘暗角（仅收口，不压中心）░░ -->
    <div class="absolute inset-0 z-[1] pointer-events-none"
         style="background: radial-gradient(ellipse 72% 72% at 50% 50%, transparent 52%, rgba(6,9,15,0.88) 100%)"></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh]
                  bg-[#0c1018]/82 backdrop-blur-md
                  flex flex-col overflow-hidden panel-frame">

      <!-- ─── TOP CHROME ─── -->
      <div class="shrink-0 flex items-center justify-between px-4 py-1.5 border-b border-tao-gold/25 bg-black/50">
        <div class="flex items-center gap-2">
          <span class="text-[7px] font-mono text-tao-gold/65 tracking-[0.4em]">CYBER·TAO</span>
          <span class="text-[7px] font-mono text-tao-gold/30 tracking-[0.2em]">v2.0</span>
        </div>
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-tao-red" style="box-shadow:0 0 5px #8a2a2a,0 0 10px #8a2a2a88"></span>
          <span class="w-2 h-2 rounded-full bg-tao-gold" style="box-shadow:0 0 5px #c8aa6e,0 0 10px #c8aa6e88"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-400" style="box-shadow:0 0 5px #22d3ee,0 0 10px #22d3ee88"></span>
        </div>
        <div class="flex items-center gap-2">
          <!-- 命运档案入口按钮 -->
          <button
            v-if="fateHistory.length > 0"
            @click="showTimeline = !showTimeline"
            class="text-[7px] font-mono tracking-widest transition-colors px-1.5 py-0.5 border border-transparent hover:border-tao-gold/30"
            :style="showTimeline ? 'color: #c8aa6e; border-color: rgba(200,170,110,0.4)' : 'color: rgba(200,170,110,0.4)'"
          >
            ◈ {{ fateHistory.length }}
          </button>
          <span class="text-[7px] font-mono text-tao-gold/50 tracking-[0.2em]">{{ currentTime }}</span>
        </div>
      </div>

      <!-- ─── 命运时间轴 抽屉（覆盖在主内容上）─── -->
      <transition name="timeline-slide">
        <div v-if="showTimeline"
             class="absolute top-[33px] inset-x-0 bottom-0 z-30 bg-[#08090f]/97 backdrop-blur-xl flex flex-col overflow-hidden">
          <div class="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-tao-gold/20">
            <span class="text-[9px] font-mono tracking-[0.5em] text-tao-gold/70 uppercase">◈ FATE ARCHIVE</span>
            <button @click="showTimeline = false"
                    class="text-[8px] font-mono text-white/30 hover:text-white/70 tracking-widest">
              CLOSE ✕
            </button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-3">
            <div v-for="(record, i) in fateHistoryReversed" :key="record.id"
                 class="relative timeline-record border border-tao-gold/15 bg-black/30 p-3"
                 :class="{ 'border-tao-gold/35': i === 0 }">
              <!-- 序号 + 稀有度 -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-[7px] font-mono text-tao-gold/35 tracking-wider">#{{ String(fateHistory.length - i).padStart(3,'0') }}</span>
                  <span class="text-[8px] font-mono tracking-wider" :style="{ color: getSyncColor(record.syncRate) }">
                    SYNC {{ record.syncRate }}%
                  </span>
                </div>
                <span class="text-[7px] font-mono text-white/25 tracking-wider">{{ formatTime(record.timestamp) }}</span>
              </div>
              <!-- 卦象 -->
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-serif text-white/90 leading-none"
                      style="text-shadow: 0 0 12px rgba(200,170,110,0.4)">{{ record.nameZh }}</span>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[8px] font-mono text-tao-gold/60 tracking-wider">{{ record.nameEn }}</span>
                  <span class="text-[7px] font-mono text-white/30 tracking-wider">{{ record.hexCode }}</span>
                </div>
              </div>
              <!-- 问题摘要 -->
              <p class="text-[8px] font-mono text-white/45 leading-relaxed line-clamp-2 border-l border-tao-gold/20 pl-2">
                {{ record.question }}
              </p>
              <!-- 最新标记 -->
              <div v-if="i === 0"
                   class="absolute top-2 right-2 text-[6px] font-mono tracking-widest px-1.5 py-0.5"
                   style="color: #22d3ee; border: 1px solid rgba(34,211,238,0.3); background: rgba(34,211,238,0.05)">
                LATEST
              </div>
            </div>
            <!-- 清空按钮 -->
            <button @click="clearHistory"
                    class="w-full py-2 text-[7px] font-mono tracking-widest text-white/20 hover:text-red-400/60 transition-colors border border-white/5 hover:border-red-500/20">
              CLEAR ARCHIVE
            </button>
          </div>
        </div>
      </transition>

      <!-- ─── INTRO ─── -->
      <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-between w-full py-3 px-5 overflow-hidden">

        <!-- 标题 + 太极核心 -->
        <header class="text-center w-full animate-fade-in shrink-0 flex flex-col items-center">
          <h1 class="text-xl md:text-2xl font-serif tracking-[0.6em] text-white neon-text-gold mb-1">
            CYBER TAO
          </h1>
          <p class="text-tao-gold/60 text-[8px] tracking-[0.4em] font-mono uppercase mb-2">
            吉凶悔吝 · Fatum et Fluxus
          </p>
          <TaijituCore />
        </header>

        <div class="w-full space-y-2.5 flex-1 flex flex-col justify-center">

          <!-- 终端输入框 -->
          <div class="relative cyber-terminal-box">
            <div class="flex items-start gap-2 p-3">
              <span class="text-tao-gold/90 font-mono text-sm mt-1 shrink-0 neon-text-gold">&gt;_</span>
              <textarea
                v-model="question"
                placeholder="ENTER THE VOID..."
                class="flex-1 bg-transparent focus:outline-none text-white text-sm
                       placeholder:text-white/30 placeholder:italic resize-none font-mono leading-relaxed"
                rows="2"
              ></textarea>
            </div>
            <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-tao-gold/50 to-transparent"></div>
            <div class="absolute inset-x-0 h-px bg-tao-gold/25 terminal-scan pointer-events-none"></div>
          </div>

          <!-- 问题引导模板 -->
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tpl in questionTemplates"
              :key="tpl.label"
              @click="applyTemplate(tpl)"
              class="px-2.5 py-1 text-[8px] font-mono tracking-wider border transition-all duration-200"
              :class="question === tpl.text
                ? 'border-tao-gold/60 text-tao-gold bg-tao-gold/10'
                : 'border-white/10 text-white/40 hover:border-tao-gold/35 hover:text-tao-gold/70'"
            >
              {{ tpl.label }}
            </button>
          </div>

          <SpiritBottle
            :lastReadingTime="lastReadingTime"
            :isUnlimited="isAdmin"
            :shareCount="shareCount"
            @refill="handleRefillShare"
          />
        </div>

        <button
          @click="step = 'ritual'"
          :disabled="!question.trim() || (!hasSpirit && !isAdmin)"
          class="shrink-0 w-full py-3 border border-tao-gold/65
                  text-tao-gold hover:border-tao-gold
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-500 text-[10px] font-black tracking-[0.8em] uppercase
                  cyber-btn-corners relative"
          style="background: rgba(200,170,110,0.08); box-shadow: 0 0 20px rgba(200,170,110,0.12), inset 0 0 20px rgba(200,170,110,0.04);"
        >
          INITIATE PROTOCOL
        </button>

        <div class="shrink-0 w-full mt-2">
          <SystemLog />
        </div>
      </section>

      <!-- ─── RITUAL ─── -->
      <section v-else-if="step === 'ritual'" class="flex-1 flex flex-col overflow-hidden">
        <!-- 仪式页顶部：问题回显 -->
        <div class="shrink-0 px-4 py-2 border-b border-tao-gold/10 bg-black/20">
          <p class="text-[8px] font-mono text-tao-gold/45 tracking-wider truncate">
            <span class="text-tao-gold/25 mr-1">&gt;_</span>{{ question }}
          </p>
        </div>
        <div class="flex-1 flex items-center justify-center px-4">
          <CoinToss @complete="onRitualComplete" />
        </div>
      </section>

      <!-- ─── RESULT ─── -->
      <section v-else-if="step === 'result'" class="flex-1 flex flex-col w-full overflow-hidden">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center space-y-5">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-2 border-tao-gold/25 border-t-tao-gold rounded-full animate-spin"></div>
            <div class="absolute inset-2 border border-cyan-400/30 border-b-cyan-400 rounded-full animate-spin" style="animation-direction:reverse;animation-duration:0.7s"></div>
            <div class="absolute inset-4 rounded-full animate-pulse" style="background: rgba(200,170,110,0.1)"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] tracking-[0.5em] text-tao-gold/70 uppercase font-mono animate-pulse">Consulting the Void...</span>
            <span class="text-[7px] tracking-widest text-white/25 font-mono">DEEPSEEK · NEURAL BRIDGE ACTIVE</span>
          </div>
        </div>

        <!-- 结果内容 -->
        <div v-else class="flex-1 flex flex-col overflow-y-auto custom-scrollbar animate-fade-in-up px-4 pt-3 pb-2 gap-3">

          <!-- 变爻提示横幅 -->
          <div v-if="hasChangingLine"
               class="shrink-0 flex items-center gap-2 px-3 py-2 border border-red-500/35 bg-red-950/15"
               style="box-shadow: 0 0 16px rgba(239,68,68,0.08)">
            <span style="color: rgba(239,68,68,0.8); text-shadow: 0 0 8px rgba(239,68,68,0.5)" class="text-sm">◈</span>
            <div class="flex flex-col gap-0.5">
              <span class="text-[8px] font-mono tracking-widest text-red-400/80 uppercase">CHANGING LINES · FATE IN FLUX</span>
              <span class="text-[7px] font-mono text-white/30">变爻第 {{ changingLineNumbers }} 爻 · 此刻命运正在转变</span>
            </div>
          </div>

          <!-- 卦象标题 -->
          <div class="text-center shrink-0">
            <h2 class="text-4xl md:text-5xl font-serif text-white tracking-[0.4em] neon-text-white">
              {{ hexagramData.nameZh }}
            </h2>
            <p class="text-[9px] tracking-[0.8em] text-tao-gold/70 uppercase mt-1">{{ hexagramData.nameEn }}</p>
            <div class="w-10 h-px bg-tao-gold/45 mx-auto my-2.5"></div>
            <!-- 爻象图形 -->
            <div class="flex justify-center mb-2">
              <div class="flex flex-col-reverse gap-1">
                <div v-for="(line, i) in hexagramResult" :key="i" class="flex justify-center gap-1">
                  <template v-if="line === 1">
                    <div class="h-1.5 rounded-sm"
                         :style="getLineStyle(i, true)"
                         style="width: 48px;"></div>
                  </template>
                  <template v-else>
                    <div class="h-1.5 rounded-sm" :style="getLineStyle(i, false)" style="width: 20px;"></div>
                    <div class="h-1.5 rounded-sm" :style="getLineStyle(i, false)" style="width: 20px;"></div>
                  </template>
                </div>
              </div>
            </div>
            <p class="text-white/90 font-serif text-sm md:text-base leading-relaxed tracking-widest max-w-xs mx-auto">
              {{ hexagramData.poemZh }}
            </p>
          </div>

          <!-- Neural Analysis -->
          <div class="relative cyber-terminal-box shrink-0">
            <div class="absolute -top-2.5 left-3 px-2 bg-[#0c1018] text-[7px] text-tao-gold/75 font-mono tracking-widest uppercase z-10">
              NEURAL ANALYSIS // CLASSIFIED
            </div>
            <div class="p-3.5">
              <p class="text-gray-100 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">
                {{ aiResultPreview }}
              </p>

              <!-- Paywall 模糊区 -->
              <div v-if="aiResult.length > 100" class="relative mt-3">
                <div class="relative overflow-hidden rounded-sm">
                  <p class="text-gray-300/50 font-mono text-xs leading-relaxed italic whitespace-pre-wrap select-none"
                     style="filter: blur(4px); pointer-events: none; user-select: none;">{{ aiResultFullBlurred }}</p>
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c1018]/65 to-[#0c1018]/92"></div>
                  <div class="absolute inset-0 cyber-grid-visible"></div>
                </div>

                <div class="flex flex-col items-center mt-3 gap-2">
                  <div class="flex items-center gap-2 text-[7px] font-mono text-tao-gold/55 tracking-widest uppercase">
                    <span class="w-8 h-px bg-tao-gold/30"></span>
                    <span>FATE SEAL ACTIVE</span>
                    <span class="w-8 h-px bg-tao-gold/30"></span>
                  </div>
                  <button
                    @click="unlockFullAnalysis"
                    class="w-full py-2.5 border border-tao-gold/65 text-tao-gold
                            text-[9px] font-black tracking-[0.5em] uppercase
                            hover:border-tao-gold hover:bg-tao-gold/12
                            transition-all duration-300 cyber-btn-corners relative"
                    style="background: linear-gradient(135deg, rgba(200,170,110,0.10), rgba(200,170,110,0.18)); box-shadow: 0 0 18px rgba(200,170,110,0.22);"
                  >
                    🔓 解锁完整命运解析
                  </button>
                  <span class="text-[7px] text-white/30 font-mono tracking-widest">FULL_DESTINY_MATRIX.decrypt</span>
                </div>

                <!-- 完整分析隐藏容器（预留收费接口）-->
                <div ref="fullAnalysisContainer"
                     class="hidden mt-3 p-3 border border-tao-gold/25 bg-black/25 rounded-sm"
                     data-paywall="full-analysis">
                  <p class="text-gray-100 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">{{ aiResult }}</p>
                  <div class="mt-3 pt-3 border-t border-tao-gold/15 space-y-1">
                    <div class="text-[7px] font-mono text-tao-gold/50 tracking-widest">// Extended Hexagram Matrix</div>
                    <div class="text-[8px] font-mono text-cyan-300/70">{{ hexagramData.nameEn }} · {{ hexagramData.nameZh }}</div>
                    <div class="text-[7px] font-mono text-white/35">{{ hexagramData.poemZh }}</div>
                    <!-- 变爻信息 -->
                    <div v-if="hasChangingLine" class="text-[7px] font-mono text-red-400/60 mt-1">
                      ◈ CHANGING: 第 {{ changingLineNumbers }} 爻在动 · 参考之卦以知变化走向
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 底部操作 -->
        <div class="shrink-0 grid grid-cols-2 gap-3 px-4 py-3 border-t border-tao-gold/25">
          <button
            @click="talismanRef.generate()"
            class="py-3 border border-tao-gold/55 text-tao-gold
                    text-[9px] font-black tracking-[0.4em] uppercase
                    hover:bg-tao-gold/18 transition-all rounded-sm cyber-btn-corners relative"
            style="background: rgba(200,170,110,0.10); box-shadow: 0 0 12px rgba(200,170,110,0.18);"
          >
            EXTRACT
          </button>
          <button
            @click="reset"
            class="py-3 border border-white/25 text-white/65
                    text-[9px] tracking-[0.4em] uppercase
                    hover:bg-white/8 hover:text-white transition-all rounded-sm"
          >
            RETURN
          </button>
        </div>

        <div class="shrink-0 px-4 pb-2">
          <SystemLog />
        </div>
      </section>
    </main>

    <TalismanCard
      ref="talismanRef"
      :hexagramData="{
        name: hexagramData.nameEn,
        nameZh: hexagramData.nameZh,
        poemZh: hexagramData.poemZh,
        lines: hexagramResult
      }"
      :aiPredictionText="aiResult"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from './lib/supabase'
import SpiritBottle from './components/SpiritBottle.vue'
import CoinToss from './components/CoinToss.vue'
import TalismanCard from './components/TalismanCard.vue'
import SystemLog from './components/SystemLog.vue'
import TaijituCore from './components/TaijituCore.vue'

// ── 核心状态 ──
const step = ref('intro')
const question = ref('')
const hexagramResult = ref([])
const currentChangingLines = ref([])  // 变爻标记数组
const aiResult = ref('')
const loading = ref(false)
const talismanRef = ref(null)
const fullAnalysisContainer = ref(null)
const lastReadingTime = ref(null)
const hexagramData = ref({ nameZh: '', nameEn: '', poemZh: '' })
const deviceId = ref('')
const isAdmin = ref(false)
const shareCount = ref(0)
const MAX_SHARES_PER_DAY = 3
const matrixCanvas = ref(null)
const currentTime = ref('')
const showTimeline = ref(false)

// ── 命运时间轴（localStorage 持久化，最多存10条）──
const fateHistory = ref([])

const loadHistory = () => {
  try {
    const raw = localStorage.getItem('cyber_tao_history')
    fateHistory.value = raw ? JSON.parse(raw) : []
  } catch { fateHistory.value = [] }
}

const saveHistory = (record) => {
  const history = [...fateHistory.value, record].slice(-10)  // 最多保留10条
  fateHistory.value = history
  localStorage.setItem('cyber_tao_history', JSON.stringify(history))
}

const clearHistory = () => {
  fateHistory.value = []
  localStorage.removeItem('cyber_tao_history')
}

const fateHistoryReversed = computed(() => [...fateHistory.value].reverse())

const formatTime = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const getSyncColor = (rate) => {
  const r = parseFloat(rate)
  if (r >= 99) return '#ef4444'
  if (r >= 95) return '#c8aa6e'
  if (r >= 90) return '#22d3ee'
  return 'rgba(255,255,255,0.4)'
}

// 简单 seed 算法复用 TalismanCard 的同步率计算
const calcSyncRate = (deviceId, hexCode) => {
  const str = `${deviceId}-${Date.now()}-${hexCode}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const rate = 80 + (Math.abs(hash) % 200) / 10
  return (rate > 99.9 ? 99.9 : rate).toFixed(1)
}

// ── 问题引导模板 ──
const questionTemplates = [
  { label: '事业', text: '我的事业走向如何，当前的方向是否正确？' },
  { label: '感情', text: '当前的感情状况，应该如何抉择？' },
  { label: '财运', text: '近期的财运如何，是否适合投资或冒险？' },
  { label: '决策', text: '我面临一个重要决策，请给出指引。' },
  { label: '今日', text: '今日运势如何，需要注意什么？' },
]

const applyTemplate = (tpl) => {
  question.value = tpl.text
}

// ── 变爻相关计算 ──
const hasChangingLine = computed(() => currentChangingLines.value.some(Boolean))

const changingLineNumbers = computed(() => {
  const nums = []
  currentChangingLines.value.forEach((isChanging, i) => {
    if (isChanging) nums.push(i + 1)
  })
  return nums.join('、')
})

// 结果页内联爻象样式（变爻显示红色）
const getLineStyle = (index, isYang) => {
  const isChanging = currentChangingLines.value[index]
  if (isChanging) {
    return {
      background: 'linear-gradient(90deg, #c8aa6e, #ef4444, #c8aa6e)',
      boxShadow: '0 0 10px rgba(239,68,68,0.6)',
    }
  }
  return {
    background: '#c8aa6e',
    boxShadow: '0 0 8px rgba(200,170,110,0.6)',
  }
}

// ── Canvas Matrix Rain ──
let animFrameId = null
const initMatrix = () => {
  const canvas = matrixCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const chars = '0123456789ABCDEF☯⚡◈⬡乾坤坎离震巽艮兑'.split('')
  const fontSize = 13
  const cols = Math.floor(canvas.width / fontSize)
  const drops = Array(cols).fill(1)

  const draw = () => {
    ctx.fillStyle = 'rgba(6, 9, 15, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const b = Math.random()
      if (b > 0.96) {
        ctx.fillStyle = '#e8f4ff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12
      } else if (b > 0.82) {
        ctx.fillStyle = '#c8aa6e'; ctx.shadowColor = '#c8aa6e'; ctx.shadowBlur = 8
      } else if (b > 0.5) {
        ctx.fillStyle = `rgba(34,197,111,${0.4 + b * 0.4})`; ctx.shadowColor = 'rgba(34,211,150,0.6)'; ctx.shadowBlur = 5
      } else {
        ctx.fillStyle = `rgba(20,160,80,${0.2 + b * 0.2})`; ctx.shadowBlur = 0
      }
      ctx.font = `${fontSize}px monospace`
      ctx.fillText(char, i * fontSize, drops[i] * fontSize)
      ctx.shadowBlur = 0
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
      drops[i]++
    }
    animFrameId = requestAnimationFrame(draw)
  }
  draw()
}

// ── 时钟 ──
let clockInterval = null
const updateClock = () => {
  currentTime.value = new Date().toTimeString().slice(0, 8)
}

// ── 初始化 ──
const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase.from('device_profiles').insert([{ device_id: id }])
  }
  deviceId.value = id
  const { data } = await supabase
    .from('device_profiles')
    .select('is_unlimited, last_reading_at, share_count, last_share_date')
    .eq('device_id', id)
    .single()
  if (data) {
    isAdmin.value = data.is_unlimited
    const today = new Date().toISOString().split('T')[0]
    shareCount.value = data.last_share_date !== today ? 0 : (data.share_count || 0)
  }
}

onMounted(() => {
  initIdentity()
  loadHistory()
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading')
  initMatrix()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (clockInterval) clearInterval(clockInterval)
})

// ── 计算属性 ──
const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const h = (Date.now() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60)
  return h >= 12
})

const aiResultPreview = computed(() => {
  if (!aiResult.value) return ''
  return aiResult.value.slice(0, 100) + (aiResult.value.length > 100 ? '...' : '')
})

const aiResultFullBlurred = computed(() => {
  if (!aiResult.value || aiResult.value.length <= 100) return ''
  return aiResult.value.slice(100, 400)
})

// ── 解锁 ──
const unlockFullAnalysis = () => {
  // TODO: 接入支付验证 API
  if (fullAnalysisContainer.value) {
    fullAnalysisContainer.value.classList.toggle('hidden')
  }
}

// ── 仪式完成（接收变爻信息）──
const onRitualComplete = async (payload) => {
  // CoinToss 现在 emit 一个对象 { lines, changingLines, rawSums }
  const lines = Array.isArray(payload) ? payload : payload.lines
  const changingLines = payload.changingLines || []

  hexagramResult.value = lines
  currentChangingLines.value = changingLines
  step.value = 'result'
  loading.value = true

  const isEnglish = /^[a-zA-Z0-9\s.,?!'""\-]+$/.test(question.value.trim())

  try {
    const { data: aiData, error } = await supabase.functions.invoke('cyber-sage', {
      body: {
        lines,
        question: question.value,
        language: isEnglish ? 'en' : 'zh',
        changingLines,  // 传递变爻信息给 Edge Function
      }
    })
    if (error) throw error

    hexagramData.value = {
      nameZh: aiData.hexagramNameZh,
      nameEn: aiData.hexagramNameEn,
      poemZh: aiData.poemZh
    }
    aiResult.value = aiData.interpretation

    const now = new Date().toISOString()
    const hexCode = lines.join('')
    const syncRate = calcSyncRate(deviceId.value, hexCode)

    // 写入 Supabase
    await supabase.from('device_profiles').update({ last_reading_at: now }).eq('device_id', deviceId.value)
    supabase.from('divination_logs').insert([{
      device_id: deviceId.value,
      question: question.value,
      hexagram_code: hexCode,
      name_zh: aiData.hexagramNameZh,
      name_en: aiData.hexagramNameEn,
      interpretation: aiData.interpretation
    }]).then()

    // 写入本地命运档案
    saveHistory({
      id: Date.now(),
      timestamp: now,
      question: question.value,
      hexCode,
      nameZh: aiData.hexagramNameZh,
      nameEn: aiData.hexagramNameEn,
      syncRate,
      hasChangingLine: changingLines.some(Boolean),
    })

    lastReadingTime.value = now
    localStorage.setItem('cyber_tao_last_reading', now)
  } catch (err) {
    console.error('AI Error:', err)
    aiResult.value = 'SIGNAL INTERRUPTED: The digital void remains silent.'
  } finally {
    loading.value = false
  }
}

// ── 分享续命 ──
const handleRefillShare = async () => {
  if (hasSpirit.value || isAdmin.value) return
  if (shareCount.value >= MAX_SHARES_PER_DAY) {
    alert('DAILY SYNC LIMIT REACHED.')
    return
  }
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Cyber Tao', url: window.location.href })
      const today = new Date().toISOString().split('T')[0]
      const newCount = shareCount.value + 1
      await supabase.from('device_profiles').update({ share_count: newCount, last_share_date: today }).eq('device_id', deviceId.value)
      shareCount.value = newCount
      lastReadingTime.value = null
      localStorage.removeItem('cyber_tao_last_reading')
    }
  } catch (err) {
    console.log('Share canceled or failed')
  }
}

// ── 重置 ──
const reset = () => {
  step.value = 'intro'
  question.value = ''
  hexagramResult.value = []
  currentChangingLines.value = []
  aiResult.value = ''
  hexagramData.value = { nameZh: '', nameEn: '', poemZh: '' }
  showTimeline.value = false
}
</script>

<style scoped>
/* ── 霓虹文字 ── */
.neon-text-gold {
  text-shadow: 0 0 8px rgba(200,170,110,0.95), 0 0 20px rgba(200,170,110,0.55), 0 0 45px rgba(200,170,110,0.28);
}
.neon-text-white {
  text-shadow: 0 0 10px rgba(255,255,255,0.65), 0 0 25px rgba(200,170,110,0.38), 0 0 50px rgba(200,170,110,0.18);
}

/* ── 主面板框架 ── */
.panel-frame {
  box-shadow:
    0 0 0 1px rgba(200,170,110,0.38),
    0 0 40px rgba(200,170,110,0.12),
    0 0 100px rgba(200,170,110,0.06),
    inset 0 0 60px rgba(6,9,15,0.5);
  border-radius: 2px;
  position: relative;
}
.panel-frame::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 18px; height: 18px; z-index: 20; pointer-events: none;
  border-top: 2px solid rgba(200,170,110,0.88);
  border-left: 2px solid rgba(200,170,110,0.88);
  box-shadow: -2px -2px 10px rgba(200,170,110,0.45);
}
.panel-frame::after {
  content: ''; position: absolute; bottom: 0; right: 0;
  width: 18px; height: 18px; z-index: 20; pointer-events: none;
  border-bottom: 2px solid rgba(200,170,110,0.88);
  border-right: 2px solid rgba(200,170,110,0.88);
  box-shadow: 2px 2px 10px rgba(200,170,110,0.45);
}

/* ── 终端框 ── */
.cyber-terminal-box {
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(200,170,110,0.38);
  border-radius: 2px;
  position: relative;
  box-shadow: inset 0 0 18px rgba(200,170,110,0.04), 0 0 12px rgba(200,170,110,0.07);
}
.cyber-terminal-box::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid rgba(200,170,110,0.92); border-left: 2px solid rgba(200,170,110,0.92);
}
.cyber-terminal-box::after {
  content: ''; position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid rgba(200,170,110,0.92); border-right: 2px solid rgba(200,170,110,0.92);
}

/* ── 按钮切角装饰 ── */
.cyber-btn-corners::before {
  content: ''; position: absolute; top: -1px; left: -1px;
  width: 7px; height: 7px;
  border-top: 2px solid #c8aa6e; border-left: 2px solid #c8aa6e;
}
.cyber-btn-corners::after {
  content: ''; position: absolute; bottom: -1px; right: -1px;
  width: 7px; height: 7px;
  border-bottom: 2px solid #c8aa6e; border-right: 2px solid #c8aa6e;
}

/* ── 终端扫描线 ── */
@keyframes terminal-scan {
  0%   { top: 0;    opacity: 0; }
  5%   { opacity: 0.75; }
  95%  { opacity: 0.75; }
  100% { top: 100%; opacity: 0; }
}
.terminal-scan { animation: terminal-scan 4s linear infinite; }

/* ── 锁定区网格 ── */
.cyber-grid-visible {
  background-image:
    linear-gradient(rgba(200,170,110,0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,170,110,0.11) 1px, transparent 1px);
  background-size: 18px 18px;
}

/* ── 命运时间轴抽屉动画 ── */
.timeline-slide-enter-active { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s; }
.timeline-slide-leave-active { transition: transform 0.25s ease-in, opacity 0.25s; }
.timeline-slide-enter-from  { transform: translateY(-12px); opacity: 0; }
.timeline-slide-leave-to    { transform: translateY(-8px);  opacity: 0; }

/* ── 时间轴记录卡片 ── */
.timeline-record {
  position: relative;
  border-radius: 2px;
  transition: border-color 0.2s;
}
.timeline-record:hover { border-color: rgba(200,170,110,0.3) !important; }

/* ── 渐入动画 ── */
@keyframes fadeIn    { from { opacity: 0; transform: translateY(8px); }  to { opacity: 1; transform: none; } }
@keyframes fadeInUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.animate-fade-in    { animation: fadeIn    1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-fade-in-up { animation: fadeInUp  0.8s ease-out forwards; }

/* ── 滚动条 ── */
.custom-scrollbar::-webkit-scrollbar       { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200,170,110,0.35); border-radius: 4px; }
</style>
