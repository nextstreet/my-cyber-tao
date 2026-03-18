<template>
  <div class="fixed inset-0 bg-[#06090f] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans">

    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-70"></canvas>
    <div class="absolute inset-0 z-[1] pointer-events-none"
         style="background:radial-gradient(ellipse 72% 72% at 50% 50%,transparent 52%,rgba(6,9,15,0.88) 100%)"></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh]
                  bg-[#0c1018]/82 backdrop-blur-md flex flex-col overflow-hidden panel-frame">

      <!-- TOP CHROME -->
      <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/25 bg-black/50">
        <span class="font-mono text-tao-gold/65" style="font-size:9px;letter-spacing:0.4em">CYBER·TAO v2.0</span>
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background:#8a2a2a;box-shadow:0 0 5px #8a2a2a,0 0 10px #8a2a2a88"></span>
          <span class="w-2 h-2 rounded-full" style="background:#c8aa6e;box-shadow:0 0 5px #c8aa6e,0 0 10px #c8aa6e88"></span>
          <span class="w-2 h-2 rounded-full" style="background:#22d3ee;box-shadow:0 0 5px #22d3ee,0 0 10px #22d3ee88"></span>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="fateHistory.length > 0" @click="showTimeline=!showTimeline"
            class="font-mono transition-all px-2 py-0.5 border border-transparent hover:border-tao-gold/30"
            style="font-size:9px;letter-spacing:0.3em"
            :style="showTimeline ? 'color:#c8aa6e;border-color:rgba(200,170,110,0.4)' : 'color:rgba(200,170,110,0.45)'">
            ◈ {{ fateHistory.length }}
          </button>
          <span class="font-mono text-tao-gold/50" style="font-size:9px;letter-spacing:0.2em">{{ currentTime }}</span>
        </div>
      </div>

      <!-- 命运时间轴抽屉 -->
      <transition name="timeline-slide">
        <div v-if="showTimeline"
             class="absolute top-[37px] inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden"
             style="background:rgba(5,7,12,0.97);backdrop-filter:blur(20px)">
          <div class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-tao-gold/20">
            <span class="font-mono text-tao-gold/70 uppercase" style="font-size:11px;letter-spacing:0.5em">◈ FATE ARCHIVE</span>
            <button @click="showTimeline=false"
                    class="font-mono text-white/30 hover:text-white/70 transition-colors"
                    style="font-size:10px;letter-spacing:0.3em">CLOSE ✕</button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-3">
            <div v-for="(rec,i) in fateHistoryReversed" :key="rec.id"
                 class="relative timeline-record border border-tao-gold/15 bg-black/30 p-3"
                 :class="{' border-tao-gold/35': i===0}">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-tao-gold/35" style="font-size:9px">#{{ String(fateHistory.length-i).padStart(3,'0') }}</span>
                  <span class="font-mono" style="font-size:10px" :style="{color:getSyncColor(rec.syncRate)}">SYNC {{ rec.syncRate }}%</span>
                </div>
                <span class="font-mono text-white/30" style="font-size:9px">{{ formatTime(rec.timestamp) }}</span>
              </div>
              <div class="flex items-center gap-3 mb-2">
                <span class="font-serif text-white/90" style="font-size:28px;line-height:1;text-shadow:0 0 12px rgba(200,170,110,0.4)">{{ rec.nameZh }}</span>
                <div>
                  <div class="font-mono text-tao-gold/60" style="font-size:10px">{{ rec.nameEn }}</div>
                  <div class="font-mono text-white/30" style="font-size:9px">{{ rec.hexCode }}</div>
                </div>
              </div>
              <p class="font-mono text-white/45 leading-relaxed line-clamp-2 border-l-2 border-tao-gold/20 pl-2"
                 style="font-size:10px">{{ rec.question }}</p>
              <div v-if="i===0"
                   class="absolute top-2 right-2 font-mono px-1.5 py-0.5"
                   style="font-size:8px;color:#22d3ee;border:1px solid rgba(34,211,238,0.3);background:rgba(34,211,238,0.05)">
                LATEST
              </div>
            </div>
            <button @click="clearHistory"
                    class="w-full py-2 font-mono text-white/20 hover:text-red-400/60 transition-colors border border-white/5 hover:border-red-500/20"
                    style="font-size:9px;letter-spacing:0.3em">CLEAR ARCHIVE</button>
          </div>
        </div>
      </transition>

      <!-- ─── INTRO ─── -->
      <section v-if="step==='intro'" class="flex-1 flex flex-col items-center justify-between w-full py-4 px-5 overflow-hidden">

        <header class="text-center w-full animate-fade-in shrink-0 flex flex-col items-center">
          <h1 class="font-serif text-white neon-text-gold" style="font-size:28px;letter-spacing:0.55em;margin-bottom:4px">
            CYBER TAO
          </h1>
          <p class="font-mono text-tao-gold/65 uppercase" style="font-size:10px;letter-spacing:0.4em;margin-bottom:8px">
            吉凶悔吝 · Fatum et Fluxus
          </p>
          <TaijituCore />
        </header>

        <div class="w-full flex-1 flex flex-col justify-center gap-3">

          <!-- 终端输入框 -->
          <div class="relative cyber-terminal-box">
            <div class="flex items-start gap-2 p-3">
              <span class="font-mono mt-1 shrink-0 neon-text-gold" style="font-size:15px;color:rgba(200,170,110,0.9)">&gt;_</span>
              <textarea
                v-model="question"
                placeholder="ENTER THE VOID..."
                class="flex-1 bg-transparent focus:outline-none text-white resize-none font-mono leading-relaxed"
                style="font-size:14px"
                rows="2"
              ></textarea>
            </div>
            <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-tao-gold/50 to-transparent"></div>
            <div class="absolute inset-x-0 h-px terminal-scan pointer-events-none" style="background:rgba(200,170,110,0.28)"></div>
          </div>

          <!-- 问题引导模板（英文为主）-->
          <div class="flex flex-wrap gap-2">
            <button v-for="tpl in questionTemplates" :key="tpl.label"
              @click="applyTemplate(tpl)"
              class="px-3 py-1.5 font-mono border transition-all duration-200"
              style="font-size:11px;letter-spacing:0.15em;border-radius:2px"
              :style="question === tpl.text
                ? 'border-color:rgba(200,170,110,0.65);color:#c8aa6e;background:rgba(200,170,110,0.12)'
                : 'border-color:rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);background:transparent'"
            >
              {{ tpl.label }}
            </button>
          </div>

          <SpiritBottle
            :spiritPoints="spiritPoints"
            :isUnlimited="isAdmin"
            :shareCount="shareCount"
            @refill="handleRefillShare"
          />
        </div>

        <!-- INITIATE 按钮：明显、始终可见 -->
        <button
          @click="step='ritual'"
          :disabled="!question.trim() || (!hasSpirit && !isAdmin)"
          class="shrink-0 w-full border transition-all duration-300 relative cyber-btn-corners"
          style="padding:14px 0;font-size:13px;font-weight:900;letter-spacing:0.75em;font-family:monospace;text-transform:uppercase"
          :style="!question.trim() || (!hasSpirit && !isAdmin)
            ? 'border-color:rgba(200,170,110,0.2);color:rgba(200,170,110,0.25);background:transparent;cursor:not-allowed'
            : 'border-color:rgba(200,170,110,0.8);color:#c8aa6e;background:rgba(200,170,110,0.12);box-shadow:0 0 28px rgba(200,170,110,0.22),inset 0 0 24px rgba(200,170,110,0.06)'"
        >
          INITIATE PROTOCOL
        </button>

        <div class="shrink-0 w-full mt-2">
          <SystemLog />
        </div>
      </section>

      <!-- ─── RITUAL ─── -->
      <section v-else-if="step==='ritual'" class="flex-1 flex flex-col overflow-hidden">
        <div class="shrink-0 px-4 py-2.5 border-b border-tao-gold/15 bg-black/20">
          <p class="font-mono truncate" style="font-size:11px;color:rgba(200,170,110,0.45);letter-spacing:0.1em">
            <span style="color:rgba(200,170,110,0.25)" class="mr-1">&gt;_</span>{{ question }}
          </p>
        </div>
        <div class="flex-1 flex items-center justify-center px-4">
          <CoinToss @complete="onRitualComplete" />
        </div>
      </section>

      <!-- ─── RESULT ─── -->
      <section v-else-if="step==='result'" class="flex-1 flex flex-col w-full overflow-hidden">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center gap-5">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 rounded-full animate-spin" style="border:2px solid rgba(200,170,110,0.2);border-top-color:#c8aa6e"></div>
            <div class="absolute inset-2 rounded-full animate-spin" style="border:1px solid rgba(34,211,238,0.25);border-bottom-color:#22d3ee;animation-direction:reverse;animation-duration:0.7s"></div>
            <div class="absolute inset-4 rounded-full animate-pulse" style="background:rgba(200,170,110,0.1)"></div>
          </div>
          <div class="text-center">
            <p class="font-mono text-tao-gold/70 animate-pulse uppercase" style="font-size:11px;letter-spacing:0.5em">Consulting the Void...</p>
            <p class="font-mono text-white/25 mt-1" style="font-size:9px;letter-spacing:0.3em">DEEPSEEK · NEURAL BRIDGE ACTIVE</p>
          </div>
        </div>

        <!-- 结果 -->
        <div v-else class="flex-1 flex flex-col overflow-y-auto custom-scrollbar animate-fade-in-up px-4 pt-3 pb-2 gap-3">

          <!-- 变爻横幅 -->
          <div v-if="hasChangingLine"
               class="shrink-0 flex items-center gap-2 px-3 py-2 border"
               style="border-color:rgba(239,68,68,0.35);background:rgba(239,0,0,0.06);box-shadow:0 0 16px rgba(239,68,68,0.08)">
            <span style="color:rgba(239,68,68,0.85);text-shadow:0 0 8px rgba(239,68,68,0.5);font-size:16px">◈</span>
            <div>
              <p class="font-mono text-red-400/80 uppercase" style="font-size:10px;letter-spacing:0.35em">CHANGING LINES · FATE IN FLUX</p>
              <p class="font-mono text-white/35 mt-0.5" style="font-size:9px">变爻第 {{ changingLineNumbers }} 爻 · 命运正在转变</p>
            </div>
          </div>

          <!-- 卦象标题 -->
          <div class="text-center shrink-0">
            <h2 class="font-serif text-white neon-text-white" style="font-size:52px;letter-spacing:0.4em">{{ hexagramData.nameZh }}</h2>
            <p class="font-mono text-tao-gold/70 uppercase mt-1" style="font-size:11px;letter-spacing:0.7em">{{ hexagramData.nameEn }}</p>
            <div class="w-12 h-px bg-tao-gold/45 mx-auto my-2.5"></div>
            <!-- 爻象小图 -->
            <div class="flex justify-center mb-2">
              <div class="flex flex-col-reverse gap-1.5">
                <div v-for="(line, i) in hexagramResult" :key="i" class="flex justify-center gap-1">
                  <template v-if="line === 1">
                    <div class="h-2 rounded-sm" style="width:52px" :style="getLineStyle(i)"></div>
                  </template>
                  <template v-else>
                    <div class="h-2 rounded-sm" style="width:22px" :style="getLineStyle(i)"></div>
                    <div class="h-2 rounded-sm" style="width:22px" :style="getLineStyle(i)"></div>
                  </template>
                </div>
              </div>
            </div>
            <p class="font-serif text-white/90 leading-relaxed tracking-widest max-w-xs mx-auto" style="font-size:15px">
              {{ hexagramData.poemZh }}
            </p>
          </div>

          <!-- ★ ORACLE TRANSMISSION — 短句，完整展示，无虚影 -->
          <div v-if="aiOracle" class="relative cyber-terminal-box shrink-0">
            <div class="absolute -top-2.5 left-3 px-2 bg-[#0c1018] font-mono text-tao-gold/75 uppercase z-10"
                 style="font-size:9px;letter-spacing:0.35em">
              ORACLE TRANSMISSION
            </div>
            <div class="p-4 text-center">
              <p class="font-serif text-white/95 leading-relaxed italic"
                 style="font-size:14px;line-height:1.9;text-shadow:0 0 20px rgba(200,170,110,0.18)">
                {{ aiOracle }}
              </p>
            </div>
          </div>

          <!-- ★ NEURAL ANALYSIS — 全部模糊，消耗灵力解锁 -->
          <div class="relative cyber-terminal-box shrink-0">
            <div class="absolute -top-2.5 left-3 px-2 bg-[#0c1018] font-mono text-tao-gold/75 uppercase z-10"
                 style="font-size:9px;letter-spacing:0.35em">
              NEURAL ANALYSIS // CLASSIFIED
            </div>
            <div class="p-4">

              <!-- 未解锁：全文模糊 + 解锁按钮 -->
              <div v-if="!analysisUnlocked" class="relative">
                <div class="relative overflow-hidden rounded-sm">
                  <p class="font-mono italic leading-relaxed whitespace-pre-wrap select-none"
                     style="font-size:12px;color:rgba(200,200,200,0.45);filter:blur(5px);pointer-events:none;user-select:none;line-height:1.7">
                    {{ aiResult || '...' }}
                  </p>
                  <div class="absolute inset-0" style="background:linear-gradient(to bottom,rgba(12,16,24,0.1),rgba(12,16,24,0.55),rgba(12,16,24,0.95))"></div>
                  <div class="absolute inset-0 cyber-grid-visible"></div>
                </div>
                <div class="flex flex-col items-center mt-3 gap-2">
                  <!-- 灵力点数提示 -->
                  <div class="flex items-center gap-2 font-mono uppercase" style="font-size:9px;letter-spacing:0.3em;color:rgba(200,170,110,0.5)">
                    <span class="w-6 h-px bg-tao-gold/25"></span>
                    <span>8 SPIRIT POINTS · CLASSIFIED</span>
                    <span class="w-6 h-px bg-tao-gold/25"></span>
                  </div>
                  <button @click="unlockFullAnalysis"
                    :disabled="spiritPoints < 8"
                    class="w-full border font-mono font-black uppercase transition-all duration-300 cyber-btn-corners relative"
                    style="padding:10px 0;font-size:11px;letter-spacing:0.4em"
                    :style="spiritPoints >= 8
                      ? 'border-color:rgba(200,170,110,0.65);color:#c8aa6e;background:linear-gradient(135deg,rgba(200,170,110,0.10),rgba(200,170,110,0.18));box-shadow:0 0 18px rgba(200,170,110,0.22)'
                      : 'border-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.2);background:transparent;cursor:not-allowed'">
                    {{ spiritPoints >= 8 ? '🔓 UNLOCK FULL DESTINY' : '⚡ INSUFFICIENT SPIRIT' }}
                  </button>
                  <span class="font-mono text-white/25" style="font-size:9px;letter-spacing:0.2em">{{ spiritPoints }}/24 SPIRIT · -8 TO DECRYPT</span>
                </div>
              </div>

              <!-- 已解锁：完整展示 -->
              <div v-else class="animate-fade-in-up">
                <p class="text-gray-100 font-mono italic leading-relaxed whitespace-pre-wrap" style="font-size:12px;line-height:1.7">{{ aiResult }}</p>
                <div class="mt-3 pt-3 border-t border-tao-gold/15 space-y-1">
                  <div class="font-mono text-tao-gold/50 uppercase" style="font-size:9px;letter-spacing:0.3em">// Extended Hexagram Matrix</div>
                  <div class="font-mono" style="font-size:10px;color:rgba(34,211,238,0.7)">{{ hexagramData.nameEn }} · {{ hexagramData.nameZh }}</div>
                  <div v-if="hasChangingLine" class="font-mono text-red-400/60 mt-1" style="font-size:9px">
                    ◈ CHANGING: 第 {{ changingLineNumbers }} 爻在动 · 参考之卦以知变化走向
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="shrink-0 grid grid-cols-2 gap-3 px-4 py-3 border-t border-tao-gold/25">
          <button @click="sealDestiny"
            :disabled="sealLoading"
            class="border font-mono font-black uppercase transition-all cyber-btn-corners relative"
            style="padding:12px 0;font-size:11px;letter-spacing:0.35em"
            :style="sealLoading
              ? 'border-color:rgba(200,170,110,0.2);color:rgba(200,170,110,0.25);background:transparent;cursor:not-allowed'
              : 'border-color:rgba(200,170,110,0.8);color:#c8aa6e;background:rgba(200,170,110,0.12);box-shadow:0 0 20px rgba(200,170,110,0.28)'">
            {{ sealLoading ? 'SEALING...' : '⬡ SEAL DESTINY' }}
          </button>
          <button @click="reset"
            class="border font-mono uppercase transition-all"
            style="padding:12px 0;font-size:11px;letter-spacing:0.4em;border-color:rgba(255,255,255,0.22);color:rgba(255,255,255,0.6)">
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
      :hexagramData="{ name:hexagramData.nameEn, nameZh:hexagramData.nameZh, poemZh:hexagramData.poemZh, lines:hexagramResult }"
      :aiPredictionText="aiResult"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import SpiritBottle from './components/SpiritBottle.vue'
import CoinToss from './components/CoinToss.vue'
import TalismanCard from './components/TalismanCard.vue'
import SystemLog from './components/SystemLog.vue'
import TaijituCore from './components/TaijituCore.vue'

const step = ref('intro')
const question = ref('')
const hexagramResult = ref([])
const currentChangingLines = ref([])
const aiResult = ref('')
const loading = ref(false)
const talismanRef = ref(null)
const fullAnalysisContainer = ref(null)
const spiritPoints  = ref(24)   // 灵力点数 (0-24)
const lastReadingTime = ref(null)  // 兼容字段
const hexagramData = ref({ nameZh:'', nameEn:'', poemZh:'' })
const deviceId = ref('')
const isAdmin = ref(false)
const shareCount = ref(0)
const MAX_SHARES_PER_DAY = 3
const router = useRouter()
const sealLoading = ref(false)
const analysisUnlocked = ref(false) // 本次占卜是否已解锁完整分析
const aiOracle = ref('')
const geoRegion = ref('VOID')  // 来自 Edge Function
const geoBeast  = ref('qilin') // 来自 Edge Function
const matrixCanvas = ref(null)
const currentTime = ref('')
const showTimeline = ref(false)

// ── 命运时间轴 ──
const fateHistory = ref([])
const loadHistory = () => {
  try { fateHistory.value = JSON.parse(localStorage.getItem('cyber_tao_history') || '[]') }
  catch { fateHistory.value = [] }
}
const saveHistory = (r) => {
  const h = [...fateHistory.value, r].slice(-10)
  fateHistory.value = h
  localStorage.setItem('cyber_tao_history', JSON.stringify(h))
}
const clearHistory = () => { fateHistory.value = []; localStorage.removeItem('cyber_tao_history') }
const fateHistoryReversed = computed(() => [...fateHistory.value].reverse())
const formatTime = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
const getSyncColor = (r) => {
  const v = parseFloat(r)
  if (v >= 99) return '#ef4444'; if (v >= 95) return '#c8aa6e'; if (v >= 90) return '#22d3ee'
  return 'rgba(255,255,255,0.4)'
}
const calcSyncRate = (id, code, geo = '') => {
  const s = `${id}-${Date.now()}-${code}-${geo}`
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  const r = 80 + (Math.abs(h) % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
}

// ── 问题模板（英文为主，括号辅助中文）──
const questionTemplates = [
  { label: 'CAREER',  text: 'What is the outlook for my career path right now?' },
  { label: 'LOVE',    text: 'What guidance does the oracle offer about my love life?' },
  { label: 'WEALTH',  text: 'How is my financial fortune? Is this a good time to invest?' },
  { label: 'CHOICE',  text: 'I face an important decision. What path should I take?' },
  { label: 'TODAY',   text: 'What should I be mindful of today?' },
]
const applyTemplate = (tpl) => { question.value = tpl.text }

// ── 变爻 ──
const hasChangingLine = computed(() => currentChangingLines.value.some(Boolean))
const changingLineNumbers = computed(() => {
  const n = []
  currentChangingLines.value.forEach((c, i) => { if (c) n.push(i + 1) })
  return n.join('、')
})
const getLineStyle = (i) => {
  if (currentChangingLines.value[i]) {
    return { background:'linear-gradient(90deg,#c8aa6e,#ef4444,#c8aa6e)', boxShadow:'0 0 10px rgba(239,68,68,0.6)' }
  }
  return { background:'#c8aa6e', boxShadow:'0 0 8px rgba(200,170,110,0.6)' }
}

// ── Canvas Rain ──
let animFrameId = null
const initMatrix = () => {
  const canvas = matrixCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize(); window.addEventListener('resize', resize)
  const chars = '0123456789ABCDEF☯⚡◈⬡乾坤坎离震巽艮兑'.split('')
  const fs = 13, cols = Math.floor(canvas.width / fs), drops = Array(cols).fill(1)
  const draw = () => {
    ctx.fillStyle = 'rgba(6,9,15,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)], b = Math.random()
      if      (b > 0.96) { ctx.fillStyle='#e8f4ff'; ctx.shadowColor='#fff'; ctx.shadowBlur=12 }
      else if (b > 0.82) { ctx.fillStyle='#c8aa6e'; ctx.shadowColor='#c8aa6e'; ctx.shadowBlur=8 }
      else if (b > 0.5)  { ctx.fillStyle=`rgba(34,197,111,${0.4+b*0.4})`; ctx.shadowBlur=5 }
      else               { ctx.fillStyle=`rgba(20,160,80,${0.2+b*0.2})`; ctx.shadowBlur=0 }
      ctx.font=`${fs}px monospace`; ctx.fillText(ch, i*fs, drops[i]*fs); ctx.shadowBlur=0
      if (drops[i]*fs > canvas.height && Math.random() > 0.975) drops[i] = 0
      drops[i]++
    }
    animFrameId = requestAnimationFrame(draw)
  }; draw()
}

let clockInterval = null
const updateClock = () => { currentTime.value = new Date().toTimeString().slice(0, 8) }

const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase.from('device_profiles').insert([{ device_id: id }])
  }
  deviceId.value = id
  const { data } = await supabase.from('device_profiles')
    .select('is_unlimited,spirit_points,last_reading_date,share_count,last_share_date,ip_address').eq('device_id', id).single()
  if (data) {
    isAdmin.value = data.is_unlimited
    spiritPoints.value = data.spirit_points ?? 24  // 默认满灵力
    const today = new Date().toISOString().split('T')[0]
    shareCount.value = data.last_share_date !== today ? 0 : (data.share_count || 0)
  }
}

