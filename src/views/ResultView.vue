<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TalismanCard from '@/components/TalismanCard.vue'
import GuardianDisplay from '@/components/GuardianDisplay.vue'
import { MANSIONS } from '@/lib/almanac'
import { getGuardian } from '@/lib/guardians'
import { linesToHexagram } from '@/lib/iching'
import { shareOrDownload, buildCaption } from '@/utils/share'
import type { DivinationLog, Hexagram } from '@/types'

const router = useRouter()
const route  = useRoute()

const log       = ref<DivinationLog | null>(null)
const hexagram  = ref<Hexagram | null>(null)
const cardRef   = ref<HTMLElement | null>(null)
const isSharing = ref(false)
const shareStatus = ref<'idle' | 'shared' | 'downloaded' | 'failed'>('idle')
const showChanging = ref(false)

onMounted(() => {
  const raw = sessionStorage.getItem('cyber-tao-result')
  if (!raw) { router.replace({ name: 'home' }); return }
  try {
    const parsed = JSON.parse(raw) as DivinationLog
    log.value = parsed
    // Reconstruct full hexagram from stored lines using the same engine
    hexagram.value = linesToHexagram(parsed.lines)
  } catch {
    router.replace({ name: 'home' })
  }
})

const guardian = computed(() => log.value ? getGuardian(log.value.guardian_key) : null)
const mansion  = computed(() => log.value ? (MANSIONS[log.value.mansion_index] ?? MANSIONS[0]!) : MANSIONS[0]!)

const hasChanging = computed(() =>
  log.value?.lines.some(v => v === 6 || v === 9) ?? false)

async function share() {
  if (!cardRef.value || !log.value || !hexagram.value) return
  isSharing.value = true
  const caption = buildCaption(
    hexagram.value.nameZh,
    hexagram.value.judgmentEn,
    log.value.verified_hash,
  )
  const status = await shareOrDownload(cardRef.value, '天命 · My Fate', caption, 'my-fate.png')
  shareStatus.value = status
  isSharing.value = false
}

function sealDestiny() {
  if (!log.value) return
  router.push({ name: 'destiny', params: { id: log.value.id } })
}

