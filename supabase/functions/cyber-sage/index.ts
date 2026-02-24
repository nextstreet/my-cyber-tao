import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HEXAGRAM_DATA } from "./data.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  const { lines, question, language, hexagramName } = await req.json()
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

  // 这里的逻辑锁：如果是英文，我们就告诉 AI 这是一个“国际解码任务”
  const isEn = language === 'en';
  const targetLang = isEn ? 'ENGLISH' : 'CHINESE';

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are the Cyber Sage. Your task is to decode reality signals.
          
          PHASE 1: Analyze the user's input language.
          PHASE 2: You MUST respond ONLY in ${targetLang}. 
          
          STRICT RULES:
          - If the detected task is ${targetLang}, use zero Chinese characters in your interpretation.
          - Tone: Mystical, Cyberpunk, Logical.
          - Output: Return JSON {"interpretation": "..."}`
        },
        {
          role: 'user',
          content: `
          [SIGNAL RECEIVED]
          Language Mode: ${targetLang}
          User Inquiry: "${question}"
          Hexagram: ${hexagramName}
          
          [INSTRUCTION]
          Provide a deep decoding of this signal. Remember: Use 100% ${targetLang} only.`
        }
      ],
      response_format: { type: "json_object" }
    })
  })
