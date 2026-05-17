<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MansionRing from '@/components/MansionRing.vue'
import TianjiPanel from '@/components/TianjiPanel.vue'
import GuardianDisplay from '@/components/GuardianDisplay.vue'
import { computeAlmanacDay, type AlmanacDay } from '@/lib/almanac'
import { GUARDIAN_LIST, getGuardian } from '@/lib/guardians'
import type { GuardianKey } from '@/types'

const router = useRouter()
const almanac = ref<AlmanacDay | null>(null)
const selectedGuardian = ref<GuardianKey>('azure')
const question = ref('')
const questionFocused = ref(false)

function persistAndNavigate() {
  if (!canBegin.value) return
  sessionStorage.setItem('cyber-tao-ritual', JSON.stringify({
    guardianKey: selectedGuardian.value,
    question: question.value.trim(),
    mansionIndex: almanac.value?.mansion.index ?? 0,
    ganzhiDay: almanac.value
      ? almanac.value.dayGanzhi.stem + almanac.value.dayGanzhi.branch + '日'
      : '',
  }))
  router.push({ name: 'cast' })
}

const canBegin = computed(() => question.value.trim().length >= 2)
const guardian = computed(() => getGuardian(selectedGuardian.value))
const dateLabel = computed(() => {
  if (!almanac.value) return ''
  return almanac.value.date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
})

onMounted(() => { almanac.value = computeAlmanacDay(new Date()) })
</script>

<template>
  <div class="home-root">
    <div class="starfield" aria-hidden="true">
      <div v-for="i in 55" :key="i" class="star"
        :style="{
          left: ((Math.sin(i * 137.508) * 0.5 + 0.5) * 100) + '%',
          top:  ((Math.cos(i * 97.311)  * 0.5 + 0.5) * 100) + '%',
          animationDelay: (i * 0.19) + 's',
          animationDuration: (2 + (i % 5) * 0.7) + 's',
          width: (1 + (i % 3) * 0.5) + 'px',
          height: (1 + (i % 3) * 0.5) + 'px',
        }"
      />
    </div>

    <div class="home-scroll">
      <!-- Header -->
      <header class="home-header">
        <div class="header-glyph">玄機天道</div>
        <div class="header-en">CYBER TAO · DIVINATION</div>
        <div class="header-date">{{ dateLabel }}</div>
      </header>

      <!-- Mansion ring -->
      <section class="section" aria-label="Twenty-Eight Lunar Mansions">
        <div class="sec-label">二十八宿 · TWENTY-EIGHT MANSIONS</div>
        <div class="mansion-wrap">
          <MansionRing v-if="almanac" :today-index="almanac.mansion.index" :size="220" />
          <div v-if="almanac" class="mansion-caption">
            <span class="m-sym">{{ almanac.mansion.symbol }}宿</span>
            <span class="m-en">{{ almanac.mansion.nameEn }}</span>
            <span class="m-el">{{ almanac.mansion.element }}</span>
          </div>
        </div>
      </section>

      <!-- Almanac data -->
      <section class="section" aria-label="Daily almanac data">
        <div class="sec-label">今日黄历 · DAILY ALMANAC</div>
        <TianjiPanel v-if="almanac" :almanac="almanac" />
      </section>

      <!-- Guardian selection -->
      <section class="section" aria-label="Choose your guardian beast">
        <div class="sec-label">选择守护神兽 · YOUR GUARDIAN</div>
        <div class="guardian-grid">
          <button v-for="g in GUARDIAN_LIST" :key="g.key"
            :class="['g-btn', { sel: selectedGuardian === g.key }]"
            :style="selectedGuardian === g.key ? { borderColor: g.color, boxShadow: '0 0 16px ' + g.glowColor } : {}"
            @click="selectedGuardian = g.key as GuardianKey"
            :aria-pressed="selectedGuardian === g.key"
          >
            <span class="g-sym" :style="{ color: g.color }">{{ g.symbol }}</span>
            <span class="g-name">{{ g.name }}</span>
            <span class="g-en">{{ g.en }}</span>
            <span class="g-dir" :style="{ color: g.color }">{{ g.dir }}</span>
          </button>
        </div>

        <Transition name="gp-fade">
          <div v-if="selectedGuardian" class="guardian-preview">
            <GuardianDisplay :guardian-key="selectedGuardian" :size="140" />
            <div class="gp-text">
              <div class="gp-name" :style="{ color: guardian.color }">{{ guardian.name }} · {{ guardian.en }}</div>
              <div class="gp-el">{{ guardian.element }} {{ guardian.elementEn }} · {{ guardian.dir }}方</div>
            </div>
          </div>
        </Transition>
      </section>

      <!-- Question -->
      <section class="section" aria-label="Your divination question">
        <div class="sec-label">心中所问 · YOUR QUESTION</div>
        <div :class="['q-wrap', { focused: questionFocused }]">
          <textarea v-model="question" class="q-input"
            placeholder="将心中疑惑化为文字，天机已在等待…"
            maxlength="200" rows="3"
            @focus="questionFocused = true"
            @blur="questionFocused = false"
          />
          <div class="q-count">{{ question.length }} / 200</div>
        </div>
      </section>

      <!-- Begin -->
      <div class="begin-wrap">
        <button class="begin-btn" :class="{ ready: canBegin }"
          :disabled="!canBegin" @click="persistAndNavigate">
          <span>开启占卜</span>
          <span class="sep">·</span>
          <span>BEGIN DIVINATION</span>
        </button>
        <p class="begin-sub">古法铜钱 · 天干地支 · 密码封印</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #07041a; }
