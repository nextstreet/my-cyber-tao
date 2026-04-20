<template>
  <div class="home-container" :class="{ 'mobile': isMobile }">
    <!-- 桌面：书页双栏 -->
    <div v-if="!isMobile" class="book-spread">
      <!-- 左页：天机数据 -->
      <div class="book-page left-page">
        <TianjiPanel :data="tianjiData" :loading="tianjiLoading" />
      </div>
      <!-- 书脊 -->
      <div class="book-spine"></div>
      <!-- 右页：占卜输入 -->
      <div class="book-page right-page">
        <DivinationInput @submit="handleSubmit" :loading="divLoading" />
      </div>
    </div>

    <!-- 移动端：翻页 -->
    <div v-else class="mobile-pages">
      <div class="page-wrapper" :style="{ transform: `translateX(-${activePage * 100}%)` }">
        <div class="mobile-page">
          <TianjiPanel :data="tianjiData" :loading="tianjiLoading" />
        </div>
        <div class="mobile-page">
          <DivinationInput @submit="handleSubmit" :loading="divLoading" />
        </div>
      </div>
      <!-- 翻页指示点 -->
      <div class="page-dots">
        <span :class="{ active: activePage === 0 }" @click="activePage = 0"></span>
        <span :class="{ active: activePage === 1 }" @click="activePage = 1"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import TianjiPanel from '../components/TianjiPanel.vue'
import DivinationInput from '../components/DivinationInput.vue'
import { getTianjiData } from '../utils/tianji'
import { useSwipe } from '../composables/useSwipe'

const router = useRouter()
const isMobile = ref(window.innerWidth < 768)
const activePage = ref(0)
const tianjiLoading = ref(true)
const divLoading = ref(false)
const tianjiData = ref<ReturnType<typeof getTianjiData> | null>(null)

// 监听窗口尺寸
const onResize = () => { isMobile.value = window.innerWidth < 768 }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

// 初始化天机数据
onMounted(async () => {
  // 尝试获取地理坐标
  let coords: { lat: number; lng: number } | undefined
  try {
    coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { timeout: 3000 }
      )
    })
  } catch { /* 优雅降级 */ }

  tianjiData.value = getTianjiData(new Date(), coords)
  tianjiLoading.value = false
})

// 移动端滑动切换
const { onTouchStart, onTouchEnd } = useSwipe(
  () => { if (activePage.value < 1) activePage.value++ },
  () => { if (activePage.value > 0) activePage.value-- }
)

// 提交占卜
async function handleSubmit(question: string, hexagram: any) {
  divLoading.value = true
  try {
    // 调用现有的 Supabase edge function
    const res = await fetch('/api/divination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, hexagram, tianji: tianjiData.value })
    })
    const { sessionId } = await res.json()
    router.push(`/result/${sessionId}`)
  } catch (e) {
    console.error(e)
  } finally {
    divLoading.value = false
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050510;
  overflow: hidden;
}

.book-spread {
  display: flex;
  width: min(1200px, 95vw);
  height: min(760px, 90vh);
  gap: 0;
  box-shadow: 0 0 80px rgba(100, 60, 220, 0.3);
}

.book-page {
  flex: 1;
  background: rgba(8, 8, 24, 0.95);
  border: 1px solid rgba(120, 80, 255, 0.2);
  padding: 2.5rem;
  overflow-y: auto;
  position: relative;
}

.left-page {
  border-right: none;
  border-radius: 4px 0 0 4px;
  background: linear-gradient(135deg, rgba(8,8,24,0.98) 0%, rgba(15,8,35,0.95) 100%);
}

.right-page {
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.book-spine {
  width: 12px;
  background: linear-gradient(180deg, rgba(120,80,255,0.6) 0%, rgba(60,30,160,0.8) 50%, rgba(120,80,255,0.6) 100%);
  position: relative;
}
.book-spine::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(200,180,255,0.15), transparent);
}

/* 移动端 */
.mobile-pages {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
.page-wrapper {
  display: flex;
  width: 200vw;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-page {
  width: 100vw;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
}
.page-dots {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.page-dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(120, 80, 255, 0.3);
  border: 1px solid rgba(120, 80, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}
.page-dots span.active {
  background: rgba(120, 80, 255, 0.9);
  box-shadow: 0 0 8px rgba(120, 80, 255, 0.8);
}
</style>