onMounted(() => {
  initIdentity(); loadHistory()
  // lastReadingTime from DB via initIdentity
  initMatrix(); updateClock()
  clockInterval = setInterval(updateClock, 1000)
})
onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (clockInterval) clearInterval(clockInterval)
})

const hasSpirit = computed(() => {
  if (isAdmin.value) return true
  return spiritPoints.value >= 8
})
const aiResultPreview = computed(() =>
  !aiResult.value ? '' : aiResult.value.slice(0, 100) + (aiResult.value.length > 100 ? '...' : '')
)
const aiResultFullBlurred = computed(() =>
  !aiResult.value || aiResult.value.length <= 100 ? '' : aiResult.value.slice(100, 400)
)
const unlockFullAnalysis = async () => {
  if (spiritPoints.value < 8) return
  const newSpirit = spiritPoints.value - 8
  spiritPoints.value = newSpirit
  analysisUnlocked.value = true
  await supabase.from('device_profiles')
    .update({ spirit_points: newSpirit })
    .eq('device_id', deviceId.value)
}

// ★ 关键：兼容旧数组格式和新对象格式
const onRitualComplete = async (payload) => {
  const lines = Array.isArray(payload) ? payload : payload.lines
  const changingLines = Array.isArray(payload) ? [] : (payload.changingLines || [])

  hexagramResult.value = lines
  currentChangingLines.value = changingLines
  step.value = 'result'
  loading.value = true

  const isEnglish = /^[a-zA-Z0-9\s.,?!'"\-]+$/.test(question.value.trim())
  try {
    const { data: aiData, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines, question: question.value, language: isEnglish ? 'en' : 'zh', changingLines }
    })
    if (error) throw error

    hexagramData.value = { nameZh: aiData.hexagramNameZh, nameEn: aiData.hexagramNameEn, poemZh: aiData.poemZh }
    aiOracle.value = aiData.oracle || ''
    aiResult.value = aiData.interpretation
    geoRegion.value = aiData.geoRegion || 'VOID'
    geoBeast.value  = aiData.geoBeast  || 'qilin'

    const now = new Date().toISOString()
    const hexCode = lines.join('')
    const today = now.split('T')[0]
    const newSpirit = Math.max(0, spiritPoints.value - 8)
    spiritPoints.value = newSpirit
    analysisUnlocked.value = false  // 每次新占卜重置解锁状态
    await supabase.from('device_profiles').update({
      spirit_points: newSpirit,
      last_reading_date: today,
      last_reading_at: now,
      geo_region: aiData.geoRegion || '',
      geo_beast:  aiData.geoBeast  || '',
      ip_address: aiData.ipHash    || '',
    }).eq('device_id', deviceId.value)
    supabase.from('divination_logs').insert([{
      device_id: deviceId.value, question: question.value, hexagram_code: hexCode,
      name_zh: aiData.hexagramNameZh, name_en: aiData.hexagramNameEn, interpretation: aiData.interpretation, oracle: aiData.oracle || '',
      ip_hash: aiData.ipHash || '', geo_region: aiData.geoRegion || '', geo_beast: aiData.geoBeast || ''
    }]).then()

    saveHistory({
      id: Date.now(), timestamp: now, question: question.value, hexCode,
      nameZh: aiData.hexagramNameZh, nameEn: aiData.hexagramNameEn,
      syncRate: calcSyncRate(deviceId.value, hexCode, aiData.geoRegion || ''),
      hasChangingLine: changingLines.some(Boolean),
      geoRegion: aiData.geoRegion || '',
      geoBeast: aiData.geoBeast || '',
    })

    lastReadingTime.value = now  // 保留兼容
  } catch (err) {
    console.error('AI Error:', err)
    aiResult.value = 'SIGNAL INTERRUPTED: The digital void remains silent.'
  } finally {
    loading.value = false }
}

