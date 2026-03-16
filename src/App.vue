<template>
  <div class="fixed inset-0 bg-[#06090f] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans">

    <!-- ░░ LAYER 0: Canvas Cyber Waterfall ░░ -->
    <!-- opacity-70: 从40%提升到70%，让字符流真正可见 -->
    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-70"></canvas>

    <!-- ░░ LAYER 1: 轻量辐射遮罩（仅边缘收口，不压中心）░░ -->
    <div class="absolute inset-0 z-[1] pointer-events-none"
         style="background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 55%, rgba(6,9,15,0.85) 100%)"></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh]
                  bg-[#0c1018]/80 backdrop-blur-md
                  flex flex-col overflow-hidden
                  panel-frame">

      <!-- ─── TOP CHROME ─── -->
      <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/30 bg-black/40">
        <span class="text-[8px] font-mono text-tao-gold/70 tracking-[0.4em]">CYBER·TAO v2.0</span>
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-tao-red" style="box-shadow:0 0 6px #8a2a2a,0 0 12px #8a2a2aaa"></span>
          <span class="w-2 h-2 rounded-full bg-tao-gold" style="box-shadow:0 0 6px #c8aa6e,0 0 12px #c8aa6eaa"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-400" style="box-shadow:0 0 6px #22d3ee,0 0 12px #22d3eeaa"></span>
        </div>
        <span class="text-[8px] font-mono text-tao-gold/60 tracking-[0.3em]">{{ currentTime }}</span>
      </div>

      <!-- ─── INTRO ─── -->
      <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-between w-full py-5 px-5 overflow-hidden">

        <header class="text-center w-full animate-fade-in shrink-0">
          <h1 class="text-2xl md:text-3xl font-serif tracking-[0.5em] text-white neon-text-gold">
            CYBER TAO
          </h1>
          <div class="h-px w-16 bg-gradient-to-r from-transparent via-tao-gold to-transparent mx-auto mt-3 mb-3"></div>
          <p class="text-tao-gold/80 text-[10px] md:text-xs tracking-[0.35em] font-mono uppercase">
            吉凶悔吝 ：Fatum et Fluxus
          </p>
        </header>

        <div class="w-full space-y-4 flex-1 flex flex-col justify-center">
          <!-- Terminal Input -->
          <div class="relative cyber-terminal-box">
            <div class="flex items-start gap-2 p-3">
              <span class="text-tao-gold/90 font-mono text-sm mt-1 shrink-0 neon-text-gold">&gt;_</span>
              <textarea
                v-model="question"
                placeholder="ENTER THE VOID..."
                class="flex-1 bg-transparent focus:outline-none text-white text-sm md:text-base
                       placeholder:text-white/35 placeholder:italic resize-none font-mono leading-relaxed"
                rows="3"
              ></textarea>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tao-gold/60 to-transparent"></div>
            <div class="absolute inset-x-0 h-px bg-tao-gold/30 terminal-scan pointer-events-none"></div>
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
          :disabled="!question || (!hasSpirit && !isAdmin)"
          class="shrink-0 w-full py-3 md:py-4
                  border border-tao-gold/70
                  text-tao-gold hover:border-tao-gold
                  disabled:opacity-25 disabled:cursor-not-allowed
                  transition-all duration-500 text-[10px] md:text-xs font-black tracking-[0.8em] uppercase
                  cyber-btn-corners relative"
          style="background: rgba(200,170,110,0.10); box-shadow: 0 0 20px rgba(200,170,110,0.15), inset 0 0 20px rgba(200,170,110,0.05);"
        >
          INITIATE PROTOCOL
        </button>

        <div class="shrink-0 w-full mt-3">
          <SystemLog />
        </div>
      </section>

      <!-- ─── RITUAL ─── -->
      <section v-else-if="step === 'ritual'" class="flex-1 flex items-center justify-center">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <!-- ─── RESULT ─── -->
      <section v-else-if="step === 'result'" class="flex-1 flex flex-col w-full overflow-hidden">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center space-y-4">
          <div class="relative w-10 h-10">
            <div class="absolute inset-0 border-2 border-tao-gold/30 border-t-tao-gold rounded-full animate-spin"></div>
            <div class="absolute inset-2 border border-cyan-400/40 border-b-cyan-400 rounded-full animate-spin" style="animation-direction:reverse;animation-duration:0.8s"></div>
          </div>
          <span class="text-[9px] tracking-[0.5em] text-tao-gold/70 uppercase font-mono animate-pulse">Synchronizing Neural Grid...</span>
        </div>

        <!-- Result Content -->
        <div v-else class="flex-1 flex flex-col overflow-y-auto custom-scrollbar animate-fade-in-up px-4 pt-4 pb-2 gap-4">

          <!-- Hexagram Header -->
          <div class="text-center shrink-0">
            <h2 class="text-4xl md:text-5xl font-serif text-white tracking-[0.4em] neon-text-white">
              {{ hexagramData.nameZh }}
            </h2>
            <p class="text-[10px] tracking-[0.8em] text-tao-gold/75 uppercase mt-1">{{ hexagramData.nameEn }}</p>
            <div class="w-12 h-px bg-tao-gold/50 mx-auto my-3"></div>
            <p class="text-white/95 font-serif text-base md:text-lg leading-relaxed tracking-widest max-w-xs mx-auto">
              {{ hexagramData.poemZh }}
            </p>
          </div>

          <!-- Neural Analysis Box -->
          <div class="relative cyber-terminal-box shrink-0">
            <div class="absolute -top-2.5 left-3 px-2 bg-[#0c1018] text-[8px] text-tao-gold/80 font-mono tracking-widest uppercase z-10">
              NEURAL ANALYSIS // CLASSIFIED
            </div>
            <div class="p-4">
              <p class="text-gray-100 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">
                {{ aiResultPreview }}
              </p>

              <!-- Paywall Blur Zone -->
              <div v-if="aiResult.length > 100" class="relative mt-3">
                <div class="relative overflow-hidden rounded-sm">
                  <p class="text-gray-300/60 font-mono text-xs leading-relaxed italic whitespace-pre-wrap select-none"
                     style="filter: blur(4px); user-select: none; pointer-events: none;">
                    {{ aiResultFullBlurred }}
                  </p>
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c1018]/60 to-[#0c1018]/90"></div>
                  <div class="absolute inset-0 cyber-grid-visible"></div>
                </div>

                <div class="flex flex-col items-center mt-3 gap-2">
                  <div class="flex items-center gap-2 text-[8px] font-mono text-tao-gold/65 tracking-widest uppercase">
                    <span class="w-8 h-px bg-tao-gold/40"></span>
                    <span>FATE SEAL ACTIVE</span>
                    <span class="w-8 h-px bg-tao-gold/40"></span>
                  </div>
                  <button
                    @click="unlockFullAnalysis"
                    class="w-full py-2.5 border border-tao-gold/70 text-tao-gold
                            text-[9px] font-black tracking-[0.5em] uppercase
                            hover:border-tao-gold hover:bg-tao-gold/15
                            transition-all duration-300 cyber-btn-corners relative"
                    style="background: linear-gradient(135deg, rgba(200,170,110,0.12), rgba(200,170,110,0.2)); box-shadow: 0 0 20px rgba(200,170,110,0.25);"
                  >
                    🔓 解锁完整命运解析
                  </button>
                  <span class="text-[7px] text-white/40 font-mono tracking-widest">FULL_DESTINY_MATRIX.decrypt</span>
                </div>

                <!-- 隐藏容器 -->
                <div
                  ref="fullAnalysisContainer"
                  class="hidden mt-3 p-3 border border-tao-gold/30 bg-black/30 rounded-sm"
                  data-paywall="full-analysis"
                >
                  <p class="text-gray-100 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">
                    {{ aiResult }}
                  </p>
                  <div class="mt-3 pt-3 border-t border-tao-gold/20 flex flex-col gap-1.5">
                    <div class="text-[7px] font-mono text-tao-gold/60 tracking-widest uppercase">// Extended Hexagram Matrix</div>
                    <div class="text-[8px] font-mono text-cyan-300/80">{{ hexagramData.nameEn }} · {{ hexagramData.nameZh }}</div>
                    <div class="text-[8px] font-mono text-white/50">{{ hexagramData.poemZh }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="shrink-0 grid grid-cols-2 gap-3 px-4 py-3 border-t border-tao-gold/30">
          <button
            @click="talismanRef.generate()"
            class="py-3 border border-tao-gold/60 text-tao-gold
                    text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase
                    hover:bg-tao-gold/20 transition-all rounded-sm cyber-btn-corners relative"
            style="background: rgba(200,170,110,0.12); box-shadow: 0 0 12px rgba(200,170,110,0.2);"
          >
            EXTRACT
          </button>
          <button
            @click="reset"
            class="py-3 border border-white/30 text-white/70
                    text-[9px] md:text-[10px] tracking-[0.4em] uppercase
                    hover:bg-white/10 hover:text-white transition-all rounded-sm"
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

const step = ref('intro')
const question = ref('')
const hexagramResult = ref([])
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
    // 拖尾从 0.08 降至 0.05，轨迹更长更明显
    ctx.fillStyle = 'rgba(6, 9, 15, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const brightness = Math.random()

      if (brightness > 0.96) {
        ctx.fillStyle = '#e8f4ff'
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = 12
      } else if (brightness > 0.82) {
        ctx.fillStyle = '#c8aa6e'
        ctx.shadowColor = '#c8aa6e'
        ctx.shadowBlur = 8
      } else if (brightness > 0.5) {
        ctx.fillStyle = `rgba(34, 197, 111, ${0.4 + brightness * 0.4})`
        ctx.shadowColor = 'rgba(34, 211, 150, 0.6)'
        ctx.shadowBlur = 5
      } else {
        ctx.fillStyle = `rgba(20, 160, 80, ${0.2 + brightness * 0.2})`
        ctx.shadowBlur = 0
      }

      ctx.font = `${fontSize}px monospace`
      ctx.fillText(char, i * fontSize, drops[i] * fontSize)
      ctx.shadowBlur = 0

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
    animFrameId = requestAnimationFrame(draw)
  }
  draw()
}

