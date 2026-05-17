export interface LunarMansion {
  index: number
  symbol: string
  nameEn: string
  element: string
  direction: '东' | '南' | '西' | '北'
}

export const MANSIONS: LunarMansion[] = [
  { index: 0,  symbol: '角', nameEn: 'Horn',            element: '木', direction: '东' },
  { index: 1,  symbol: '亢', nameEn: 'Neck',             element: '木', direction: '东' },
  { index: 2,  symbol: '氐', nameEn: 'Root',             element: '木', direction: '东' },
  { index: 3,  symbol: '房', nameEn: 'Room',             element: '木', direction: '东' },
  { index: 4,  symbol: '心', nameEn: 'Heart',            element: '木', direction: '东' },
  { index: 5,  symbol: '尾', nameEn: 'Tail',             element: '木', direction: '东' },
  { index: 6,  symbol: '箕', nameEn: 'Winnowing Basket', element: '木', direction: '东' },
  { index: 7,  symbol: '井', nameEn: 'Well',             element: '火', direction: '南' },
  { index: 8,  symbol: '鬼', nameEn: 'Ghost',            element: '火', direction: '南' },
  { index: 9,  symbol: '柳', nameEn: 'Willow',           element: '火', direction: '南' },
  { index: 10, symbol: '星', nameEn: 'Star',             element: '火', direction: '南' },
  { index: 11, symbol: '张', nameEn: 'Extended Net',     element: '火', direction: '南' },
  { index: 12, symbol: '翼', nameEn: 'Wings',            element: '火', direction: '南' },
  { index: 13, symbol: '轸', nameEn: 'Chariot',          element: '火', direction: '南' },
  { index: 14, symbol: '奎', nameEn: 'Legs',             element: '金', direction: '西' },
  { index: 15, symbol: '娄', nameEn: 'Bond',             element: '金', direction: '西' },
  { index: 16, symbol: '胃', nameEn: 'Stomach',          element: '金', direction: '西' },
  { index: 17, symbol: '昴', nameEn: 'Hairy Head',       element: '金', direction: '西' },
  { index: 18, symbol: '毕', nameEn: 'Net',              element: '金', direction: '西' },
  { index: 19, symbol: '觜', nameEn: 'Turtle Beak',      element: '金', direction: '西' },
  { index: 20, symbol: '参', nameEn: 'Three Stars',      element: '金', direction: '西' },
  { index: 21, symbol: '斗', nameEn: 'Dipper',           element: '水', direction: '北' },
  { index: 22, symbol: '牛', nameEn: 'Ox',               element: '水', direction: '北' },
  { index: 23, symbol: '女', nameEn: 'Girl',             element: '水', direction: '北' },
  { index: 24, symbol: '虚', nameEn: 'Emptiness',        element: '水', direction: '北' },
  { index: 25, symbol: '危', nameEn: 'Rooftop',          element: '水', direction: '北' },
  { index: 26, symbol: '室', nameEn: 'Encampment',       element: '水', direction: '北' },
  { index: 27, symbol: '壁', nameEn: 'Wall',             element: '水', direction: '北' },
]
