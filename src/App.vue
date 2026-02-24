<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
    
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-70"></div>
      <video autoplay loop muted playsinline class="w-full h-full object-cover opacity-20 scale-105">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

  <main class="... border-tao-gold/30 shadow-[0_0_30px_rgba(200,170,110,0.1)]">
  <div class="absolute inset-0 bg-[#1a1a1a]/40 pointer-events-none rounded-2xl"></div>
 
      <section v-if="step === 'intro'" class="flex flex-col items-center w-full max-w-md mx-auto">
        <header class="text-center w-full mb-10">
          <h1 class="text-4xl md:text-5xl font-serif tracking-[0.5em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">CYBER TAO</h1>
          <div class="h-[1px] w-16 bg-tao-gold/40 mx-auto mt-6 mb-6"></div>
          
          <p class="text-white/50 text-[10px] md:text-xs tracking-widest font-mono leading-relaxed max-w-sm mx-auto">
            SUBMIT YOUR INTENT TO THE NEURAL MATRIX.<br/>
            SIX TOSSES WILL ALIGN YOUR HEXAGRAM.<br/>
            <span class="text-tao-gold/50">REQUIRES ONE SPIRIT CHARGE TO DECODE.</span>
          </p>
        </header>

        <textarea 
          v-model="question" 
          placeholder="ENTER THE VOID..." 
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-6 md:py-8 focus:outline-none focus:border-tao-gold transition-all text-white text-xl md:text-2xl placeholder:opacity-10 placeholder:tracking-widest italic resize-none"
          rows="2"
        ></textarea>
        
        <SpiritBottle 
          :lastReadingTime="lastReadingTime" 
          :isUnlimited="isAdmin" 
          :shareCount="shareCount" 
          @refill="handleRefillShare" 
          class="my-4"
        />

        <button 
          @click="step = 'ritual'" 
          :disabled="!question || (!hasSpirit && !isAdmin)" 
          class="group relative w-full py-5 md:py-6 overflow-hidden border border-tao-gold/40 bg-black/40 transition-all hover:border-tao-gold disabled:opacity-10 mt-2"
        >
          <div class="absolute inset-0 bg-tao-gold opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span class="relative z-10 text-[11px] md:text-xs font-black tracking-[0.8em] uppercase group-hover:text-white transition-colors">
            {{ (hasSpirit || isAdmin) ? 'INITIATE PROTOCOL' : 'ENERGY DEPLETED' }}
          </span>
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full max-w-md mx-auto">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="relative flex flex-col items-center justify-center text-center w-full h-full flex-1">
        <div class="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none overflow-hidden">
          <span class="text-[16rem] md:text-[24rem] font-serif transition-all duration-1000 select-none whitespace-nowrap">{{ hexagramData.nameZh }}</span>
        </div>

        <div class="z-10 w-full max-w-2xl mx-auto flex flex-col items-center flex-1 justify-center">
          <h2 class="text-5xl md:text-6xl font-serif text-white tracking-[0.4em] mb-4">{{ hexagramData.nameZh }}</h2>
          <p class="text-[10px] md:text-xs tracking-[0.6em] text-tao-gold/40 uppercase mb-12">{{ hexagramData.nameEn }}</p>

          <div v-if="loading" class="py-24 animate-pulse flex flex-col items-center">
            <div class="w-10 h-10 border-t-2 border-tao-gold rounded-full animate-spin mb-6"></div>
            <span class="text-[10px] tracking-[0.8em] opacity-50">DECODING REALITY</span>
          </div>
          
          <div v-else class="space-y-8 text-left animate-fade-in w-full">
            <p class="text-white font-serif text-xl md:text-2xl border-l-3 border-tao-red/80 pl-6 leading-relaxed">
              {{ hexagramData.poemZh }}
            </p>
            <div class="bg-white/5 border border-white/10 p-6 md:p-8 rounded-sm backdrop-blur-md shadow-inner">
              <p class="text-gray-300 font-mono text-sm md:text-base leading-relaxed italic whitespace-pre-wrap">
                {{ aiResult }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md mt-12 z-20 mx-auto">
          <button @click="talismanRef.generate()" class="py-4 md:py-5 bg-tao-gold text-black text-[11px] md:text-xs font-black tracking-[0.4em] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all uppercase rounded-sm">EXTRACT</button>
          <button @click="reset" class="py-4 md:py-5 border border-tao-gold/30 text-[11px] md:text-xs text-tao-gold tracking-[0.4em] hover:border-tao-gold hover:bg-white/5 transition-all uppercase rounded-sm">RETURN</button>
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
// 修改状态
const aiResultZh = ref('')
const aiResultEn = ref('')

// 在 onRitualComplete 中
const { data: aiData } = await supabase.functions.invoke('cyber-sage', {
  body: { lines, question: question.value, language: isEnglish ? 'en' : 'zh' }
});

// 如果后端返回了两个字段
aiResultZh.value = aiData.interpretationZh;
aiResultEn.value = aiData.interpretationEn;
  
const logAnalytics = async (id) => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    await supabase.from('user_analytics').insert([{ device_id: id, ip_address: ip, user_agent: navigator.userAgent }]);
  } catch (e) {
    console.error("Analytics failed", e);
  }
};

