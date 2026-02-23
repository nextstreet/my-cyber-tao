<template>
  <div
    v-if="showModal"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
  >
    <div class="flex flex-col items-center max-w-sm w-full animate-fade-in">
      <div class="text-tao-gold text-xs tracking-[0.3em] mb-4 font-serif uppercase animate-pulse">
        — Divine Manifestation —
      </div>

      <div class="relative group">
        <img
          :src="generatedImage"
          class="w-full border border-tao-gold/50 shadow-[0_0_30px_rgba(200,170,110,0.3)] rounded-sm"
          alt="Talisman"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4"
        >
          <span class="text-[10px] text-white/70 italic">Long press to save to your device</span>
        </div>
      </div>

      <button
        @click="close"
        class="mt-8 px-8 py-2 border border-tao-gold/30 text-tao-gold/60 text-xs tracking-widest hover:text-tao-gold hover:border-tao-gold transition-all"
      >
        CLOSE
      </button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    <div
      ref="talismanRef"
      class="w-[375px] h-[667px] bg-[#050505] relative flex flex-col items-center pt-12 pb-8 px-8 overflow-hidden"
      style="border: 12px double #c8aa6e"
    >
      <img
        :src="beastImageUrl"
        class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
      />

      <div class="z-10 flex flex-col-reverse gap-2.5 mb-10">
        <div
          v-for="(line, i) in hexagramData.lines"
          :key="i"
          class="w-32 h-3.5 flex justify-between"
          :class="line === 1 ? 'bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]' : ''"
        >
          <template v-if="line === 0">
            <div class="w-[44%] h-full bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]"></div>
            <div class="w-[44%] h-full bg-[#C8AA6E] shadow-[0_0_15px_rgba(200,170,110,0.6)]"></div>
          </template>
        </div>
      </div>

      <div class="z-10 text-center flex-1 flex flex-col justify-center w-full">
        <h2 class="text-xs text-[#C8AA6E]/60 tracking-[0.5em] uppercase mb-2">Oracle Reading</h2>
        <h1 class="text-4xl font-serif text-[#C8AA6E] font-bold tracking-widest mb-6">
          {{ hexagramData.name || 'DEPARTURE' }}
        </h1>
        <div class="w-12 h-[2px] bg-red-800 mx-auto mb-8"></div>
        <p class="text-white/90 font-serif text-lg leading-relaxed italic px-2">
          "{{ aiPredictionText }}"
        </p>
      </div>

      <div
        class="z-10 mt-auto flex items-end justify-between w-full border-t border-[#C8AA6E]/20 pt-6"
      >
        <div class="text-left">
          <p class="text-[10px] text-[#C8AA6E] tracking-widest leading-loose">
            CYBER TAOISM <br />
            SANCTUARY v1.0
          </p>
          <p class="text-[9px] text-white/30 font-mono mt-1 italic">{{ currentDate }}</p>
        </div>
        <div class="relative p-1 border border-[#C8AA6E]/30 bg-black">
          <img src="/qr-code.png" class="w-14 h-14 grayscale brightness-125" />
        </div>
      </div>

      <div
        class="absolute inset-0 pointer-events-none opacity-[0.05]"
        style="background-image: url('/noise.png')"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText'])

const showModal = ref(false)
const generatedImage = ref(null)
const talismanRef = ref(null)

const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

// 核心逻辑：根据卦象名称动态切换神兽图片
const beastImageUrl = computed(() => {
  const name = (props.hexagramData?.name || '').toLowerCase()

  if (name.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (name.match(/fire|sun|bright|south/)) return '/guardian-phoenix.png'
  if (name.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (name.match(/water|rain|moon|north/)) return '/guardian-turtle.png'

  return '/guardian-qilin.png' // 默认麒麟
})

// 生成图片的核心方法
const generate = async () => {
  showModal.value = false // 重置状态
  await nextTick()

  if (!talismanRef.value) return

  try {
    // 增加一个微小的延迟，确保浏览器完成字体和图片的初步渲染
    setTimeout(async () => {
      const dataUrl = await toPng(talismanRef.value, {
        quality: 1,
        pixelRatio: 2, // 提高清晰度
        skipFonts: false,
      })
      generatedImage.value = dataUrl
      showModal.value = true
    }, 100)
  } catch (err) {
    console.error('Talisman generation failed:', err)
  }
}

const close = () => {
  showModal.value = false
  generatedImage.value = null
}

// 暴露方法给 App.vue 调用
defineExpose({ generate })
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
