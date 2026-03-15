<template>
  <div class="fixed inset-0 bg-[#020408] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans selection:bg-tao-gold/30">

    <!-- ░░ LAYER 0: Canvas Cyber Waterfall ░░ -->
    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-40"></canvas>

    <!-- ░░ LAYER 1: Gradient Vignette ░░ -->
    <div class="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#020408_100%)]"></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh] bg-[#05080f]/95 backdrop-blur-2xl
                  border border-tao-gold/25
                  shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_120px_rgba(200,170,110,0.06)]
                  flex flex-col overflow-hidden
                  cyber-border-frame">

      <!-- ─── TOP CHROME ─── -->
      <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/15 bg-black/30">
        <span class="text-[8px] font-mono text-tao-gold/40 tracking-[0.4em]">CYBER·TAO v2.0</span>
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-tao-red/60 shadow-[0_0_6px_rgba(138,42,42,0.8)]"></span>
          <span class="w-2 h-2 rounded-full bg-tao-gold/40 shadow-[0_0_6px_rgba(200,170,110,0.6)]"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.7)]"></span>
        </div>
        <span class="text-[8px] font-mono text-tao-gold/30 tracking-[0.3em]">{{ currentTime }}</span>
      </div>

      <!-- ─── INTRO ─── -->
      <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-between w-full py-5 px-5 overflow-hidden">

        <header class="text-center w-full animate-fade-in shrink-0">
          <h1 class="text-2xl md:text-3xl font-serif tracking-[0.5em] text-white
                      drop-shadow-[0_0_20px_rgba(200,170,110,0.6)]
                      neon-text-gold">
            CYBER TAO
          </h1>
          <div class="h-px w-12 bg-gradient-to-r from-transparent via-tao-gold/60 to-transparent mx-auto mt-3 mb-3"></div>
          <p class="text-tao-gold/50 text-[9px] md:text-[10px] tracking-[0.35em] font-mono uppercase">
            吉凶悔吝 ：Fatum et Fluxus
          </p>
        </header>

        <div class="w-full space-y-4 flex-1 flex flex-col justify-center">
          <!-- Terminal Input -->
          <div class="relative cyber-terminal-box">
            <div class="flex items-start gap-2 p-3">
              <span class="text-tao-gold/60 font-mono text-sm mt-1 shrink-0 neon-text-gold">&gt;_</span>
              <textarea
                v-model="question"
                placeholder="ENTER THE VOID..."
                class="flex-1 bg-transparent focus:outline-none text-white text-sm md:text-base
                       placeholder:text-white/15 placeholder:italic resize-none font-mono leading-relaxed"
                rows="3"
              ></textarea>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tao-gold/40 to-transparent"></div>
            <!-- scanning line -->
            <div class="absolute inset-x-0 h-px bg-tao-gold/20 terminal-scan pointer-events-none"></div>
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
          class="shrink-0 w-full py-3 md:py-4 bg-transparent border border-tao-gold/40
                  text-tao-gold hover:bg-tao-gold/8 hover:border-tao-gold/70
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-500 text-[10px] md:text-xs font-black tracking-[0.8em] uppercase
                  shadow-[0_0_20px_rgba(200,170,110,0.1)] hover:shadow-[0_0_30px_rgba(200,170,110,0.2)]
                  cyber-btn-corners relative"
        >
          INITIATE PROTOCOL
        </button>

        <!-- Status Log -->
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
            <div class="absolute inset-0 border border-tao-gold/20 border-t-tao-gold rounded-full animate-spin"></div>
            <div class="absolute inset-2 border border-cyan-500/20 border-b-cyan-400 rounded-full animate-spin" style="animation-direction:reverse;animation-duration:0.8s"></div>
          </div>
          <span class="text-[9px] tracking-[0.5em] text-tao-gold/40 uppercase font-mono animate-pulse">Synchronizing Neural Grid...</span>
        </div>

        <!-- Result Content -->
        <div v-else class="flex-1 flex flex-col overflow-y-auto custom-scrollbar animate-fade-in-up px-4 pt-4 pb-2 gap-4">

          <!-- Hexagram Header -->
          <div class="text-center shrink-0">
            <h2 class="text-4xl md:text-5xl font-serif text-white tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] neon-text-white">
              {{ hexagramData.nameZh }}
            </h2>
            <p class="text-[9px] tracking-[0.8em] text-tao-gold/50 uppercase mt-1">{{ hexagramData.nameEn }}</p>
            <div class="w-8 h-px bg-tao-gold/30 mx-auto my-3"></div>
            <p class="text-white/80 font-serif text-base md:text-lg leading-relaxed tracking-widest max-w-xs mx-auto">
              {{ hexagramData.poemZh }}
            </p>
          </div>

          <!-- Neural Analysis Box -->
          <div class="relative cyber-terminal-box shrink-0">
            <div class="absolute -top-2.5 left-3 px-2 bg-[#05080f] text-[8px] text-tao-gold/60 font-mono tracking-widest uppercase z-10">
              NEURAL ANALYSIS // CLASSIFIED
            </div>
            <div class="p-4">

              <!-- 前100字摘要 -->
              <p class="text-gray-300 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">
                {{ aiResultPreview }}
              </p>

              <!-- Paywall Blur Zone -->
              <div v-if="aiResult.length > 100" class="relative mt-3">
                <!-- 模糊遮罩层 -->
                <div class="relative overflow-hidden rounded-sm">
                  <p class="text-gray-400/50 font-mono text-xs leading-relaxed italic whitespace-pre-wrap select-none"
                     style="filter: blur(4px); user-select: none; pointer-events: none;">
                    {{ aiResultFullBlurred }}
                  </p>
                  <!-- 渐变遮罩 -->
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#05080f]/60 to-[#05080f]/90"></div>
                  <!-- 锁定纹理 -->
                  <div class="absolute inset-0 cyber-grid opacity-5"></div>
                </div>

                <!-- Unlock Button -->
                <div class="flex flex-col items-center mt-3 gap-2">
                  <div class="flex items-center gap-2 text-[8px] font-mono text-tao-gold/40 tracking-widest uppercase">
                    <span class="w-8 h-px bg-tao-gold/20"></span>
                    <span>FATE SEAL ACTIVE</span>
                    <span class="w-8 h-px bg-tao-gold/20"></span>
                  </div>
                  <button
                    @click="unlockFullAnalysis"
                    class="w-full py-2.5 bg-gradient-to-r from-tao-gold/15 to-tao-gold/25
                            border border-tao-gold/50 text-tao-gold
                            text-[9px] font-black tracking-[0.5em] uppercase
                            hover:from-tao-gold/25 hover:to-tao-gold/35 hover:border-tao-gold
                            transition-all duration-300
                            shadow-[0_0_20px_rgba(200,170,110,0.2)] hover:shadow-[0_0_30px_rgba(200,170,110,0.4)]
                            cyber-btn-corners relative"
                  >
                    🔓 解锁完整命运解析
                  </button>
                  <span class="text-[7px] text-white/20 font-mono tracking-widest">FULL_DESTINY_MATRIX.decrypt</span>
                </div>

                <!-- 隐藏容器：完整分析，待收费接口解锁 -->
                <div
                  ref="fullAnalysisContainer"
                  class="hidden mt-3 p-3 border border-tao-gold/20 bg-black/20 rounded-sm"
                  data-paywall="full-analysis"
                >
                  <p class="text-gray-200 font-mono text-xs leading-relaxed italic whitespace-pre-wrap">
                    {{ aiResult }}
                  </p>
                  <div class="mt-3 pt-3 border-t border-tao-gold/10 flex flex-col gap-1.5">
                    <div class="text-[7px] font-mono text-tao-gold/40 tracking-widest uppercase">// Extended Hexagram Matrix</div>
                    <div class="text-[8px] font-mono text-cyan-400/60">{{ hexagramData.nameEn }} · {{ hexagramData.nameZh }}</div>
                    <div class="text-[8px] font-mono text-white/30">{{ hexagramData.poemZh }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="shrink-0 grid grid-cols-2 gap-3 px-4 py-3 border-t border-tao-gold/10">
          <button
            @click="talismanRef.generate()"
            class="py-3 border border-tao-gold/40 bg-tao-gold/10 text-tao-gold
                    text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase
                    hover:bg-tao-gold/20 transition-all rounded-sm
                    shadow-[0_0_12px_rgba(200,170,110,0.15)]
                    cyber-btn-corners relative"
          >
            EXTRACT
          </button>
          <button
            @click="reset"
            class="py-3 border border-white/10 text-white/40
                    text-[9px] md:text-[10px] tracking-[0.4em] uppercase
                    hover:bg-white/5 hover:text-white/60 transition-all rounded-sm"
          >
            RETURN
          </button>
        </div>

        <!-- Status Log -->
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

// ── 核心状态 ──
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
    ctx.fillStyle = 'rgba(2, 4, 8, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const brightness = Math.random()

      if (brightness > 0.97) {
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = 8
      } else if (brightness > 0.85) {
        ctx.fillStyle = '#c8aa6e'
        ctx.shadowColor = '#c8aa6e'
        ctx.shadowBlur = 6
      } else {
        ctx.fillStyle = `rgba(34, 197, 111, ${0.15 + brightness * 0.25})`
        ctx.shadowColor = 'rgba(34, 197, 111, 0.3)'
        ctx.shadowBlur = 4
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

// ── 时钟 ──
let clockInterval = null
const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toTimeString().slice(0, 8)
}

// ── 初始化身份 ──
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

// ── 灵力状态 ──
const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const hoursPassed = (Date.now() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60)
  return hoursPassed >= 12
})

