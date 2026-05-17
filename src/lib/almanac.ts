/**
 * almanac.ts
 * Computes Chinese calendar values for a given Date:
 * - Heavenly Stems (天干) + Earthly Branches (地支) ganzhi for year and day
 * - Zodiac animal
 * - Today's Twenty-Eight Lunar Mansion index
 * - Auspicious and inauspicious activities from a rotating almanac table
 * - Daily Wuxing (Five Elements) affinities
 *
 * All logic is pure deterministic computation — no external API needed.
 * The Twenty-Eight Mansion index uses the traditional method anchored to
 * a known reference date (2000-01-07 = mansion index 0 / 角宿).
 */

export const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
export const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
export const ZODIAC_ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'] as const
export const ZODIAC_EN = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'] as const

export type StemBranch = { stem: string; branch: string; zodiac: string; zodiacEn: string }

/** Ganzhi for a Gregorian year (using traditional offset from 4 BCE) */
export function ganzhiYear(year: number): StemBranch {
  const stemIdx = (year - 4 + 4000) % 10
  const branchIdx = (year - 4 + 4000) % 12
  return {
    stem: HEAVENLY_STEMS[stemIdx]!,
    branch: EARTHLY_BRANCHES[branchIdx]!,
    zodiac: ZODIAC_ANIMALS[branchIdx]!,
    zodiacEn: ZODIAC_EN[branchIdx]!,
  }
}

/** Ganzhi for a specific day using Julian Day Number */
function julianDay(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yr = y + 4800 - a
  const mo = m + 12 * a - 3
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045
}

export function ganzhiDay(date: Date): StemBranch {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
  // JD 2451551 = 2000-01-07, known ganzhi day index = 40 (甲子 cycle offset)
  const offset = (jd - 2451551 + 40 + 60000) % 60
  const stemIdx = offset % 10
  const branchIdx = offset % 12
  return {
    stem: HEAVENLY_STEMS[stemIdx]!,
    branch: EARTHLY_BRANCHES[branchIdx]!,
    zodiac: ZODIAC_ANIMALS[branchIdx]!,
    zodiacEn: ZODIAC_EN[branchIdx]!,
  }
}

/** Twenty-Eight Mansions (二十八宿) */
export type LunarMansion = {
  index: number
  symbol: string
  name: string
  nameEn: string
  element: string
  elementEn: string
  direction: '东' | '南' | '西' | '北'
  directionEn: 'East' | 'South' | 'West' | 'North'
  animal: string
  animalEn: string
}

