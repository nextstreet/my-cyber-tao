<template>
  <div class="fixed inset-0 bg-tao-black text-tao-gold flex items-center justify-center p-4 overflow-hidden font-sans">
    <div class="absolute inset-0 z-0 opacity-20">
      <video autoplay loop muted playsinline class="w-full h-full object-cover"><source src="/bg-smoke.mp4" type="video/mp4" /></video>
    </div>

    <main class="z-10 w-full max-w-[400px] bg-black/80 backdrop-blur-3xl p-8 border border-tao-gold/20 relative shadow-2xl">
      <section v-if="step === 'intro'" class="flex flex-col items-center space-y-8 animate-fade-in">
        <header class="text-center">
          <h1 class="text-4xl font-serif tracking-[0.4em] text-white">CYBER TAO</h1>
          <p class="text-[9px] tracking-[0.4em] text-tao-gold/40 mt-2">Neural Oracle V2.0</p>
        </header>

        <textarea v-model="question" placeholder="天人合一，道法自然..." class="w-full bg-transparent border-b border-tao-gold/20 text-center py-6 focus:outline-none focus:border-tao-gold transition-all resize-none text-white text-lg placeholder:opacity-20"></textarea>
        
        <SpiritBottle :lastReadingTime="lastReadingTime" :isUnlimited="isAdmin" @refill="handleRefillShare" />

        <button @click="startRitual" :disabled="!question || (!hasSpirit && !isAdmin)" class="w-full py-5 border-2 border-tao-gold text-xs font-black tracking-[0.5em] hover:bg-tao-gold hover:text-black transition-all disabled:opacity-20">
          {{ (hasSpirit || isAdmin) ? 'BEGIN SYNC' : 'RECHARGE REQUIRED' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="relative flex flex-col items-center min-h-[460px] justify-between">
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.08] select-none">
          <span class="text-[16rem] font-serif leading-none">{{ hexagramData.nameZh }}</span>
        </div>

        <div class="z-10 w-full pt-2 text-center">
          <h2 class="text-4xl font-serif text-white tracking-[0.4em] mb-2">{{ hexagramData.nameZh }}</h2>
          <p class="text-[10px] tracking-[0.4em] text-tao-gold/60 uppercase mb-8">{{ hexagramData.nameEn }}</p>

          <div v-if="loading" class="py-20 animate-pulse text-[11px] tracking-[0.8em]">SYNCHRONIZING...</div>
          <div v-else class="space-y-6 animate-fade-in">
            <p class="text-white font-serif text-xl border-l-2 border-tao-red pl-4 text-left">{{ hexagramData.poemZh }}</p>
            <div class="bg-black/40 p-5 border border-tao-gold/10 text-sm leading-relaxed text-gray-400 font-mono text-left italic">
              {{ aiResult }}
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 w-full mt-8 z-20">
          <button @click="talismanRef.show()" class="py-4 bg-tao-gold text-black text-[11px] font-black tracking-widest uppercase hover:bg-white transition-all">EXTRACT</button>
          <button @click="reset" class="py-4 border-2 border-tao-gold/30 text-[11px] text-tao-gold uppercase hover:border-tao-gold transition-all">RETURN</button>
        </div>
      </section>
    </main>

    <TalismanCard 
      ref="talismanRef" 
      :hexagramData="{ name: hexagramData.nameZh, lines: hexagramResult }" 
      :aiPredictionText="aiResult"
      :guardian="currentGuardian"
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
const isAdmin = ref(false)
const talismanRef = ref(null)
const lastReadingTime = ref(null)
const hexagramData = ref({ nameZh: '', nameEn: '', poemZh: '' })

// 权限校验
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('profiles').select('is_unlimited').eq('id', user.id).single()
    if (data) isAdmin.value = data.is_unlimited
  }
  const saved = localStorage.getItem('cyber_tao_last_reading')
  if (saved) lastReadingTime.value = saved
})

const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const hours = (new Date().getTime() - new Date(lastReadingTime.value).getTime()) / (1000 * 60 * 60)
  return hours >= 12
})

// 动态神兽映射
const currentGuardian = computed(() => {
  const guardians = ['dragon', 'tiger', 'phoenix', 'turtle', 'qilin']
  if (hexagramResult.value.length < 6) return 'dragon'
  const val = parseInt(hexagramResult.value.join(''), 2)
  return guardians[val % guardians.length]
})

// 交互逻辑
const startRitual = () => { step.value = 'ritual' }

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
  } catch (err) { aiResult.value = 'SIGNAL LOST: ' + err.message } 
  finally { loading.value = false }
}

const handleRefillShare = async () => {
  if (hasSpirit.value || isAdmin.value) return
  if (navigator.share) {
    await navigator.share({ title: 'Cyber Tao', url: window.location.href })
    localStorage.removeItem('cyber_tao_last_reading')
    lastReadingTime.value = null
  }
}

const reset = () => { step.value = 'intro'; question.value = ''; hexagramResult.value = [] }
</script>
