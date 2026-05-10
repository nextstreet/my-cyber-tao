<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const steps = [
  { title: '天象 · Celestial Almanac', desc: '查看当日二十八宿、干支黄历，选择守护神兽，写下心中所问。', color: '#c9a84c' },
  { title: '投币 · Cast the Coins',    desc: '以古法铜钱六次起卦，每一爻皆顺应天意，不可重复。',       color: '#7ab0ff' },
  { title: '天命 · Sealed Fate',       desc: '卦象生成，天机显现，密码封印永久存档，可分享验证。',     color: '#6ed48a' },
]

const beasts = [
  { key: 'azure',     sym: '龙', name: '青龙', en: 'Azure Dragon',   color: '#2a8c5a' },
  { key: 'vermilion', sym: '雀', name: '朱雀', en: 'Vermilion Bird', color: '#cc4400' },
  { key: 'white',     sym: '虎', name: '白虎', en: 'White Tiger',    color: '#8898b8' },
  { key: 'black',     sym: '龟', name: '玄武', en: 'Black Tortoise', color: '#3a5aaa' },
]
</script>

<template>
  <div class="about-root">
    <div class="about-aurora" aria-hidden="true" />
    <div class="about-inner">
      <div class="about-nav">
        <button class="nav-back" @click="router.push({ name: 'home' })">‹ 返回</button>
        <span class="nav-title">关于 · ABOUT</span>
        <div style="width:50px" />
      </div>

      <div class="about-logo">
        <div class="logo-glyph">道</div>
        <div class="logo-title">玄機天道</div>
        <div class="logo-sub">CYBER TAO · DIVINATION</div>
      </div>

      <div class="about-card">
        <div class="ac-title">关于本应用</div>
        <p class="ac-body">
          玄機天道将三千年的《周易》智慧与现代密码学相结合，
          为每一次占卜生成唯一的加密封印，确保您的天命真实可验证，
          无法伪造。
        </p>
      </div>

      <div class="about-card">
        <div class="ac-title">三步占卜流程</div>
        <div v-for="(s, i) in steps" :key="i" class="step-row">
          <div class="step-num" :style="{ color: s.color }">{{ i + 1 }}</div>
          <div>
            <div class="step-title" :style="{ color: s.color }">{{ s.title }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>

      <div class="about-card">
        <div class="ac-title">密码封印原理</div>
        <p class="ac-body">
          每次占卜完成后，系统将您的问题、卦象、时间戳通过
          SHA-256 算法生成唯一哈希值，永久写入数据库。
          任何人均可通过验证页面重算哈希，确认天命真实性。
        </p>
        <div class="hash-demo">
          <span class="hd-label">示例封印</span>
          <span class="hd-val">a4f2c8e1#3b9d0f22</span>
        </div>
      </div>

      <div class="about-card">
        <div class="ac-title">四象守护神兽</div>
        <div class="beast-grid">
          <div v-for="b in beasts" :key="b.key" class="beast-item" :style="{ borderColor: b.color + '44' }">
            <span class="b-sym" :style="{ color: b.color }">{{ b.sym }}</span>
            <span class="b-name" :style="{ color: b.color }">{{ b.name }}</span>
            <span class="b-en">{{ b.en }}</span>
          </div>
        </div>
      </div>

      <div class="about-card">
        <div class="ac-title">二十八宿 · Twenty-Eight Mansions</div>
        <p class="ac-body">
          应用每日根据儒略日算法精确计算当日所在星宿，对应四象方位，
          并从传统黄历推算当日宜忌与五行。所有计算完全在客户端进行，无需网络请求。
        </p>
      </div>

      <div class="about-footer">
        <p>古法 · 今用 · 诚信 · 守护</p>
        <p class="footer-sub">Ancient wisdom · Modern trust · cyber-tao.app</p>
        <button class="footer-btn" @click="router.push({ name: 'home' })">开始占卜</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-root { position:relative;width:100%;height:100%;overflow:hidden;background:#07041a; }
.about-aurora { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 60% 50% at 50% 30%,rgba(30,10,70,0.95),rgba(7,4,26,0.99)); }
.about-inner { position:relative;z-index:1;height:100%;overflow-y:auto;padding:0 14px 48px; }
.about-nav { display:flex;align-items:center;justify-content:space-between;padding:14px 0 12px;border-bottom:0.5px solid rgba(201,168,76,0.12);margin-bottom:16px; }
.nav-back { background:transparent;border:none;color:rgba(201,168,76,0.5);font-size:13px;cursor:pointer;padding:4px 8px; }
.nav-back:hover { color:#c9a84c; }
.nav-title { font-size:12px;color:rgba(201,168,76,0.55);letter-spacing:.1em; }
.about-logo { text-align:center;margin-bottom:18px;padding:16px 0; }
.logo-glyph { font-size:54px;color:#c9a84c;text-shadow:0 0 30px rgba(201,168,76,0.5);line-height:1;margin-bottom:8px; }
.logo-title { font-size:20px;font-weight:600;color:#c9a84c;letter-spacing:.14em; }
.logo-sub { font-size:10px;color:rgba(201,168,76,0.4);letter-spacing:.14em;margin-top:4px; }
.about-card { background:rgba(201,168,76,0.04);border:0.5px solid rgba(201,168,76,0.15);border-radius:12px;padding:14px;margin-bottom:12px; }
.ac-title { font-size:13px;font-weight:500;color:#e8d4a0;margin-bottom:10px;letter-spacing:.06em; }
.ac-body { font-size:13px;color:rgba(220,210,255,0.72);line-height:1.75; }
.step-row { display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-top:0.5px solid rgba(201,168,76,0.08); }
.step-row:first-of-type { border-top:none; }
.step-num { font-size:20px;font-weight:700;line-height:1;flex-shrink:0;width:22px; }
.step-title { font-size:13px;font-weight:500;margin-bottom:3px; }
.step-desc { font-size:12px;color:rgba(220,210,255,0.6);line-height:1.65; }
.hash-demo { margin-top:10px;display:flex;align-items:center;gap:8px;background:rgba(42,140,90,0.07);border:0.5px solid rgba(42,140,90,0.2);border-radius:6px;padding:7px 10px; }
.hd-label { font-size:9px;color:rgba(110,212,138,0.6);letter-spacing:.06em; }
.hd-val { font-size:11px;color:rgba(110,212,138,0.5);font-family:monospace; }
.beast-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
.beast-item { display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 6px;background:rgba(13,8,32,0.7);border:0.5px solid;border-radius:10px; }
.b-sym { font-size:24px; }
.b-name { font-size:13px;font-weight:500; }
.b-en { font-size:10px;color:rgba(201,168,76,0.4); }
.about-footer { text-align:center;padding:16px 0 8px;color:rgba(201,168,76,0.5);font-size:13px;letter-spacing:.08em; }
.footer-sub { font-size:10px;color:rgba(201,168,76,0.28);margin-top:4px;letter-spacing:.1em; }
.footer-btn { margin-top:14px;padding:10px 28px;background:linear-gradient(135deg,rgba(50,15,100,0.5),rgba(100,18,18,0.5));border:0.5px solid rgba(201,168,76,0.35);border-radius:20px;color:#c9a84c;font-size:13px;letter-spacing:.08em;cursor:pointer; }
</style>
