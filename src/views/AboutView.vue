<template>
  <div class="about-view">

    <!-- 背景装饰 -->
    <div class="bg-bagua" aria-hidden="true"></div>
    <div class="bg-aurora" aria-hidden="true"></div>
    <div class="bg-texture" aria-hidden="true"></div>

    <div class="about-content">
      <!-- 太极核心 -->
      <div class="about-taiji">
        <TaijituCore :isActive="true" />
      </div>

      <!-- 标题 -->
      <div class="about-header">
        <h1 class="about-title">
          <span class="title-zh">赛博道</span>
          <span class="title-en">CYBER·TAO</span>
        </h1>
        <p class="about-subtitle">天行健 · 君子以自强不息</p>
      </div>

      <!-- 祥云分割 -->
      <div class="cloud-divider-wrap" aria-hidden="true">
        <img src="/cloud-divider.svg" alt="" class="cloud-divider" />
      </div>

      <!-- 项目介绍 -->
      <div class="about-body">
        <section class="about-section">
          <h2 class="section-heading">
            <span class="heading-glyph">☯</span>
            <span>关于 · ABOUT</span>
          </h2>
          <p class="section-text">
            Cyber Tao（赛博道）融合中国传统易经占卜与赛博朋克美学。
            通过投掷铜钱起卦，AI 解读卦象，生成专属命运卡片并可永久分享。
          </p>
        </section>

        <section class="about-section">
          <h2 class="section-heading">
            <span class="heading-glyph">⚡</span>
            <span>技术 · TECH</span>
          </h2>
          <div class="tech-tags">
            <span v-for="tech in techStack" :key="tech" class="tech-tag">{{ tech }}</span>
          </div>
        </section>

        <section class="about-section">
          <h2 class="section-heading">
            <span class="heading-glyph">◈</span>
            <span>流程 · FLOW</span>
          </h2>
          <div class="flow-steps">
            <div v-for="(step, i) in flowSteps" :key="i" class="flow-step">
              <span class="flow-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="flow-line" v-if="i < flowSteps.length - 1"></div>
              <span class="flow-text">{{ step }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 底部链接 -->
      <div class="about-footer">
        <a href="https://github.com/nextstreet/my-cyber-tao" target="_blank" rel="noopener" class="footer-link">
          <span class="link-icon">⟨⟩</span>
          GitHub
        </a>
        <span class="footer-sep">·</span>
        <span class="footer-version">v1.0.0</span>
        <span class="footer-sep">·</span>
        <span class="footer-copy">© 2026 Cyber Tao</span>
      </div>
    </div>

    <!-- 底部系统日志 -->
    <div class="about-syslog">
      <SystemLog />
    </div>
  </div>
</template>

<script setup lang="ts">
import TaijituCore from '../components/TaijituCore.vue'
import SystemLog from '../components/SystemLog.vue'

const techStack = [
  'Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4',
  'Supabase', 'DeepSeek AI', 'Pinia', 'Vue Router',
  'Vercel', 'Playwright', 'Vitest',
]

const flowSteps = [
  '投掷铜钱起卦 · Cast Coins',
  'AI 解读卦象 · AI Interprets',
  '生成命运卡片 · Generate Card',
  '封印于链 · Seal on Chain',
  '永久分享 · Share Forever',
]
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  background: #050510;
  color: rgba(200, 180, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-y: auto;
  padding: 2rem 1rem 3rem;
}

/* ── 背景装饰 ── */
.bg-bagua {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.025;
  background-image: url('/bagua-array.svg');
  background-size: min(80vmin, 600px);
  background-position: center;
  background-repeat: no-repeat;
  animation: bg-rotate 120s linear infinite;
  will-change: transform;
}
@keyframes bg-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(120, 80, 255, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(200, 170, 110, 0.04) 0%, transparent 50%);
}
.bg-texture {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url('/texture-rice-paper.png');
  background-size: 300px 300px;
  background-repeat: repeat;
  mix-blend-mode: overlay;
}

.about-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── 太极 ── */
.about-taiji {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

/* ── 标题 ── */
.about-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.about-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}
.title-zh {
  font-size: 3rem;
  font-weight: 900;
  color: rgba(220, 200, 255, 0.95);
  letter-spacing: 0.3em;
  font-family: 'Playfair Display', serif;
}
.title-en {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(120, 80, 255, 0.6);
  letter-spacing: 0.8em;
  font-family: monospace;
}
.about-subtitle {
  font-size: 0.7rem;
  color: rgba(200, 170, 110, 0.5);
  letter-spacing: 0.5em;
  margin-top: 0.75rem;
  font-family: serif;
}

/* ── 祥云分割 ── */
.cloud-divider-wrap {
  width: 80%;
  margin: 0.5rem 0 1.5rem;
  opacity: 0.12;
  pointer-events: none;
}
.cloud-divider {
  width: 100%;
  height: auto;
  display: block;
}

/* ── 正文 ── */
.about-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.about-section {
  padding: 1.25rem;
  background: rgba(8, 8, 24, 0.7);
  border: 1px solid rgba(120, 80, 255, 0.12);
  border-radius: 4px;
  transition: border-color 0.3s;
}
.about-section:hover {
  border-color: rgba(120, 80, 255, 0.3);
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 400;
  color: rgba(120, 80, 255, 0.7);
  letter-spacing: 0.3em;
  font-family: monospace;
  text-transform: uppercase;
  margin: 0 0 0.75rem;
}
.heading-glyph {
  font-size: 0.9rem;
}
.section-text {
  font-size: 0.85rem;
  line-height: 1.9;
  color: rgba(200, 180, 255, 0.75);
  margin: 0;
}

/* ── 技术标签 ── */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tech-tag {
  font-size: 0.6rem;
  font-family: monospace;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border: 1px solid rgba(120, 80, 255, 0.2);
  color: rgba(200, 180, 255, 0.6);
  background: rgba(120, 80, 255, 0.05);
  border-radius: 2px;
  transition: all 0.3s;
}
.tech-tag:hover {
  border-color: rgba(120, 80, 255, 0.5);
  color: rgba(200, 180, 255, 0.9);
  background: rgba(120, 80, 255, 0.1);
}

/* ── 流程步骤 ── */
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.flow-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  position: relative;
}
.flow-num {
  font-size: 0.6rem;
  font-family: monospace;
  color: rgba(120, 80, 255, 0.5);
  width: 2rem;
  flex-shrink: 0;
  text-align: right;
}
.flow-line {
  position: absolute;
  left: 1rem;
  top: 1.5rem;
  bottom: -0.5rem;
  width: 1px;
  background: rgba(120, 80, 255, 0.15);
}
.flow-text {
  font-size: 0.8rem;
  color: rgba(200, 180, 255, 0.7);
  letter-spacing: 0.05em;
}

/* ── 底部 ── */
.about-footer {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6rem;
  font-family: monospace;
  color: rgba(120, 80, 255, 0.35);
}
.footer-link {
  color: rgba(120, 80, 255, 0.5);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.3s;
}
.footer-link:hover {
  color: rgba(200, 180, 255, 0.8);
}
.link-icon {
  font-size: 0.7rem;
}
.footer-sep {
  opacity: 0.4;
}
.footer-version, .footer-copy {
  opacity: 0.6;
}

/* ── 底部系统日志 ── */
.about-syslog {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(5, 5, 16, 0.85);
  backdrop-filter: blur(4px);
  padding: 0 1rem;
}
</style>