let clockInterval = null
const updateClock = () => {
  currentTime.value = new Date().toTimeString().slice(0, 8)
}

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
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading')
  initMatrix()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (clockInterval) clearInterval(clockInterval)
})

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const hoursPassed = (Date.now() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60)
  return hoursPassed >= 12
})

const aiResultPreview = computed(() => {
  if (!aiResult.value) return ''
  return aiResult.value.slice(0, 100) + (aiResult.value.length > 100 ? '...' : '')
})

const aiResultFullBlurred = computed(() => {
  if (!aiResult.value || aiResult.value.length <= 100) return ''
  return aiResult.value.slice(100, 400)
})

const unlockFullAnalysis = () => {
  if (fullAnalysisContainer.value) {
    fullAnalysisContainer.value.classList.toggle('hidden')
  }
}

const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true
  const isEnglish = /^[a-zA-Z0-9\s.,?!'""-]+$/.test(question.value.trim())
  try {
    const { data: aiData, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines, question: question.value, language: isEnglish ? 'en' : 'zh' }
    })
    if (error) throw error
    hexagramData.value = {
      nameZh: aiData.hexagramNameZh,
      nameEn: aiData.hexagramNameEn,
      poemZh: aiData.poemZh
    }
    aiResult.value = aiData.interpretation
    const now = new Date().toISOString()
    await supabase.from('device_profiles').update({ last_reading_at: now }).eq('device_id', deviceId.value)
    supabase.from('divination_logs').insert([{
      device_id: deviceId.value,
      question: question.value,
      hexagram_code: lines.join(''),
      name_zh: aiData.hexagramNameZh,
      name_en: aiData.hexagramNameEn,
      interpretation: aiData.interpretation
    }]).then()
    lastReadingTime.value = now
    localStorage.setItem('cyber_tao_last_reading', now)
  } catch (err) {
    console.error('AI Error:', err)
    aiResult.value = 'SIGNAL INTERRUPTED: The digital void remains silent.'
  } finally {
    loading.value = false
  }
}

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

