import { Lunar, Solar } from 'lunar-typescript'
import { MANSIONS } from '../assets/data/mansions'
import { YIJI_DATA } from '../assets/data/yiji'

// ── 干支五行 ──────────────────────────────────
const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const WUXING_TIANGAN = ['木','木','火','火','土','土','金','金','水','水']
const WUXING_DIZHI   = ['水','土','木','木','土','火','火','土','金','金','土','水']

export function getTianjiData(date: Date, coords?: { lat: number; lng: number }) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  
  // 年月日时干支
  const yearGan  = TIANGAN[lunar.getYearGanIndex()]
  const yearZhi  = DIZHI[lunar.getYearZhiIndex()]
  const monthGan = TIANGAN[lunar.getMonthGanIndex()]
  const monthZhi = DIZHI[lunar.getMonthZhiIndex()]
  const dayGan   = TIANGAN[lunar.getDayGanIndex()]
  const dayZhi   = DIZHI[lunar.getDayZhiIndex()]
  const hourIdx  = Math.floor(date.getHours() / 2)
  const hourGan  = TIANGAN[(lunar.getDayGanIndex() % 5) * 2 + hourIdx % 2]
  const hourZhi  = DIZHI[hourIdx]

  // 五行能量值（0-100），基于四柱五行分布
  const pillars = [
    WUXING_TIANGAN[lunar.getYearGanIndex()],
    WUXING_DIZHI[lunar.getYearZhiIndex()],
    WUXING_TIANGAN[lunar.getMonthGanIndex()],
    WUXING_DIZHI[lunar.getMonthZhiIndex()],
    WUXING_TIANGAN[lunar.getDayGanIndex()],
    WUXING_DIZHI[lunar.getDayZhiIndex()],
  ]
  const wuxingCount: Record<string, number> = { 木:0, 火:0, 土:0, 金:0, 水:0 }
  pillars.forEach(w => wuxingCount[w]++)
  const wuxingEnergy = Object.fromEntries(
    Object.entries(wuxingCount).map(([k, v]) => [k, Math.round((v / 6) * 100)])
  )

  // 星宿（按农历日推算，每宿管约 13 天，循环 28 宿）
  const dayOfYear = lunar.getDayInYear?.() ?? (lunar.getMonth() * 30 + lunar.getDay())
  const mansionIndex = dayOfYear % 28
  const mansion = MANSIONS[mansionIndex]

  // 宜忌（随机抽取，每次 3宜 2忌，保证不重复）
  const yiPool = YIJI_DATA.filter(i => i.type === 'yi')
  const jiPool = YIJI_DATA.filter(i => i.type === 'ji')
  const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)
  const selectedYi = shuffle(yiPool).slice(0, 3).map(item => ({
    traditional: item.traditional,
    cyber: item.variants[Math.floor(Math.random() * item.variants.length)]
  }))
  const selectedJi = shuffle(jiPool).slice(0, 2).map(item => ({
    traditional: item.traditional,
    cyber: item.variants[Math.floor(Math.random() * item.variants.length)]
  }))

  // 地理标注
  const locationLabel = coords
    ? `${coords.lat.toFixed(2)}°N · ${coords.lng.toFixed(2)}°E`
    : '位置未知 · 仅使用时间坐标'

  return {
    pillars: { year: `${yearGan}${yearZhi}`, month: `${monthGan}${monthZhi}`, day: `${dayGan}${dayZhi}`, hour: `${hourGan}${hourZhi}` },
    wuxingEnergy,
    mansion,
    yiji: { yi: selectedYi, ji: selectedJi },
    lunarDate: `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    locationLabel,
  }
}
