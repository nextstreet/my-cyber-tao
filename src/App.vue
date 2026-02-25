<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans selection:bg-tao-gold/30">
    
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-70"></div>
      <video autoplay loop muted playsinline class="w-full h-full object-cover opacity-20 scale-105">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="relative z-10 w-full max-w-2xl h-[90vh] md:h-[85vh] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-tao-gold/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl flex flex-col p-6 md:p-12 overflow-hidden">
      
      <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 md:space-y-12" style="margin:auto"> 
        <header class="text-center w-full animate-fade-in">
          <h1 class="text-3xl md:text-3xl font-serif tracking-[0.5em] text-white drop-shadow-[0_0_15px_rgba(200,170,110,0.4)]">CYBER TAO</h1>
          <div class="h-[1px] w-16 bg-tao-gold/60 mx-auto mt-6 mb-6"></div>
          <p class="text-tao-gold/60 text-[10px] md:text-xs tracking-[0.3em] font-mono leading-relaxed uppercase">
            吉凶悔吝 ：Fatum et Fluxus
          </p>
        </header>

        <div class="w-full space-y-6">
          <textarea 
            v-model="question" 
            placeholder="ENTER THE VOID..." 
            class="w-full bg-black/40 border-b border-tao-gold/30 text-center py-6 focus:outline-none focus:border-tao-gold transition-all text-white text-xl md:text-2xl placeholder:opacity-10 italic resize-none"
            rows="2"
          ></textarea>
          
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
          class="w-full py-5 md:py-6 bg-transparent border border-tao-gold/50 text-tao-gold hover:bg-tao-white hover:text-tao-gold disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-tao-gold transition-all duration-500 text-xs md:text-sm font-black tracking-[0.8em] uppercase shadow-[0_0_15px_rgba(200,170,110,0.1)]"
        >
          INITIATE PROTOCOL
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="flex-1 flex items-center justify-center">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="flex-1 flex flex-col items-center w-full h-full overflow-hidden">
        
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center space-y-6">
          <div class="w-10 h-10 border-2 border-tao-gold/20 border-t-tao-gold rounded-full animate-spin"></div>
          <span class="text-[10px] tracking-[0.5em] text-tao-gold/40 uppercase">Synchronizing...</span>
        </div>
        
        <div v-else class="w-full flex-1 flex flex-col pt-4 overflow-y-auto custom-scrollbar pr-2 animate-fade-in-up">
          
          <div class="text-center w-full flex flex-col items-center mb-8 shrink-0">
            <h2 class="text-5xl md:text-6xl font-serif text-white tracking-[0.4em] mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{{ hexagramData.nameZh }}</h2>
            <p class="text-[10px] tracking-[0.8em] text-tao-gold/50 uppercase">{{ hexagramData.nameEn }}</p>
            
            <div class="w-12 h-px bg-tao-gold/30 my-6"></div>
            
            <p class="text-white/90 font-serif text-lg md:text-xl leading-relaxed tracking-widest max-w-sm text-center">
              {{ hexagramData.poemZh }}
            </p>
          </div>

          <div class="w-full relative mt-auto shrink-0">
            <div class="absolute -top-2.5 left-4 px-2 bg-[#0a0a0a] text-[9px] text-tao-gold/60 font-mono tracking-widest uppercase z-10">
              Neural Analysis
            </div>
            <div class="bg-white/[0.02] border border-tao-gold/20 p-6 md:p-8 rounded-sm backdrop-blur-md relative">
              <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-tao-gold/50"></div>
              <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-tao-gold/50"></div>
              <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tao-gold/50"></div>
              <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tao-gold/50"></div>
              
              <p class="text-gray-300 font-mono text-xs md:text-sm leading-relaxed italic whitespace-pre-wrap">
                {{ aiResult }}
              </p>
            </div>
          </div>
          
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 w-full pt-8 shrink-0 border-t border-tao-gold/10 mt-6">
          <button @click="talismanRef.generate()" class="py-4 border border-tao-gold/40 bg-tao-gold text-tao-gold text-[10px] md:text-xs font-black tracking-[0.4em] hover:bg-white transition-all uppercase rounded-sm shadow-lg shadow-tao-gold/20">Extract</button>
          <button @click="reset" class="py-4 border border-tao-gold/40 text-[10px] md:text-xs text-tao-gold tracking-[0.4em] hover:bg-white/5 transition-all uppercase rounded-sm">Return</button>
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from './lib/supabase'
import SpiritBottle from './components/SpiritBottle.vue'
import CoinToss from './components/CoinToss.vue'
import TalismanCard from './components/TalismanCard.vue'

// 核心状态
const step = ref('intro')
const question = ref('')
const hexagramResult = ref([])
const aiResult = ref('')
const loading = ref(false)
const talismanRef = ref(null)
const lastReadingTime = ref(null)
const hexagramData = ref({ nameZh: '', nameEn: '', poemZh: '' })
const deviceId = ref('')
const isAdmin = ref(false)
const shareCount = ref(0)
const MAX_SHARES_PER_DAY = 3

// 初始化身份与灵力状态
const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase.from('device_profiles').insert([{ device_id: id }])
  }
  deviceId.value = id;

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
  const hoursPassed = (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60)
  return hoursPassed >= 12
})

// 处理仪式完成：调用 Edge Function
const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true

  const isEnglish = /^[a-zA-Z0-9\s.,?!\'\"-]+$/.test(question.value.trim());

  try {
    const { data: aiData, error } = await supabase.functions.invoke('cyber-sage', {
      body: { 
        lines, 
        question: question.value,
        language: isEnglish ? 'en' : 'zh' 
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
    console.error("AI Error:", err)
    aiResult.value = "SIGNAL INTERRUPTED: The digital void remains silent."
  } finally {
    loading.value = false
  }
}

// 分享续命逻辑
const handleRefillShare = async () => {
  if (hasSpirit.value || isAdmin.value) return
  if (shareCount.value >= MAX_SHARES_PER_DAY) {
    alert(`DAILY SYNC LIMIT REACHED.`)
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
  step.value = 'intro'; question.value = ''; hexagramResult.value = [];
  aiResult.value = ''; hexagramData.value = { nameZh: '', nameEn: '', poemZh: '' };
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* 隐藏主容器滚动条但允许滚动 */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200, 170, 110, 0.3); border-radius: 4px; }
</style>
