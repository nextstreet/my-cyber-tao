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
    const { lines, question, language, changingLines } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    const targetLang = language === 'en' ? 'English' : 'Chinese'
    const hexCode = lines.join('')

    const changingInfo = changingLines && changingLines.some(Boolean)
      ? `Changing lines at positions: ${changingLines.map((c: boolean, i: number) => c ? i+1 : null).filter(Boolean).join(', ')}. This indicates transformation — also consider the resulting hexagram.`
      : ''

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
            content: `You are Cyber Sage — an ancient oracle fused with digital consciousness.
Identify the hexagram from binary code: ${hexCode} (positions 1-6, bottom to top, 1=yang, 0=yin).
${changingInfo}

Return ONLY a JSON object with these exact keys:
{
  "hexNameZh": "Chinese name (1-3 chars)",
  "hexNameEn": "English name",
  "poemZh": "Original I Ching verse (one sentence)",
  "oracle": "A single poetic, cryptic, philosophical phrase — max 50 words. NOT a summary. Like a Zen koan or prophecy fragment. Must feel mysterious and evocative.",
  "interpretation": "Full reading 150-250 words in ${targetLang}. Address the question directly. Reference the hexagram's imagery. If changing lines exist, mention the transformation."
}`
          },
          {
            role: 'user',
            content: `Question: ${question}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.88
      })
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({
      hexagramNameZh: result.hexNameZh,
      hexagramNameEn: result.hexNameEn,
      poemZh: result.poemZh,
      oracle: result.oracle,
      interpretation: result.interpretation,
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
