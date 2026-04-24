<template>
  <div class="about-view">

    <!-- 背景装饰 -->
    <div class="bg-bagua" aria-hidden="true"></div>
    <div class="bg-mandala" aria-hidden="true"></div>
    <div class="bg-aurora" aria-hidden="true"></div>
    <div class="bg-texture" aria-hidden="true"></div>

    <!-- 页边装饰 -->
    <div class="edge-ring edge-ring-inner" aria-hidden="true"></div>
    <div class="edge-ring edge-ring-outer" aria-hidden="true"></div>
    <div class="corner-rune corner-tl" aria-hidden="true">☯</div>
    <div class="corner-rune corner-tr" aria-hidden="true">☯</div>
    <div class="corner-rune corner-bl" aria-hidden="true">☯</div>
    <div class="corner-rune corner-br" aria-hidden="true">☯</div>

    <div class="about-scroll">
      <div class="about-content">
        <div class="about-taiji">
          <TaijituCore :isActive="true" />
        </div>

        <div class="about-header">
          <h1 class="about-title">
            <span class="title-en">CYBER·TAO</span>
            <span class="title-zh">赛博道</span>
          </h1>
          <p class="about-subtitle">DIVINATION · REIMAGINED</p>
        </div>

        <div class="sacred-divider-wrap" aria-hidden="true">
          <img src="/sacred-divider.svg" alt="" class="sacred-divider" />
        </div>

        <div class="about-body">
          <section class="about-section">
            <h2 class="section-heading">
              <span class="heading-glyph">☯</span>
              <span>ABOUT</span>
            </h2>
            <p class="section-text">
              Cyber Tao merges the ancient I-Ching divination with cyberpunk aesthetics.
              Cast coins to form a hexagram, let AI interpret the oracle, and receive
              your unique destiny card — permanently sealed and shareable.
            </p>
          </section>

          <section class="about-section">
            <h2 class="section-heading">
              <span class="heading-glyph">⚡</span>
              <span>TECH STACK</span>
            </h2>
            <div class="tech-tags">
              <span v-for="tech in techStack" :key="tech" class="tech-tag">{{ tech }}</span>
            </div>
          </section>

          <section class="about-section">
            <h2 class="section-heading">
              <span class="heading-glyph">◈</span>
              <span>FLOW</span>
            </h2>
            <div class="flow-steps">
              <div v-for="(step, i) in flowSteps" :key="i" class="flow-step">
                <span class="flow-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="flow-text">{{ step }}</span>
                <div v-if="i < flowSteps.length - 1" class="flow-line"></div>
              </div>
            </div>
          </section>
        </div>

        <div class="about-footer">
          <a href="https://github.com/nextstreet/my-cyber-tao" target="_blank" class="footer-link">
            <span class="link-icon">⌂</span> GitHub
          </a>
          <span class="footer-sep">·</span>
          <span class="footer-version">v0.1.0</span>
          <span class="footer-sep">·</span>
          <span class="footer-copy">© 2026 Cyber Tao</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaijituCore from '../components/TaijituCore.vue'

const techStack = [
  'Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4',
  'Supabase', 'DeepSeek AI', 'Pinia', 'Vue Router',
  'Vercel', 'Playwright', 'Vitest',
]

const flowSteps = [
  'Cast Coins · 投掷铜钱',
  'AI Interprets · AI解读卦象',
  'Generate Card · 生成卡片',
  'Seal on Chain · 封印于链',
  'Share Forever · 永久分享',
]
</script>

<style scoped>
.about-view {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

/* ── 背景装饰 ── */
.bg-bagua {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: url('/bagua-array.svg');
  background-size: min(80vmin, 600px);
  background-position: center;
  background-repeat: no-repeat;
  animation: bg-rotate 120s linear infinite;
}
@keyframes bg-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.bg-mandala {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: url('/sacred-mandala.svg');
  background-size: min(70vmin, 500px);
  background-position: center;
  background-repeat: no-repeat;
  animation: mandala-breathe 20s ease-in-out infinite;
}
@keyframes mandala-breathe {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.03); opacity: 0.15; }
}
.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(140, 90, 255, 0.14) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(200, 170, 110, 0.1) 0%, transparent 50%);
}
.bg-texture {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url('/texture-rice-paper.png');
  background-size: 300px 300px;
  background-repeat: repeat;
  mix-blend-mode: overlay;
}

