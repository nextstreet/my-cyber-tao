import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. 关键修改：在这里接收前端传过来的 language 参数
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) throw new Error("API Key missing on server")

    // 2. 根据前端传入的语言，动态锁定目标语言
    const targetLanguage = language === 'en' ? 'ENGLISH' : 'CHINESE';

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
            content: `You are a Cyber Sage analyzing I Ching hexagrams.
You must return ONLY a JSON object with these exact keys: { "hexagramNameZh", "hexagramNameEn", "poemZh", "interpretation" }.

CRITICAL LANGUAGE RULES:
1. "hexagramNameZh" and "poemZh" MUST always be in Chinese.
2. "hexagramNameEn" MUST always be in English.
3. The "interpretation" field MUST STRICTLY BE WRITTEN IN: ${targetLanguage}. Do not use any other language for this field.`
          },
          {
            role: 'user',
            content: `Hexagram lines (bottom to top, 0=Yin, 1=Yang): ${lines.join(', ')}. 
User Question: "${question}"`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const aiData = await response.json()

    if (aiData.error) throw new Error(aiData.error.message)

    const result = JSON.parse(aiData.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (e) {
    // 修正：在 catch 块中 e 是 unknown 或 any，建议使用 e.message 时加个回退
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