// ── AI 结果截取 ──
const aiResultPreview = computed(() => {
  if (!aiResult.value) return ''
  return aiResult.value.slice(0, 100) + (aiResult.value.length > 100 ? '...' : '')
})

const aiResultFullBlurred = computed(() => {
  if (!aiResult.value || aiResult.value.length <= 100) return ''
  return aiResult.value.slice(100, 400)
})

// ── 解锁逻辑（预留收费接口）──
const unlockFullAnalysis = () => {
  // TODO: 接入支付验证 API
  // 当前为演示：直接展示（后续替换为 payment gate）
  if (fullAnalysisContainer.value) {
    fullAnalysisContainer.value.classList.toggle('hidden')
  }
}

// ── 仪式完成 ──
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

const reset = () => {
  step.value = 'intro'
  question.value = ''
  hexagramResult.value = []
  aiResult.value = ''
  hexagramData.value = { nameZh: '', nameEn: '', poemZh: '' }
}
</script>

<style scoped>
/* ── 霓虹文字 ── */
.neon-text-gold {
  text-shadow: 0 0 10px rgba(200, 170, 110, 0.5), 0 0 30px rgba(200, 170, 110, 0.2);
}
.neon-text-white {
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 40px rgba(200, 170, 110, 0.15);
}

/* ── 赛博边框框架 ── */
.cyber-border-frame {
  clip-path: polygon(
    0 12px, 12px 0,
    calc(100% - 12px) 0, 100% 12px,
    100% calc(100% - 12px), calc(100% - 12px) 100%,
    12px 100%, 0 calc(100% - 12px)
  );
}

