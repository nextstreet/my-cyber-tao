<template>
  <div class="fixed inset-0 bg-[#050505] text-tao-gold flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-70"></div>
      <video autoplay loop muted playsinline class="w-full h-full object-cover opacity-20 scale-105">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <main class="relative z-10 w-full max-w-4xl h-[90vh] md:h-[80vh] bg-[#0a0a0a]/80 backdrop-blur-xl border border-tao-gold/30 shadow-[0_0_30px_rgba(200,170,110,0.1)] rounded-2xl flex flex-col p-6 md:p-12 overflow-y-auto">
      
      <section v-if="step === 'intro'" class="flex flex-col items-center w-full max-w-md mx-auto my-auto">
        <header class="text-center w-full mb-10">
          <h1 class="text-4xl md:text-5xl font-serif tracking-[0.5em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">CYBER TAO</h1>
          <div class="h-[1px] w-16 bg-tao-gold/40 mx-auto mt-6 mb-6"></div>
          <p class="text-white/50 text-[10px] md:text-xs tracking-widest font-mono leading-relaxed">
            SUBMIT YOUR INTENT TO THE NEURAL MATRIX.<br/>
            SIX TOSSES WILL ALIGN YOUR HEXAGRAM.
          </p>
        </header>

        <textarea 
          v-model="question" 
          placeholder="ENTER THE VOID..." 
          class="w-full bg-transparent border-b border-tao-gold/20 text-center py-6 md:py-8 focus:outline-none focus:border-tao-gold transition-all text-white text-xl md:text-2xl placeholder:opacity-10 italic resize-none"
          rows="2"
        ></textarea>
        
        <SpiritBottle 
          :lastReadingTime="lastReadingTime" 
          :isUnlimited="isAdmin" 
          :shareCount="shareCount" 
          @refill="handleRefillShare" 
          class="my-8"
        />

        <button 
          @click="step = 'ritual'" 
          :disabled="!question || (!hasSpirit && !isAdmin)" 
          class="group relative w-full py-5 md:py-6 overflow-hidden border border-tao-gold/40 bg-black/40 transition-all hover:border-tao-gold disabled:opacity-10"
        >
          <span class="relative z-10 text-[11px] md:text-xs font-black tracking-[0.8em] uppercase">
            {{ (hasSpirit || isAdmin) ? 'INITIATE PROTOCOL' : 'ENERGY DEPLETED' }}
          </span>
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full max-w-md mx-auto my-auto">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section v-else-if="step === 'result'" class="relative flex flex-col items-center justify-center text-center w-full flex-1">
        <div class="z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
          <h2 class="text-5xl md:text-6xl font-serif text-white tracking-[0.4em] mb-4 animate-fade-in">{{ hexagramData.nameZh }}</h2>
          <p class="text-[10px] md:text-xs tracking-[0.6em] text-tao-gold/40 uppercase mb-12">{{ hexagramData.nameEn }}</p>

          <div v-if="loading" class="py-12 animate-pulse flex flex-col items-center">
            <div class="w-10 h-10 border-t-2 border-tao-gold rounded-full animate-spin mb-6"></div>
            <span class="text-[10px] tracking-[0.8em] opacity-50 uppercase">Decoding Neural Echoes...</span>
          </div>
          
          <div v-else class="space-y-8 text-left animate-fade-in w-full">
            <p class="text-white font-serif text-xl md:text-2xl border-l-2 border-tao-gold/50 pl-6 leading-relaxed">
              {{ hexagramData.poemZh }}
            </p>
            <div class="bg-white/5 border border-white/10 p-6 md:p-8 rounded-sm backdrop-blur-md">
              <p class="text-gray-300 font-mono text-sm md:text-base leading-relaxed italic whitespace-pre-wrap">
                {{ aiResult }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md mt-12 z-20">
          <button @click="talismanRef.generate()" class="py-4 bg-tao-gold text-black text-[11px] font-black tracking-[0.4em] hover:bg-white transition-all rounded-sm uppercase">Extract</button>
          <button @click="reset" class="py-4 border border-tao-gold/30 text-[11px] text-tao-gold tracking-[0.4em] hover:bg-white/5 transition-all rounded-sm uppercase">Return</button>
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
import { HEXAGRAM_MAP } from './data.ts' // 确保该路径正确指向你的 64 卦数据
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

// 身份初始化
const initIdentity = async () => {
  let id = localStorage.getItem('cyber_tao_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cyber_tao_device_id', id)
    await supabase
