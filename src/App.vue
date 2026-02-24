<template>
  <div class="fixed inset-0 bg-tao-black text-tao-gold flex flex-col items-center justify-center p-4 overflow-hidden">
    <div class="absolute inset-0 z-0 opacity-25">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="z-10 w-full max-w-md bg-black/60 backdrop-blur-2xl p-8 border border-tao-gold/10 relative overflow-hidden">
      <section v-if="step === 'intro'" class="flex flex-col items-center space-y-8">
        <header class="text-center"><h1 class="text-3xl font-serif tracking-[0.3em] text-tao-gold-light">CYBER TAO</h1></header>
        
        <textarea 
          v-model="question" 
          placeholder="天人合一，道法自然..." 
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-4 focus:outline-none focus:border-tao-gold transition-all resize-none placeholder:opacity-30"
        ></textarea>
        
        <SpiritBottle :lastReadingTime="lastReadingTime" />

        <button 
          @click="startRitual" 
          :disabled="!question || !hasSpirit" 
          class="w-full py-4 border border-tao-gold text-xs tracking-widest uppercase hover:bg-tao-gold hover:text-black transition-all disabled:opacity-20"
        >
          {{ hasSpirit ? 'ENTER RITUAL' : 'SPIRIT DEPLETED' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="relative flex flex-col items-center min-h-[420px] justify-between text-center">
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.08] select-none">
          <span class="text-[14rem] font-serif leading-none">{{ hexagramData.nameZh }}</span>
          <p class="text-xl font-serif mt-4 text-tao-red">{{ hexagramData.poemZh }}</p>
        </div>

        <div class="z-10 w-full mt-2">
          <h2 class="text-4xl font-serif text-white tracking-[0.3em] mb-1">{{ hexagramData.nameZh }}</h2>
          <p class="text-[9px] tracking-[0.4em] text-tao-gold/40 uppercase mb-8">{{ hexagramData.nameEn }}</p>

          <div v-if="loading" class="py-16 animate-pulse text-[10px] tracking-[0.6em] text-tao-gold/60">SYNCHRONIZING...</div>
          
          <div v-else class="space-y-6">
            <div class="border-l border-tao-red pl-4 text-left">
              <p class="text-white/90 font-serif text-lg leading-relaxed">{{ hexagramData.poemZh }}</p>
            </div>
            <div class="bg-black/40 p-5 border border-tao-gold/5 text-sm leading-relaxed text-gray-400 font-mono italic">
              {{ aiResult }}
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 w-full mt-8 z-10">
          <button @click="showTalisman" class="py-4 bg-tao-gold text-black text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-all">EXTRACT</button>
          <button @click="reset" class="py-4 border border-tao-gold/20 text-[10px] text-tao-gold/40 uppercase hover:text-tao-gold">RETURN</button>
        </div>
      </section>
    </main>

    <TalismanCard 
      ref="talismanRef" 
      :hexagramData="{ name: hexagramData.nameZh, lines: hexagramResult }" 
      :aiPredictionText="aiResult"
      :guardian="'dragon'"
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
</script>
