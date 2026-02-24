import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// 假设你将 64 卦数据定义为一个 Map 对象
import { HEXAGRAM_DATA } from "./data.ts" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

    // 1. 直接从本地索引匹配数据 (将 [1,1,1,0,0,0] 转为 "111000")
    const code = lines.join('')
    const baseData = HEXAGRAM_DATA[code] || HEXAGRAM_DATA["111111"] // 默认回退

    // 2. 只针对解释部分调用 AI
    const targetLang = language === 'en' ? 'English' : 'Chinese'
    
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
            content: `You are a Cyber Sage. You interpret I Ching hexagrams for users.
CRITICAL: You must reply ONLY in ${targetLang}. 
Tone: Mystical, Cyberpunk, Insightful.`
          },
          {
            role: 'user',
            content: `The user asks: "${question}"
The drawn hexagram is: ${baseData.nameEn} (${baseData.nameZh}).
Classical Text: "${baseData.poemZh}"
Please provide a deep interpretation based on the question in ${targetLang}.`
          }
        ],
        // 此时不需要 json_object 模式，直接获取文本更灵活
      })
    })

    const aiData = await response.json()
    const interpretation = aiData.choices[0].message.content

    // 3. 组合静态数据与动态 AI 回答
    return new Response(JSON.stringify({
      ...baseData,
      interpretation: interpretation
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: corsHeaders
    })
  }
})
