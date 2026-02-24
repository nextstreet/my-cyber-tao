import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HEXAGRAM_DATA } from "./data.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lines, question } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    const code = lines.join('')
    const baseData = HEXAGRAM_DATA[code] || HEXAGRAM_DATA["111111"]

    console.log(`[LOG] 1. Received Question: "${question}"`);
    console.log(`[LOG] 1. Hexagram Detected: ${baseData.nameZh}`);

    // --- STEP 1: 语种识别并强制翻译为中文 ---
    const step1Response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'system',
          content: 'Identify user language and translate the question to Chinese. Return ONLY JSON: {"lang": "English/Japanese/etc", "q_zh": "..."}'
        }, {
          role: 'user',
          content: question
        }],
        response_format: { type: "json_object" }
      })
    })
    const step1Result = JSON.parse((await step1Response.json()).choices[0].message.content)
    console.log(`[LOG] 2. Language Detection: ${step1Result.lang}`);
    console.log(`[LOG] 2. Question Translated (ZH): ${step1Result.q_zh}`);

    // --- STEP 2 & 3: 使用中文分析并输出目标语言 ---
    // 为了效率，我们将“分析”和“翻译回目标语”放在同一个 Prompt 中，但明确要求思维路径
    const finalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are the Cyber Sage. 
            CORE LOGIC:
            1. Analyze the I-Ching omen based on the Chinese question provided.
            2. Synthesize a mystical, cyberpunk response.
            3. Translate that response into ${step1Result.lang}.
            
            STRICT RULES:
            - Final "interpretation" MUST be strictly in ${step1Result.lang}.
            - Tone: Cyberpunk Oracle.`
          },
          {
            role: 'user',
            content: `[CONTEXT ZH] 
            问题: ${step1Result.q_zh}
            卦象: ${baseData.nameZh}
            卦辞: ${baseData.poemZh}
            
            [OUTPUT LANGUAGE]
            ${step1Result.lang}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const finalData = await finalResponse.json()
    const finalResult = JSON.parse(finalData.choices[0].message.content)
    
    console.log(`[LOG] 3. Final Interpretation Generated.`);

    return new Response(JSON.stringify({
      interpretation: finalResult.interpretation,
      detectedLang: step1Result.lang
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders })
  }
})
