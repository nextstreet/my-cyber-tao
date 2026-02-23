<template>
  <div
    class="min-h-screen bg-tao-black text-tao-gold relative flex flex-col items-center justify-center p-4 overflow-hidden"
  >
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="/bg-smoke.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="scanline z-0"></div>

    <main
      class="z-10 w-full max-w-md bg-black/60 backdrop-blur-md p-8 border border-tao-gold/30 rounded-lg shadow-2xl flex flex-col items-center"
    >
      <header class="text-center mb-8 w-full">
        <h1 class="text-4xl font-serif text-tao-gold-light mb-2 tracking-widest">CYBER TAO</h1>
        <div class="w-16 h-1 bg-tao-red mx-auto mb-4"></div>

        <SpiritBottle :lastReadingTime="lastReadingTime" @share-refill="handleShareRefill" />
      </header>

      <section v-if="step === 'intro'" class="w-full space-y-6 animate-fade-in">
        <div>
          <label class="block text-xs uppercase tracking-widest mb-2 text-gray-500 text-center"
            >Focus your intent</label
          >
          <textarea
            v-model="question"
            placeholder="What troubles your mind?"
            class="w-full bg-transparent border border-tao-gold/30 rounded text-center text-lg p-4 focus:outline-none focus:border-tao-gold transition-colors h-24 resize-none placeholder-gray-700"
          ></textarea>
        </div>

        <button
          @click="startRitual"
          :disabled="!question || !hasSpirit"
          class="w-full py-4 border border-tao-gold hover:bg-tao-gold hover:text-black transition-all duration-500 uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {{ hasSpirit ? 'Cast the Oracle' : 'Spirit Depleted - Tap Bottle to Refill' }}
        </button>
      </section>

      <section v-else-if="step === 'ritual'" class="w-full animate-fade-in">
        <CoinToss :userEntropy="question" @complete="onRitualComplete" />
      </section>

      <section
        v-else-if="step === 'result'"
        class="w-full text-center animate-fade-in flex flex-col items-center"
      >
        <div class="mb-6">
          <p class="text-tao-red text-xs tracking-widest uppercase mb-2">The Spirits Answer</p>
          <h2 class="text-3xl font-serif text-white">{{ hexagramName }}</h2>
        </div>

        <div
          class="text-left text-sm leading-relaxed text-gray-300 space-y-4 mb-8 border-l-2 border-tao-gold pl-4 w-full"
        >
          <p v-if="loading" class="animate-pulse text-tao-gold">Communing with the Dao...</p>
          <p v-else>{{ aiResult }}</p>
        </div>

        <div class="mt-4 w-full space-y-4">
          <button
            v-if="!loading"
            @click="generateAndShare"
            class="w-full py-3 bg-tao-gold text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors flex justify-center items-center gap-2"
          >
            <span>📜</span> Manifest Talisman
          </button>

          <button
            @click="reset"
            class="w-full py-2 text-xs text-gray-500 underline hover:text-tao-gold"
          >
            Ask Another Question
          </button>
        </div>
      </section>
    </main>

    <TalismanCard
      ref="talismanRef"
      :hexagramData="{ name: hexagramName, lines: hexagramResult }"
      :aiPredictionText="aiResult"
    />
  </div>
</template>

<script setup>
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

// 新的真实调用逻辑
const onRitualComplete = async (lines) => {
  hexagramResult.value = lines
  step.value = 'result'
  loading.value = true // 显示 loading 状态，比如 "Communing with the DAO..."

  try {
    // 关键调用：使用 supabase.functions.invoke 调用刚才部署的 'cyber-sage'
    const { data, error } = await supabase.functions.invoke('cyber-sage', {
      body: {
        lines: lines,
        question: question.value,
      },
    })

    if (error) throw error

    // 将 AI 返回的数据赋给响应式变量，更新 UI
    hexagramName.value = data.hexagramName
    aiResult.value = data.interpretation

    // 可选：在这里调用之前写的生成符咒长图的方法
    // setTimeout(() => talismanRef.value.generate(), 500)
  } catch (err) {
    console.error('The spirits are silent:', err)
    aiResult.value = 'The connection to the Dao is disturbed. Please try again later.'
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
