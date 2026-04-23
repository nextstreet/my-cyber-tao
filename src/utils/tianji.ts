/**
 * tianji.ts — 天机数据计算引擎（零依赖，纯算法）
 * 干支、五行、二十八星宿、宜忌 全部本地计算
 */

import { MANSIONS } from '../assets/data/mansions'
import { YIJI_DATA } from '../assets/data/yiji'

// ─── 基础常量 ────────────────────────────────────────────────────────────────

const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const

const WUXING_TIANGAN: Record<string, string> = {
  甲:'木', 乙:'木', 丙:'火', 丁:'火', 戊:'土',
  己:'土', 庚:'金', 辛:'金', 壬:'水', 癸:'水',
}
const WUXING_DIZHI: Record<string, string> = {
  子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火',
  午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水',
}

// 月支对照（寅月 = 正月 = index 0）
const MONTH_ZHI_ORDER = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'] as const

// 年干推算：1984年为甲子年，以此为基准
const YEAR_GANZHI_BASE = 1984

// 日干支推算基准：2000-01-01 = 甲午日
const DAY_GANZHI_BASE_DATE = new Date(2000, 0, 1)
const DAY_GANZHI_BASE_GAN  = 0  // 甲
const DAY_GANZHI_BASE_ZHI  = 6  // 午

// 时干：日干 → 子时起干（五鼠遁年起时）
const HOUR_GAN_BASE: Record<number, number> = {
  0: 0, 1: 0,  // 甲/乙日 → 甲子
  2: 2, 3: 2,  // 丙/丁日 → 丙子
  4: 4, 5: 4,  // 戊/己日 → 戊子
  6: 6, 7: 6,  // 庚/辛日 → 庚子
  8: 8, 9: 8,  // 壬/癸日 → 壬子
}

// 五虎遁年起月干：按年干 index(0-9) 对应寅月起始干 index
const MONTH_GAN_BASE = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0] as const

// ─── 干支计算 ────────────────────────────────────────────────────────────────

function getYearGanZhi(year: number) {
  const offset = (year - YEAR_GANZHI_BASE) % 60
  const n      = offset < 0 ? offset + 60 : offset
  const ganIdx = n % 10
  const zhiIdx = n % 12
  return {
    gan: TIANGAN[ganIdx] as string,
    zhi: DIZHI[zhiIdx]   as string,
    ganIdx,
    zhiIdx,
  }
}

function getMonthGanZhi(year: number, month: number /* 1-12 */) {
  const yearGanIdx              = getYearGanZhi(year).ganIdx
  const baseGanIdx: number      = MONTH_GAN_BASE[yearGanIdx] ?? 2
  const ganIdx                  = (baseGanIdx + (month - 1)) % 10
  const zhiIdx                  = month - 1  // 寅=0, 卯=1 ...
  return {
    gan: TIANGAN[ganIdx]         as string,
    zhi: MONTH_ZHI_ORDER[zhiIdx] as string,
    ganIdx,
    zhiIdx,
  }
}

function getDayGanZhi(date: Date) {
  const msPerDay = 86400000
  const base     = DAY_GANZHI_BASE_DATE.getTime()
  const target   = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((target - base) / msPerDay)
  const ganIdx   = ((DAY_GANZHI_BASE_GAN + diffDays) % 10 + 10) % 10
  const zhiIdx   = ((DAY_GANZHI_BASE_ZHI + diffDays) % 12 + 12) % 12
  return {
    gan: TIANGAN[ganIdx] as string,
    zhi: DIZHI[zhiIdx]   as string,
    ganIdx,
    zhiIdx,
  }
}

function getHourGanZhi(hour: number, dayGanIdx: number) {
  const zhiIdx         = Math.floor(hour / 2) % 12
  const baseGanIdx: number = HOUR_GAN_BASE[dayGanIdx % 10] ?? 0
  const ganIdx         = (baseGanIdx + zhiIdx) % 10
  return {
    gan: TIANGAN[ganIdx] as string,
    zhi: DIZHI[zhiIdx]   as string,
    ganIdx,
    zhiIdx,
  }
}

// ─── 农历（简化版，精度 ±1 天，展示用） ─────────────────────────────────────

// 春节距当年 1 月 1 日的天数偏移（覆盖 2020-2040）
const SPRING_FESTIVAL_DAYS: Record<number, number> = {
  2020: 25, 2021: 12, 2022: 32, 2023: 22, 2024: 40,
  2025: 29, 2026: 17, 2027: 36, 2028: 26, 2029: 13,
  2030: 33, 2031: 23, 2032: 11, 2033: 31, 2034: 19,
  2035: 8,  2036: 28, 2037: 15, 2038: 35, 2039: 24,
  2040: 14,
}

const LUNAR_MONTHS_ZH = ['正','二','三','四','五','六','七','八','九','十','冬','腊'] as const
const LUNAR_DAYS_ZH   = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
] as const

function getLunarDayOfYear(date: Date): number {
  const year   = date.getFullYear()
  const sfDays = SPRING_FESTIVAL_DAYS[year]
  if (sfDays === undefined) {
    const start = new Date(year, 0, 1)
    return Math.floor((date.getTime() - start.getTime()) / 86400000)
  }
  const sfDate = new Date(year, 0, sfDays + 1)
  const diff   = Math.floor((date.getTime() - sfDate.getTime()) / 86400000)
  return diff < 0 ? 330 + diff : diff
}