/* ── 终端输入框 ── */
.cyber-terminal-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 2px;
  position: relative;
}
.cyber-terminal-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 8px; height: 8px;
  border-top: 1px solid rgba(200, 170, 110, 0.6);
  border-left: 1px solid rgba(200, 170, 110, 0.6);
}
.cyber-terminal-box::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 8px; height: 8px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.6);
  border-right: 1px solid rgba(200, 170, 110, 0.6);
}

/* ── 按钮角装饰 ── */
.cyber-btn-corners::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 6px; height: 6px;
  border-top: 2px solid rgba(200, 170, 110, 0.8);
  border-left: 2px solid rgba(200, 170, 110, 0.8);
}
.cyber-btn-corners::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 6px; height: 6px;
  border-bottom: 2px solid rgba(200, 170, 110, 0.8);
  border-right: 2px solid rgba(200, 170, 110, 0.8);
}

/* ── 终端扫描线 ── */
@keyframes terminal-scan {
  0% { top: 0; opacity: 0; }
  5% { opacity: 0.6; }
  95% { opacity: 0.6; }
  100% { top: 100%; opacity: 0; }
}
.terminal-scan {
  animation: terminal-scan 4s linear infinite;
}

/* ── 渐入动画 ── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }

/* ── 背景网格 ── */
.cyber-grid {
  background-image:
    linear-gradient(rgba(200, 170, 110, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 170, 110, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ── 滚动条 ── */
.custom-scrollbar::-webkit-scrollbar { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200, 170, 110, 0.25); border-radius: 4px; }
</style>
