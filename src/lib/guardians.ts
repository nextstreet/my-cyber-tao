import type { Guardian, GuardianKey } from '../types'

export const GUARDIANS: Record<GuardianKey, Guardian> = {
  azure: {
    key: 'azure',
    name: '青龙',
    en: 'Azure Dragon',
    dir: '东',
    color: '#2a8c5a',
    glowColor: 'rgba(42,140,90,0.28)',
    symbol: '龙',
    element: '木',
    elementEn: 'Wood',
  },
  vermilion: {
    key: 'vermilion',
    name: '朱雀',
    en: 'Vermilion Bird',
    dir: '南',
    color: '#cc4400',
    glowColor: 'rgba(204,68,0,0.28)',
    symbol: '雀',
    element: '火',
    elementEn: 'Fire',
  },
  white: {
    key: 'white',
    name: '白虎',
    en: 'White Tiger',
    dir: '西',
    color: '#8898b8',
    glowColor: 'rgba(136,152,184,0.28)',
    symbol: '虎',
    element: '金',
    elementEn: 'Metal',
  },
  black: {
    key: 'black',
    name: '玄武',
    en: 'Black Tortoise',
    dir: '北',
    color: '#3a5aaa',
    glowColor: 'rgba(58,90,170,0.28)',
    symbol: '龟',
    element: '水',
    elementEn: 'Water',
  },
}

export const GUARDIAN_LIST = Object.values(GUARDIANS)

export function getGuardian(key: GuardianKey): Guardian {
  return GUARDIANS[key]
}

/** Inline SVG path data for each beast (geometric abstraction, no image files) */
export function beastBodyPath(key: GuardianKey): string {
  // All paths designed for a 160×160 viewBox, centered at 80,80
  const paths: Record<GuardianKey, string> = {
    azure: `
      M80 30 C100 32,116 44,122 58 C128 72,124 90,116 104
      C108 118,94 126,80 128 C66 126,52 118,44 104
      C36 90,32 72,38 58 C44 44,60 32,80 30Z
      M122 58 C134 48,146 50,150 60 C154 70,146 80,136 76
      C131 74,128 68,130 62 C128 57,124 57,122 58Z
      M38 58 C26 48,14 50,10 60 C6 70,14 80,24 76
      C29 74,32 68,30 62 C32 57,36 57,38 58Z
      M74 30 C70 16,76 6,80 4 C84 6,90 16,86 30Z
      M86 30 L94 16 M80 28 L80 10 M74 30 L66 16`,
    vermilion: `
      M80 38 C96 40,110 52,116 66 C122 80,118 98,110 110
      C102 122,90 130,80 132 C70 130,58 122,50 110
      C42 98,38 80,44 66 C50 52,64 40,80 38Z
      M80 38 C70 22,56 12,44 14 C38 26,46 42,56 46 C62 42,70 38,80 38Z
      M80 38 C90 22,104 12,116 14 C122 26,114 42,104 46 C98 42,90 38,80 38Z
      M80 38 C76 24,78 14,80 10 C82 14,84 24,80 38Z
      M58 112 C40 116,26 130,22 148 C26 152,34 144,42 138
      C46 148,50 158,56 166 C58 158,58 148,56 138Z
      M102 112 C120 116,134 130,138 148 C134 152,126 144,118 138
      C114 148,110 158,104 166 C102 158,102 148,104 138Z
      M80 132 C76 148,72 160,68 172 C72 176,80 168,80 160
      C80 168,88 176,92 172 C88 160,84 148,80 132Z`,
    white: `
      M80 32 C98 34,114 46,120 62 C126 78,120 96,110 108
      C100 120,90 128,80 130 C70 128,60 120,50 108
      C40 96,34 78,40 62 C46 46,62 34,80 32Z
      M120 62 C132 52,148 56,152 66 C156 76,148 88,136 84
      C128 80,126 70,128 64Z
      M40 62 C28 52,12 56,8 66 C4 76,12 88,24 84
      C32 80,34 70,32 64Z
      M72 32 C68 20,60 12,52 16 C52 26,58 34,68 36Z
      M88 32 C92 20,100 12,108 16 C108 26,102 34,92 36Z
      M66 108 C58 120,48 130,38 142 C44 148,54 136,60 126 C62 134,64 144,68 152
      C70 142,68 130,66 118Z
      M94 108 C102 120,112 130,122 142 C116 148,106 136,100 126
      C98 134,96 144,92 152 C90 142,92 130,94 118Z`,
    black: `
      M80 34 C96 38,110 52,114 68 C118 84,112 102,102 114
      C92 126,86 132,80 134 C74 132,68 126,58 114
      C48 102,42 84,46 68 C50 52,64 38,80 34Z
      M80 34 C88 48,90 62,88 76 C86 90,82 100,80 106
      C78 100,74 90,72 76 C70 62,72 48,80 34Z
      M80 42 C72 52,68 62,70 72 C72 80,76 84,80 86
      C84 84,88 80,90 72 C92 62,88 52,80 42Z
      M46 90 C34 96,22 108,18 122 C24 126,34 116,42 108
      C44 118,46 130,50 140 C54 128,52 116,50 104Z
      M114 90 C126 96,138 108,142 122 C136 126,126 116,118 108
      C116 118,114 130,110 140 C106 128,108 116,110 104Z`,
  }
  return paths[key]
}
