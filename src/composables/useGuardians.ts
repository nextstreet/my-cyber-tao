/**
 * useGuardians.ts
 * 路径: src/composables/useGuardians.ts
 *
 * 从 Supabase Storage 动态获取守护神图片 URL，全局缓存，只请求一次。
 *
 * ── 使用前确认 ────────────────────────────────────────────────
 * 1. Supabase Storage bucket 名称: "guardians"（Public）
 * 2. 文件命名: guardian-dragon.png / guardian-phoenix.png 等
 * 3. bucket 须设为 Public，否则 getPublicUrl 返回的 URL 无法访问
 * ─────────────────────────────────────────────────────────────
 */

import { ref, readonly } from 'vue'
import { supabase } from '@/lib/supabase'   // 你项目现有的 supabase client

export type GuardianKey = 'dragon' | 'phoenix' | 'tiger' | 'turtle' | 'qilin'

export const GUARDIAN_KEYS: GuardianKey[] = ['dragon', 'phoenix', 'tiger', 'turtle', 'qilin']

const BUCKET = 'guardians'

// ── 全局单例缓存（模块级，整个应用只初始化一次）──────────────
const urlMap   = ref<Partial<Record<GuardianKey, string>>>({})
const ready    = ref(false)
const error    = ref<string | null>(null)
let   initOnce: Promise<void> | null = null

// ── 核心：从 Supabase Storage 批量获取 Public URL ────────────
// getPublicUrl 是纯客户端计算，不发网络请求，速度 < 1ms
// 实际图片加载走 Supabase CDN，受益于浏览器缓存
async function fetchGuardianUrls(): Promise<void> {
  try {
    const entries: [GuardianKey, string][] = GUARDIAN_KEYS.map(key => {
      const { data } = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(`guardian-${key}.png`)
      return [key, data.publicUrl]
    })
    urlMap.value = Object.fromEntries(entries)
    ready.value  = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load guardian URLs'
    // Fallback: 用 public/ 目录的静态文件（确保不完全崩溃）
    const fallback: Partial<Record<GuardianKey, string>> = {}
    for (const key of GUARDIAN_KEYS) {
      fallback[key] = `/guardian-${key}.png`
    }
    urlMap.value = fallback
    ready.value  = true
  }
}

// ── 公开 composable ───────────────────────────────────────────
export function useGuardians() {

  // 初始化（幂等，多次调用只执行一次）
  function init(): Promise<void> {
    if (!initOnce) initOnce = fetchGuardianUrls()
    return initOnce
  }

  /** 获取指定守护神的图片 URL（ready 为 true 后才有值） */
  function getUrl(key: GuardianKey): string {
    return urlMap.value[key] ?? `/guardian-${key}.png`  // fallback to public/
  }

  /** 随机返回一个守护神 key */
  function randomKey(): GuardianKey {
    return GUARDIAN_KEYS[Math.floor(Math.random() * GUARDIAN_KEYS.length)]!
  }

  /** 预热指定图片（让浏览器开始下载，放入缓存）*/
  function preload(key: GuardianKey): void {
    const url = getUrl(key)
    if (!url) return
    const img = new Image()
    img.src = url
  }

  /** 预热所有图片（用户开始输入问题时调用，此时有空闲时间窗口）*/
  function preloadAll(): void {
    GUARDIAN_KEYS.forEach(preload)
  }

  return {
    urlMap:     readonly(urlMap),
    ready:      readonly(ready),
    error:      readonly(error),
    init,
    getUrl,
    randomKey,
    preload,
    preloadAll,
  }
}
