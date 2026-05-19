import { ref, computed } from 'vue'
import type { GuardianKey } from '../types'
import type { LineValue } from './tianji'

export type RitualStage = 'idle' | 'summon' | 'cast' | 'reveal' | 'sealed'

export interface RitualState {
  stage: RitualStage
  question: string
  guardianKey: GuardianKey
  lines: LineValue[]
  hexagramIndex: number
  mansionIndex: number
  ganzhiDay: string
  fortuneText: string
  fortuneEn: string
  verifiedHash: string
  dbId: string
  dbCreatedAt: string
}

export function useRitual() {
  const stage = ref<RitualStage>('idle')
  const question = ref('')
  const guardianKey = ref<GuardianKey>('azure')
  const lines = ref<LineValue[]>([])
  const hexagramIndex = ref(0)
  const mansionIndex = ref(0)
  const ganzhiDay = ref('')
  const fortuneText = ref('')
  const fortuneEn = ref('')
  const verifiedHash = ref('')
  const dbId = ref('')
  const dbCreatedAt = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isComplete = computed(() => lines.value.length === 6)
  const canBegin = computed(() => question.value.trim().length >= 2 && stage.value === 'summon')
  const canCast = computed(() => stage.value === 'cast' && !isComplete.value)

  function beginSummon() {
    stage.value = 'summon'
    lines.value = []
    error.value = null
  }

  function beginCast() {
    if (question.value.trim().length < 2) return
    stage.value = 'cast'
  }

  function addLine(v: LineValue) {
    if (stage.value !== 'cast' || isComplete.value) return
    lines.value.push(v)
  }

  function setReveal(data: {
    hexagramIndex: number
    mansionIndex: number
    ganzhiDay: string
    fortuneText: string
    fortuneEn: string
    verifiedHash: string
    dbId: string
    dbCreatedAt: string
  }) {
    hexagramIndex.value = data.hexagramIndex
    mansionIndex.value = data.mansionIndex
    ganzhiDay.value = data.ganzhiDay
    fortuneText.value = data.fortuneText
    fortuneEn.value = data.fortuneEn
    verifiedHash.value = data.verifiedHash
    dbId.value = data.dbId
    dbCreatedAt.value = data.dbCreatedAt
    stage.value = 'reveal'
  }

  function sealDestiny() {
    stage.value = 'sealed'
  }

  function reset() {
    stage.value = 'idle'
    question.value = ''
    lines.value = []
    hexagramIndex.value = 0
    fortuneText.value = ''
    fortuneEn.value = ''
    verifiedHash.value = ''
    dbId.value = ''
    dbCreatedAt.value = ''
    error.value = null
  }

  return {
    stage, question, guardianKey, lines, hexagramIndex,
    mansionIndex, ganzhiDay, fortuneText, fortuneEn,
    verifiedHash, dbId, dbCreatedAt,
    isLoading, error,
    isComplete, canBegin, canCast,
    beginSummon, beginCast, addLine, setReveal, sealDestiny, reset,
  }
}
