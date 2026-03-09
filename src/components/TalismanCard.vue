<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 p-4 backdrop-blur-xl overflow-y-auto">
    
    <div class="flex items-center gap-4 mb-6 opacity-80 animate-fade-in">
      <div class="h-px w-12 bg-white/20"></div>
      <div :class="['text-[11px] tracking-[0.6em] font-black uppercase px-3 py-1 border', rarityColor]">
        {{ rarityLabel }} // SYNC: {{ syncRate }}%
      </div>
      <div class="h-px w-12 bg-white/20"></div>
    </div>

    <div class="relative w-[85vw] max-w-[400px] aspect-[9/16] md:max-w-[420px] perspective-2000" @click="isFlipped = !isFlipped">
      <div 
        class="relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl"
        :class="{ 'rotate-y-180': isFlipped }"
      >
        <div class="absolute inset-0 backface-hidden rounded-xl border border-white/10 bg-[#050505] overflow-hidden transform-rotate-0">
          <div class="w-full h-full flex flex-col relative" :style="visualSeedStyles">
            <div class="absolute inset-0 cyber-grid opacity-[0.08]" :style="gridOffsetStyle"></div>
            
            <div class="relative p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div class="flex items-center gap-3">
                <div v-if="userData" class="w-8 h-8 rounded-sm bg-cyan-900/50 border border-cyan-500/50 overflow-hidden">
                  <img :src="userData.avatar" class="w-full h-full object-cover grayscale brightness-125" />
                </div>
                <div v-else class="w-8 h-8 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center">
                  <span class="text-[10px] text-white/40">?</span>
                </div>
                <div class="flex flex-col">
                  <span :class="['text-[10px] font-mono tracking-widest uppercase', userData ? 'text-cyan-400' : 'text-white/40']">
                    {{ userData ? userData.name : 'TEMPORARY NEURAL LINK' }}
                  </span>
                  <span class="text-[8px] text-white/30 font-mono tracking-widest">{{ userHash }}</span>
                </div>
              </div>
            </div>

            <div class="relative flex-1 flex flex-col items-center justify-center p-6 border-b border-white/5">
              <h1 class="text-2xl font-serif text-white/90 tracking-[0.3em] uppercase mb-4">{{ hexagramData.name }}</h1>
              <div class="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  <polygon points="50,15 85,38 72,80 28,80 15,38" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
                  <polygon points="50,25 75,43 65,72 35,72 25,43" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
                  <polygon :points="radarPoints" fill="currentColor" class="opacity-20 text-current" stroke="currentColor" stroke-width="1.5" />
                  <g class="font-mono tracking-widest uppercase">
                    <text x="50" y="6" text-anchor="middle" class="text-[5px] fill-current opacity-90">ORDER</text>
                    <text x="50" y="10" text-anchor="middle" class="text-[3px] fill-current opacity-40 font-serif">秩序</text>
                    <text x="92" y="36" text-anchor="start" class="text-[5px] fill-current opacity-90">SENSE</text>
                    <text x="92" y="40" text-anchor="start" class="text-[3px] fill-current opacity-40 font-serif">感知</text>
                    <text x="75" y="90" text-anchor="middle" class="text-[5px] fill-current opacity-90">ORIGIN</text>
                    <text x="75" y="94" text-anchor="middle" class="text-[3px] fill-current opacity-40 font-serif">根源</text>
                    <text x="25" y="90" text-anchor="middle" class="text-[5px] fill-current opacity-90">SYNC</text>
                    <text x="25" y="94" text-anchor="middle" class="text-[3px] fill-current opacity-40 font-serif">同步</text>
                    <text x="8" y="36" text-anchor="end" class="text-[5px] fill-current opacity-90">CHAOS</text>
                    <text x="8" y="40" text-anchor="end" class="text-[3px] fill-current opacity-40 font-serif">混沌</text>
                  </g>
                </svg>
              </div>
            </div>

            <div class="relative h-1/3 p-6 flex flex-col justify-between bg-gradient-to-t from-white/[0.05] to-transparent">
              <div class="overflow-hidden">
                <div class="w-8 h-px bg-white/30 mb-4"></div>
                <p class="text-white/80 font-mono text-xs leading-relaxed italic line-clamp-3">
                  {{ shortAiText }}
                </p>
              </div>
              <div class="flex justify-between items-end mt-4">
                <span class="text-[10px] text-white/40 font-serif tracking-[0.5em] [writing-mode:vertical-rl] border-l border-white/10 pl-2">
                  {{ lunarDateStamp }}
                </span>
                <span class="text-[8px] text-white/20 font-mono tracking-widest uppercase">SYS V2.0 // DECODED</span>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-tao-gold/30 bg-[#050505] overflow-hidden">
          <div class="w-full h-full flex flex-col relative" :style="visualSeedStyles">
            <div class="relative h-[55%] w-full border-b border-tao-gold/20">
              <img v-if="beastImageUrl" :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-105" />
              <svg class="absolute inset-0 w-full h-full opacity-60 pointer-events-none drop-shadow-[0_0_8px_rgba(200,170,110,0.8)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path v-for="(path, i) in talismanPaths" :key="i" :d="path" fill="none" stroke="#c8aa6e" stroke-width="0.5" class="animate-pulse" :style="`animation-delay: ${i * 0.5}s`" />
              </svg>
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]"></div>
            </div>
            <div class="relative h-[45%] w-full p-6 flex justify-between items-start bg-gradient-to-t from-[#0a0a0a] to-[#050505]">
              <div class="flex gap-6 h-full">
                <h1 class="text-6xl font-serif text-tao-gold tracking-widest font-bold [writing-mode:vertical-rl] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)] h-full">
                  {{ hexagramData.nameZh }}
                </h1>
                <p class="text-white/80 text-lg font-serif tracking-[0.4em] [writing-mode:vertical-rl] leading-loose h-full pt-2">
                  {{ hexagramData.poemZh }}
                </p>
              </div>
              <div class="flex flex-col items-end justify-between h-full pb-2">
                 <div class="p-1.5 border border-tao-gold/20 bg-black/80">
                   <img src="/qr-code.png" class="w-10 h-10 grayscale brightness-125" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex flex-col items-center gap-4 animate-fade-up">
      <div class="flex gap-4">
        <button @click="downloadImage('poster')" class="px-6 py-3 bg-white/10 border border-white/20 text-white text-[10px] tracking-[0.3em] uppercase hover:bg-white/20">
          Save 9:16 Poster
        </button>
        <button @click="downloadImage('square')" class="px-6 py-3 bg-tao-gold/20 border border-tao-gold/40 text-tao-gold text-[10px] tracking-[0.3em] font-bold uppercase shadow-[0_0_15px_rgba(200,170,110,0.2)]">
          IG 1:1 Square
        </button>
      </div>
      <button @click="close" class="text-white/30 text-[10px] tracking-[0.4em] hover:text-white transition-colors uppercase mt-2">Dismiss</button>
    </div>
  </div>

  <div class="fixed top-[-9999px] left-[-9999px] pointer-events-none">
    
    <div ref="squareRef" class="w-[1080px] h-[1080px] bg-[#050505] flex flex-col justify-between overflow-hidden relative border-[20px] border-[#0a0a0a] p-16">
      <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen scale-125" />
      <div class="z-10 flex justify-between items-start w-full">
         <div>
           <h2 class="text-[48px] font-serif text-tao-gold tracking-[0.3em] font-bold">{{ hexagramData.nameZh }} // {{ hexagramData.name }}</h2>
           <div class="text-[24px] text-white/50 font-mono tracking-widest mt-4">SYNC: {{ syncRate }}% | {{ rarityLabel }}</div>
         </div>
         <div class="text-[24px] text-white/40 font-serif tracking-[0.5em] [writing-mode:vertical-rl] h-[200px]">{{ lunarDateStamp }}</div>
      </div>
      <div class="z-10 flex w-full gap-12 items-end">
         <div class="flex-1 border-t border-tao-gold/30 pt-8">
           <p class="text-[36px] text-white/90 font-mono italic leading-relaxed">{{ shortAiText }}</p>
         </div>
         <div class="shrink-0 p-4 border border-tao-gold/30 bg-black/80">
            <img src="/qr-code.png" class="w-32 h-32 grayscale brightness-150" />
         </div>
      </div>
    </div>

    <div ref="posterRef" class="w-[1080px] h-[1920px] bg-[#050505] flex flex-col overflow-hidden relative border-[24px] border-[#0a0a0a]">
       <img :src="beastImageUrl" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-110" />
       <div class="z-10 w-full p-16 flex justify-between items-start border-b-2 border-[#c8aa6e]/30">
          <div class="flex flex-col gap-6">
            <h2 class="text-[64px] font-serif text-white tracking-[0.4em] uppercase font-bold">{{ hexagramData.name }}</h2>
            <div class="text-[28px] text-white/50 font-mono tracking-[0.6em] uppercase">USER HASH: {{ userHash }}</div>
          </div>
          <div class="text-[32px] text-[#c8aa6e]/80 font-serif tracking-[0.6em] [writing-mode:vertical-rl] font-bold">{{ lunarDateStamp }}</div>
       </div>
       <div class="z-10 flex-1 w-full p-20 flex justify-center items-center relative">
          <img src="/bagua-array.svg" class="absolute w-[800px] h-[800px] opacity-10" />
          <h1 class="text-[320px] font-serif text-[#c8aa6e] tracking-[0.1em] font-black [writing-mode:vertical-rl] absolute right-[30%]">{{ hexagramData.nameZh }}</h1>
          <p class="text-[80px] text-white font-serif tracking-[0.5em] [writing-mode:vertical-rl] absolute left-[20%] font-bold">{{ hexagramData.poemZh }}</p>
       </div>
       <div class="z-10 w-full p-16 bg-[#0a0a0a]/90 border-t-2 border-[#c8aa6e]/40 flex gap-12 items-center">
          <div class="flex-1">
            <div class="text-[#8b0000] text-[24px] font-black tracking-[0.4em] mb-4 uppercase">Neural Decree</div>
            <p class="text-[40px] text-white/90 font-serif leading-[1.8]">{{ aiPredictionText }}</p>
          </div>
          <div class="p-2 border border-[#c8aa6e]/50 bg-black">
            <img src="/qr-code.png" class="w-48 h-48 grayscale brightness-150" />
          </div>
       </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { toPng } from 'html-to-image'