export const MANSIONS: LunarMansion[] = [
  { index:0,  symbol:'角', name:'角宿', nameEn:'Horn',       element:'木', elementEn:'Wood',   direction:'东', directionEn:'East',  animal:'蛟', animalEn:'Dragon'  },
  { index:1,  symbol:'亢', name:'亢宿', nameEn:'Neck',       element:'金', elementEn:'Metal',  direction:'东', directionEn:'East',  animal:'龙', animalEn:'Dragon'  },
  { index:2,  symbol:'氐', name:'氐宿', nameEn:'Root',       element:'土', elementEn:'Earth',  direction:'东', directionEn:'East',  animal:'貉', animalEn:'Badger'  },
  { index:3,  symbol:'房', name:'房宿', nameEn:'Room',       element:'日', elementEn:'Sun',    direction:'东', directionEn:'East',  animal:'兔', animalEn:'Rabbit'  },
  { index:4,  symbol:'心', name:'心宿', nameEn:'Heart',      element:'月', elementEn:'Moon',   direction:'东', directionEn:'East',  animal:'狐', animalEn:'Fox'     },
  { index:5,  symbol:'尾', name:'尾宿', nameEn:'Tail',       element:'火', elementEn:'Fire',   direction:'东', directionEn:'East',  animal:'虎', animalEn:'Tiger'   },
  { index:6,  symbol:'箕', name:'箕宿', nameEn:'Basket',     element:'水', elementEn:'Water',  direction:'东', directionEn:'East',  animal:'豹', animalEn:'Leopard' },
  { index:7,  symbol:'斗', name:'斗宿', nameEn:'Dipper',     element:'木', elementEn:'Wood',   direction:'北', directionEn:'North', animal:'獬', animalEn:'Xiezhi'  },
  { index:8,  symbol:'牛', name:'牛宿', nameEn:'Ox',         element:'金', elementEn:'Metal',  direction:'北', directionEn:'North', animal:'牛', animalEn:'Ox'      },
  { index:9,  symbol:'女', name:'女宿', nameEn:'Girl',       element:'土', elementEn:'Earth',  direction:'北', directionEn:'North', animal:'蝠', animalEn:'Bat'     },
  { index:10, symbol:'虚', name:'虚宿', nameEn:'Void',       element:'日', elementEn:'Sun',    direction:'北', directionEn:'North', animal:'鼠', animalEn:'Rat'     },
  { index:11, symbol:'危', name:'危宿', nameEn:'Danger',     element:'月', elementEn:'Moon',   direction:'北', directionEn:'North', animal:'燕', animalEn:'Swallow' },
  { index:12, symbol:'室', name:'室宿', nameEn:'House',      element:'火', elementEn:'Fire',   direction:'北', directionEn:'North', animal:'猪', animalEn:'Pig'     },
  { index:13, symbol:'壁', name:'壁宿', nameEn:'Wall',       element:'水', elementEn:'Water',  direction:'北', directionEn:'North', animal:'㺄', animalEn:'Porcupine'},
  { index:14, symbol:'奎', name:'奎宿', nameEn:'Legs',       element:'木', elementEn:'Wood',   direction:'西', directionEn:'West',  animal:'狼', animalEn:'Wolf'    },
  { index:15, symbol:'娄', name:'娄宿', nameEn:'Bond',       element:'金', elementEn:'Metal',  direction:'西', directionEn:'West',  animal:'狗', animalEn:'Dog'     },
  { index:16, symbol:'胃', name:'胃宿', nameEn:'Stomach',    element:'土', elementEn:'Earth',  direction:'西', directionEn:'West',  animal:'雉', animalEn:'Pheasant'},
  { index:17, symbol:'昴', name:'昴宿', nameEn:'Pleiades',   element:'日', elementEn:'Sun',    direction:'西', directionEn:'West',  animal:'鸡', animalEn:'Rooster' },
  { index:18, symbol:'毕', name:'毕宿', nameEn:'Net',        element:'月', elementEn:'Moon',   direction:'西', directionEn:'West',  animal:'乌', animalEn:'Crow'    },
  { index:19, symbol:'觜', name:'觜宿', nameEn:'Turtle Beak',element:'火', elementEn:'Fire',   direction:'西', directionEn:'West',  animal:'猴', animalEn:'Monkey'  },
  { index:20, symbol:'参', name:'参宿', nameEn:'Orion',      element:'水', elementEn:'Water',  direction:'西', directionEn:'West',  animal:'猿', animalEn:'Ape'     },
  { index:21, symbol:'井', name:'井宿', nameEn:'Well',       element:'木', elementEn:'Wood',   direction:'南', directionEn:'South', animal:'犴', animalEn:'Tapir'   },
  { index:22, symbol:'鬼', name:'鬼宿', nameEn:'Ghost',      element:'金', elementEn:'Metal',  direction:'南', directionEn:'South', animal:'羊', animalEn:'Goat'    },
  { index:23, symbol:'柳', name:'柳宿', nameEn:'Willow',     element:'土', elementEn:'Earth',  direction:'南', directionEn:'South', animal:'獐', animalEn:'Roebuck' },
  { index:24, symbol:'星', name:'星宿', nameEn:'Star',       element:'日', elementEn:'Sun',    direction:'南', directionEn:'South', animal:'马', animalEn:'Horse'   },
  { index:25, symbol:'张', name:'张宿', nameEn:'Bow',        element:'月', elementEn:'Moon',   direction:'南', directionEn:'South', animal:'鹿', animalEn:'Deer'    },
  { index:26, symbol:'翼', name:'翼宿', nameEn:'Wings',      element:'火', elementEn:'Fire',   direction:'南', directionEn:'South', animal:'蛇', animalEn:'Serpent' },
  { index:27, symbol:'轸', name:'轸宿', nameEn:'Chariot',    element:'水', elementEn:'Water',  direction:'南', directionEn:'South', animal:'蚓', animalEn:'Worm'    },
]