// 封印命运卡后，触发分享弹窗，成功则 +1 次占卜（每天上限3次）
const handleRefillShare = async () => {
  if (shareCount.value >= MAX_SHARES_PER_DAY) { alert('DAILY SHARE LIMIT REACHED.'); return }
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Cyber Tao', url: window.location.href })
      const today = new Date().toISOString().split('T')[0]
      const nc = shareCount.value + 1
      const newSpirit = Math.min(24, spiritPoints.value + 8)  // +8点，上限24
      await supabase.from('device_profiles').update({
        share_count: nc,
        last_share_date: today,
        spirit_points: newSpirit,
      }).eq('device_id', deviceId.value)
      shareCount.value = nc
      spiritPoints.value = newSpirit
    }
  } catch (e) { console.log('Share canceled') }
}


// ── 封印命运：生成唯一 card_id，写入 Supabase，跳转到专属页 ──
const sealDestiny = async () => {
  if (sealLoading.value || !hexagramData.value.nameZh) return
  sealLoading.value = true
  try {
    const hexCode = hexagramResult.value.join('')
    const now = new Date().toISOString()

    const rawId = `${deviceId.value}-${Date.now()}-${hexCode}`
    const buf   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawId))
    const fullHash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
    const hash8 = fullHash.slice(0, 8).toUpperCase()

    const { count } = await supabase.from('divination_logs').select('*', { count:'exact', head:true }).eq('is_sealed', true)
    const editionNumber = (count || 0) + 1
    const cardId = `CT-${String(editionNumber).padStart(4,'0')}-${hexagramData.value.nameZh}-${hash8}`

    const hashRaw = `${cardId}:${deviceId.value}:${hexCode}:${now}`
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashRaw))
    const verifiedHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0, 16)

    const { error } = await supabase
      .from('divination_logs')
      .update({
        card_id: cardId,
        edition_number: editionNumber,
        verified_hash: verifiedHash,
        oracle: aiOracle.value,
        is_sealed: true,
      })
      .eq('device_id', deviceId.value)
      .eq('hexagram_code', hexCode)
      .is('card_id', null)
      .order('id', { ascending: false })
      .limit(1)

    if (error) throw error
    router.push(`/destiny/${encodeURIComponent(cardId)}`)
  } catch (err) {
    console.error('Seal error:', err)
    alert('SEAL FAILED: ' + err.message)
  } finally {
    sealLoading.value = false
  }
}

