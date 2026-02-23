<template>
  <div
    class="fixed inset-0 bg-tao-black text-tao-gold flex flex-col items-center justify-center p-4 overflow-hidden"
  >
    <div class="absolute inset-0 z-0 opacity-30">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main
      class="z-10 w-full max-w-md bg-black/50 backdrop-blur-xl p-8 border border-tao-gold/10 relative"
    >
      <header class="text-center mb-8">
        <h1 class="text-2xl font-serif tracking-[0.4em] text-tao-gold-light">CYBER TAO</h1>
      </header>

      <section v-if="step === 'intro'" class="space-y-8 animate-fade-in">
        <SpiritBottle :lastReadingTime="lastReadingTime" @share-refill="handleShareRefill" />
        <textarea
          v-model="question"
          placeholder="ASK THE VOID..."
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-4 focus:outline-none focus:border-tao-gold transition-colors resize-none"
        ></textarea>
        <button
          @click="startRitual"
          :disabled="!question || !hasSpirit"
          class="w-full py-4 border border-tao-gold hover:bg-tao-gold hover:text-black transition-all text-xs tracking-[0.3em] uppercase disabled:opacity-20"
        >
          {{ hasSpirit ? 'Enter Ritual' : 'Spirit Depleted' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section
        v-else-if="step === 'result'"
        class="relative flex flex-col items-center min-h-[350px]"
      >
        <div
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.07] select-none"
        >
          <span class="text-[12rem] font-serif leading-none">{{ hexagramData.nameZh }}</span>
          <p class="text-lg font-serif mt-4">{{ hexagramData.poemZh }}</p>
        </div>

        <div class="z-10 text-center w-full mt-4">
          <h2 class="text-3xl font-serif text-white tracking-widest mb-2">
            {{ hexagramData.nameZh }}
          </h2>
          <p class="text-[10px] tracking-[0.4em] text-tao-gold/50 uppercase mb-8">
            {{ hexagramData.nameEn }}
          </p>

          <div v-if="loading" class="py-12 animate-pulse text-xs tracking-[0.5em]">
            DECODING DAO...
          </div>

          <div v-else class="space-y-6">
            <div class="border-l border-tao-red pl-4 text-left">
              <p class="text-white/80 font-serif italic text-lg">{{ hexagramData.poemZh }}</p>
            </div>
            <div
              class="bg-black/40 p-5 border border-tao-gold/5 text-sm leading-relaxed text-gray-400 font-mono"
            >
              {{ aiResult }}
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4">
              <button
                @click="generateAndShare"
                class="py-3 bg-tao-gold text-black text-[10px] font-bold tracking-widest uppercase"
              >
                Extract
              </button>
              <button
                @click="reset"
                class="py-3 border border-tao-gold/20 text-[10px] text-tao-gold/40"
              >
                Return
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <TalismanCard
      ref="talismanRef"
      :hexagramData="{ name: hexagramData.nameZh, lines: hexagramResult }"
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

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const last = new Date(lastReadingTime.value).getTime()
  return (new Date().getTime() - last) / (1000 * 60 * 60) >= 12
})

onMounted(() => {
  // 预加载硬币，解决显示延迟
  ;['/coin-head.png', '/coin-tail.png'].forEach((src) => {
    const img = new Image()
    img.src = src
  })
  const saved = localStorage.getItem('cyber_tao_last_reading')
  if (saved) lastReadingTime.value = saved
})

const startRitual = () => {
  if (hasSpirit.value) step.value = 'ritual'
}

const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true

  try {
    const { data, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines: hexagramResult.value, question: question.value },
    })
    if (error) throw error
    hexagramData.value = {
      nameZh: data.hexagramNameZh,
      nameEn: data.hexagramNameEn,
      poemZh: data.poemZh,
    }
    aiResult.value = data.interpretation
    lastReadingTime.value = new Date().toISOString()
    localStorage.setItem('cyber_tao_last_reading', lastReadingTime.value)
  } catch (err) {
    aiResult.value = 'CONNECTION DISTURBED: ' + err.message
  } finally {
    loading.value = false
  }
}

const generateAndShare = () => talismanRef.value?.generate()
const reset = () => {
  step.value = 'intro'
  question.value = ''
  hexagramResult.value = []
}
</script>
