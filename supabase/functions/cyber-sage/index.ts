import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HEXAGRAM_DATA } from "./data.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 必须处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lines, question } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    
    // 获取卦象数据
    const code = lines.join('')
    const baseData = HEXAGRAM_DATA[code] || HEXAGRAM_DATA["111111"]

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
            content: 'You are the Cyber Sage. Give a mystical, cyberpunk interpretation of the I-Ching based on the user question. Return ONLY JSON: {"interpretation": "..."}'
          },
          {
            role: 'user',
            content: `Question: ${question}, Hexagram: ${baseData.nameZh}, Poem: ${baseData.poemZh}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({
      interpretation: result.interpretation,
      hexName: baseData.nameZh,
      hexEn: baseData.nameEn,
      poem: baseData.poemZh
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
