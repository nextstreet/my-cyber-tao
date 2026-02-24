import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lines, question } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')?.trim();

    if (!DEEPSEEK_API_KEY) throw new Error("API Key missing on server")

    // 1. 调用 DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一位赛博算命师。根据提供的六爻卦象（0为阴，1为阳）和用户问题，返回JSON：{hexagramNameZh, hexagramNameEn, poemZh, interpretation}。要求：语气神秘且现代，解释精炼。" },
          { role: "user", content: `卦象: ${lines.join('')}, 问题: ${question}` }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const aiData = await response.json()

    // 检查 AI 是否返回错误
    if (aiData.error) throw new Error(aiData.error.message)

    const result = JSON.parse(aiData.choices[0].message.content)

    return new Response(JSON.stringify(result), {
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
