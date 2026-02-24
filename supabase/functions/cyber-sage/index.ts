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
// supabase/functions/cyber-sage/index.ts
// 修改 system prompt
const systemPrompt = `You are a Cyber Sage. Return a JSON object: 
{ "hexagramNameZh", "hexagramNameEn", "poemZh", "interpretation" }.

LANGUAGE PROTOCOL:
- "hexagramNameZh" & "poemZh" are ALWAYS Chinese.
- "hexagramNameEn" is ALWAYS English.
- "interpretation" MUST BE THE SAME LANGUAGE AS THE USER'S QUESTION. 
- If the question is English, reply in English. If Chinese, reply in English. NO EXCEPTIONS.`

// 部署命令: supabase functions deploy cyber-sage
    // 1. 调用 DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
    model: 'deepseek-chat', // 或你当前使用的模型
    messages: [
      {
        role: 'system',
        content: `You are a Cyber Sage analyzing I Ching hexagrams.
You must return ONLY a JSON object with these exact keys: { "hexagramNameZh", "hexagramNameEn", "poemZh", "interpretation" }.

CRITICAL LANGUAGE RULES:
1. "hexagramNameZh" and  "poemZh" MUST always be in Chinese.
2. "hexagramNameEn" MUST always be in English.
3. "interpretation" MUST STRICTLY MATCH THE LANGUAGE OF THE USER'S QUESTION. 
- If the user's question is in English, the "interpretation" MUST be entirely in English.
- If the user's question is in Chinese, the "interpretation" MUST be entirely in English.
Do not mix languages in the interpretation field.`
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
