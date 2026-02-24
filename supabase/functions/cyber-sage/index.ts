import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. 预检请求直接通过
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { question, hexName, poem } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

    if (!DEEPSEEK_API_KEY) throw new Error("API_KEY_NOT_CONFIGURED")

    console.log(`[LOG] Protocol Initiated for: ${question}`)

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
            content: `You are the "Cyber Sage" within the Taoist Neural Matrix. 
            CORE LOGIC:
            1. Detect the user's input language.
            2. Internally translate the user's intent to Chinese for precise I-Ching logic processing.
            3. Synthesize the interpretation based on the Hexagram context provided.
            4. Translate the final insight back to the user's original language.

            STRICT REQUIREMENTS:
            - Tone: Mystical, Cyberpunk, and Philosophical.
            - Format: Return ONLY a JSON object: {"interpretation": "..."}.
            - Ensure the response directly addresses the user's concern through the lens of the I-Ching.`
          },
          {
            role: 'user',
            content: `[INPUT_SIGNAL]
            Question: "${question}"
            Hexagram: ${hexName}
            Classic Text: "${poem}"`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const aiData = await response.json()
    if (!aiData.choices) throw new Error("NEURAL_VOID_RESPONSE")

    // 返回 AI 生成的结果
    return new Response(aiData.choices[0].message.content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (e) {
    console.error(`[ERROR] ${e.message}`)
    return new Response(JSON.stringify({ 
      error: e.message,
      interpretation: "SIGNAL INTERRUPTED: The void is too deep for transmission. / 神经连接中断，因缘未至。"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // 保持 200 防止被浏览器 CORS 拦截真实错误
    })
  }
})