/** Today's mansion index using Julian Day arithmetic anchored to 2000-01-07 = index 0 */
export function todayMansionIndex(date: Date): number {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const ref = julianDay(2000, 1, 7)
  return ((jd - ref) % 28 + 28) % 28
}

/** Auspicious activities keyed by (branchIndex % 12) */
const AUSPICIOUS_TABLE: string[][] = [
  ['祈福','出行','入宅'],['嫁娶','祭祀','立约'],['开业','纳财','动土'],
  ['会友','远行','求财'],['祈福','嫁娶','开仓'],['纳财','立约','出行'],
  ['祭祀','求医','动土'],['入宅','开业','嫁娶'],['出行','会友','祈福'],
  ['动土','纳财','立约'],['嫁娶','祭祀','开业'],['祈福','入宅','求财'],
]
const INAUSPICIOUS_TABLE: string[][] = [
  ['破土','安葬','修造'],['出行','动土','开仓'],['嫁娶','纳畜','破土'],
  ['修造','安葬','出行'],['动土','破土','修造'],['嫁娶','安葬','纳畜'],
  ['开仓','出行','修造'],['破土','嫁娶','动土'],['安葬','修造','开仓'],
  ['嫁娶','出行','破土'],['动土','纳畜','安葬'],['修造','开仓','嫁娶'],
]

export type AlmanacDay = {
  date: Date
  yearGanzhi: StemBranch
  dayGanzhi: StemBranch
  mansion: LunarMansion
  auspicious: string[]
  inauspicious: string[]
  wuxingToday: string[]
  wuxingEnToday: string[]
}

const WUXING = ['木','火','土','金','水'] as const
const WUXING_EN = ['Wood','Fire','Earth','Metal','Water'] as const

export function computeAlmanacDay(date: Date): AlmanacDay {
  const yearGanzhi = ganzhiYear(date.getFullYear())
  const dayGanzhi = ganzhiDay(date)
  const mansionIdx = todayMansionIndex(date)
  const mansion = MANSIONS[mansionIdx]!

  // Branch index drives the activity table
  const branchIdx = EARTHLY_BRANCHES.indexOf(dayGanzhi.branch as typeof EARTHLY_BRANCHES[number])
  const auspicious = AUSPICIOUS_TABLE[branchIdx < 0 ? 0 : branchIdx]!
  const inauspicious = INAUSPICIOUS_TABLE[branchIdx < 0 ? 0 : branchIdx]!

  // Wuxing: primary from mansion element, secondary from day branch cycle
  const primaryEl = WUXING.indexOf(mansion.element as typeof WUXING[number])
  const secondaryEl = (primaryEl + 2) % 5
  const tertiaryEl = (primaryEl + 4) % 5
  const wuxingToday = [WUXING[primaryEl]!, WUXING[secondaryEl]!, WUXING[tertiaryEl]!]
  const wuxingEnToday = [WUXING_EN[primaryEl]!, WUXING_EN[secondaryEl]!, WUXING_EN[tertiaryEl]!]

  return { date, yearGanzhi, dayGanzhi, mansion, auspicious, inauspicious, wuxingToday, wuxingEnToday }
}