const reset = () => {
  step.value = 'intro'
  question.value = ''
  hexagramResult.value = []
  aiResult.value = ''
  hexagramData.value = { nameZh: '', nameEn: '', poemZh: '' }
}
</script>

<style scoped>
/* ── 霓虹文字（增强发光强度）── */
.neon-text-gold {
  text-shadow:
    0 0 8px rgba(200, 170, 110, 0.95),
    0 0 20px rgba(200, 170, 110, 0.6),
    0 0 45px rgba(200, 170, 110, 0.3);
}
.neon-text-white {
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.7),
    0 0 25px rgba(200, 170, 110, 0.4),
    0 0 50px rgba(200, 170, 110, 0.2);
}

/* ── 主面板（替代 clip-path，保留发光 + 伪元素切角）── */
.panel-frame {
  box-shadow:
    0 0 0 1px rgba(200, 170, 110, 0.40),
    0 0 40px rgba(200, 170, 110, 0.14),
    0 0 100px rgba(200, 170, 110, 0.07),
    inset 0 0 60px rgba(6, 9, 15, 0.5);
  border-radius: 2px;
  position: relative;
}
/* 左上切角 */
.panel-frame::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 18px; height: 18px;
  border-top: 2px solid rgba(200, 170, 110, 0.9);
  border-left: 2px solid rgba(200, 170, 110, 0.9);
  z-index: 20;
  pointer-events: none;
  box-shadow: -2px -2px 10px rgba(200, 170, 110, 0.5);
}
/* 右下切角 */
.panel-frame::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 18px; height: 18px;
  border-bottom: 2px solid rgba(200, 170, 110, 0.9);
  border-right: 2px solid rgba(200, 170, 110, 0.9);
  z-index: 20;
  pointer-events: none;
  box-shadow: 2px 2px 10px rgba(200, 170, 110, 0.5);
}