/* ── 页边光环 ── */
.edge-ring {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  border: 1px solid;
}
.edge-ring-inner {
  width: min(80vmin, 550px);
  height: min(80vmin, 550px);
  border-color: rgba(140, 100, 255, 0.12);
  animation: edge-pulse 8s ease-in-out infinite;
}
.edge-ring-outer {
  width: min(100vmin, 750px);
  height: min(100vmin, 750px);
  border-color: rgba(200, 170, 110, 0.08);
  animation: edge-pulse 12s ease-in-out infinite reverse;
}
@keyframes edge-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; }
}

/* ── 四角符文 ── */
.corner-rune {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  font-size: 1.8rem;
  opacity: 0.08;
  font-family: serif;
}
.corner-tl { top: 3%; left: 3%; }
.corner-tr { top: 3%; right: 3%; }
.corner-bl { bottom: 3%; left: 3%; }
.corner-br { bottom: 3%; right: 3%; }

.about-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
}

.about-content {
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-taiji {
  width: 70px;
  height: 70px;
  margin-bottom: 1rem;
  opacity: 0.65;
}

.about-header {
  text-align: center;
  margin-bottom: 1rem;
}
.about-title { display: flex; flex-direction: column; gap: 0.15rem; margin: 0; }
.title-en {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(240, 225, 255, 0.95);
  letter-spacing: 0.5em;
  font-family: 'Playfair Display', serif;
}
.title-zh {
  font-size: 2rem;
  font-weight: 900;
  color: rgba(225, 205, 255, 0.9);
  letter-spacing: 0.3em;
  font-family: 'Playfair Display', serif;
}
.about-subtitle {
  font-size: 0.75rem;
  color: rgba(200, 170, 110, 0.6);
  letter-spacing: 0.4em;
  margin-top: 0.5rem;
  font-family: monospace;
}

.sacred-divider-wrap { width: 100%; margin: 1rem 0; opacity: 0.18; pointer-events: none; }
.sacred-divider { width: 100%; height: auto; display: block; }

.about-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.about-section {
  padding: 1rem;
  background: rgba(10, 8, 28, 0.65);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(140, 100, 255, 0.12);
  border-radius: 6px;
  transition: border-color 0.3s;
}
.about-section:hover { border-color: rgba(140, 100, 255, 0.3); }

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(160, 130, 230, 0.75);
  letter-spacing: 0.25em;
  font-family: monospace;
  text-transform: uppercase;
  margin: 0 0 0.6rem;
}
.heading-glyph { font-size: 0.95rem; }
.section-text {
  font-size: 0.9rem;
  line-height: 1.75;
  color: rgba(215, 195, 250, 0.8);
  margin: 0;
}

.tech-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.tech-tag {
  font-size: 0.68rem;
  font-family: monospace;
  padding: 0.25rem 0.6rem;
  border: 1px solid rgba(140, 100, 255, 0.2);
  color: rgba(215, 195, 250, 0.7);
  background: rgba(140, 100, 255, 0.06);
  border-radius: 3px;
  transition: all 0.3s;
}
.tech-tag:hover {
  border-color: rgba(140, 100, 255, 0.5);
  color: rgba(215, 195, 250, 0.9);
  background: rgba(140, 100, 255, 0.12);
}

.flow-steps { display: flex; flex-direction: column; gap: 0; }
.flow-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  position: relative;
}
.flow-num {
  font-size: 0.68rem;
  font-family: monospace;
  color: rgba(160, 130, 230, 0.6);
  width: 2rem;
  flex-shrink: 0;
  text-align: right;
}
.flow-line {
  position: absolute;
  left: 1rem;
  top: 1.4rem;
  bottom: -0.4rem;
  width: 1px;
  background: rgba(140, 100, 255, 0.15);
}
.flow-text {
  font-size: 0.85rem;
  color: rgba(215, 195, 250, 0.75);
}

.about-footer {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  font-family: monospace;
  color: rgba(140, 100, 255, 0.4);
}
.footer-link {
  color: rgba(160, 130, 230, 0.6);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.3s;
}
.footer-link:hover { color: rgba(215, 195, 250, 0.85); }
.link-icon { font-size: 0.75rem; }
.footer-sep { opacity: 0.4; }
.footer-version, .footer-copy { opacity: 0.6; }
</style>
