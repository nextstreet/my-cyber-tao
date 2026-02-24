<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans selection:bg-tao-gold/30">
    
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-70"></div>
      <video autoplay loop muted playsinline class="w-full h-full object-cover opacity-20 scale-105">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="relative z-10 w-full max-w-4xl h-[85vh] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-tao-gold/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl flex flex-col p-8 md:p-16 overflow-hidden">
      
      <section v-if="step === 'intro'" class="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-12">
        <header class="text-center w-full animate-fade-in">
          <h1 class="text-5xl md:text-6xl font-serif tracking-[0.6em] text-white drop-shadow-[0_0_20px_rgba(200,170,110,0.4)]">CYBER TAO</h1>
          <div class="h-[1px] w-24 bg-tao-gold/60 mx-auto mt-8 mb-8"></div>
          <p class="text-tao-gold/60 text-xs md:text-sm tracking-[0.3em] font-mono leading-relaxed uppercase">
            Submit your intent to the neural matrix.<br/>Six tosses will align your destiny.
          </p>
        </header>

        <div class="w-full space-y-6">
          <textarea 
            v-model="question" 
            placeholder="ENTER THE VOID..." 
            class="w-full bg-black/40 border-b border-tao-gold/30 text-center py-6 focus:outline-none focus:border-tao-gold transition-all text-white text-2xl placeholder:opacity-10 italic resize-none"
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
          class="w-full py-6 bg-transparent border border-tao-gold/50 text-tao-gold hover:bg-tao-gold hover:text-black disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-tao-gold transition-all duration-500 text-sm font-black tracking-[1em] uppercase shadow-[0_0_15px_rgba(200,170,110,0.1)]"
        >
          INITIATE PROTOCOL
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="flex-1 flex items-center justify-center">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="flex-1 flex flex-col items-center justify-between w-full h-full">
        <div class="w-full flex-1 flex flex-col items-center justify-center space-y-8">
          <div class="text-center">
            <h2 class="text-6xl md:text-7xl font-serif text-white tracking-[0.4em] mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{{ hexagramData.nameZh }}</h2>
            <p class="text-sm tracking-[0.8em] text-tao-gold/50 uppercase">{{ hexagramData.nameEn }}</p>
          </div>

          <div v-if="loading" class="flex flex-col items-center space-y-4">
            <div class="w-12 h-12 border-2 border-tao-gold/20 border-t-tao-gold rounded-full animate-spin"></div>
            <span class="text-[10px] tracking-[0.5em] text-tao-gold/40">SYNCHRONIZING...</span>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl animate-fade-in-up">
            <div class="space-y-6">
              <p class="text-white font-serif text-2xl md:text-3xl border-l-4 border-tao-gold pl-8 leading-relaxed">
                {{ hexagramData.poemZh }}
              </p>
            </div>
            <div class="bg-white/[0.03] border border-white/10 p-8 rounded-lg backdrop-blur-sm shadow-2xl">
              <p class="text-gray-300 font-mono text-sm md:text-base leading-relaxed italic whitespace-pre-wrap">
                {{ aiResult }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-8 w-full max-w-lg pt-12">
          <button @click="talismanRef.generate()" class="py-5 bg-tao-gold text-black text-xs font-black tracking-[0.4em] hover:bg-white transition-all uppercase rounded-sm shadow-lg shadow-tao-gold/20">Extract Talisman</button>
          <button @click="reset" class="py-5 border border-tao-gold/40 text-xs text-tao-gold tracking-[0.4em] hover:bg-white/5 transition-all uppercase rounded-sm">Return</button>
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

<style scoped>
.animate-fade-in { animation: fadeIn 1.5s ease-out; }
.animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>

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
    // 如果日期变了，重置分享次数
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

    // 更新卦象基本数据与 AI 解读
    hexagramData.value = {
      nameZh: aiData.hexagramNameZh,
      nameEn: aiData.hexagramNameEn,
      poemZh: aiData.poemZh
    }
    aiResult.value = aiData.interpretation

    // 更新本地与远程状态
    const now = new Date().toISOString()
    await supabase.from('device_profiles').update({ last_reading_at: now }).eq('device_id', deviceId.value)
    
    // 异步插入日志
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
      // 临时清除限制
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
.animate-fade-in {
  animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
