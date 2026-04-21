/**
 * tianji.ts — 天机数据计算引擎（零依赖，纯算法）
 * 干支、五行、二十八星宿、宜忌 全部本地计算
 */

import { MANSIONS } from '../assets/data/mansions'
import { YIJI_DATA } from '../assets/data/yiji'

// ─── 基础常量 ────────────────────────────────────────────────────────────────

const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const WUXING_TIANGAN: Record<string, string> = {
  甲:'木', 乙:'木', 丙:'火', 丁:'火', 戊:'土',
  己:'土', 庚:'金', 辛:'金', 壬:'水', 癸:'水',
}
const WUXING_DIZHI: Record<string, string> = {
  子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火',
  午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水',
}

// 月支对照（寅月 = 正月 = index 0）
const MONTH_ZHI_ORDER = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑']

// 年干推算：1984年为甲子年，以此为基准
const YEAR_GANZHI_BASE = 1984   // 甲子

// 日干支推算基准：2000-01-01 为甲午日（干支序号 = 0 mod 60）
// 甲=0，午=6  → 序号 = 0*12+6，但我们直接用偏移量
const DAY_GANZHI_BASE_DATE = new Date(2000, 0, 1)
const DAY_GANZHI_BASE_GAN  = 0   // 甲
const DAY_GANZHI_BASE_ZHI  = 6   // 午

// 时支：以小时划分
const HOUR_ZHI_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
// 时干：日干 → 子时起干（五鼠遁年起时）
const HOUR_GAN_BASE: Record<number, number> = {
  0: 0, 1: 0,   // 甲/乙日 → 甲子
  2: 2, 3: 2,   // 丙/丁日 → 丙子
  4: 4, 5: 4,   // 戊/己日 → 戊子
  6: 6, 7: 6,   // 庚/辛日 → 庚子
  8: 8, 9: 8,   // 壬/癸日 → 壬子
}

// ─── 干支计算 ────────────────────────────────────────────────────────────────

/** 年干支 */
function getYearGanZhi(year: number) {
  const offset = (year - YEAR_GANZHI_BASE) % 60
  const n = offset < 0 ? offset + 60 : offset
  return {
    gan: TIANGAN[n % 10],
    zhi: DIZHI[n % 12],
    ganIdx: n % 10,
    zhiIdx: n % 12,
  }
}

/** 月干支（简化：不以节气为界，以月份为界，误差约半月内，足够展示用） */
function getMonthGanZhi(year: number, month: number /* 1-12 */) {
  const zhiIdx = (month + 1) % 12        // 寅月=正月=1月，子月=11月
  const zhiIdxReal = zhiIdx < 0 ? zhiIdx + 12 : zhiIdx
  const zhi = MONTH_ZHI_ORDER[month - 1]

  // 月干：取决于年干（五虎遁年起月）
  const yearGanIdx = getYearGanZhi(year).ganIdx
  const baseGanIdx = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][yearGanIdx]  // 甲/己年→丙寅月起
  const monthOffset = (month - 1 + 2) % 10  // 寅月为偏移起点
  const ganIdx = (baseGanIdx + monthOffset) % 10

  return {
    gan: TIANGAN[ganIdx],
    zhi: zhi,
    ganIdx,
  }
}

/** 日干支（基于 2000-01-01 = 甲午日的偏移量） */
function getDayGanZhi(date: Date) {
  const msPerDay = 86400000
  const base = DAY_GANZHI_BASE_DATE.getTime()
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((target - base) / msPerDay)

  const ganIdx = ((DAY_GANZHI_BASE_GAN + diffDays) % 10 + 10) % 10
  const zhiIdx = ((DAY_GANZHI_BASE_ZHI + diffDays) % 12 + 12) % 12

  return {
    gan: TIANGAN[ganIdx],
    zhi: DIZHI[zhiIdx],
    ganIdx,
    zhiIdx,
  }
}

/** 时干支 */
function getHourGanZhi(hour: number, dayGanIdx: number) {
  // 子时 0-1点, 丑时 2-3点 ... 亥时 22-23点
  const zhiIdx = Math.floor(hour / 2) % 12
  const baseGanIdx = HOUR_GAN_BASE[dayGanIdx % 10] ?? 0
  const ganIdx = (baseGanIdx + zhiIdx) % 10

  return {
    gan: TIANGAN[ganIdx],
    zhi: DIZHI[zhiIdx],
    ganIdx,
    zhiIdx,
  }
}

// ─── 农历（简化版，用于推算星宿和农历日期显示） ────────────────────────────

/**
 * 农历推算（简化版，精度约 ±1 天，用于展示非精算场景）
 * 基于 1900-2100 年的农历月大小表
 * 此处使用一个轻量级的春节公历日期表来定位农历年首
 */

// 1900-2100 年春节公历日期偏移（距离1月1日的天数）
// 数据精简版，覆盖 2020-2040
const SPRING_FESTIVAL_DAYS: Record<number, number> = {
  2020: 25, 2021: 12, 2022: 32, 2023: 22, 2024: 40,
  2025: 29, 2026: 17, 2027: 36, 2028: 26, 2029: 13,
  2030: 33, 2031: 23, 2032: 11, 2033: 31, 2034: 19,
  2035: 8,  2036: 28, 2037: 15, 2038: 35, 2039: 24,
  2040: 14,
}

// 农历月份汉字
const LUNAR_MONTHS_ZH = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
const LUNAR_DAYS_ZH = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
]

