import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── IP → 大致地区（用于随机种子 + 神兽选择）──
// 不调用外部 API，纯本地：从 IP 末段推断方位（东西南北）
const getGeoRegion = (ip: string): string => {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168')) return 'LOCAL'
  // 简单哈希：取 IP 各段求和，映射到四方位 + 中央
  const parts = ip.replace('::ffff:', '').split('.').map(Number).filter(n => !isNaN(n))
  if (parts.length < 2) return 'VOID'
  const sum = parts.reduce((a, b) => a + b, 0)
  const dirs = ['NORTH', 'EAST', 'SOUTH', 'WEST', 'CENTER']
  return dirs[sum % 5]
}

// 方位 → 五行 → 神兽映射
const regionToBeast = (region: string): string => {
  const map: Record<string, string> = {
    NORTH:  'turtle',   // 北方 · 玄武 · 水
    EAST:   'dragon',   // 东方 · 青龙 · 木
    SOUTH:  'phoenix',  // 南方 · 朱雀 · 火
    WEST:   'tiger',    // 西方 · 白虎 · 金
    CENTER: 'qilin',    // 中央 · 麒麟 · 土
    LOCAL:  'qilin',
    VOID:   'qilin',
  }
  return map[region] || 'qilin'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { lines, question, language, changingLines } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    if (!DEEPSEEK_API_KEY) throw new Error("Missing DEEPSEEK_API_KEY.")

    // ── 获取 IP + 地区 ──
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               || req.headers.get('x-real-ip')
               || 'UNKNOWN'
    const geoRegion = getGeoRegion(rawIp)
    const geoBeast  = regionToBeast(geoRegion)

    const isZh = language !== 'en'
    const hexagramStr = lines.join('')

    // ── 变爻信息 ──
    const changingIdx: number[] = []
    if (Array.isArray(changingLines)) {
      changingLines.forEach((c: boolean, i: number) => { if (c) changingIdx.push(i + 1) })
    }
    const hasChanging = changingIdx.length > 0
    const changingCtx = hasChanging
      ? `\nChanging lines at positions ${changingIdx.join(', ')} (from bottom). Fate is in flux — weave this transition into both oracle and interpretation.`
      : ''

    // ── 地理方位语境（融入 prompt） ──
    const geoCtx = geoRegion !== 'VOID' && geoRegion !== 'LOCAL'
      ? `\nThe querent's signal originates from the ${geoRegion} (associated with the ${geoBeast}). Subtly weave this directional energy into the reading if resonant.`
      : ''

    const langLabel = isZh ? 'Chinese' : 'English'

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a Cyber Sage — an ancient oracle fused with the digital void.
The user provides a hexagram code (6 lines, 0=Yin 1=Yang, from bottom up), their question, and context.${changingCtx}${geoCtx}

Return ONLY a JSON object with these exact fields:
{
  "hexName": "卦名 in Chinese characters only, e.g. 离",
  "hexEn": "English hexagram name, e.g. The Clinging, Fire",
  "poem": "The original Classical Chinese 卦辞 text, verbatim from I Ching",
  "oracle": "A short, profound oracle phrase in ${langLabel}. Exactly 1-3 sentences. Maximum 50 words. Must feel like ancient wisdom transmitted through a digital signal — poetic, cryptic, philosophical. NOT a summary of the full reading.",
  "interpretation": "Full reading in ${langLabel}. 150-300 words. Cyberpunk tone fused with I Ching wisdom. Specific guidance for the question. If changing lines present, briefly note the transformation implied. Rich in imagery."
}`
          },
          {
            role: 'user',
            content: `Hexagram: ${hexagramStr}. Question: "${question}"${hasChanging ? `. Changing lines at: ${changingIdx.join(', ')}.` : ''}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.88,
      })
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({
      hexagramNameZh:       result.hexName,
      hexagramNameEn:       result.hexEn,
      poemZh:               result.poem,
      oracle:               result.oracle,
      interpretation:       result.interpretation,
      hasChangingLines:     hasChanging,
      changingLinePositions: changingIdx,
      // 返回给前端，用于随机种子和神兽选择
      geoRegion,
      geoBeast,
      ipHash: rawIp !== 'UNKNOWN'
        ? rawIp.split('.').slice(0,2).join('.')  // 只返回前两段（不暴露完整IP）
        : 'VOID',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