.home-scroll { position: relative; z-index: 1; height: 100%; overflow-y: auto; padding-bottom: 48px; -webkit-overflow-scrolling: touch; }
.starfield { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.star { position: absolute; border-radius: 50%; background: rgba(201,168,76,0.65); animation: starTwinkle 2s ease-in-out infinite alternate; }
@keyframes starTwinkle { from { opacity:.12; transform:scale(1); } to { opacity:.7; transform:scale(1.5); } }

.home-header { text-align: center; padding: 22px 16px 14px; border-bottom: 0.5px solid rgba(201,168,76,0.12); }
.header-glyph { font-size: 24px; font-weight: 600; color: #c9a84c; letter-spacing: .14em; text-shadow: 0 0 24px rgba(201,168,76,0.5); }
.header-en { font-size: 10px; color: rgba(201,168,76,0.4); letter-spacing: .14em; margin-top: 4px; }
.header-date { font-size: 11px; color: rgba(201,168,76,0.55); margin-top: 6px; letter-spacing: .05em; }

.section { padding: 14px 14px 8px; }
.sec-label { font-size: 10px; font-weight: 500; color: rgba(201,168,76,0.42); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.sec-label::after { content: ''; flex: 1; height: 0.5px; background: rgba(201,168,76,0.13); }

.mansion-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.mansion-caption { display: flex; gap: 10px; align-items: center; }
.m-sym { font-size: 18px; color: #c9a84c; font-weight: 500; }
.m-en  { font-size: 12px; color: rgba(201,168,76,0.6); }
.m-el  { font-size: 11px; color: rgba(201,168,76,0.4); }

.guardian-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 7px; margin-bottom: 12px; }
.g-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 9px 4px 7px; background: rgba(201,168,76,0.04); border: 0.5px solid rgba(201,168,76,0.16); border-radius: 10px; cursor: pointer; transition: border-color .2s, box-shadow .2s, background .2s; }
.g-btn:hover, .g-btn.sel { background: rgba(201,168,76,0.08); }
.g-sym  { font-size: 22px; }
.g-name { font-size: 12px; color: #e8d4a0; font-weight: 500; }
.g-en   { font-size: 8px; color: rgba(201,168,76,0.38); }
.g-dir  { font-size: 10px; }

.guardian-preview { display: flex; align-items: center; gap: 14px; background: rgba(13,8,32,0.75); border: 0.5px solid rgba(201,168,76,0.14); border-radius: 12px; padding: 12px; animation: fadeUp .3s ease-out; }
.gp-name { font-size: 14px; font-weight: 500; margin-bottom: 3px; letter-spacing: .06em; }
.gp-el   { font-size: 11px; color: rgba(201,168,76,0.5); }

.q-wrap { border: 0.5px solid rgba(201,168,76,0.22); border-radius: 10px; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
.q-wrap.focused { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 14px rgba(201,168,76,0.1); }
.q-input { width: 100%; padding: 12px 13px 6px; background: rgba(201,168,76,0.04); border: none; outline: none; resize: none; color: #e8d4a0; font-size: 14px; line-height: 1.7; font-family: inherit; }
.q-input::placeholder { color: rgba(201,168,76,0.2); }
.q-count { text-align: right; padding: 2px 10px 6px; font-size: 10px; color: rgba(201,168,76,0.28); background: rgba(201,168,76,0.03); }

.begin-wrap { padding: 10px 14px 0; }
.begin-btn { width: 100%; padding: 14px; background: linear-gradient(135deg,rgba(50,10,100,0.6),rgba(100,18,18,0.6)); border: 0.5px solid rgba(201,168,76,0.22); border-radius: 24px; cursor: pointer; color: rgba(201,168,76,0.4); font-size: 14px; letter-spacing: .1em; font-weight: 500; transition: all .25s; display: flex; align-items: center; justify-content: center; gap: 9px; }
.begin-btn.ready { border-color: rgba(201,168,76,0.55); color: #c9a84c; box-shadow: 0 0 20px rgba(201,168,76,0.13); animation: pulseRing 2.4s ease-in-out infinite; }
.begin-btn:disabled { cursor: default; }
.begin-btn.ready:active { transform: scale(.98); }
.sep { opacity: .4; }
.begin-sub { text-align: center; margin-top: 7px; font-size: 10px; color: rgba(201,168,76,0.28); letter-spacing: .06em; }

.gp-fade-enter-active { animation: fadeUp .28s ease-out; }
.gp-fade-leave-active { transition: opacity .18s; }
.gp-fade-leave-to { opacity: 0; }
</style>
