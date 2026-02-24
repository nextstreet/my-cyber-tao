import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    const targetLang = language === 'en' ? 'English' : 'Chinese'
    const hexCode = lines.join('')

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
            content: `You are a Cyber Sage. Identify the hexagram from code: ${hexCode} (bottom to top). Return ONLY JSON: {"hexNameZh":"...","hexNameEn":"...","poemZh":"...","interpretation":"..."}. Prophecy in ${targetLang}.`
          },
          {
            role: 'user',
            content: `Question: ${question}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({
      hexagramNameZh: result.hexNameZh,
      hexagramNameEn: result.hexNameEn,
      poemZh: result.poemZh,
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
