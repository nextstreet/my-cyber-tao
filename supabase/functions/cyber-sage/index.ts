import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HEXAGRAM_DATA } from "./data.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // 1. 关键：处理浏览器预检请求 (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { lines, question } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) throw new Error("Missing DEEPSEEK_API_KEY");

    const code = lines.join('');
    const baseData = HEXAGRAM_DATA[code] || HEXAGRAM_DATA["111111"];

    console.log(`[LOG] 1. Question: ${question}`);

    // --- STEP 1: 语种识别并翻译为中文 ---
    const step1Response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'system',
          content: 'Identify language and translate to Chinese. Return ONLY JSON: {"lang": "English", "q_zh": "..."}'
        }, {
          role: 'user',
          content: question
        }],
        response_format: { type: "json_object" }
      })
    });

    const step1Data = await step1Response.json();
    const { lang, q_zh } = JSON.parse(step1Data.choices[0].message.content);
    console.log(`[LOG] 2. Detected: ${lang}, ZH: ${q_zh}`);

    // --- STEP 2: 深度分析并翻译回目标语 ---
    const finalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: `You are the Cyber Sage. Use Chinese to analyze I-Ching, then translate the insight into ${lang}. Tone: Mystical Cyberpunk. JSON format: {"interpretation": "..."}`
          },
          {
            role: 'user',
            content: `[CONTEXT] Question: ${q_zh}, Hexagram: ${baseData.nameZh}, Poem: ${baseData.poemZh}. Output Language: ${lang}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const finalData = await finalResponse.json();
    const finalContent = JSON.parse(finalData.choices[0].message.content);

    // 成功返回：必须包含 corsHeaders
    return new Response(JSON.stringify({
      interpretation: finalContent.interpretation,
      detectedLang: lang
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, // 改为 500 明确错误状态
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
})