// 新增 userData 支持身份系统
const props = defineProps(['hexagramData', 'aiPredictionText', 'userData'])
const showModal = ref(false)
const isFlipped = ref(false)

const posterRef = ref(null)
const squareRef = ref(null)
const generateTime = ref(Date.now())

// --- 核心逻辑：确定性随机种子 (Visual Seed) ---
const seed = computed(() => {
  const uid = props.userData?.id || 'guest'
  const hexLines = props.hexagramData?.lines?.join('') || '000000'
  let hash = 0
  const str = `${uid}-${generateTime.value}-${hexLines}`
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 
  }
  return Math.abs(hash)
})

// 生成不可篡改的用户/访客 Hash 签名
const userHash = computed(() => `0x${seed.value.toString(16).toUpperCase().padStart(8, '0')}`)

// --- 稀有度与同步率算法 ---
const syncRate = computed(() => {
  // 保证 80.0% - 99.9% 之间
  const rate = 80 + (seed.value % 200) / 10
  return rate > 99.9 ? 99.9 : rate.toFixed(1)
})

const rarityInfo = computed(() => {
  const rate = parseFloat(syncRate.value)
  if (rate >= 99.0) return { label: 'GODLIKE', color: 'text-rose-500 border-rose-500/50', hue: 'hue-rotate(-45deg)' } // 偏红/紫
  if (rate >= 95.1) return { label: 'ULTRA RARE', color: 'text-tao-gold border-tao-gold/50', hue: 'hue-rotate(30deg)' } // 偏金
  if (rate >= 90.1) return { label: 'RARE', color: 'text-cyan-300 border-cyan-300/50', hue: 'hue-rotate(180deg)' } // 偏绿/蓝
  return { label: 'COMMON', color: 'text-white/60 border-white/20', hue: 'hue-rotate(0deg)' } // 原色
})

