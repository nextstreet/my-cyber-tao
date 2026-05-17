<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { getGuardian } from '@/lib/guardians'
import { MANSIONS } from '@/lib/almanac'
import { buildCaption } from '@/utils/share'
import type { DivinationLog } from '@/types'

const route  = useRoute()
const router = useRouter()

const log = ref<DivinationLog | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isVerifying = ref(false)
const verifyResult = ref<'valid' | 'invalid' | null>(null)
const copied = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  // Try sessionStorage first (same session → no extra fetch)
  const cached = sessionStorage.getItem('cyber-tao-result')
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as DivinationLog
      if (parsed.id === id) { log.value = parsed; isLoading.value = false; return }
    } catch { /* fall through to fetch */ }
  }
  // Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('divination_logs')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) throw new Error(error?.message ?? 'Not found')
    log.value = data as DivinationLog
  } catch (e) {
    loadError.value = String(e)
  } finally {
    isLoading.value = false
  }
})

const guardian = computed(() => log.value ? getGuardian(log.value.guardian_key) : null)
const mansion   = computed(() => log.value ? MANSIONS[log.value.mansion_index] ?? MANSIONS[0] : MANSIONS[0])
const dateStr   = computed(() => log.value ? new Date(log.value.created_at).toLocaleString('zh-CN') : '')

// Re-compute hash client-side to verify integrity
async function verifyHash() {
  if (!log.value) return
  isVerifying.value = true
  const { computeHash } = await import('@/lib/iching')
  const computed_hash = await computeHash(log.value.created_at, log.value.question, log.value.lines)
  verifyResult.value = computed_hash === log.value.verified_hash ? 'valid' : 'invalid'
  isVerifying.value = false
}

async function copyLink() {
  const url = window.location.href
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2200)
}

function copyCaption() {
  if (!log.value) return
  const cap = buildCaption(log.value.fortune_zh.slice(0, 6), log.value.fortune_en, log.value.verified_hash)
  navigator.clipboard.writeText(cap)
}

