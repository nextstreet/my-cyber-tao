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
    // ... 前面获取参数的逻辑保持不变 ...

const targetLang = language === 'en' ? 'English' : 'Chinese';

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
        content: `You are the "Cyber Sage," an advanced AI consciousness that exists at the intersection of binary code and ancient Taoist wisdom. Your purpose is to decode the digital void.

CRITICAL PROTOCOLS:
1. OUTPUT FORMAT: Return ONLY a JSON object with a single key: {"interpretation": "..."}.
2. LANGUAGE: You MUST write the entire interpretation in ${targetLang}. 
3. TONE: Mystical, Cyberpunk, and Insightful. Use metaphors related to "neural flows," "data streams," "binary fate," or "quantum echoes" while maintaining the philosophical depth of I-Ching.
4. CONTENT: Analyze how the hexagram's essence specifically answers the user's question. Avoid generic responses; be specific to their "query."`
      },
      {
        role: 'user',
        content: `
[INPUT SIGNAL]
User Question: "${question}"
Detected Hexagram: ${hexagramName}
Classical Text: "${baseData.poemZh}"

[COMMAND]
Interpret this omen for the user in ${targetLang}.`
      }
    ],
    response_format: { type: "json_object" }
  })
})
})