function startOver() {
  sessionStorage.removeItem('cyber-tao-ritual')
  sessionStorage.removeItem('cyber-tao-result')
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="result-root" v-if="log && hexagram && guardian">
    <div class="result-aurora" aria-hidden="true" />

    <div class="result-inner">
      <!-- Top nav bar (step 3 of 3) -->
      <div class="result-topbar">
        <button class="back-btn" @click="startOver">再问 · New</button>
        <span class="result-title">天命已定 · DESTINY REVEALED</span>
        <div class="result-step">3 / 3</div>
      </div>

      <!-- Guardian + meta header -->
      <div class="result-header">
        <GuardianDisplay :guardian-key="log.guardian_key" :size="90" />
        <div class="header-text">
          <div class="header-guardian" :style="{ color: guardian.color }">
            {{ guardian.name }} · {{ guardian.en }}
          </div>
          <div class="header-meta">
            {{ mansion.symbol }}宿 · {{ log.ganzhi }}
          </div>
          <div class="header-date">{{ new Date(log.created_at).toLocaleString('zh-CN') }}</div>
        </div>
      </div>

      <!-- TalismanCard (screenshot target) -->
      <div ref="cardRef" class="card-capture-area">
        <TalismanCard
          :hexagram="hexagram"
          :guardian-key="log.guardian_key"
          :verified-hash="log.verified_hash"
          :ganzhi-day="log.ganzhi"
          :mansion-symbol="mansion.symbol"
          @share="share"
        />
      </div>

      <!-- Changing lines note -->
      <div v-if="hasChanging" class="changing-note">
        <button class="toggle-changing" @click="showChanging = !showChanging">
          {{ showChanging ? '▾' : '▸' }} 动爻变卦 · Changing Lines
        </button>
        <div v-if="showChanging" class="changing-detail">
          此卦含动爻，预示变化将至。当前卦象为起点，变卦指引未来走向。
          老阴（6）变阳，老阳（9）变阴，形成第二卦象。
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-row">
        <button class="action-btn primary" :disabled="isSharing" @click="share">
          <span v-if="isSharing">分享中…</span>
          <span v-else-if="shareStatus === 'shared'">已分享 ✓</span>
          <span v-else-if="shareStatus === 'downloaded'">已保存 ✓</span>
          <span v-else>📤 保存图片 · Save Image</span>
        </button>
        <button class="action-btn secondary" @click="sealDestiny">
          🔏 查看封印 · View Seal
        </button>
      </div>

      <p class="tiktok-hint">保存图片后可直接发布至 TikTok · Instagram</p>
    </div>
  </div>

  <!-- Loading / fallback -->
  <div v-else class="result-loading">
    <div class="load-spinner" />
    <span>天机显现中…</span>
  </div>
</template>

<style scoped>
.result-root { position:relative;width:100%;height:100%;overflow:hidden;background:#07041a; }
.result-aurora { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 65% at 50% 50%,rgba(40,15,95,0.95),rgba(7,4,26,0.99)),radial-gradient(ellipse 35% 25% at 20% 80%,rgba(100,15,15,0.3),transparent 60%); }
.result-inner { position:relative;z-index:1;height:100%;overflow-y:auto;padding:0 14px 48px;display:flex;flex-direction:column;gap:0; -webkit-overflow-scrolling:touch; }
.result-topbar { width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 0 12px;border-bottom:0.5px solid rgba(201,168,76,0.12);margin-bottom:14px;flex-shrink:0; }
.back-btn { background:transparent;border:none;color:rgba(201,168,76,0.5);font-size:13px;cursor:pointer;padding:4px 8px;letter-spacing:.04em; }
.back-btn:hover { color:#c9a84c; }
.result-title { font-size:12px;color:rgba(201,168,76,0.6);letter-spacing:.1em; }
.result-step { font-size:11px;color:rgba(201,168,76,0.3); }
.result-header { display:flex;align-items:center;gap:14px;margin-bottom:14px;padding:12px;background:rgba(13,8,32,0.7);border:0.5px solid rgba(201,168,76,0.12);border-radius:12px; }
.header-guardian { font-size:15px;font-weight:500;letter-spacing:.06em;margin-bottom:3px; }
.header-meta { font-size:11px;color:rgba(201,168,76,0.5);margin-bottom:2px;letter-spacing:.05em; }
.header-date { font-size:10px;color:rgba(201,168,76,0.3); }
.card-capture-area { margin-bottom:12px; }
.changing-note { background:rgba(201,168,76,0.05);border:0.5px solid rgba(201,168,76,0.15);border-radius:8px;padding:10px 12px;margin-bottom:12px; }
.toggle-changing { background:transparent;border:none;color:rgba(201,168,76,0.6);font-size:12px;cursor:pointer;letter-spacing:.04em;padding:0; }
.changing-detail { margin-top:7px;font-size:12px;color:rgba(220,210,255,0.65);line-height:1.7; }
.action-row { display:flex;flex-direction:column;gap:8px;margin-bottom:8px; }
.action-btn { width:100%;padding:13px;border-radius:22px;font-size:14px;letter-spacing:.08em;font-weight:500;cursor:pointer;transition:all .18s; }
.action-btn.primary { background:linear-gradient(135deg,rgba(55,15,110,0.65),rgba(110,20,20,0.65));border:0.5px solid rgba(201,168,76,0.45);color:#c9a84c; }
.action-btn.primary:hover { box-shadow:0 0 18px rgba(201,168,76,0.2); }
.action-btn.primary:disabled { opacity:.5;cursor:default; }
.action-btn.secondary { background:rgba(42,140,90,0.12);border:0.5px solid rgba(42,140,90,0.3);color:#6ed48a; }
.action-btn.secondary:hover { background:rgba(42,140,90,0.18); }
.tiktok-hint { text-align:center;font-size:10px;color:rgba(201,168,76,0.25);letter-spacing:.06em; }
.result-loading { width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#07041a;color:rgba(201,168,76,0.6);font-size:13px;letter-spacing:.06em; }
.load-spinner { width:36px;height:36px;border:1.5px solid rgba(201,168,76,0.2);border-top-color:#c9a84c;border-radius:50%;animation:spin 1s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
