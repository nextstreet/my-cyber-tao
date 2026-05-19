<template>
  <div
    class="fixed inset-0 bg-[#020408] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans selection:bg-tao-gold/30"
  >
    <!-- ░░ LAYER 0: Canvas Cyber Waterfall ░░ -->
    <canvas ref="matrixCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-40"></canvas>

    <!-- ░░ LAYER 1: Gradient Vignette ░░ -->
    <div
      class="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#020408_100%)]"
    ></div>

    <!-- ░░ MAIN PANEL ░░ -->
    <main
      class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh] bg-[#05080f]/95 backdrop-blur-2xl border border-tao-gold/25 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_120px_rgba(200,170,110,0.06)] flex flex-col overflow-hidden cyber-border-frame"
    >
      <!-- ─── TOP CHROME ─── -->
      <div
        class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/15 bg-black/30"
      >
        <span class="text-[8px] font-mono text-tao-gold/40 tracking-[0.4em]">CYBER·TAO v2.0</span>
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-tao-red/60 shadow-[0_0_6px_rgba(138,42,42,0.8)]"></span>
          <span class="w-2 h-2 rounded-full bg-tao-gold/40 shadow-[0_0_6px_rgba(200,170,110,0.6)]"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.7)]"></span>
        </div>
        <span class="text-[8px] font-mono text-tao-gold/30 tracking-[0.3em]">{{ currentTime }}</span>
      </div>

      <!-- ░░ ROUTER CONTENT ░░ -->
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const matrixCanvas = document.querySelector('canvas') as HTMLCanvasElement | null
  if (matrixCanvas) {
    const ctx = matrixCanvas.getContext('2d')
    if (ctx) {
      matrixCanvas.width = matrixCanvas.offsetWidth
      matrixCanvas.height = matrixCanvas.offsetHeight
      const chars = '天地玄黄宇宙洪荒日月盈昃辰宿列張寒来暑往秋收冬藏閏餘成歲律呂調陽'
      const fontSize = 14
      const columns = Math.floor(matrixCanvas.width / fontSize)
      const drops: number[] = Array(columns).fill(1)

      function draw() {
        if (!ctx || !matrixCanvas) return
        ctx.fillStyle = 'rgba(2, 4, 8, 0.05)'
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height)
        ctx.fillStyle = 'rgba(200, 170, 110, 0.15)'
        ctx.font = `${fontSize}px monospace`
        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)]
          ctx.fillText(text!, i * fontSize, drops[i]! * fontSize)
          if (drops[i]! * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0
          }
          drops[i] = drops[i]! + 1
        }
      }
      const interval = setInterval(draw, 50)
      onUnmounted(() => clearInterval(interval))
    }
  }

  const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
