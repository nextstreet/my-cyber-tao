<template>
  <div
    class="fixed inset-0 bg-[#020408] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans selection:bg-tao-gold/30"
  >
    <!-- ░░ LAYER 0: Canvas Cyber Waterfall ░░ -->
    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-40"></canvas>

    <!-- ░░ LAYER 1: Gradient Vignette ░░ -->
    <div
      class="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#020408_100%)]"
    ></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main
      class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh] bg-[#05080f]/95 backdrop-blur-2xl border border-tao-gold/25 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_120px_rgba(200,170,110,0.06)] flex flex-col overflow-hidden cyber-border-frame"
    >
      <!-- ─── TOP CHROME ─── -->
      <div
        class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/15 bg-black/30"
      >
        <span class="text-[8px] font-mono text-tao-gold/40 tracking-[0.4em]">CYBER·TAO v2.0</span>
        <div class="flex gap-1.5">
          <span
            class="w-2 h-2 rounded-full bg-tao-red/60 shadow-[0_0_6px_rgba(138,42,42,0.8)]"
          ></span>
          <span
            class="w-2 h-2 rounded-full bg-tao-gold/40 shadow-[0_0_6px_rgba(200,170,110,0.6)]"
          ></span>
          <span
            class="w-2 h-2 rounded-full bg-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.7)]"
          ></span>
        </div>
        <span class="text-[8px] font-mono text-tao-gold/30 tracking-[0.3em]">{{
          currentTime
        }}</span>
      </div>

      <!-- ─── INTRO ─── -->
      <section
        v-if="step === 'intro'"
        class="flex-1 flex flex-col items-center justify-between w-full py-5 px-5 overflow-hidden"
      >
        <header class="text-center w-full animate-fade-in shrink-0">
          <h1
            class="text-2xl md:text-3xl font-serif tracking-[0.5em] text-white drop-shadow-[0_0_20px_rgba(200,170,110,0.6)] neon-text-gold"
          >
            CYBER TAO
          </h1>
          <div
            class="h-px w-12 bg-gradient-to-r from-transparent via-tao-gold/60 to-transparent mx-auto mt-3 mb-3"
          ></div>
          <p
            class="text-tao-gold/50 text-[9px] md:text-[10px] tracking-[0.35em] font-mono uppercase"
          >
            吉凶悔吝 ：Fatum et Fluxus
          </p>
        </header>

        <textarea
          v-model="question"
          placeholder="吉凶悔吝-Question"
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-6 focus:outline-none focus:border-tao-gold transition-all text-white text-xl placeholder:tracking-widest italic"
        ></textarea>

        <SpiritBottle
          :lastReadingTime="lastReadingTime"
          :isUnlimited="isAdmin"
          :shareCount="shareCount"
          @refill="handleRefillShare"
        />

        <button
          @click="step = 'ritual'"
          :disabled="!question || (!hasSpirit && !isAdmin)"
          class="group relative w-full py-5 overflow-hidden border border-tao-gold/40 transition-all hover:border-tao-gold disabled:opacity-10"
        >
          <div
            class="absolute inset-0 bg-tao-gold opacity-0 group-hover:opacity-10 transition-opacity"
          ></div>
          <span class="relative z-10 text-[11px] font-black tracking-[0.8em] uppercase">
            {{ hasSpirit || isAdmin ? 'INITIATE PROTOCOL' : 'ENERGY DEPLETED' }}
          </span>
        </button>
      </section>

      <section v-else-if="step === 'ritual'">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section
        v-else-if="step === 'result'"
        class="relative flex flex-col items-center min-h-[520px] justify-between text-center"
      >
        <div
          class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"
        >
          <span class="text-[16rem] font-serif transition-all duration-1000">{{
            hexagramData.nameEn
          }}</span>
        </div>

        <div class="z-10 w-full">
          <h2 class="text-5xl font-serif text-white tracking-[0.4em] mb-4">
            {{ hexagramData.nameZh }}
          </h2>
          <p class="text-[10px] tracking-[0.6em] text-tao-gold/40 uppercase mb-12">
            {{ hexagramData.nameEn }}
          </p>

          <div v-if="loading" class="py-24 animate-pulse flex flex-col items-center">
            <div class="w-8 h-8 border-t border-tao-gold rounded-full animate-spin mb-4"></div>
            <span class="text-[9px] tracking-[0.8em] opacity-50">DECODING REALITY</span>
          </div>

          <div v-else class="space-y-8 text-left animate-fade-in">
            <p
              class="text-white font-serif text-2xl border-l-3 border-tao-red/80 pl-6 leading-relaxed"
            >
              {{ hexagramData.poemZh }}
            </p>
            <div class="bg-white/2 border border-white/5 p-6 backdrop-blur-md">
              <p class="text-gray-400 font-mono text-sm leading-relaxed italic">
                {{ aiResult }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-6 w-full mt-10 z-20">
          <button
            @click="talismanRef.generate()"
            class="py-4 bg-tao-gold text-gold text-[11px] border border-tao-gold/30 font-black tracking-[0.4em] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all uppercase"
          >
            EXTRACT
          </button>
          <button
            @click="reset"
            class="py-4 border border-tao-gold/30 text-[11px] text-tao-gold tracking-[0.4em] hover:border-tao-gold transition-all uppercase"
          >
            RETURN
          </button>
        </div>
      </section>
    </main>

    <TalismanCard
      ref="talismanRef"
      :hexagramData="{
        name: hexagramData.nameEn,
        nameZh: hexagramData.nameZh,
        poemZh: hexagramData.poemZh,
        lines: hexagramResult,
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

// --- 核心状态 ---
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

// --- 逻辑重构 ---

// 1. 记录 IP 和分析数据
const logAnalytics = async (id) => {
  try {
    // 使用外部 API 获取 IP (Supabase 客户端本身不直接暴露 IP)
    const res = await fetch('https://api.ipify.org?format=json')
    const { ip } = await res.json()

    await supabase.from('user_analytics').insert([
      {
        device_id: id,
        ip_address: ip,
        user_agent: navigator.userAgent,
      },
    ])
  } catch (e) {
    console.error('Analytics failed', e)
  }
}

const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase.from('device_profiles').insert([{ device_id: id }])
  }
  deviceId.value = id

  // 记录访问日志
  logAnalytics(id)

  const { data } = await supabase
    .from('device_profiles')
    .select('is_unlimited, last_reading_at, share_count, last_share_date')
    .eq('device_id', id)
    .single()

  if (data) {
    isAdmin.value = data.is_unlimited
    const today = new Date().toISOString().split('T')[0]
    if (data.last_share_date !== today) {
      shareCount.value = 0
    } else {
      shareCount.value = data.share_count || 0
    }
  }
}

