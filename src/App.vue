<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold overflow-hidden selection:bg-tao-gold/30">
    
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-80"></div>
      <video autoplay loop muted playsinline class="w-full h-full object-cover opacity-15 scale-105 mix-blend-screen">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
      <div class="scanlines"></div>
      <img src="/bagua-array.svg" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[80vw] opacity-5 animate-spin-slow" />
    </div>

    <div class="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
      <main class="relative w-full max-w-2xl h-[90vh] md:h-[85vh] bg-[#0a0a0a]/80 backdrop-blur-xl border-x border-y border-tao-gold/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-sm flex flex-col p-6 md:p-12 overflow-hidden">
        <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-tao-gold/40"></div>
        <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-tao-gold/40"></div>
        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-tao-gold/40"></div>
        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-tao-gold/40"></div>
        
        <div class="rice-paper-overlay"></div>

        <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-10 relative z-20" style="margin:auto"> 
          <header class="text-center w-full animate-fade-in relative">
            <div class="absolute -right-2 md:-right-8 -top-4 border-2 border-[#8b0000] text-[#8b0000] p-1.5 transform rotate-12 opacity-80 backdrop-blur-sm">
              <span class="text-[12px] font-serif font-black tracking-widest [writing-mode:vertical-rl] shadow-[0_0_5px_rgba(139,0,0,0.5)]">天命<br>验证</span>
            </div>
            
            <h1 class="text-4xl md:text-5xl font-serif tracking-[0.4em] text-white drop-shadow-[0_0_20px_rgba(200,170,110,0.5)] mb-2 font-bold">CYBER TAO</h1>
            <p class="text-tao-gold/70 text-xs md:text-sm tracking-[0.5em] font-serif uppercase">天行健 · 极数流转</p>
            <div class="h-[1px] w-24 bg-gradient-to-r from-transparent via-tao-gold/60 to-transparent mx-auto mt-6 mb-6"></div>
            <p class="text-white/40 text-[9px] md:text-[10px] tracking-[0.4em] font-mono leading-relaxed uppercase">
              Fatum et Fluxus // INITIALIZE
            </p>
          </header>

          <div class="w-full space-y-8 relative">
            <div class="absolute inset-0 border border-tao-gold/10 bg-black/40 blur-md -z-10"></div>
            <textarea 
              v-model="question" 
              placeholder="ENTER THE VOID / 叩问虚空" 
              class="w-full bg-transparent border-b-2 border-tao-gold/20 text-center py-6 focus:outline-none focus:border-tao-gold transition-all text-white text-xl md:text-2xl placeholder:opacity-20 placeholder:font-serif font-serif resize-none shadow-inner"
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
            class="w-full py-5 md:py-6 bg-black/60 border border-tao-gold/50 text-tao-gold hover:bg-tao-gold hover:text-black hover:shadow-[0_0_30px_rgba(200,170,110,0.4)] disabled:opacity-20 transition-all duration-500 text-sm font-black tracking-[0.6em] uppercase animate-pulse-glow"
          >
            INITIATE PROTOCOL
          </button>
        </section>

        <section v-else-if="step === 'ritual'" class="flex-1 flex items-center justify-center relative z-20">
          <CoinToss @complete="onRitualComplete" />
        </section>

        <section v-else-if="step === 'result'" class="flex-1 flex flex-col items-center w-full h-full overflow-hidden relative z-20">
          
          <div v-if="loading" class="flex-1 flex flex-col items-center justify-center space-y-8">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <img src="/bagua-array.svg" class="absolute inset-0 w-full h-full opacity-60 animate-spin-slow" />
              <div class="w-12 h-12 border-y-2 border-tao-gold rounded-full animate-spin"></div>
              <span class="absolute text-white/80 font-serif text-lg">卦</span>
            </div>
            <div class="text-center space-y-2">
              <div class="text-xs tracking-[0.6em] text-tao-gold uppercase">Aligning Quantum Qi...</div>
              <div class="text-[9px] font-mono text-white/30">DECODING HEXAGRAM MULTIVERSE</div>
            </div>
          </div>
          
          <div v-else class="w-full flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar pr-4 animate-fade-in-up">
            
            <div class="text-center w-full flex flex-col items-center mb-8 shrink-0 relative">
              <h2 class="text-6xl md:text-7xl font-serif text-white tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] font-bold">{{ hexagramData.nameZh }}</h2>
              <p class="text-[11px] font-mono tracking-[1em] text-tao-gold/60 uppercase">{{ hexagramData.nameEn }}</p>
              
              <img src="/cloud-divider.svg" class="h-6 w-32 my-6 opacity-40" />
              
              <p class="text-white/90 font-serif text-xl md:text-2xl leading-loose tracking-[0.2em] max-w-sm text-center">
                {{ hexagramData.poemZh }}
              </p>
            </div>

            <div class="w-full relative mt-auto shrink-0 mb-4">
              <div class="absolute -top-3 left-6 px-3 bg-[#8b0000] text-[#050505] text-[10px] font-black tracking-[0.3em] uppercase z-10 shadow-[0_0_10px_rgba(139,0,0,0.5)]">
                Neural Decree // 判词
              </div>
              <div class="bg-gradient-to-b from-white/[0.05] to-transparent border border-tao-gold/30 p-8 md:p-10 rounded-sm relative shadow-inner">
                <div class="rice-paper-overlay opacity-20"></div>
                <p class="text-white/80 font-serif text-sm md:text-base leading-[2] tracking-wider text-justify whitespace-pre-wrap relative z-10">
                  {{ aiResult }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="!loading" class="grid grid-cols-2 gap-6 w-full pt-6 shrink-0 border-t border-tao-gold/20 mt-2 z-20">
            <button @click="talismanRef.generate()" class="py-4 bg-tao-gold/10 border border-tao-gold text-tao-gold text-xs font-black tracking-[0.4em] hover:bg-tao-gold hover:text-black transition-all uppercase shadow-[0_0_20px_rgba(200,170,110,0.2)]">Extract Talisman</button>
            <button @click="reset" class="py-4 border border-white/20 text-xs text-white/50 tracking-[0.4em] hover:bg-white/10 hover:text-white transition-all uppercase">Return to Void</button>
          </div>
        </section>
      </main>
    </div>

    <div class="relative z-50 pointer-events-none">
      <TalismanCard 
        ref="talismanRef" 
        class="pointer-events-auto"
        :hexagramData="{ 
          name: hexagramData.nameEn, 
          nameZh: hexagramData.nameZh, 
          poemZh: hexagramData.poemZh, 
          lines: hexagramResult 
        }" 
        :aiPredictionText="aiResult"
      />
    </div>
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
