<template>
  <main class="z-10 w-full max-w-md bg-black/80 backdrop-blur-3xl p-8 border border-tao-gold/20 relative">
    <section v-if="step === 'intro'" class="flex flex-col items-center space-y-8 animate-fade-in">
      <header class="text-center">
        <h1 class="text-4xl font-serif tracking-[0.4em] text-white">CYBER TAO</h1>
        <p class="text-[9px] tracking-[0.5em] text-tao-gold/40 mt-2 uppercase">Neural Divination Protocol</p>
      </header>

      <textarea v-model="question" placeholder="INPUT YOUR CONUNDRUM..." class="w-full bg-transparent border-b border-tao-gold/30 text-center py-6 focus:outline-none focus:border-tao-gold transition-all resize-none text-white text-lg"></textarea>
      
      <SpiritBottle :lastReadingTime="lastReadingTime" @click="handleRefillShare" />

      <button @click="startRitual" :disabled="!question || !hasSpirit" class="w-full py-5 border-2 border-tao-gold text-xs font-black tracking-[0.5em] uppercase hover:bg-tao-gold hover:text-black transition-all disabled:opacity-20">
        {{ hasSpirit ? 'BEGIN SYNC' : 'RECHARGE REQUIRED' }}
      </button>
    </section>

    <section v-else-if="step === 'result'" class="relative flex flex-col items-center min-h-[450px] text-center">
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.08]">
        <span class="text-[15rem] font-serif leading-none text-tao-gold">{{ hexagramData.nameZh }}</span>
      </div>

      <div class="z-10 w-full pt-4">
        <h2 class="text-4xl font-serif text-white tracking-[0.4em] mb-2">{{ hexagramData.nameZh }}</h2>
        <p class="text-[10px] tracking-[0.5em] text-tao-gold/60 uppercase mb-10">{{ hexagramData.nameEn }}</p>
        
        <div v-if="loading" class="py-20 animate-pulse text-[11px] tracking-[0.8em]">READING AKASHIC RECORDS...</div>
        <div v-else class="space-y-6 animate-fade-in">
          <p class="text-white/90 font-serif text-xl border-l-2 border-tao-red pl-4 text-left leading-relaxed">{{ hexagramData.poemZh }}</p>
          <p class="bg-black/40 p-5 border border-tao-gold/10 text-sm leading-relaxed text-gray-300 font-mono text-left">
            {{ aiResult }}
          </p>
        </div>
      </div>

      <div v-if="!loading" class="grid grid-cols-2 gap-4 w-full mt-12 z-20">
        <button @click="showTalisman" class="py-4 bg-tao-gold text-black text-[11px] font-black tracking-widest uppercase hover:bg-white">EXTRACT</button>
        <button @click="reset" class="py-4 border-2 border-tao-gold/30 text-[11px] text-tao-gold uppercase hover:border-tao-gold">RETURN</button>
      </div>
    </section>
  </main>
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

const isDev = computed(() => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const hasSpirit = computed(() => {
  if (isDev.value) return true
  if (!lastReadingTime.value) return true
  return (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60) >= 12
})

onMounted(() => {
  const saved = localStorage.getItem('cyber_tao_last_reading')
  if (saved) lastReadingTime.value = saved
})

const startRitual = () => { if (hasSpirit.value) step.value = 'ritual' }
const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true
  try {
    const { data, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines: hexagramResult.value, question: question.value },
    })
    if (error) throw error
    hexagramData.value = { nameZh: data.hexagramNameZh, nameEn: data.hexagramNameEn, poemZh: data.poemZh }
    aiResult.value = data.interpretation
    lastReadingTime.value = new Date().toISOString()
    localStorage.setItem('cyber_tao_last_reading', lastReadingTime.value)
  } catch (err) {
    aiResult.value = 'SIGNAL LOST: ' + err.message
  } finally { loading.value = false }
}
const showTalisman = () => talismanRef.value?.show()
const reset = () => { step.value = 'intro'; question.value = ''; hexagramResult.value = [] }

  const handleRefillShare = async () => {
  if (hasSpirit.value) return;
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Cyber Tao Divination',
        text: 'Decode your destiny through the matrix.',
        url: window.location.href
      });
      // 分享成功后强制恢复灵力（清除冷却时间）
      localStorage.removeItem('cyber_tao_last_reading');
      lastReadingTime.value = null;
      alert('SPIRIT RECHARGED via Synchronized Link.');
    } else {
      // 降级方案：复制链接
      await navigator.clipboard.writeText(window.location.href);
      alert('Link Copied. Share to recharge.');
    }
  } catch (err) { console.log('Share failed', err) }
}
</script>