onMounted(() => {
  initIdentity()
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading')
})

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  return (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60) >= 12
})

const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true

  try {
    const { data: aiData } = await supabase.functions.invoke('cyber-sage', {
      body: { lines, question: question.value },
    })

    const now = new Date().toISOString()
    await supabase
      .from('device_profiles')
      .update({ last_reading_at: now })
      .eq('device_id', deviceId.value)

    await supabase
      .from('divination_logs')
      .insert([
        {
          device_id: deviceId.value,
          question: question.value,
          hexagram_code: lines.join(''),
          name_zh: aiData.hexagramNameZh,
          name_en: aiData.hexagramNameEn,
          interpretation: aiData.interpretation,
        },
      ])
      .then()

    lastReadingTime.value = now
    localStorage.setItem('cyber_tao_last_reading', now)
  } catch (err) {
    aiResult.value = 'CONNECTION INTERRUPTED'
  } finally {
    loading.value = false
  }
}

const handleRefillShare = async () => {
  if (hasSpirit.value || isAdmin.value) return
  if (shareCount.value >= MAX_SHARES_PER_DAY) {
    alert(`DAILY SYNC LIMIT REACHED. PLEASE WAIT FOR THE NEXT NEURAL CYCLE.`)
    return
  }
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Cyber Tao', url: window.location.href })
      const today = new Date().toISOString().split('T')[0]
      const newCount = shareCount.value + 1
      await supabase
        .from('device_profiles')
        .update({ share_count: newCount, last_share_date: today })
        .eq('device_id', deviceId.value)
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
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