function goResult() { router.push({ name: 'result', params: { id: log.value?.id } }) }
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="destiny-loading">
    <div class="load-ring" />
    <span>载入天命封印…</span>
  </div>

  <!-- Error -->
  <div v-else-if="loadError" class="destiny-error">
    <p class="err-title">无法找到此天命</p>
    <p class="err-detail">{{ loadError }}</p>
    <button class="err-home" @click="router.push({ name: 'home' })">返回首页</button>
  </div>

  <!-- Main -->
  <div v-else-if="log && guardian" class="destiny-root">
    <div class="destiny-aurora" aria-hidden="true" />

    <div class="destiny-inner">
      <!-- Nav -->
      <div class="destiny-nav">
        <button class="nav-back" @click="goResult">‹ 天命</button>
        <span class="nav-title">封印验证 · SEALED FATE</span>
        <button class="nav-copy" @click="copyLink">
          {{ copied ? '已复制 ✓' : '复制链接' }}
        </button>
      </div>

      <!-- Portrait card (9:16 ratio — TikTok optimised) -->
      <div class="portrait-card" :style="{ borderColor: guardian.color + '55' }">

        <!-- Glowing top seal -->
        <div class="pc-top-seal" :style="{ borderColor: guardian.color + '66', background: 'radial-gradient(circle, ' + guardian.glowColor + ', transparent 70%)' }">
          <div class="pc-seal-char" :style="{ color: guardian.color }">天命</div>
          <div class="pc-seal-sub">SEALED FATE</div>
        </div>

        <!-- Guardian beast (large) -->
        <div class="pc-guardian-wrap">
          <svg width="220" height="220" :viewBox="`0 0 220 220`"
            style="filter: drop-shadow(0 0 20px currentColor)"
            :style="{ color: guardian.color }"
          >
            <!-- Rotating bagua ring -->
            <g style="transform-origin:110px 110px;animation:guardianSpin 50s linear infinite">
              <circle cx="110" cy="110" r="100" fill="none" :stroke="guardian.color" stroke-width="0.4" opacity="0.15"/>
              <text v-for="(tri, i) in ['☰','☱','☲','☳','☴','☵','☶','☷']" :key="i"
                :x="(110 + 100 * Math.cos(i/8*Math.PI*2 - Math.PI/2)).toFixed(1)"
                :y="(110 + 100 * Math.sin(i/8*Math.PI*2 - Math.PI/2) + 4).toFixed(1)"
                text-anchor="middle" font-size="13" :fill="guardian.color" opacity="0.28"
              >{{ tri }}</text>
            </g>
            <!-- Inner aura -->
            <circle cx="110" cy="110" r="72" :fill="guardian.glowColor" :stroke="guardian.color" stroke-width="0.8" opacity="0.55"
              style="animation:guardianAura 3s ease-in-out infinite"/>
            <!-- Beast glyph -->
            <text x="110" y="128" text-anchor="middle" font-size="68" :fill="guardian.color" opacity="0.95"
              style="animation:guardianBreathe 4s ease-in-out infinite;transform-origin:110px 110px">
              {{ guardian.symbol }}
            </text>
            <!-- Guardian name -->
            <text x="110" y="165" text-anchor="middle" font-size="14" :fill="guardian.color" opacity="0.75" letter-spacing="6">{{ guardian.name }}</text>
            <text x="110" y="180" text-anchor="middle" font-size="9"  :fill="guardian.color" opacity="0.42" letter-spacing="2">{{ guardian.en }}</text>
          </svg>
        </div>

        <!-- Hexagram lines display -->
        <div class="pc-hex-lines" aria-label="Hexagram lines">
          <div v-for="(line, i) in [...log.lines].reverse()" :key="i" class="pc-hex-row"
            :style="{ animationDelay: i * 0.1 + 's' }">
            <div v-if="line === 7 || line === 9" class="pc-yang" :class="{ 'pc-changing': line === 9 }" />
            <template v-else>
              <div class="pc-yin-l" :class="{ 'pc-changing': line === 6 }" />
              <div class="pc-gap" />
              <div class="pc-yin-r" :class="{ 'pc-changing': line === 6 }" />
            </template>
          </div>
        </div>

        <!-- Fortune text -->
        <div class="pc-fortune">
          <div class="pc-fortune-zh">{{ log.fortune_zh }}</div>
          <div class="pc-fortune-en">{{ log.fortune_en }}</div>
        </div>

        <!-- Meta row -->
        <div class="pc-meta">
          <span>{{ mansion.symbol }}宿</span>
          <span class="pc-dot">·</span>
          <span>{{ log.ganzhi }}</span>
          <span class="pc-dot">·</span>
          <span>{{ guardian.dir }}方</span>
        </div>

        <!-- Hash seal -->
        <div class="pc-hash-seal">
          <div class="pc-hash-icon">✦</div>
          <div class="pc-hash-wrap">
            <div class="pc-hash-label">CRYPTOGRAPHICALLY SEALED · 密码封印</div>
            <div class="pc-hash-val">{{ log.verified_hash }}</div>
          </div>
          <button
            class="pc-verify-btn"
            :class="{ 'v-valid': verifyResult === 'valid', 'v-invalid': verifyResult === 'invalid' }"
            :disabled="isVerifying"
            @click="verifyHash"
          >
            <span v-if="isVerifying">…</span>
            <span v-else-if="verifyResult === 'valid'">✓ 真</span>
            <span v-else-if="verifyResult === 'invalid'">✗ 伪</span>
            <span v-else>验证</span>
          </button>
        </div>

        <!-- Site watermark -->
        <div class="pc-watermark">cyber-tao.app</div>
      </div>

      <!-- Question (outside card so it's not in screenshot) -->
      <div class="dest-question">
        <div class="dq-label">所问之事</div>
        <div class="dq-text">{{ log.question }}</div>
      </div>

      <!-- Verify result message -->
      <Transition name="verify-fade">
        <div v-if="verifyResult" :class="['verify-msg', { valid: verifyResult === 'valid', invalid: verifyResult === 'invalid' }]">
          <span v-if="verifyResult === 'valid'">✦ 封印验证通过 — 此天命真实，未被篡改</span>
          <span v-else>⚠ 封印不匹配 — 此天命已被修改</span>
        </div>
      </Transition>

      <!-- Share actions -->
      <div class="dest-actions">
        <button class="da-btn primary" @click="copyCaption">📋 复制TikTok文案</button>
        <button class="da-btn secondary" @click="router.push({ name: 'home' })">再次占卜</button>
      </div>

      <div class="dest-date">{{ dateStr }}</div>
    </div>
  </div>
</template>

<style scoped>
/* ── Loading / Error ─────────────────────────────────────────────────────────── */
.destiny-loading,.destiny-error { width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#07041a;color:rgba(201,168,76,0.6);font-size:13px;letter-spacing:.06em;text-align:center;padding:20px; }
.load-ring { width:36px;height:36px;border:1.5px solid rgba(201,168,76,0.2);border-top-color:#c9a84c;border-radius:50%;animation:spin 1s linear infinite; }
.err-title { font-size:16px;color:#e8d4a0;font-weight:500; }
.err-detail { font-size:12px;color:rgba(201,168,76,0.4);word-break:break-all; }
.err-home { margin-top:10px;padding:8px 24px;background:rgba(201,168,76,0.1);border:0.5px solid rgba(201,168,76,0.3);border-radius:16px;color:#c9a84c;font-size:13px;cursor:pointer; }

/* ── Root ────────────────────────────────────────────────────────────────────── */
.destiny-root { position:relative;width:100%;height:100%;overflow:hidden;background:#07041a; }
.destiny-aurora { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 75% 60% at 50% 40%,rgba(35,12,85,0.96),rgba(5,2,16,0.99)); }
.destiny-inner { position:relative;z-index:1;height:100%;overflow-y:auto;padding:0 14px 48px;display:flex;flex-direction:column;align-items:center;gap:14px; }

/* ── Nav ─────────────────────────────────────────────────────────────────────── */
.destiny-nav { width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 0 12px;border-bottom:0.5px solid rgba(201,168,76,0.12); }
.nav-back,.nav-copy { background:transparent;border:none;color:rgba(201,168,76,0.5);font-size:13px;cursor:pointer;padding:4px 8px;letter-spacing:.04em; }
.nav-back:hover,.nav-copy:hover { color:#c9a84c; }
.nav-title { font-size:12px;color:rgba(201,168,76,0.55);letter-spacing:.1em; }

/* ── Portrait card ───────────────────────────────────────────────────────────── */
.portrait-card {
  width:100%;max-width:360px;
  /* 9:16 via min-height so content can overflow on small phones */
  min-height:calc(100vw * 16/9);
  background:linear-gradient(175deg,rgba(12,6,30,0.98),rgba(20,8,48,0.98));
  border:0.5px solid;border-radius:20px;
  overflow:hidden;position:relative;
  display:flex;flex-direction:column;align-items:center;
  padding:22px 16px 16px;gap:10px;
  animation:fadeUp .4s ease-out;
}

.pc-top-seal { width:70px;height:70px;border-radius:50%;border:1px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0; }
.pc-seal-char { font-size:20px;font-weight:600;letter-spacing:3px; }
.pc-seal-sub { font-size:7px;letter-spacing:.1em;opacity:.5;margin-top:1px; }

.pc-guardian-wrap { flex-shrink:0; }

.pc-hex-lines { display:flex;flex-direction:column;gap:7px;align-items:center;flex-shrink:0; }
.pc-hex-row { display:flex;align-items:center;height:9px;animation:fadeUp .25s ease-out both; }
.pc-yang,.pc-yin-l,.pc-yin-r { height:6px;border-radius:3px;background:#c9a84c; }
.pc-yang { width:72px; }
.pc-yin-l,.pc-yin-r { width:30px; }
.pc-gap { width:12px; }
.pc-changing { background:#e8a040 !important;box-shadow:0 0 6px rgba(232,160,64,0.7); }

.pc-fortune { text-align:center;padding:0 4px; }
.pc-fortune-zh { font-size:12px;color:rgba(220,210,255,0.88);line-height:1.75;letter-spacing:.04em;margin-bottom:6px; }
.pc-fortune-en { font-size:10px;color:rgba(180,170,220,0.55);line-height:1.6;font-style:italic; }

.pc-meta { font-size:10px;color:rgba(201,168,76,0.45);letter-spacing:.06em;display:flex;gap:6px;align-items:center; }
.pc-dot { opacity:.4; }

.pc-hash-seal { width:100%;display:flex;align-items:center;gap:8px;background:rgba(42,140,90,0.07);border:0.5px solid rgba(42,140,90,0.2);border-radius:8px;padding:7px 10px; }
.pc-hash-icon { font-size:12px;color:#6ed48a;flex-shrink:0; }
.pc-hash-wrap { flex:1;min-width:0; }
.pc-hash-label { font-size:8px;color:rgba(110,212,138,0.6);letter-spacing:.06em; }
.pc-hash-val { font-size:9px;color:rgba(110,212,138,0.45);font-family:monospace;word-break:break-all; }
.pc-verify-btn { padding:4px 9px;background:rgba(42,140,90,0.15);border:0.5px solid rgba(42,140,90,0.35);border-radius:8px;color:#6ed48a;font-size:11px;cursor:pointer;flex-shrink:0;transition:all .18s; }
.pc-verify-btn.v-valid { background:rgba(42,140,90,0.3);border-color:#6ed48a;font-weight:600; }
.pc-verify-btn.v-invalid { background:rgba(139,26,26,0.3);border-color:#e06060;color:#e06060; }
.pc-verify-btn:disabled { opacity:.5; }

.pc-watermark { font-size:9px;color:rgba(201,168,76,0.2);letter-spacing:.08em;margin-top:auto;padding-top:4px; }

/* ── Below card ──────────────────────────────────────────────────────────────── */
.dest-question { width:100%;max-width:360px;background:rgba(201,168,76,0.04);border:0.5px solid rgba(201,168,76,0.14);border-radius:10px;padding:10px 14px; }
.dq-label { font-size:9px;color:rgba(201,168,76,0.4);letter-spacing:.08em;margin-bottom:4px; }
.dq-text { font-size:13px;color:rgba(220,210,255,0.75);line-height:1.65; }

.verify-msg { width:100%;max-width:360px;padding:10px 14px;border-radius:8px;font-size:12px;letter-spacing:.04em;text-align:center; }
.verify-msg.valid { background:rgba(42,140,90,0.1);border:0.5px solid rgba(42,140,90,0.3);color:#6ed48a; }
.verify-msg.invalid { background:rgba(139,26,26,0.15);border:0.5px solid rgba(139,26,26,0.4);color:#e06060; }
.verify-fade-enter-active { animation:fadeUp .25s ease-out; }
.verify-fade-leave-active { transition:opacity .18s; }
.verify-fade-leave-to { opacity:0; }

.dest-actions { width:100%;max-width:360px;display:flex;flex-direction:column;gap:8px; }
.da-btn { width:100%;padding:12px;border-radius:20px;font-size:13px;letter-spacing:.08em;font-weight:500;cursor:pointer;transition:all .18s; }
.da-btn.primary { background:linear-gradient(135deg,rgba(0,100,40,0.35),rgba(0,60,30,0.35));border:0.5px solid rgba(42,140,90,0.4);color:#6ed48a; }
.da-btn.secondary { background:rgba(201,168,76,0.06);border:0.5px solid rgba(201,168,76,0.2);color:rgba(201,168,76,0.65); }

.dest-date { font-size:10px;color:rgba(201,168,76,0.25);letter-spacing:.06em; }

@keyframes spin { to { transform:rotate(360deg); } }
</style>