// 农历每月天数（月大=30，月小=29），2020-2040 年精简数据
// 每年12或13个月（闰月），此处只需要天数粗估即可
function getLunarDayOfYear(date: Date): number {
  const year = date.getFullYear()
  const sfDays = SPRING_FESTIVAL_DAYS[year]
  if (!sfDays) {
    // fallback: 用公历 day-of-year 近似
    const start = new Date(year, 0, 1)
    return Math.floor((date.getTime() - start.getTime()) / 86400000)
  }
  const sfDate = new Date(year, 0, sfDays + 1)  // 春节日期
  const diff = Math.floor((date.getTime() - sfDate.getTime()) / 86400000)
  // 如果是春节前，用上一年农历
  if (diff < 0) return 330 + diff  // 大约在腊月
  return diff
}

function getLunarMonthDay(date: Date): { monthZh: string; dayZh: string } {
  const doy = getLunarDayOfYear(date)
  // 农历月均约 29.5 天
  const monthIdx = Math.floor(doy / 29.5) % 12
  const dayIdx   = doy % 30
  return {
    monthZh: LUNAR_MONTHS_ZH[monthIdx] ?? '正',
    dayZh:   LUNAR_DAYS_ZH[Math.min(dayIdx, 29)],
  }
}

// ─── 二十八星宿推算 ──────────────────────────────────────────────────────────

/**
 * 二十八星宿：以 2000-01-01 为基准（角宿 index=0），
 * 每天月亮约走 13.2°，对应约 1 宿/天，28 宿循环一周
 * 使用公历距基准日偏移量取模
 */
const MANSION_BASE_DATE = new Date(2000, 0, 7)  // 2000-01-07 约为角宿
const MANSION_BASE_IDX  = 0

function getMansionIndex(date: Date): number {
  const msPerDay = 86400000
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((target - MANSION_BASE_DATE.getTime()) / msPerDay)
  return ((MANSION_BASE_IDX + diffDays) % 28 + 28) % 28
}

// ─── 五行能量计算 ────────────────────────────────────────────────────────────

function calcWuxingEnergy(pillars: {
  yearGan: string; yearZhi: string;
  monthGan: string; monthZhi: string;
  dayGan: string; dayZhi: string;
  hourGan: string; hourZhi: string;
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
    if (wx) count[wx]++
  })
  // 转换为 0-100
  return Object.fromEntries(
    Object.entries(count).map(([k, v]) => [k, Math.round((v / 8) * 100)])
  )
}

// ─── 宜忌随机抽取 ────────────────────────────────────────────────────────────

function pickYiJi(date: Date) {
  // 用日期作为随机种子，确保同一天结果一致
  const seed = date.getFullYear() * 10000 + (date.getMonth()+1) * 100 + date.getDate()
  const seededRandom = (n: number) => {
    let x = Math.sin(seed + n) * 10000
    return x - Math.floor(x)
  }

  const yiPool = YIJI_DATA.filter(i => i.type === 'yi')
  const jiPool = YIJI_DATA.filter(i => i.type === 'ji')

  // 每天固定取 3宜 2忌（随种子稳定）
  const pickN = <T>(arr: T[], count: number, offset: number): T[] => {
    const indices = new Set<number>()
    let i = 0
    while (indices.size < count) {
      indices.add(Math.floor(seededRandom(offset + i) * arr.length))
      i++
    }
    return [...indices].map(idx => arr[idx])
  }

  return {
    yi: pickN(yiPool, 3, 0).map(item => ({
      traditional: item.traditional,
      cyber: item.variants[Math.floor(seededRandom(item.traditional.charCodeAt(0)) * item.variants.length)]
    })),
    ji: pickN(jiPool, 2, 100).map(item => ({
      traditional: item.traditional,
      cyber: item.variants[Math.floor(seededRandom(item.traditional.charCodeAt(0)) * item.variants.length)]
    })),
  }
}

// ─── 主导出函数 ──────────────────────────────────────────────────────────────

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

  // 四柱
  const yGZ  = getYearGanZhi(year)
  const mGZ  = getMonthGanZhi(year, month)
  const dGZ  = getDayGanZhi(date)
  const hGZ  = getHourGanZhi(hour, dGZ.ganIdx)

  const pillars = {
    year:  `${yGZ.gan}${yGZ.zhi}`,
    month: `${mGZ.gan}${mGZ.zhi}`,
    day:   `${dGZ.gan}${dGZ.zhi}`,
    hour:  `${hGZ.gan}${hGZ.zhi}`,
  }

  // 五行
  const wuxingEnergy = calcWuxingEnergy({
    yearGan: yGZ.gan, yearZhi: yGZ.zhi,
    monthGan: mGZ.gan, monthZhi: mGZ.zhi,
    dayGan: dGZ.gan, dayZhi: dGZ.zhi,
    hourGan: hGZ.gan, hourZhi: hGZ.zhi,
  })

  // 主导五行（能量最高者）
  const dominantElement = Object.entries(wuxingEnergy)
    .sort((a, b) => b[1] - a[1])[0][0]

  // 星宿
  const mansionIdx = getMansionIndex(date)
  const mansion = MANSIONS[mansionIdx]

  // 农历
  const { monthZh, dayZh } = getLunarMonthDay(date)
  const lunarDate = `农历${monthZh}月${dayZh}`

  // 宜忌（当天固定）
  const yiji = pickYiJi(date)

  // 地理
  const locationLabel = coords
    ? `${Math.abs(coords.lat).toFixed(2)}°${coords.lat >= 0 ? 'N' : 'S'} · ${Math.abs(coords.lng).toFixed(2)}°${coords.lng >= 0 ? 'E' : 'W'}`
    : '位置未知 · 仅使用时间坐标'

  return { pillars, wuxingEnergy, dominantElement, mansion, yiji, lunarDate, locationLabel }
}