const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cyber_tao_device_id', id);
    await supabase.from('device_profiles').insert([{ device_id: id }]);
  }
  deviceId.value = id;
  logAnalytics(id);

  const { data } = await supabase
    .from('device_profiles')
    .select('is_unlimited, last_reading_at, share_count, last_share_date')
    .eq('device_id', id)
    .single();

  if (data) {
    isAdmin.value = data.is_unlimited;
    const today = new Date().toISOString().split('T')[0];
    if (data.last_share_date !== today) {
      shareCount.value = 0;
    } else {
      shareCount.value = data.share_count || 0;
    }
  }
};

onMounted(() => {
  initIdentity();
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading');
});

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true;
  return (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000*60*60) >= 12;
});

const onRitualComplete = async (lines) => {
  hexagramResult.value = lines;
  step.value = 'result';
  loading.value = true;

  // 粗略判断用户输入是否纯英文（用于控制大模型语言输出）
  const isEnglish = /^[a-zA-Z0-9\s.,?!\'\"-]+$/.test(question.value.trim());

  try {
    const { data: aiData } = await supabase.functions.invoke('cyber-sage', {
      body: { 
        lines, 
        question: question.value,
        language: isEnglish ? 'en' : 'zh' // 传参给后端 Edge Function
      }
    });

    const now = new Date().toISOString();
    await supabase.from('device_profiles')
      .update({ last_reading_at: now })
      .eq('device_id', deviceId.value);

    await supabase.from('divination_logs').insert([{
      device_id: deviceId.value,
      question: question.value,
      hexagram_code: lines.join(''),
      name_zh: aiData.hexagramNameZh,
      name_en: aiData.hexagramNameEn,
      interpretation: aiData.interpretation
    }]);

    hexagramData.value = aiData;
    aiResult.value = aiData.interpretation;
    lastReadingTime.value = now;
    localStorage.setItem('cyber_tao_last_reading', now);
  } catch (err) {
    aiResult.value = "CONNECTION INTERRUPTED / 神经连接中断";
  } finally {
    loading.value = false;
  }
};

const handleRefillShare = async () => {
  if (hasSpirit.value || isAdmin.value) return;
  if (shareCount.value >= MAX_SHARES_PER_DAY) {
    alert(`DAILY SYNC LIMIT REACHED. PLEASE WAIT FOR THE NEXT NEURAL CYCLE.`);
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Cyber Tao',
        text: 'Decoding the digital void.',
        url: window.location.href
      });

      const today = new Date().toISOString().split('T')[0];
      const newCount = shareCount.value + 1;
      await supabase.from('device_profiles')
        .update({ share_count: newCount, last_share_date: today, last_reading_at: null })
        .eq('device_id', deviceId.value);

      shareCount.value = newCount;
      lastReadingTime.value = null;
      localStorage.removeItem('cyber_tao_last_reading');
    }
  } catch (err) {
    console.log('Share failed');
  }
};

const reset = () => { step.value = 'intro'; question.value = ''; hexagramResult.value = [] }
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