/* ── 终端框（边框亮度 /20 → /40，内发光）── */
.cyber-terminal-box {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(200, 170, 110, 0.40);
  border-radius: 2px;
  position: relative;
  box-shadow:
    inset 0 0 20px rgba(200, 170, 110, 0.05),
    0 0 15px rgba(200, 170, 110, 0.08);
}
.cyber-terminal-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid rgba(200, 170, 110, 0.95);
  border-left: 2px solid rgba(200, 170, 110, 0.95);
}
.cyber-terminal-box::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid rgba(200, 170, 110, 0.95);
  border-right: 2px solid rgba(200, 170, 110, 0.95);
}

/* ── 按钮角装饰（完全不透明）── */
.cyber-btn-corners::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 7px; height: 7px;
  border-top: 2px solid #c8aa6e;
  border-left: 2px solid #c8aa6e;
}
.cyber-btn-corners::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 7px; height: 7px;
  border-bottom: 2px solid #c8aa6e;
  border-right: 2px solid #c8aa6e;
}

/* ── 终端扫描线 ── */
@keyframes terminal-scan {
  0%   { top: 0;    opacity: 0; }
  5%   { opacity: 0.8; }
  95%  { opacity: 0.8; }
  100% { top: 100%; opacity: 0; }
}
.terminal-scan { animation: terminal-scan 4s linear infinite; }

/* ── 锁定区网格（提升至可见的 /12）── */
.cyber-grid-visible {
  background-image:
    linear-gradient(rgba(200, 170, 110, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.12) 1px, transparent 1px);
  background-size: 18px 18px;
}

/* ── 动画 ── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in    { animation: fadeIn    1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-fade-in-up { animation: fadeInUp  0.8s ease-out forwards; }

/* ── 滚动条 ── */
.custom-scrollbar::-webkit-scrollbar       { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200, 170, 110, 0.4); border-radius: 4px; }
</style>