const rarityLabel = computed(() => rarityInfo.value.label)
const rarityColor = computed(() => rarityInfo.value.color)

// 根据种子和稀有度驱动视觉变量
const visualSeedStyles = computed(() => {
  // Common 默认青色体系，通过种子微调滤镜
  const baseColor = rarityInfo.value.label === 'COMMON' ? '#22d3ee' : 'currentColor'
  return {
    filter: rarityInfo.value.hue,
    color: baseColor
  }
})

const gridOffsetStyle = computed(() => ({
  backgroundPosition: `${seed.value % 50}px ${seed.value % 50}px`
}))

// --- 视觉增强：能量雷达图 ---
const radarPoints = computed(() => {
  // 五维：秩序、感知、根源、同步、混沌 (值 30-90)
  const getVal = (offset) => 30 + ((seed.value >> offset) % 60)
  const order = getVal(1)
  const perceive = getVal(2)
  const origin = getVal(3)
  const sync = getVal(4)
  const chaos = getVal(5)

  // 映射到 100x100 的多边形顶点 (基于极坐标转换近似值)
  const p1 = `50,${50 - (order * 0.4)}` // 上
  const p2 = `${50 + (perceive * 0.38)},${50 - (perceive * 0.12)}` // 右上
  const p3 = `${50 + (origin * 0.23)},${50 + (origin * 0.35)}` // 右下
  const p4 = `${50 - (sync * 0.23)},${50 + (sync * 0.35)}` // 左下
  const p5 = `${50 - (chaos * 0.38)},${50 - (chaos * 0.12)}` // 左上
  
  return `${p1} ${p2} ${p3} ${p4} ${p5}`
})