function getLunarMonthDay(date: Date): { monthZh: string; dayZh: string } {
  const doy      = getLunarDayOfYear(date)
  const monthIdx = Math.floor(doy / 29.5) % 12
  const dayIdx   = Math.min(doy % 30, 29)
  return {
    monthZh: LUNAR_MONTHS_ZH[monthIdx] ?? '正',
    dayZh:   LUNAR_DAYS_ZH[dayIdx]     ?? '初一',
  }
}

// ─── 二十八星宿 ───────────────────────────────────────────────────────────────

const MANSION_BASE_DATE = new Date(2000, 0, 7)  // 约为角宿
const MANSION_BASE_IDX  = 0

function getMansionIndex(date: Date): number {
  const msPerDay = 86400000
  const target   = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((target - MANSION_BASE_DATE.getTime()) / msPerDay)
  return ((MANSION_BASE_IDX + diffDays) % 28 + 28) % 28
}

// ─── 五行能量 ─────────────────────────────────────────────────────────────────

function calcWuxingEnergy(pillars: {
  yearGan: string; yearZhi: string
  monthGan: string; monthZhi: string
  dayGan: string; dayZhi: string
  hourGan: string; hourZhi: string
}): Record<string, number> {
  const allChars = [
    pillars.yearGan,  pillars.yearZhi,
    pillars.monthGan, pillars.monthZhi,
    pillars.dayGan,   pillars.dayZhi,
    pillars.hourGan,  pillars.hourZhi,
  ]
  const count: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  allChars.forEach(c => {
    const wx = WUXING_TIANGAN[c] ?? WUXING_DIZHI[c]
    if (wx !== undefined && wx in count) count[wx] = (count[wx] ?? 0) + 1
  })
  return Object.fromEntries(
    Object.entries(count).map(([k, v]) => [k, Math.round((v / 8) * 100)])
  )
}

// ─── 宜忌抽取 ─────────────────────────────────────────────────────────────────

function pickYiJi(date: Date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const seededRandom = (n: number): number => {
    const x = Math.sin(seed + n) * 10000
    return x - Math.floor(x)
  }

  const yiPool = YIJI_DATA.filter(i => i.type === 'yi')
  const jiPool = YIJI_DATA.filter(i => i.type === 'ji')

  function pickN<T>(arr: T[], count: number, offset: number): T[] {
    if (arr.length === 0) return []
    const safeCount = Math.min(count, arr.length)
    const indices   = new Set<number>()
    let   i = 0
    while (indices.size < safeCount && i < arr.length * 10) {
      indices.add(Math.floor(seededRandom(offset + i) * arr.length))
      i++
    }
    const result: T[] = []
    indices.forEach(idx => {
      const item = arr[idx]
      if (item !== undefined) result.push(item)
    })
    return result
  }

  const mapItem = (item: typeof YIJI_DATA[number]) => {
    const variantIdx = Math.floor(
      seededRandom(item.traditional.charCodeAt(0)) * item.variants.length
    )
    return {
      traditional: item.traditional,
      cyber: item.variants[variantIdx] ?? item.variants[0] ?? item.traditional,
    }
  }

  return {
    yi: pickN(yiPool, 3, 0).map(mapItem),
    ji: pickN(jiPool, 2, 100).map(mapItem),
  }
}

// ─── 导出接口与主函数 ─────────────────────────────────────────────────────────

export interface TianjiData {
  pillars: { year: string; month: string; day: string; hour: string }
  wuxingEnergy: Record<string, number>
  dominantElement: string
  mansion: typeof MANSIONS[number]
  yiji: {
    yi: Array<{ traditional: string; cyber: string }>
    ji: Array<{ traditional: string; cyber: string }>
  }
  lunarDate: string
  locationLabel: string
}

export function getTianjiData(
  date: Date,
  coords?: { lat: number; lng: number }
): TianjiData {
  const year  = date.getFullYear()
  const month = date.getMonth() + 1
  const hour  = date.getHours()

  const yGZ = getYearGanZhi(year)
  const mGZ = getMonthGanZhi(year, month)
  const dGZ = getDayGanZhi(date)
  const hGZ = getHourGanZhi(hour, dGZ.ganIdx)

  const pillars = {
    year:  `${yGZ.gan}${yGZ.zhi}`,
    month: `${mGZ.gan}${mGZ.zhi}`,
    day:   `${dGZ.gan}${dGZ.zhi}`,
    hour:  `${hGZ.gan}${hGZ.zhi}`,
  }

  const wuxingEnergy = calcWuxingEnergy({
    yearGan:  yGZ.gan, yearZhi:  yGZ.zhi,
    monthGan: mGZ.gan, monthZhi: mGZ.zhi,
    dayGan:   dGZ.gan, dayZhi:   dGZ.zhi,
    hourGan:  hGZ.gan, hourZhi:  hGZ.zhi,
  })

  const sorted          = Object.entries(wuxingEnergy).sort((a, b) => b[1] - a[1])
  const dominantElement = sorted[0]?.[0] ?? '木'

  const mansionIdx = getMansionIndex(date)
  const mansion    = MANSIONS[mansionIdx] ?? MANSIONS[0]!

  const { monthZh, dayZh } = getLunarMonthDay(date)
  const lunarDate          = `农历${monthZh}月${dayZh}`

  const yiji = pickYiJi(date)

  const locationLabel = coords
    ? `${Math.abs(coords.lat).toFixed(2)}°${coords.lat >= 0 ? 'N' : 'S'} · ${Math.abs(coords.lng).toFixed(2)}°${coords.lng >= 0 ? 'E' : 'W'}`
    : '位置未知 · 仅使用时间坐标'

  return { pillars, wuxingEnergy, dominantElement, mansion, yiji, lunarDate, locationLabel }
}
