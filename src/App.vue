<template>
  <div class="fixed inset-0 bg-tao-black text-tao-gold flex items-center justify-center p-4 overflow-hidden font-sans">
    <div class="absolute inset-0 z-0 opacity-20">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="z-10 w-full max-w-[420px] bg-black/80 backdrop-blur-3xl p-8 border border-tao-gold/20 relative shadow-2xl animate-fade-in">
      <section v-if="step === 'intro'" class="flex flex-col items-center space-y-8">
        <header class="text-center">
          <h1 class="text-3xl font-serif tracking-[0.4em] text-white">CYBER TAO</h1>
          <p class="text-[9px] tracking-[0.4em] text-tao-gold/40 mt-1 italic">ID: {{ deviceId.slice(0,8) }} {{ isAdmin ? '(ADMIN)' : '' }}</p>
        </header>

        <textarea v-model="question" placeholder="ASK THE VOID..." class="w-full bg-transparent border-b border-tao-gold/30 text-center py-4 focus:outline-none focus:border-tao-gold transition-all text-white text-lg placeholder:opacity-20"></textarea>
        
        <SpiritBottle :lastReadingTime="lastReadingTime" :isUnlimited="isAdmin" @refill="handleRefillShare" />

        <button @click="step = 'ritual'" :disabled="!question || (!hasSpirit && !isAdmin)" class="w-full py-5 border-2 border-tao-gold text-xs font-black tracking-[0.5em] hover:bg-tao-gold hover:text-black transition-all disabled:opacity-20">
          {{ (hasSpirit || isAdmin) ? 'INITIATE PROTOCOL' : 'ENERGY DEPLETED' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="relative flex flex-col items-center min-h-[480px] justify-between text-center">
        <div class="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
          <span class="text-[14rem] font-serif">{{ hexagramData.nameZh }}</span>
        </div>

        <div class="z-10 w-full">
          <h2 class="text-4xl font-serif text-white tracking-[0.3em] mb-2">{{ hexagramData.nameZh }}</h2>
          <p class="text-[10px] tracking-[0.5em] text-tao-gold/50 uppercase mb-10">{{ hexagramData.nameEn }}</p>

          <div v-if="loading" class="py-20 animate-pulse text-[10px] tracking-[0.6em]">DECODING REALITY...</div>
          <div v-else class="space-y-6 text-left animate-fade-in">
            <p class="text-white font-serif text-xl border-l-2 border-tao-red pl-4">{{ hexagramData.poemZh }}</p>
            <p class="text-gray-400 font-mono text-sm leading-relaxed italic bg-white/5 p-4 border border-white/5">
              {{ aiResult }}
            </p>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 w-full mt-8 z-20">
          <button @click="talismanRef.generate()" class="py-4 bg-tao-gold text-black text-[11px] font-black tracking-widest uppercase hover:bg-white transition-all">EXTRACT</button>
          <button @click="reset" class="py-4 border border-tao-gold/40 text-[11px] text-tao-gold uppercase hover:border-tao-gold">RETURN</button>
        </div>
      </section>
    </main>

    <TalismanCard 
      ref="talismanRef" 
      :hexagramData="{ name: hexagramData.nameEn, lines: hexagramResult, nameZh: hexagramData.nameZh }" 
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

// 身份锁定逻辑
const deviceId = ref('')
const isAdmin = ref(false)

const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase.from('device_profiles').insert([{ device_id: id }])
  }
  deviceId.value = id
  const { data } = await supabase.from('device_profiles').select('is_unlimited').eq('device_id', id).single()
  if (data) isAdmin.value = data.is_unlimited
}

onMounted(() => {
  initIdentity()
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading')
})

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  return (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000*60*60) >= 12
})

const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true
  const { data } = await supabase.functions.invoke('cyber-sage', { body: { lines, question: question.value } })
  hexagramData.value = data
  aiResult.value = data.interpretation
  lastReadingTime.value = new Date().toISOString()
  localStorage.setItem('cyber_tao_last_reading', lastReadingTime.value)
  loading.value = false
}

const handleRefillShare = async () => {
  if (navigator.share) {
    await navigator.share({ title: 'Cyber Tao', url: window.location.href })
    localStorage.removeItem('cyber_tao_last_reading')
    lastReadingTime.value = null
  }
}

const reset = () => { step.value = 'intro'; question.value = '' }
</script>
