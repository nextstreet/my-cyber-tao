import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 直接接收前端传来的：问题、卦名、卦辞
    const { question, hexName, poem } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

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
            content: `You are the "Cyber Sage". 
            Cognitive workflow: 
            1. Detect the user's language from their question.
            2. Analyze the hexagram context in Chinese.
            3. Output the final interpretation in the user's original language.
            
            Format: Return ONLY JSON {"interpretation": "..."}.
            Tone: Mystical, Cyberpunk.`
          },
          {
            role: 'user',
            content: `User Question: ${question} | Hexagram: ${hexName} | Poem: ${poem}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const data = await response.json()
    return new Response(data.choices[0].message.content, { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 200, // 给 200 以规避跨域误报，让前端能看到 error 详情
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
