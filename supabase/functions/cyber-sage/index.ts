import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) throw new Error("API Key missing on server")

    // 确定目标语言，如果前端没有传，默认 fallback 为英文或中文均可
    const targetLanguage = language === 'en' ? 'English' : 'Chinese'
    const hexagramStr = lines.join(', ')

    // ==========================================
    // STEP 1: 获取客观数据（卦名、中文诗词）
    // ==========================================
    const metaResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: `You are an I Ching database. You must return ONLY a JSON object with exact keys: { "hexagramNameZh", "hexagramNameEn", "poemZh" }. 
The "poemZh" must be a classic Chinese poem/phrase representing the hexagram.`
          },
          {
            role: 'user',
            content: `Identify the hexagram for these lines (bottom to top, 0=Yin, 1=Yang): ${hexagramStr}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const metaData = await metaResponse.json()
    if (metaData.error) throw new Error(`Step 1 Error: ${metaData.error.message}`)
    const metaResult = JSON.parse(metaData.choices[0].message.content)

    // ==========================================
    // STEP 2: 获取主观解释（严格锁定语言）
    // ==========================================
    const interpretationResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: `You are a Cyber Sage predicting the future. You must return ONLY a JSON object with the exact key: { "interpretation" }. 
CRITICAL RULE: The entire "interpretation" MUST be written strictly in ${targetLanguage}. Maintain a cyber-punk and mystical tone.`
          },
          {
            role: 'user',
            content: `The user asked: "${question}". 
The divination result is the hexagram: ${metaResult.hexagramNameEn} (${metaResult.hexagramNameZh}). 
Provide your interpretation in ${targetLanguage}.`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const interpretationData = await interpretationResponse.json()
    if (interpretationData.error) throw new Error(`Step 2 Error: ${interpretationData.error.message}`)
    const interpretationResult = JSON.parse(interpretationData.choices[0].message.content)

    // ==========================================
    // 组合结果并返回给前端
    // ==========================================
    const finalResult = {
      hexagramNameZh: metaResult.hexagramNameZh,
      hexagramNameEn: metaResult.hexagramNameEn,
      poemZh: metaResult.poemZh,
      interpretation: interpretationResult.interpretation
    }

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