// --- 视觉增强：数码符咒叠加 (Digital Talismans) ---
const talismanPaths = computed(() => {
  // 根据吉凶/种子随机组合 SVG 路径
  const paths = [
    `M 20,20 Q ${30 + (seed.value%40)},50 50,80 T 80,90`,
    `M 10,50 L ${40 + (seed.value%20)},50 L 50,90`,
    `M 80,10 C 60,30 40,70 ${20 + (seed.value%20)},80`,
    `M 50,10 L 50,${40 + (seed.value%30)} L 80,80`
  ]
  // 随机抽取 2-3 个笔画
  const count = 2 + (seed.value % 2)
  return paths.sort(() => (seed.value % 3) - 1.5).slice(0, count)
})

// --- 视觉增强：五行流时印章 ---
const lunarDateStamp = computed(() => {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
  const date = new Date(generateTime.value)
  // 简单模拟天干地支算法 (基于年份)
  const year = date.getFullYear()
  const stem = stems[(year - 4) % 10]
  const branch = branches[(year - 4) % 12]
  return `${stem}${branch}年 · 极数时空`
})

const shortAiText = computed(() => {
  if (!props.aiPredictionText) return ''
  const sentences = props.aiPredictionText.match(/[^.!?]+[.!?]+/g) || [props.aiPredictionText]
  return sentences.slice(0, 2).join(' ').trim()
})

const beastImageUrl = computed(() => {
  const name = (props.hexagramData?.name || '').toLowerCase()
  if (name.match(/heaven|sky|thunder|wind|wood/)) return '/guardian-dragon.png'
  if (name.match(/fire|sun|bright|south/)) return '/guardian-phoenix.png'
  if (name.match(/lake|mountain|metal|gold/)) return '/guardian-tiger.png'
  if (name.match(/water|rain|moon|north/)) return '/guardian-turtle.png'
  return '/guardian-qilin.png'
})

const generate = () => {
  generateTime.value = Date.now() // 每次生成刷新时间戳和种子
  isFlipped.value = false
  showModal.value = true
}

const downloadImage = async (format) => {
  const targetRef = format === 'poster' ? posterRef.value : squareRef.value
  if (!targetRef) return
  try {
    const dataUrl = await toPng(targetRef, { 
      quality: 1.0, 
      pixelRatio: 2,
      backgroundColor: '#050505'
    })
    const link = document.createElement('a')
    link.download = `CyberTao-${format}-${props.hexagramData.nameZh}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const close = () => { showModal.value = false }
defineExpose({ generate })
</script>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }

/* 必须加上 -webkit- 前缀，并且确保初始旋转为 0 */
.backface-hidden { 
  backface-visibility: hidden; 
  -webkit-backface-visibility: hidden; 
}
.transform-rotate-0 {
  transform: rotateY(0deg);
}
.rotate-y-180 { 
  transform: rotateY(180deg); 
}

.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 0.8; }
}
.animate-fade-in { animation: fade-in 1s ease-out forwards; }

</style>


