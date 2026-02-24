<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold flex items-center justify-center p-4 overflow-hidden font-sans">
    <div class="absolute inset-0 z-0 opacity-20">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="relative z-10 w-full max-w-4xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-tao-gold/30 rounded-2xl flex flex-col p-8 md:p-12">
      
      <section v-if="step === 'intro'" class="flex flex-col items-center max-w-md mx-auto my-auto">
        <h1 class="text-4xl md:text-5xl font-serif tracking-[0.5em] text-white mb-10">CYBER TAO</h1>
        <textarea 
          v-model="question" 
          placeholder="ENTER THE VOID..." 
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-6 focus:outline-none focus:border-tao-gold text-white text-xl italic resize-none"
          rows="2"
        ></textarea>
        
        <SpiritBottle :lastReadingTime="lastReadingTime" :isUnlimited="isAdmin" class="my-8" />

        <button 
          @click="step = 'ritual'" 
          :disabled="!question || (!hasSpirit && !isAdmin)" 
          class="w-full py-6 border border-tao-gold/40 hover:bg-tao-gold/10 transition-all text-xs font-black tracking-[0.8em] uppercase"
        >
          INITIATE PROTOCOL
        </button>
      </section>

      <section v-else-if="step === 'ritual'">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="flex flex-col items-center text-center">
        <h2 class="text-5xl font-serif text-white tracking-[0.4em] mb-2">{{ hexagramData.nameZh }}</h2>
        <p class="text-xs tracking-[0.6em] text-tao-gold/40 uppercase mb-12">{{ hexagramData.nameEn }}</p>

        <div v-if="loading" class="py-12 animate-pulse uppercase tracking-[0.8em] text-[10px]">Decoding...</div>
        
        <div v-else class="space-y-8 text-left w-full max-w-2xl">
          <p class="text-white font-serif text-xl border-l-2 border-tao-gold/50 pl-6">{{ hexagramData.poemZh }}</p>
          <div class="bg-white/5 p-6 rounded-sm border border-white/10 font-mono text-sm italic">
            {{ aiResult }}
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-8 w-full max-w-md mt-12">
          <button @click="talismanRef.generate()" class="py-4 bg-tao-gold text-black font-black tracking-[0.4em] uppercase">Extract</button>
          <button @click="reset" class="py-4 border border-tao-gold/30 text-tao-gold tracking-[0.4em] uppercase">Return</button>
        </div>
      </section>
    </main>

    <TalismanCard ref="talismanRef" :hexagramData="hexagramData" :aiPredictionText="aiResult" />
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
const aiResult = ref('')
const loading = ref(false)
const talismanRef = ref(null)
const lastReadingTime = ref(null)
const hexagramData = ref({})
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
  const { data } = await supabase.from('device_profiles').select('*').eq('device_id', id).single()
  if (data) isAdmin.value = data.is_unlimited
}

onMounted(() => {
  initIdentity()
  lastReadingTime.value = localStorage.getItem('cyber_tao_last_reading')
})

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  return (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / 3600000 >= 12
})

const onRitualComplete = async (lines) => {
  step.value = 'result'
  loading.value = true
  try {
    const { data, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines, question: question.value }
    })
    if (error) throw error

    hexagramData.value = {
      nameZh: data.hexName,
      nameEn: data.hexEn,
      poemZh: data.poem,
      lines: lines
    }
    aiResult.value = data.interpretation
    
    const now = new Date().toISOString()
    localStorage.setItem('cyber_tao_last_reading', now)
    lastReadingTime.value = now
  } catch (err) {
    aiResult.value = "CONNECTION ERROR"
  } finally {
    loading.value = false
  }
}

const reset = () => { step.value = 'intro'; question.value = ''; aiResult.value = '' }
</script>