const reset = () => {
  step.value = 'intro'; question.value = ''; hexagramResult.value = []
  currentChangingLines.value = []; aiOracle.value = ''; aiResult.value = ''
  analysisUnlocked.value = false
  hexagramData.value = { nameZh:'', nameEn:'', poemZh:'' }; showTimeline.value = false
  // dailyReadings not reset on return - keeps the count
}
</script>

<style scoped>
.neon-text-gold {
  text-shadow: 0 0 8px rgba(200,170,110,0.95), 0 0 20px rgba(200,170,110,0.55), 0 0 45px rgba(200,170,110,0.28);
}
.neon-text-white {
  text-shadow: 0 0 10px rgba(255,255,255,0.65), 0 0 25px rgba(200,170,110,0.38), 0 0 50px rgba(200,170,110,0.18);
}
.panel-frame {
  box-shadow: 0 0 0 1px rgba(200,170,110,0.38), 0 0 40px rgba(200,170,110,0.12), 0 0 100px rgba(200,170,110,0.06), inset 0 0 60px rgba(6,9,15,0.5);
  border-radius: 2px; position: relative;
}
.panel-frame::before {
  content:''; position:absolute; top:0; left:0; width:18px; height:18px; z-index:20; pointer-events:none;
  border-top:2px solid rgba(200,170,110,0.88); border-left:2px solid rgba(200,170,110,0.88);
  box-shadow:-2px -2px 10px rgba(200,170,110,0.45);
}
.panel-frame::after {
  content:''; position:absolute; bottom:0; right:0; width:18px; height:18px; z-index:20; pointer-events:none;
  border-bottom:2px solid rgba(200,170,110,0.88); border-right:2px solid rgba(200,170,110,0.88);
  box-shadow:2px 2px 10px rgba(200,170,110,0.45);
}
.cyber-terminal-box {
  background:rgba(0,0,0,0.5); border:1px solid rgba(200,170,110,0.38); border-radius:2px; position:relative;
  box-shadow:inset 0 0 18px rgba(200,170,110,0.04), 0 0 12px rgba(200,170,110,0.07);
}
.cyber-terminal-box::before {
  content:''; position:absolute; top:0; left:0; width:10px; height:10px;
  border-top:2px solid rgba(200,170,110,0.92); border-left:2px solid rgba(200,170,110,0.92);
}
.cyber-terminal-box::after {
  content:''; position:absolute; bottom:0; right:0; width:10px; height:10px;
  border-bottom:2px solid rgba(200,170,110,0.92); border-right:2px solid rgba(200,170,110,0.92);
}
.cyber-btn-corners::before {
  content:''; position:absolute; top:-1px; left:-1px; width:7px; height:7px;
  border-top:2px solid #c8aa6e; border-left:2px solid #c8aa6e;
}
.cyber-btn-corners::after {
  content:''; position:absolute; bottom:-1px; right:-1px; width:7px; height:7px;
  border-bottom:2px solid #c8aa6e; border-right:2px solid #c8aa6e;
}
@keyframes terminal-scan { 0%{top:0;opacity:0} 5%{opacity:0.75} 95%{opacity:0.75} 100%{top:100%;opacity:0} }
.terminal-scan { animation:terminal-scan 4s linear infinite; position:absolute; height:1px; left:0; right:0; }
.cyber-grid-visible {
  background-image: linear-gradient(rgba(200,170,110,0.11) 1px,transparent 1px), linear-gradient(90deg,rgba(200,170,110,0.11) 1px,transparent 1px);
  background-size:18px 18px;
}
.timeline-slide-enter-active { transition:transform 0.3s cubic-bezier(0.2,0.8,0.2,1),opacity 0.3s; }
.timeline-slide-leave-active  { transition:transform 0.25s ease-in,opacity 0.25s; }
.timeline-slide-enter-from    { transform:translateY(-12px); opacity:0; }
.timeline-slide-leave-to      { transform:translateY(-8px); opacity:0; }
.timeline-record { border-radius:2px; transition:border-color 0.2s; }
.timeline-record:hover { border-color:rgba(200,170,110,0.3) !important; }
@keyframes fadeIn    { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
@keyframes fadeInUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
.animate-fade-in     { animation:fadeIn    1.2s cubic-bezier(0.2,0.8,0.2,1) forwards; }
.animate-fade-in-up  { animation:fadeInUp  0.8s ease-out forwards; }
.custom-scrollbar::-webkit-scrollbar       { width:2px; }
.custom-scrollbar::-webkit-scrollbar-track { background:transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(200,170,110,0.35); border-radius:4px; }
</style>
