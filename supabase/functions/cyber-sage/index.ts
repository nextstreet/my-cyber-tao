import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. 立即处理预检请求，确保不会报 CORS 错误
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) {
      throw new Error("Missing DEEPSEEK_API_KEY. Please set it in Supabase Secrets.")
    }

    const targetLang = language === 'en' ? 'English' : 'Chinese'
    const hexagramStr = lines.join('') // 得到 010101 这种字符串

    // 2. 为了避免超时限制，我们将两个请求合并为一个，让 AI 一次性返回所有数据
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
            content: `You are a Cyber Sage. The user provides a hexagram code (6 lines, 0=Yin, 1=Yang, from bottom to top). 
            Identify the hexagram and provide a cyberpunk interpretation.
            Return ONLY a JSON object: 
            {
              "hexName": "卦名(中文)",
              "hexEn": "Hexagram Name(English)",
              "poem": "卦辞或爻辞(中文)",
              "interpretation": "Your detailed prophecy in ${targetLang}"
            }`
          },
          {
            role: 'user',
            content: `Hexagram Code: ${hexagramStr}. User Question: ${question}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({
      hexagramNameZh: result.hexName,
      hexagramNameEn: result.hexEn,
      poemZh: result.poem,
      interpretation: result.interpretation
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
