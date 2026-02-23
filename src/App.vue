<template>
  <div
    class="min-h-screen bg-tao-black text-tao-gold relative flex flex-col items-center justify-center p-4 overflow-hidden"
  >
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="absolute top-4 right-4 z-50">
      <SpiritBottle :lastReadingTime="lastReadingTime" @share-refill="handleShareRefill" />
    </div>

    <main
      class="z-10 w-full max-w-md bg-black/40 backdrop-blur-xl p-8 border border-tao-gold/20 shadow-2xl flex flex-col items-center relative mt-12"
    >
      <header class="text-center mb-10 w-full">
        <h1 class="text-3xl font-serif text-tao-gold-light tracking-[0.2em] mb-3">CYBER TAO</h1>
        <div class="w-8 h-px bg-tao-red mx-auto"></div>
      </header>

      <section v-if="step === 'intro'" class="w-full space-y-8 animate-fade-in">
        <div class="relative">
          <label
            class="block text-[10px] uppercase tracking-[0.3em] mb-4 text-tao-gold/60 text-center"
            >Imprint your thought into the void</label
          >
          <textarea
            v-model="question"
            placeholder="e.g., Will my current project succeed?"
            class="w-full bg-transparent border-b border-tao-gold/30 text-center text-lg py-4 focus:outline-none focus:border-tao-gold transition-colors resize-none placeholder-tao-gold/20"
            rows="2"
          ></textarea>
        </div>

        <button
          @click="startRitual"
          :disabled="!question || !hasSpirit"
          class="w-full py-3 border border-tao-gold hover:bg-tao-gold hover:text-black transition-all tracking-[0.2em] text-xs uppercase disabled:opacity-30"
        >
          {{ hasSpirit ? 'Enter the Matrix' : 'Spirit Depleted' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full animate-fade-in">
        <CoinToss @complete="onRitualComplete" />
      </section>

      <section
        v-else-if="step === 'result'"
        class="w-full animate-fade-in flex flex-col items-center"
      >
        <div class="mb-8 text-center space-y-2">
          <h2 class="text-4xl font-serif text-white tracking-widest">{{ hexagramData.nameZh }}</h2>
          <p class="text-tao-gold/70 text-sm tracking-[0.2em] uppercase">
            {{ hexagramData.nameEn }}
          </p>
        </div>

        <div class="w-full space-y-6">
          <p v-if="loading" class="animate-pulse text-tao-gold text-center text-sm">
            Translating the binary signals of the Dao...
          </p>
          <template v-else>
            <div class="border-l-2 border-tao-red pl-4 py-1">
              <p class="text-white/80 font-serif text-lg tracking-wide">
                {{ hexagramData.poemZh }}
              </p>
            </div>
            <div class="text-sm leading-loose text-gray-400 font-mono">
              <p>{{ aiResult }}</p>
            </div>
          </template>
        </div>

        <div class="mt-10 w-full space-y-4">
          <button
            v-if="!loading"
            @click="generateAndShare"
            class="w-full py-3 bg-tao-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
          >
            Extract Talisman
          </button>
          <button
            @click="reset"
            class="w-full py-2 text-xs text-tao-gold/40 hover:text-tao-gold transition-colors"
          >
            Return to the Void
          </button>
        </div>
      </section>
    </main>

    <TalismanCard
      ref="talismanRef"
      :hexagramData="{ name: hexagramData.nameEn, lines: hexagramResult }"
      :aiPredictionText="aiResult"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from './supabase' // 确保路径指向你创建的文件
import { ref, computed, onMounted } from 'vue'
import SpiritBottle from './components/SpiritBottle.vue'
import CoinToss from './components/CoinToss.vue'
import TalismanCard from './components/TalismanCard.vue'
// 如果你还没配好 Supabase Edge Function，可以先注释掉下面这行
// import { supabase } from './lib/supabase'

const step = ref('intro')
const question = ref('')
const hexagramResult = ref([])
const hexagramName = ref('')
const aiResult = ref('')
const loading = ref(false)
const talismanRef = ref(null)
// 在 script 顶部定义
const hexagramData = ref({
  nameZh: '',
  nameEn: '',
  poemZh: '',
})

// --- 灵力水瓶与免费逻辑 ---
const lastReadingTime = ref(null)

// 检查是否还有灵力 (距离上次测算是否超过 12 小时)
const hasSpirit = computed(() => {
  if (!lastReadingTime.value) return true
  const last = new Date(lastReadingTime.value).getTime()
  const now = new Date().getTime()
  const diffHours = (now - last) / (1000 * 60 * 60)
  return diffHours >= 12
})

onMounted(() => {
  // 从本地存储获取上次测算时间 (MVP 临时方案，后续可接入 Supabase 用户数据)
  const savedTime = localStorage.getItem('cyber_tao_last_reading')
  if (savedTime) lastReadingTime.value = savedTime
})

// --- 核心流程 ---
const startRitual = () => {
  if (!hasSpirit.value) return
  step.value = 'ritual'
}

// 在你的 onRitualComplete 方法中接收 AI 返回的新格式
const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true

  // 灵力消耗逻辑保持不变...

  try {
    const { data, error } = await supabase.functions.invoke('cyber-sage', {
      body: { lines: lines, question: question.value },
    })

    if (error) throw error

    // 匹配新的 JSON 结构
    hexagramData.value = {
      nameZh: data.hexagramNameZh,
      nameEn: data.hexagramNameEn,
      poemZh: data.poemZh,
    }
    aiResult.value = data.interpretation
    // selectedGuardian.value = data.guardian; // 如果你在 TalismanCard 做了这个改造的话
  } catch (err) {
    console.error('API Error details:', err)
    aiResult.value = 'The signal was lost in the quantum realm. Check F12 for details.'
  } finally {
    loading.value = false
  }
}

// --- 裂变分享逻辑 ---
const handleShareRefill = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Cyber Taoism',
        text: 'I just consulted the AI Oracle at the Cyber Taoism Sanctuary. Discover your fate.',
        url: window.location.href,
      })
      // 分享成功，重置灵力时间 (设为12小时前)
      const pastTime = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString()
      lastReadingTime.value = pastTime
      localStorage.setItem('cyber_tao_last_reading', pastTime)
      alert('Your spirit has been fully restored by the DAO.')
    } else {
      // 电脑端不支持 Web Share API 时的回退方案
      navigator.clipboard.writeText(window.location.href)
      alert(
        'Link copied to clipboard! Share it to restore your spirit. (Spirit refilled for testing!)',
      )
      lastReadingTime.value = null // 测试用直接加满
    }
  } catch (err) {
    console.log('Share canceled or failed', err)
  }
}

const generateAndShare = () => {
  if (talismanRef.value) {
    talismanRef.value.generate() // 调用 TalismanCard 组件里的生成截图方法
  }
}

const reset = () => {
  step.value = 'intro'
  question.value = ''
  hexagramResult.value = []
}
</script>
