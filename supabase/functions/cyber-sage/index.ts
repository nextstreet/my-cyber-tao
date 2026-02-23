import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { CreateChatCompletionRequest } from "https://esm.sh/openai@3.2.1";

// 1. 设置跨域头 (CORS) - 极其重要，否则你的 Vue 前端会被拦截
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 处理浏览器的预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. 解析前端传来的数据
    const { lines, question } = await req.json()
    // lines 是一个数组，比如 [1, 0, 1, 1, 0, 0]，0代表阴，1代表阳 (从下往上)
    const hexagramBinary = lines.join('');

    // 3. 构建给 AI 的 Prompt (系统人设)
    const systemPrompt = `
      You are a wise, cryptic Taoist sage from ancient China, existing in a cyberpunk future.
      The user has cast an I Ching hexagram represented by the binary lines from bottom to top: ${hexagramBinary} (1=Yang solid, 0=Yin broken).
      Their question is: "${question}".

      Your task:
      1. Identify the name of the Hexagram (e.g., "The Receptive", "Thunder").
      2. Provide a 2-3 sentence philosophical interpretation using nature metaphors (water, mountain, wind). Do NOT be fatalistic.
      3. Give one practical, secular piece of advice based on the hexagram.

      Respond STRICTLY in JSON format:
      {
        "hexagramName": "Name of the Hexagram (English)",
        "interpretation": "Your poetic and philosophical response here."
      }
    `;

    // 4. 调用 OpenAI API (你可以换成 Claude 或其他)
    const openAiKey = Deno.env.get('DEEPSEEK_API_KEY');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 建议用 3.5 够用且便宜，土豪可以用 gpt-4o
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const resultText = aiData.choices[0].message.content;
    const resultJson = JSON.parse(resultText); // 解析 AI 返回的 JSON

    // 5. 将结果返回给前端
    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
