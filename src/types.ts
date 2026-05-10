// ─── Guardians ────────────────────────────────────────────────────────────────
export type GuardianKey = 'azure' | 'vermilion' | 'white' | 'black'

export interface Guardian {
  key: GuardianKey
  name: string        // 青龙
  en: string          // Azure Dragon
  dir: string         // 东
  color: string       // CSS hex
  glowColor: string   // rgba for aura
  symbol: string      // single CJK char used in SVG
  element: string     // 木火土金水
  elementEn: string
}

// ─── I Ching ──────────────────────────────────────────────────────────────────
export type LineValue = 6 | 7 | 8 | 9  // old-yin | yang | yin | old-yang

export interface Hexagram {
  index: number       // 1–64
  symbol: string      // unicode ☰ etc (upper+lower combined)
  nameZh: string
  nameEn: string
  judgment: string    // 卦辞 (Chinese)
  judgmentEn: string
  image: string       // 象辞 short
}

// ─── Almanac / Tian Xiang ─────────────────────────────────────────────────────
export interface TianXiang {
  date: Date
  mansion: Mansion        // 二十八宿 today
  ganzhi: string          // 甲子年 丙午日
  zodiacZh: string        // 龙
  zodiacEn: string        // Dragon
  dailyElements: string[] // 木 火 土 …
  auspicious: string[]
  inauspicious: string[]
}

export interface Mansion {
  index: number   // 0–27
  symbol: string  // 角
  nameEn: string  // Horn
  element: string // 木
  region: 'east' | 'south' | 'west' | 'north'
}

// ─── Ritual state machine ─────────────────────────────────────────────────────
export type RitualStage = 'almanac' | 'cast' | 'sealed'

export interface RitualState {
  stage: RitualStage
  selectedGuardian: GuardianKey | null
  question: string
  lines: LineValue[]      // 0–6 values built up during casting
  hexagram: Hexagram | null
  sealHash: string | null
  dbRowId: string | null
  createdAt: string | null
}

// ─── Supabase row ─────────────────────────────────────────────────────────────
export interface DivinationLog {
  id: string
  created_at: string
  question: string
  guardian_key: GuardianKey
  hexagram_index: number
  lines: LineValue[]
  verified_hash: string
  fortune_zh: string
  fortune_en: string
  mansion_index: number
  ganzhi: string
}
