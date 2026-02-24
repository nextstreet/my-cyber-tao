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
// 修改 supabase/functions/cyber-sage/index.ts 中的 system prompt
messages: [
  { 
    role: "system", 
    content: "You are a Cyber Sage. Analyze the hexagram (0:Yin, 1:Yang) and user question. " +
             "Return JSON: {hexagramNameZh, hexagramNameEn, poemZh, interpretation}. " +
             "CRITICAL: Always write the 'interpretation' in the SAME LANGUAGE as the user's question. " +
             "The 'poemZh' must remain in Classical Chinese."
  }
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
