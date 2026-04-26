<template>
  <div class="fixed inset-0 bg-[#06090f] text-tao-gold flex items-center justify-center p-3 md:p-6 overflow-hidden font-sans">

    <div class="fixed inset-0 z-0 pointer-events-none"
         style="opacity:.08;background:url('/sacred-mandala.svg') center/ min(70vmin,500px) no-repeat; animation:mandala-breathe 20s ease-in-out infinite"></div>
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:radial-gradient(ellipse at 30% 20%,rgba(140,90,255,.12),transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(200,170,110,.08),transparent 50%)"></div>
    <div class="fixed top-1/2 left-1/2 z-0 pointer-events-none rounded-full border border-solid"
         style="width:min(80vmin,550px);height:min(80vmin,550px);transform:translate(-50%,-50%);border-color:rgba(140,100,255,.1);animation:edge-pulse 8s ease-in-out infinite"></div>
    <div class="fixed top-1/2 left-1/2 z-0 pointer-events-none rounded-full border border-solid"
         style="width:min(100vmin,750px);height:min(100vmin,750px);transform:translate(-50%,-50%);border-color:rgba(200,170,110,.07);animation:edge-pulse 12s ease-in-out infinite reverse"></div>

    <main class="relative z-10 w-full max-w-lg h-[95vh] md:h-[88vh]
                  bg-[#0c1018]/65 backdrop-blur-lg flex flex-col overflow-hidden panel-frame">
      <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-tao-gold/25 bg-black/50">
        <span class="font-mono text-tao-gold/65" style="font-size:11px;letter-spacing:.4em">CYBER·TAO // ABOUT</span>
        <router-link to="/" class="font-mono text-white/50 hover:text-tao-gold transition-colors" style="font-size:11px;letter-spacing:.3em">← BACK</router-link>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar px-5 py-6 text-center">
        <h1 class="font-serif text-white mb-1" style="font-size:36px;letter-spacing:.4em;text-shadow:0 0 12px rgba(200,170,110,.5)">CYBER TAO</h1>
        <p class="font-serif text-tao-gold/70 mb-6" style="font-size:16px;letter-spacing:.3em">赛博道</p>

        <div class="w-full h-px mb-5" style="background:linear-gradient(to right,transparent,rgba(200,170,110,.35),transparent)"></div>

        <section class="text-left mb-5">
          <h2 class="font-mono text-tao-gold/80 mb-3" style="font-size:13px;letter-spacing:.25em">◈ ABOUT</h2>
          <p class="text-white/75 leading-relaxed" style="font-size:13px;line-height:1.8">
            Cyber Tao merges ancient I-Ching divination with cyberpunk aesthetics.
            Cast three coins to form a hexagram, and let DeepSeek AI decode your fate.
            Seal your destiny card and share it forever.
          </p>
        </section>

        <section class="text-left mb-5">
          <h2 class="font-mono text-tao-gold/80 mb-3" style="font-size:13px;letter-spacing:.25em">◈ TECH STACK</h2>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in techs" :key="t" class="px-3 py-1 font-mono border border-tao-gold/20 text-tao-gold/70 bg-black/30" style="font-size:11px;letter-spacing:.1em;border-radius:2px">{{ t }}</span>
          </div>
        </section>

        <section class="text-left">
          <h2 class="font-mono text-tao-gold/80 mb-3" style="font-size:13px;letter-spacing:.25em">◈ FLOW</h2>
          <div v-for="(s,i) in steps" :key="i" class="flex items-center gap-3 py-1.5 relative">
            <span class="font-mono text-tao-gold/50 shrink-0" style="font-size:12px;width:1.5rem;text-align:right">{{ String(i+1).padStart(2,'0') }}</span>
            <span class="text-white/70" style="font-size:12px">{{ s }}</span>
            <div v-if="i<steps.length-1" class="absolute left-[.7rem] top-7 bottom-0 w-px bg-tao-gold/15"></div>
          </div>
        </section>

        <div class="mt-6 pt-4 border-t border-tao-gold/15 flex items-center justify-center gap-3 font-mono text-white/35" style="font-size:11px">
          <a href="https://github.com/nextstreet/my-cyber-tao" target="_blank" class="hover:text-tao-gold transition-colors">GitHub</a>
          <span>·</span>
          <span>v0.2.0</span>
          <span>·</span>
          <span>© 2026</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const techs = ['Vue 3','TypeScript','Vite','Tailwind CSS','Supabase','DeepSeek AI','Vercel']
const steps = ['Cast Coins · 投掷铜钱起卦','AI Interprets · 人工智能解卦','Generate Card · 生成命运卡片','Seal on Chain · 封印于区块链','Share Forever · 永久分享']
</script>

<style scoped>
.panel-frame {
  box-shadow:0 0 0 1px rgba(200,170,110,.38),0 0 40px rgba(200,170,110,.1);
  border-radius:2px; position:relative;
}
.panel-frame::before { content:'';position:absolute;top:0;left:0;width:18px;height:18px;z-index:20;pointer-events:none;border-top:2px solid rgba(200,170,110,.88);border-left:2px solid rgba(200,170,110,.88);box-shadow:-2px -2px 10px rgba(200,170,110,.45) }
.panel-frame::after { content:'';position:absolute;bottom:0;right:0;width:18px;height:18px;z-index:20;pointer-events:none;border-bottom:2px solid rgba(200,170,110,.88);border-right:2px solid rgba(200,170,110,.88);box-shadow:2px 2px 10px rgba(200,170,110,.45) }
@keyframes mandala-breathe { 0%,100%{transform:scale(1);opacity:.08} 50%{transform:scale(1.04);opacity:.14} }
@keyframes edge-pulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5} 50%{transform:translate(-50%,-50%) scale(1.05);opacity:1} }
.custom-scrollbar::-webkit-scrollbar { width:2px }
.custom-scrollbar::-webkit-scrollbar-track { background:transparent }
.custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(200,170,110,.35);border-radius:4px }
</style>
